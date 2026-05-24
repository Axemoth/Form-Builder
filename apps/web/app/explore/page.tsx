"use client";

import { useState, useEffect } from "react";
import { trpc } from "~/trpc/client";
import { PageHeader } from "~/components/layout/page-header";
import { CompassLoader } from "~/components/ui/compass-loader";
import { CherryBlossoms } from "~/components/ui/cherry-blossoms";
import { WaveBackground } from "~/components/ui/wave-background";
import { InkBrushDivider } from "~/components/ui/ink-brush-divider";
import { Compass, Search, Map, Calendar, ExternalLink, Anchor, Loader2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [limit] = useState(50);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all public forms using tRPC
  const { data, isLoading } = trpc.form.getPublicExploreForms.useQuery(
    {
      search: search || undefined,
      page,
      limit,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const forms = data?.forms || [];
  const total = data?.total || 0;

  return (
    <div className="min-h-screen bg-ocean-deep text-wano-cream relative overflow-hidden pb-20 pt-8 px-4 md:px-8">
      {/* Aesthetic layout backgrounds */}
      <CherryBlossoms intensity="light" className="opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.06)_0%,transparent_60%)] pointer-events-none" />

      {/* Decorative Sea Chart Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,248,231,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,248,231,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Navigation Home Link */}
        <div className="flex justify-between items-center select-none">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Compass className="w-5 h-5 text-wano-gold group-hover:rotate-45 transition-transform" />
            <span className="font-heading text-sm font-bold text-wano-cream group-hover:text-wano-gold transition-colors uppercase tracking-wider">
              AxeForm Hub
            </span>
          </Link>
          <Link href="/dashboard">
            <Button className="btn-crimson rounded-xl text-[10px] font-heading font-bold px-4 py-2 h-auto flex items-center gap-1.5 shadow-md">
              <Anchor className="w-3 h-3 text-wano-gold" />
              Captain's Quarters
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-heading text-4xl md:text-5xl font-black text-gradient-gold tracking-wide drop-shadow">
            Floating Islands Directory
          </h1>
          <p className="text-xs md:text-sm text-wano-cream/65 max-w-xl mx-auto leading-relaxed font-sans">
            Explore open public island dispatch boards charted across the Grand Line ocean. Cast
            your votes, log coordinates, and answer calls for recruits!
          </p>
          <div className="max-w-md mx-auto">
            <InkBrushDivider className="w-48 mx-auto" />
          </div>
        </div>

        {/* Search Bar filter */}
        <div className="max-w-lg mx-auto bg-ocean-mid/50 border border-ocean-surface/65 p-4 rounded-2xl shadow-lg backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wano-cream/40" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charted islands by keywords..."
              className="bg-ocean-deep border-ocean-surface text-wano-cream pl-10 pr-4 py-2.5 rounded-xl text-xs focus:border-wano-gold/45 focus:ring-0 w-full"
            />
          </div>
        </div>

        {/* Floating cards grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-wano-cream/45 gap-4">
            <CompassLoader size="lg" />
            <p className="text-xs font-heading">Consulting Grand Line sea charts...</p>
          </div>
        ) : forms.length === 0 ? (
          <div className="text-center py-20 bg-ocean-mid/20 border-2 border-dashed border-ocean-surface/50 rounded-3xl max-w-xl mx-auto p-8">
            <Map className="w-12 h-12 text-wano-cream/25 mx-auto mb-4 animate-pulse" />
            <h4 className="font-heading text-base font-semibold text-wano-cream/80 mb-1">
              No Uncharted Islands Found
            </h4>
            <p className="text-xs text-wano-cream/50 max-w-xs mx-auto">
              We couldn't trace any public islands matching your coordinates. Try adjusting the
              search keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
            {forms.map((form) => {
              const formattedDate = mounted ? format(new Date(form.createdAt), "MMM dd, yyyy") : "";

              return (
                <div
                  key={form.id}
                  className="bg-ocean-mid/45 border-2 border-ocean-surface/60 rounded-2xl p-6 hover:border-wano-gold/30 hover:bg-ocean-mid/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group h-64 shadow-md"
                >
                  {/* Watermark Compass logo in card background */}
                  <Compass className="absolute -bottom-6 -right-6 w-28 h-28 stroke-[0.4] stroke-ocean-surface/40 group-hover:stroke-wano-gold/10 group-hover:scale-110 transition-all pointer-events-none" />

                  {/* Card corner nodes */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-ocean-surface/50 rounded-tl-xl pointer-events-none" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-ocean-surface/50 rounded-tr-xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-ocean-surface/50 rounded-bl-xl pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-ocean-surface/50 rounded-br-xl pointer-events-none" />

                  <div className="space-y-3.5 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-wano-gold font-bold tracking-wider uppercase bg-wano-gold/5 border border-wano-gold/10 px-2 py-0.5 rounded">
                        🏝️ Active Island
                      </span>
                      <span className="text-[9px] font-mono text-wano-cream/40 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-wano-crimson/50" />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-wano-cream group-hover:text-wano-gold transition-colors leading-tight line-clamp-2">
                      {form.title}
                    </h3>

                    <p className="text-xs text-wano-cream/60 leading-relaxed font-sans line-clamp-3">
                      {form.description ||
                        "No logs recorded for this charted land. Open coordinate dispatch for more details."}
                    </p>
                  </div>

                  <div className="pt-4 flex items-center justify-between relative z-10 border-t border-ocean-surface/20">
                    <span className="text-[8px] text-wano-cream/35 font-mono uppercase tracking-widest">
                      ID: {form.slug.substring(0, 12)}
                    </span>

                    <Link href={`/f/${form.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button className="btn-gold-outline text-[10px] font-heading font-bold px-3 py-1.5 h-auto flex items-center gap-1">
                        Land Here
                        <ExternalLink className="w-3 h-3 text-wano-gold" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <WaveBackground position="bottom" className="opacity-20" />
    </div>
  );
}
