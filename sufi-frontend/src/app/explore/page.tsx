"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSufiStore } from "@/lib/state/sufiStore";
import { useTrends } from "@/lib/hooks/useTrends";
import Navbar from "@/components/core/Navbar";
import SearchBar from "@/components/explore/SearchBar";
import Filters from "@/components/explore/Filters";
import ResultsGrid from "@/components/explore/ResultsGrid";
import DetailPanel from "@/components/explore/DetailPanel";
import CompareBar from "@/components/explore/CompareBar";
import ComparisonPanel from "@/components/explore/ComparisonPanel";

function ExploreContent() {
  const params = useSearchParams();
  const q = params.get("q");
  const { search } = useSufiStore();

  useEffect(() => {
    if (q) search(q);
  }, [q, search]);

  useTrends();

  return (
    <>
      <Navbar />
      <div className="pt-14">
        <SearchBar />
        <div className="flex" style={{ height: "calc(100vh - 14rem - 56px)" }}>
          <Filters />
          <ResultsGrid />
          <DetailPanel />
        </div>
      </div>
      <CompareBar />
      <ComparisonPanel />
    </>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ExploreContent />
    </Suspense>
  );
}
