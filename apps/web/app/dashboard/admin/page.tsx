"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { PageHeader } from "~/components/layout/page-header";
import { StatsCard } from "~/components/dashboard/stats-card";
import {
  ShieldAlert,
  Loader2,
  Users,
  Map,
  Compass,
  TrendingUp,
  Search,
  UserCheck,
  UserX,
  Trash2,
  Archive,
  RefreshCw,
  Anchor,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { toast } from "sonner";

type TabMode = "overview" | "users" | "forms";

export default function AdminPage() {
  const router = useRouter();
  const [roleChecking, setRoleChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>("overview");

  // User States
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);

  // Forms States
  const [formSearch, setFormSearch] = useState("");
  const [formPage, setFormPage] = useState(1);

  // Security Check
  useEffect(() => {
    const role = localStorage.getItem("axeform_user_role");
    if (role !== "admin") {
      toast.error("Access Denied: You do not possess Administrator permissions!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setIsAuthorized(true);
      setRoleChecking(false);
    }
  }, [router]);

  // tRPC Admin queries
  const statsQuery = trpc.admin.getAdminStats.useQuery(undefined, {
    enabled: isAuthorized,
    refetchOnWindowFocus: false,
  });

  const usersQuery = trpc.admin.getUsers.useQuery(
    {
      search: userSearch || undefined,
      page: userPage,
      limit: 10,
    },
    {
      enabled: isAuthorized,
      refetchOnWindowFocus: false,
    }
  );

  const formsQuery = trpc.admin.getForms.useQuery(
    {
      search: formSearch || undefined,
      page: formPage,
      limit: 10,
    },
    {
      enabled: isAuthorized,
      refetchOnWindowFocus: false,
    }
  );

  // Mutations
  const toggleRoleMutation = trpc.admin.toggleUserRole.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      usersQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update user role.");
    },
  });

  const updateStatusMutation = trpc.admin.adminUpdateFormStatus.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      formsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update form status.");
    },
  });

  const toggleArchiveMutation = trpc.admin.adminToggleArchiveForm.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      formsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update archival status.");
    },
  });

  const deleteFormMutation = trpc.admin.adminDeleteForm.useMutation({
    onSuccess: (res) => {
      toast.success(res.message);
      formsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete form.");
    },
  });

  // Action Handlers
  const handleToggleUserRole = (userId: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "user" : "admin";
    toggleRoleMutation.mutate({ userId, role: nextRole });
  };

  const handleUpdateFormStatus = (formId: string, currentStatus: string) => {
    const statuses: ("draft" | "published" | "unpublished")[] = ["draft", "published", "unpublished"];
    const currentIdx = statuses.indexOf(currentStatus as any);
    const nextStatus = statuses[(currentIdx + 1) % statuses.length]!;
    updateStatusMutation.mutate({ formId, status: nextStatus });
  };

  const handleToggleFormArchive = (formId: string, isArchived: boolean) => {
    toggleArchiveMutation.mutate({ formId, isArchived: !isArchived });
  };

  const handleDeleteForm = (formId: string, title: string) => {
    if (confirm(`Are you absolutely sure you want to permanently delete the form "${title}"? This action is irreversible.`)) {
      deleteFormMutation.mutate({ formId });
    }
  };

  if (roleChecking || !isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-wano-cream">
        <Loader2 className="w-10 h-10 animate-spin text-wano-sakura" />
        <p className="text-sm font-mono tracking-widest text-wano-sakura animate-pulse">
          Verifying Administrator Permissions...
        </p>
      </div>
    );
  }

  const globalStats = statsQuery.data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <PageHeader
        title="Admin Control Panel"
        description="Platform-wide administration area. Monitor overall performance, manage users, and oversee all active forms."
        actions={
          <Button
            onClick={() => {
              statsQuery.refetch();
              usersQuery.refetch();
              formsQuery.refetch();
              toast.success("Platform statistics and registries updated successfully.");
            }}
            className="bg-ocean-mid/80 hover:bg-ocean-surface border border-wano-gold/20 text-wano-gold rounded-xl px-4 py-2 font-semibold flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Telemetry
          </Button>
        }
      />

      {/* Global Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <StatsCard
          title="Total Users"
          value={statsQuery.isLoading ? "..." : globalStats?.totalUsers ?? 0}
          icon={Users}
          description="Registered Captains"
        />
        <StatsCard
          title="Total Forms"
          value={statsQuery.isLoading ? "..." : globalStats?.totalForms ?? 0}
          icon={Map}
          description="Created Forms"
        />
        <StatsCard
          title="Total Submissions"
          value={statsQuery.isLoading ? "..." : globalStats?.totalSubmissions ?? 0}
          icon={Anchor}
          description="Collected Responses"
        />
        <StatsCard
          title="Total Views"
          value={statsQuery.isLoading ? "..." : globalStats?.totalViews ?? 0}
          icon={Compass}
          description="Aggregated Page Views"
        />
        <StatsCard
          title="Conversion Rate"
          value={statsQuery.isLoading ? "..." : `${globalStats?.globalConversionRate ?? 0}%`}
          icon={TrendingUp}
          description="Global Yield Rate"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-ocean-surface/20 pb-1 gap-6 mt-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "pb-3 text-sm font-bold tracking-wide relative transition-colors duration-300 font-heading",
            activeTab === "overview" ? "text-wano-gold" : "text-wano-cream/40 hover:text-wano-cream"
          )}
        >
          System Overview
          {activeTab === "overview" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wano-gold rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={cn(
            "pb-3 text-sm font-bold tracking-wide relative transition-colors duration-300 font-heading",
            activeTab === "users" ? "text-wano-gold" : "text-wano-cream/40 hover:text-wano-cream"
          )}
        >
          User Management ({usersQuery.data?.total ?? "..."})
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wano-gold rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("forms")}
          className={cn(
            "pb-3 text-sm font-bold tracking-wide relative transition-colors duration-300 font-heading",
            activeTab === "forms" ? "text-wano-gold" : "text-wano-cream/40 hover:text-wano-cream"
          )}
        >
          Form Management ({formsQuery.data?.total ?? "..."})
          {activeTab === "forms" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wano-gold rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Contents: 1. Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-ocean-mid/30 border border-ocean-surface/40 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute inset-0 fruit-swirl opacity-[0.02] pointer-events-none" />
            <h3 className="text-md font-heading font-bold text-wano-cream mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-wano-gold" />
              Administrative Guidelines
            </h3>
            <p className="text-xs text-wano-cream/60 leading-relaxed mb-4">
              Welcome back to the **AxeForm Control Room**. You are currently managing a database containing <strong>{globalStats?.totalUsers ?? "..."} Registered Users</strong> and their respective form endpoints.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              <div className="p-4 rounded-2xl bg-ocean-deep/40 border border-ocean-surface/30 space-y-2">
                <span className="text-[10px] font-heading font-bold uppercase text-wano-gold/80 tracking-wide">User Controls</span>
                <p className="text-xs text-wano-cream/50 leading-relaxed">
                  Utilize the <strong>User Management</strong> roster to look up registered credentials, promote standard members to administrative status, or modify permissions.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-ocean-deep/40 border border-ocean-surface/30 space-y-2">
                <span className="text-[10px] font-heading font-bold uppercase text-wano-gold/80 tracking-wide">Form Audits</span>
                <p className="text-xs text-wano-cream/50 leading-relaxed">
                  Monitor dynamic form configurations in the <strong>Form Management</strong> area. Check active responses, toggle active states (Draft / Published), or delete prohibited layouts instantly.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Trends Chart */}
          <div className="bg-ocean-mid/30 border border-ocean-surface/40 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <h4 className="text-sm font-heading font-bold text-wano-cream flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-wano-sakura" />
              Platform Analytics (Last 30 Days)
            </h4>
            {statsQuery.isLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-wano-gold" />
              </div>
            ) : globalStats?.dailyTrends && globalStats.dailyTrends.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {globalStats.dailyTrends.slice(-4).map((trend, i) => (
                    <div key={i} className="bg-ocean-deep/60 border border-ocean-surface/30 rounded-xl p-3 flex flex-col justify-between hover:border-wano-gold/20 transition-all">
                      <span className="text-[10px] font-mono text-wano-cream/40">{trend.date}</span>
                      <div className="flex items-end justify-between mt-2">
                        <span className="text-xs font-semibold text-wano-cream">Views: <strong className="text-wano-cream font-bold">{trend.views}</strong></span>
                        <span className="text-xs font-semibold text-wano-sakura">Replies: <strong className="text-wano-sakura font-bold">{trend.submissions}</strong></span>
                      </div>
                      <div className="h-1 bg-ocean-surface rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full bg-gradient-to-r from-wano-sakura to-wano-gold"
                          style={{ width: `${trend.views > 0 ? Math.min(100, (trend.submissions / trend.views) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-wano-cream/30 text-center py-10 font-mono">No historical coordinates registered.</p>
            )}
          </div>
        </div>
      )}

      {/* Tab Contents: 2. Users */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-ocean-mid/40 rounded-2xl border border-ocean-surface/30">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/40" />
              <Input
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
                placeholder="Search user by name or email..."
                className="bg-ocean-deep/80 border-ocean-surface text-wano-cream pl-9 pr-4 py-2 rounded-xl focus:border-wano-gold/40 focus:ring-0 text-xs w-full"
              />
            </div>
            <div className="text-xs text-wano-cream/40 font-mono">
              Displaying {usersQuery.data?.users.length ?? 0} of {usersQuery.data?.total ?? 0} total users.
            </div>
          </div>

          {/* Roster Table */}
          {usersQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-wano-cream/40 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-wano-gold" />
              <p className="text-xs font-mono">Loading user data directory...</p>
            </div>
          ) : usersQuery.data?.users && usersQuery.data.users.length > 0 ? (
            <div className="overflow-x-auto bg-ocean-mid/20 border border-ocean-surface/30 rounded-2xl">
              <table className="min-w-full divide-y divide-ocean-surface/40 text-left text-xs font-heading">
                <thead>
                  <tr className="bg-ocean-deep/50 text-[10px] text-wano-gold uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email Address</th>
                    <th className="px-6 py-4">User Role</th>
                    <th className="px-6 py-4 text-center">Forms Created</th>
                    <th className="px-6 py-4">Joined Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-surface/20 text-wano-cream/80">
                  {usersQuery.data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-ocean-surface/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-ocean-surface border border-wano-gold/20 flex items-center justify-center text-wano-gold overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>⚓</span>
                          )}
                        </div>
                        <span className="font-bold text-wano-cream">{user.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-wano-cream/55">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            user.role === "admin"
                              ? "bg-wano-gold/15 text-wano-gold border border-wano-gold/20"
                              : "bg-ocean-surface/60 text-wano-cream/60 border border-ocean-surface"
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold font-mono text-wano-gold">{user.formCount}</td>
                      <td className="px-6 py-4 font-mono text-wano-cream/50">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => handleToggleUserRole(user.id, user.role)}
                          className={cn(
                            "rounded-lg px-2.5 py-1 font-heading text-[10px] font-bold uppercase flex items-center gap-1 inline-flex transition-all",
                            user.role === "admin"
                              ? "bg-wano-crimson/10 border border-wano-crimson/30 text-wano-crimson hover:bg-wano-crimson/20"
                              : "bg-wano-gold/10 border border-wano-gold/30 text-wano-gold hover:bg-wano-gold/20"
                          )}
                        >
                          {user.role === "admin" ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              Demote
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Promote
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-ocean-mid/10 rounded-2xl border-2 border-dashed border-ocean-surface/30">
              <p className="text-xs text-wano-cream/40 font-mono">No users found matching search coordinates.</p>
            </div>
          )}

          {/* Pagination */}
          {usersQuery.data && usersQuery.data.total > 10 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                disabled={userPage <= 1}
                onClick={() => setUserPage((p) => p - 1)}
                className="bg-ocean-mid text-wano-cream/80 hover:bg-ocean-surface px-3 py-1 text-xs rounded-xl"
              >
                Previous Page
              </Button>
              <span className="text-xs font-mono text-wano-cream/40">
                Page {userPage} of {Math.ceil(usersQuery.data.total / 10)}
              </span>
              <Button
                disabled={userPage * 10 >= usersQuery.data.total}
                onClick={() => setUserPage((p) => p + 1)}
                className="bg-ocean-mid text-wano-cream/80 hover:bg-ocean-surface px-3 py-1 text-xs rounded-xl"
              >
                Next Page
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: 3. Forms */}
      {activeTab === "forms" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-ocean-mid/40 rounded-2xl border border-ocean-surface/30">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/40" />
              <Input
                value={formSearch}
                onChange={(e) => {
                  setFormSearch(e.target.value);
                  setFormPage(1);
                }}
                placeholder="Search forms by title or slug..."
                className="bg-ocean-deep/80 border-ocean-surface text-wano-cream pl-9 pr-4 py-2 rounded-xl focus:border-wano-gold/40 focus:ring-0 text-xs w-full"
              />
            </div>
            <div className="text-xs text-wano-cream/40 font-mono">
              Displaying {formsQuery.data?.forms.length ?? 0} of {formsQuery.data?.total ?? 0} total forms.
            </div>
          </div>

          {/* Forms Table */}
          {formsQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-wano-cream/40 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-wano-gold" />
              <p className="text-xs font-mono">Scanning form directories...</p>
            </div>
          ) : formsQuery.data?.forms && formsQuery.data.forms.length > 0 ? (
            <div className="overflow-x-auto bg-ocean-mid/20 border border-ocean-surface/30 rounded-2xl">
              <table className="min-w-full divide-y divide-ocean-surface/40 text-left text-xs font-heading">
                <thead>
                  <tr className="bg-ocean-deep/50 text-[10px] text-wano-gold uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">Form Details</th>
                    <th className="px-6 py-4">Creator Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submissions</th>
                    <th className="px-6 py-4">Created On</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-surface/20 text-wano-cream/80">
                  {formsQuery.data.forms.map((form) => (
                    <tr key={form.id} className="hover:bg-ocean-surface/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-wano-cream text-xs">{form.title}</span>
                          <span className="text-[10px] font-mono text-wano-cream/35">{form.slug}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-wano-cream/70">{form.ownerName}</span>
                          <span className="text-[10px] font-mono text-wano-cream/35">{form.ownerEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateFormStatus(form.id, form.status)}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border hover:scale-105 active:scale-95 transition-all",
                              form.status === "published"
                                ? "bg-fruit-glow/15 border-fruit-glow/30 text-fruit-glow"
                                : form.status === "draft"
                                  ? "bg-wano-gold/15 border-wano-gold/30 text-wano-gold"
                                  : "bg-ocean-surface border-ocean-surface/80 text-wano-cream/40"
                            )}
                          >
                            {form.status}
                          </button>
                          {form.isArchived && (
                            <span className="px-1.5 py-0.5 bg-wano-crimson/15 border border-wano-crimson/30 text-wano-crimson rounded-md text-[8px] font-bold uppercase">
                              Archived
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-wano-gold">{form.responseCount}</td>
                      <td className="px-6 py-4 font-mono text-wano-cream/50">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                        {/* Toggle Archive */}
                        <button
                          onClick={() => handleToggleFormArchive(form.id, form.isArchived)}
                          title={form.isArchived ? "Restore Form" : "Archive Form"}
                          className="p-1.5 rounded-lg border border-ocean-surface bg-ocean-deep/50 text-wano-cream/60 hover:text-wano-gold hover:border-wano-gold/30 transition-all hover:scale-110"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        {/* Permanent Erasure */}
                        <button
                          onClick={() => handleDeleteForm(form.id, form.title)}
                          title="Delete Form Permanently"
                          className="p-1.5 rounded-lg border border-wano-crimson/20 bg-wano-crimson/5 text-wano-crimson/50 hover:text-wano-crimson hover:bg-wano-crimson/15 hover:border-wano-crimson/40 transition-all hover:scale-110"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-ocean-mid/10 rounded-2xl border-2 border-dashed border-ocean-surface/30">
              <p className="text-xs text-wano-cream/40 font-mono">No forms found matching search parameters.</p>
            </div>
          )}

          {/* Pagination */}
          {formsQuery.data && formsQuery.data.total > 10 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                disabled={formPage <= 1}
                onClick={() => setFormPage((p) => p - 1)}
                className="bg-ocean-mid text-wano-cream/80 hover:bg-ocean-surface px-3 py-1 text-xs rounded-xl"
              >
                Previous Page
              </Button>
              <span className="text-xs font-mono text-wano-cream/40">
                Page {formPage} of {Math.ceil(formsQuery.data.total / 10)}
              </span>
              <Button
                disabled={formPage * 10 >= formsQuery.data.total}
                onClick={() => setFormPage((p) => p + 1)}
                className="bg-ocean-mid text-wano-cream/80 hover:bg-ocean-surface px-3 py-1 text-xs rounded-xl"
              >
                Next Page
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
