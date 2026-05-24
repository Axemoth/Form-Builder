"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { trpc } from "~/trpc/client";
import { FormWorkspaceHeader } from "~/components/layout/form-workspace-header";
import { StatsCard } from "~/components/dashboard/stats-card";
import { BarChart3, Loader2, TrendingUp, Eye, Anchor, Clock, Sparkles, Trophy } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function FormAnalyticsPage() {
  const params = useParams();
  const formId = params.formId as string;

  // Fetch Form details (for workspace header)
  const { data: form, isLoading: isFormLoading } = trpc.form.getFormById.useQuery(
    { id: formId },
    { refetchOnWindowFocus: false },
  );

  // Fetch Analytics data
  const { data: analytics, isLoading: isAnalyticsLoading } = trpc.form.getFormAnalytics.useQuery(
    { formId },
    { refetchOnWindowFocus: false },
  );

  // Parse trends data for Recharts
  const chartData = useMemo(() => {
    if (!analytics?.dailyTrends || analytics.dailyTrends.length === 0) {
      return [];
    }
    // Sort chronologically by date
    return [...analytics.dailyTrends].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [analytics]);

  if (isFormLoading || isAnalyticsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-wano-cream/40 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-wano-gold" />
        <h3 className="font-heading text-lg font-bold text-wano-cream">Reading Sea Charts...</h3>
        <p className="text-xs">
          Gathering island traffic, conversions, and Devil Fruit distributions.
        </p>
      </div>
    );
  }

  if (!form || !analytics) {
    return (
      <div className="text-center py-20 bg-ocean-mid/20 border border-wano-crimson/30 rounded-2xl max-w-md mx-auto p-6">
        <h3 className="font-heading text-lg font-bold text-wano-crimson mb-2">Sea Charts Lost</h3>
        <p className="text-xs text-wano-cream/50">
          We could not retrieve analytics data for this form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Shared workspace navigation header */}
      <FormWorkspaceHeader
        formId={formId}
        title={form.title}
        status={form.status}
        slug={form.slug}
        activeTab="analytics"
      />

      {/* Analytics Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Island Viewings"
          value={analytics.totalViews}
          icon={Eye}
          description="Total visits to form link"
        />
        <StatsCard
          title="Cargo Captured"
          value={analytics.totalSubmissions}
          icon={Anchor}
          description="Total form submissions"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${analytics.conversionRate}%`}
          icon={TrendingUp}
          description="Visit-to-submission ratio"
        />
        <StatsCard
          title="Completion Speed"
          value={`${analytics.averageCompletionTime}s`}
          icon={Clock}
          description="Average response time"
        />
      </div>

      {/* Navigational wave daily trends line chart */}
      <div className="bg-ocean-mid/45 border border-ocean-surface/30 p-6 rounded-2xl shadow-md relative overflow-hidden space-y-6">
        {/* Glow effect background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-wano-gold/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="flex items-center gap-2 pb-4 border-b border-ocean-surface/20">
          <BarChart3 className="w-5 h-5 text-wano-gold animate-pulse" />
          <div>
            <h3 className="font-heading text-lg font-bold text-wano-cream">
              Log Pose Tidal Activity
            </h3>
            <p className="text-[10px] text-wano-cream/50 font-mono uppercase tracking-wider mt-0.5">
              Daily Views vs Submissions Trends
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="text-center py-20 text-wano-cream/35">
            <Trophy className="w-10 h-10 mx-auto text-wano-cream/20 mb-3 animate-bounce" />
            <p className="text-xs">
              No historical voyages logged. Share your island link to record traffic.
            </p>
          </div>
        ) : (
          <div className="w-full h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A3A5C" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  stroke="#FFF8E7"
                  style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#FFF8E7"
                  style={{ fontSize: 10, opacity: 0.5, fontFamily: "monospace" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0F2340",
                    border: "2px solid #1A3A5C",
                    borderRadius: "12px",
                    color: "#FFF8E7",
                    fontFamily: "sans-serif",
                    fontSize: "11px",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    color: "#FFF8E7",
                    opacity: 0.8,
                    paddingTop: "10px",
                  }}
                />
                <Area
                  type="monotone"
                  name="Views"
                  dataKey="views"
                  stroke="#C9A84C"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  name="Submissions"
                  dataKey="submissions"
                  stroke="#C41E3A"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubs)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Devil Fruit Distribution Summaries */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-ocean-surface/20">
          <Sparkles className="w-4 h-4 text-wano-gold animate-pulse" />
          <h3 className="font-heading text-lg font-bold text-wano-cream">
            Devil Fruit Choice Distribution
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.fieldDistribution.map((dist, i) => {
            const stats = dist.stats as any;
            const hasData = Object.keys(stats).length > 0;
            const totalAnswerCount = Object.entries(stats).reduce((acc, [key, val]) => {
              if (key === "average") return acc;
              return acc + Number(val || 0);
            }, 0);

            return (
              <div
                key={i}
                className="bg-ocean-mid/45 border border-ocean-surface/30 p-5 rounded-2xl shadow-md space-y-4 hover:border-wano-gold/10 transition-all duration-300 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 border-b border-ocean-surface/20 pb-3">
                  <div className="min-w-0">
                    <h4 className="font-heading text-sm font-bold text-wano-cream truncate">
                      {dist.fieldLabel}
                    </h4>
                    <span className="text-[9px] font-mono text-wano-gold uppercase font-semibold">
                      🍇 {dist.fieldType.replace("_", " ")} field
                    </span>
                  </div>
                  {dist.fieldType === "rating" && stats.average !== undefined && (
                    <div className="bg-wano-gold/10 border border-wano-gold/25 px-2.5 py-1 rounded-xl text-center shrink-0">
                      <span className="text-[8px] block font-mono text-wano-gold uppercase font-bold">
                        Average
                      </span>
                      <span className="text-xs font-bold text-wano-cream font-heading">
                        ⭐ {stats.average} / 5
                      </span>
                    </div>
                  )}
                </div>

                {/* Distributions */}
                {!hasData ? (
                  <div className="py-8 text-center text-[10px] text-wano-cream/30 italic">
                    No answer distributions captured for this field yet.
                  </div>
                ) : dist.fieldType === "single_select" || dist.fieldType === "multi_select" ? (
                  <div className="space-y-3.5 max-h-56 overflow-y-auto axe-scrollbar pr-1">
                    {Object.entries(stats).map(([option, count]) => {
                      const countNum = Number(count);
                      const percent =
                        totalAnswerCount > 0 ? Math.round((countNum / totalAnswerCount) * 100) : 0;

                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-medium text-wano-cream/80">
                            <span className="truncate pr-4">{option}</span>
                            <span className="font-mono text-wano-gold font-bold">
                              {countNum} ({percent}%)
                            </span>
                          </div>
                          <div className="h-2.5 bg-ocean-deep rounded-full overflow-hidden border border-ocean-surface/40 relative">
                            {/* Colorful gradient indicator fill */}
                            <div
                              className="h-full bg-gradient-to-r from-fruit-purple via-wano-crimson to-wano-gold rounded-full transition-all duration-500 shadow-[0_0_6px_rgba(201,168,76,0.2)]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : dist.fieldType === "checkbox" ? (
                  <div className="grid grid-cols-2 gap-4 py-2">
                    <div className="bg-ocean-deep/55 p-3.5 border border-ocean-surface/40 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-fruit-glow/90 uppercase font-heading block">
                        Checked (Yes)
                      </span>
                      <span className="font-mono text-xl font-bold text-wano-cream block">
                        {Number(stats.true || 0)}
                      </span>
                    </div>
                    <div className="bg-ocean-deep/55 p-3.5 border border-ocean-surface/40 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-wano-crimson/95 uppercase font-heading block">
                        Unchecked (No)
                      </span>
                      <span className="font-mono text-xl font-bold text-wano-cream block">
                        {Number(stats.false || 0)}
                      </span>
                    </div>
                  </div>
                ) : dist.fieldType === "rating" ? (
                  <div className="space-y-3 pt-1">
                    {[5, 4, 3, 2, 1].map((ratingStar) => {
                      const starStr = String(ratingStar);
                      const countNum = Number(stats[starStr] || 0);
                      const percent =
                        totalAnswerCount > 0 ? Math.round((countNum / totalAnswerCount) * 100) : 0;

                      return (
                        <div key={ratingStar} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold font-heading text-wano-gold w-12 shrink-0">
                            ⭐ {ratingStar} Star
                          </span>
                          <div className="flex-1 h-2 bg-ocean-deep rounded-full overflow-hidden border border-ocean-surface/35">
                            <div
                              className="h-full bg-wano-gold rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-wano-cream/45 w-12 text-right shrink-0">
                            {countNum} ({percent}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-[10px] text-wano-cream/30 italic">
                    Freeform answers captured. View them on the "Treasures Collected" tab.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
