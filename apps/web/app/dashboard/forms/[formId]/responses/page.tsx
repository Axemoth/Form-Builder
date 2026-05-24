"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormWorkspaceHeader } from "~/components/layout/form-workspace-header";
import {
  Trophy,
  Loader2,
  Calendar,
  Clock,
  User,
  Globe,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { format } from "date-fns";

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.formId as string;

  // States
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [emailSearch, setEmailSearch] = useState("");
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  // Fetch Form details (for workspace header)
  const { data: form, isLoading: isFormLoading } = trpc.form.getFormById.useQuery(
    { id: formId },
    { refetchOnWindowFocus: false },
  );

  // Fetch responses with filter/pagination
  const {
    data: responsesData,
    isLoading: isResponsesLoading,
    refetch: refetchResponses,
  } = trpc.form.getFormResponses.useQuery(
    {
      formId,
      page,
      limit,
      respondentEmail: emailSearch || undefined,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  // CSV Exporter lazy query
  const { refetch: fetchCsvContent, isFetching: isExporting } =
    trpc.form.exportResponsesToCsv.useQuery({ formId }, { enabled: false });

  const responses = responsesData?.responses || [];
  const totalResponses = responsesData?.total || 0;
  const totalPages = Math.ceil(totalResponses / limit) || 1;

  const handleExport = async () => {
    try {
      const res = await fetchCsvContent();
      if (res.data?.csvContent) {
        const blob = new Blob([res.data.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${form?.slug || "axeform"}-responses.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Treasure coordinates successfully exported to CSV!");
      } else {
        toast.error("No CSV cargo retrieved.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to export responses cargo.");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  const toggleExpandResponse = (resId: string) => {
    if (expandedResponse === resId) {
      setExpandedResponse(null);
    } else {
      setExpandedResponse(resId);
    }
  };

  if (isFormLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-wano-cream/40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-wano-gold" />
        <h3 className="font-heading text-lg font-bold text-wano-cream">
          Opening Treasure Chests...
        </h3>
        <p className="text-xs">Locating form submissions and packing database logs.</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20 bg-ocean-mid/20 border border-wano-crimson/30 rounded-2xl max-w-md mx-auto p-6">
        <h3 className="font-heading text-lg font-bold text-wano-crimson mb-2">Island Lost</h3>
        <p className="text-xs text-wano-cream/50">We could not retrieve this form's credentials.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Shared navigation header */}
      <FormWorkspaceHeader
        formId={formId}
        title={form.title}
        status={form.status}
        slug={form.slug}
        activeTab="responses"
      />

      {/* Stats and Filter Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-ocean-mid/45 border border-ocean-surface/30 rounded-2xl shadow-md">
        {/* Total counts and CSV action */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-wano-gold/15 border border-wano-gold/25 flex items-center justify-center text-wano-gold">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-[10px] text-wano-cream/50 font-mono uppercase tracking-wider">
                Total Cargo Collected
              </h4>
              <p className="font-heading text-xl font-bold text-wano-cream">
                {totalResponses} {totalResponses === 1 ? "Response" : "Responses"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={totalResponses === 0 || isExporting}
            className="btn-gold text-xs h-10 rounded-xl px-4 flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ocean-deep" />
                Shipping CSV...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-ocean-deep" />
                Claim CSV Treasure
              </>
            )}
          </Button>
        </div>

        {/* Search filter input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/40" />
          <Input
            value={emailSearch}
            onChange={handleSearchChange}
            placeholder="Search by respondent email..."
            className="bg-ocean-deep/60 border-ocean-surface text-wano-cream pl-9 pr-4 py-2 rounded-xl text-xs w-full focus:border-wano-gold/45 focus:ring-0"
          />
        </div>
      </div>

      {/* Responses Cargo Log */}
      {isResponsesLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-wano-cream/45 gap-2.5">
          <Loader2 className="w-8 h-8 animate-spin text-wano-gold" />
          <p className="text-xs font-heading">Sifting through the scroll logs...</p>
        </div>
      ) : responses.length === 0 ? (
        <div className="text-center py-16 bg-ocean-mid/15 border-2 border-dashed border-ocean-surface/60 rounded-2xl text-wano-cream/35">
          <Trophy className="w-10 h-10 mx-auto stroke-1 text-wano-cream/25 mb-4 animate-pulse" />
          <h4 className="font-heading font-semibold text-sm text-wano-cream/80 mb-1">
            No Treasures Discovered Yet
          </h4>
          <p className="text-xs max-w-xs mx-auto leading-relaxed">
            {emailSearch
              ? "No submissions match this respondent email search filter."
              : "Set sail! Share your Grand Line survey link to begin gathering devil fruit responses."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((res, index) => {
            const isExpanded = expandedResponse === res.id;
            const completionTimeStr = res.metadata?.completionTime
              ? `${res.metadata.completionTime}s`
              : "Unknown";
            const countryStr = res.metadata?.country || "Grand Line";
            const submissionDateStr = format(new Date(res.submittedAt), "PPP p");

            return (
              <div
                key={res.id}
                className={`bg-ocean-mid/30 border rounded-2xl hover:border-wano-gold/30 transition-all duration-300 overflow-hidden ${
                  isExpanded ? "border-wano-gold/40 shadow-lg" : "border-ocean-surface/50"
                }`}
              >
                {/* Header Summary Row */}
                <div
                  onClick={() => toggleExpandResponse(res.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-wano-crimson/10 border border-wano-crimson/30 flex items-center justify-center text-wano-crimson font-heading font-bold text-xs shadow-inner">
                      #{totalResponses - (page - 1) * limit - index}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-wano-cream flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-wano-gold/70" />
                        {res.respondentEmail || "Anonymous Pirate"}
                      </h4>
                      <p className="text-[10px] text-wano-cream/40 font-mono flex items-center gap-1.5 mt-1 flex-wrap">
                        <Calendar className="w-3 h-3 text-wano-crimson/70" />
                        {submissionDateStr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-wano-cream/50 sm:self-auto self-start pl-12 sm:pl-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-wano-gold" />
                      Speed: {completionTimeStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-fruit-glow" />
                      Island: {countryStr}
                    </span>
                    <span className="text-[10px] font-bold text-wano-gold font-heading bg-wano-gold/5 border border-wano-gold/10 px-2 py-0.5 rounded">
                      {res.answers.length} {res.answers.length === 1 ? "Answer" : "Answers"}
                    </span>
                  </div>
                </div>

                {/* Collapsible Details Area */}
                {isExpanded && (
                  <div className="border-t border-ocean-surface/30 bg-ocean-deep/30 px-6 py-5 space-y-4 animate-slide-down">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-ocean-surface/20">
                      <Sparkles className="w-3.5 h-3.5 text-wano-gold animate-pulse" />
                      <h5 className="text-[9px] font-bold uppercase tracking-wider text-wano-gold font-heading">
                        Log Entry Answers Detail
                      </h5>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {res.answers.map((answer, i) => {
                        let renderValue = "";
                        if (Array.isArray(answer.value)) {
                          renderValue = answer.value.join(", ");
                        } else if (typeof answer.value === "boolean") {
                          renderValue = answer.value ? "✅ Checked (True)" : "❌ Unchecked (False)";
                        } else {
                          renderValue = String(answer.value);
                        }

                        return (
                          <div
                            key={i}
                            className="bg-ocean-mid/40 p-4 border border-ocean-surface/40 rounded-xl space-y-1.5"
                          >
                            <span className="text-[10px] font-bold uppercase tracking-wide text-wano-gold/80 font-heading block">
                              {answer.fieldLabel}
                            </span>
                            <span className="text-xs text-wano-cream font-medium block">
                              {renderValue || (
                                <span className="italic text-wano-cream/30">Blank</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Metadata summary */}
                    <div className="pt-4 border-t border-ocean-surface/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono text-wano-cream/30">
                      <span>Response ID: {res.id}</span>
                      <span className="truncate max-w-sm">
                        User Agent: {res.metadata?.userAgent || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-6 border-t border-ocean-surface/10 select-none">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-ocean-mid border border-ocean-surface hover:bg-ocean-surface text-wano-cream disabled:opacity-30 rounded-xl p-2.5 h-10 w-10 flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="w-4 h-4 text-wano-gold" />
          </Button>

          <span className="text-xs font-bold font-heading text-wano-cream">
            Page {page} of {totalPages}
          </span>

          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="bg-ocean-mid border border-ocean-surface hover:bg-ocean-surface text-wano-cream disabled:opacity-30 rounded-xl p-2.5 h-10 w-10 flex items-center justify-center shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-wano-gold" />
          </Button>
        </div>
      )}
    </div>
  );
}
