"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { PageHeader } from "~/components/layout/page-header";
import { StatsCard } from "~/components/dashboard/stats-card";
import { FormCard } from "~/components/dashboard/form-card";
import { CreateFormDialog } from "~/components/dashboard/create-form-dialog";
import { Anchor, Compass, Plus, Loader2, FolderOpen, TrendingUp, Map, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [preSelectedTheme, setPreSelectedTheme] = useState<string | undefined>(undefined);

  useEffect(() => {
    const createParam = searchParams.get("create");
    const themeParam = searchParams.get("theme");
    if (createParam === "true") {
      setIsCreateOpen(true);
      if (themeParam) {
        setPreSelectedTheme(themeParam);
      }
    }
  }, [searchParams]);

  // Fetch the creator's own forms using tRPC!
  const { data, isLoading, refetch } = trpc.form.getUserForms.useQuery({
    search: search || undefined,
    filter: viewMode,
    page: 1,
    limit: 50,
  });

  const forms = data?.forms || [];
  const totalForms = data?.total || 0;

  // Calculate actual user statistics dynamically from active fleet data
  const totalResponses = forms.reduce((acc, form) => acc + form.responseCount, 0);
  const activeForms = forms.filter((f) => f.status === "published").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Captain's Cabin"
        description="Navigate your drafted courses, chart new locations, and verify treasures discovered across the seas."
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="btn-crimson rounded-xl px-5 py-3 font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Chart New Island
          </Button>
        }
      />

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Forms Created"
          value={isLoading ? "..." : totalForms}
          icon={Map}
          description="Charted Islands"
        />
        <StatsCard
          title="Total Answers Collected"
          value={isLoading ? "..." : totalResponses}
          icon={Anchor}
          description="Treasures Discovered"
        />
        <StatsCard
          title="Published Forms Live"
          value={isLoading ? "..." : activeForms}
          icon={Compass}
          description="Active Sea Routes"
        />
        <StatsCard
          title="Percentage of Active Routes"
          value={
            isLoading
              ? "..."
              : totalForms > 0
                ? `${Math.round((activeForms / totalForms) * 100)}%`
                : "0%"
          }
          icon={TrendingUp}
          description="Log Success Rate"
        />
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-ocean-surface/20 pb-1 gap-6 mt-6">
        <button
          onClick={() => setViewMode("active")}
          className={cn(
            "pb-3 text-sm font-bold tracking-wide relative transition-colors duration-300 font-heading",
            viewMode === "active" ? "text-wano-gold" : "text-wano-cream/40 hover:text-wano-cream",
          )}
        >
          Active Routes
          {viewMode === "active" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wano-gold rounded-full" />
          )}
        </button>
        <button
          onClick={() => setViewMode("archived")}
          className={cn(
            "pb-3 text-sm font-bold tracking-wide relative transition-colors duration-300 font-heading",
            viewMode === "archived" ? "text-wano-gold" : "text-wano-cream/40 hover:text-wano-cream",
          )}
        >
          Archived Islands
          {viewMode === "archived" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wano-gold rounded-full" />
          )}
        </button>
      </div>

      {/* Filter / Search Tool bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 p-4 bg-ocean-mid/40 rounded-2xl border border-ocean-surface/30">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charted islands..."
            className="bg-ocean-deep/80 border-ocean-surface text-wano-cream pl-9 pr-4 py-2 rounded-xl focus:border-wano-gold/40 focus:ring-0 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-wano-cream/40">
          <span>Sort course:</span>
          <span className="text-wano-gold font-semibold cursor-pointer hover:underline font-heading">
            Latest charted
          </span>
        </div>
      </div>

      {/* Islands / Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-wano-cream/40 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-wano-gold" />
          <p className="text-sm font-heading">Consulting navigation charts...</p>
        </div>
      ) : forms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={{
                id: form.id,
                title: form.title,
                description: form.description,
                slug: form.slug,
                status: form.status,
                expiresAt: form.expiresAt || null,
                passwordHash: form.passwordHash,
                isArchived: form.isArchived,
              }}
              responseCount={form.responseCount}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-ocean-mid/20 rounded-2xl border-2 border-dashed border-ocean-surface/40 p-8 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-ocean-surface/50 border border-wano-gold/15 flex items-center justify-center text-wano-gold mb-6">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="font-heading text-lg font-bold text-wano-cream mb-2">
            No Islands Charted
          </h3>
          <p className="text-xs text-wano-cream/50 leading-relaxed mb-6">
            Your maps are currently blank. Choose a destination, navigate the course, and start
            charting your first survey island on the Grand Line.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="btn-crimson rounded-xl px-5 py-2.5 font-bold flex items-center gap-2 text-xs"
          >
            <Plus className="w-4 h-4" />
            Chart New Island
          </Button>
        </div>
      )}

      {/* Create Dialog Mount */}
      <CreateFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaultThemeName={preSelectedTheme}
      />
    </div>
  );
}
