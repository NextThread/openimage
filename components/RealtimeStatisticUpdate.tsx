"use client";
import supabase from "@/lib/supabase/server";
import RealtimeStatistics from "./RealtimeStatistics";
import { useState, useEffect } from "react";
import { formatBytes } from "@/lib/utils";

export const revalidate = 0;

type Statistic = {
  id: string;
  created_at: string;
  imgconverted: number;
  totalsize: number;
  totalsizeconverted: number;
};

export default function StatisticUpdate({
  statistic,
}: {
  statistic: Statistic;
}) {
  const [stat, setStat] = useState(statistic);
  const id = 1;
  useEffect(() => {
    const channel = supabase
      .channel("realtimeStatistics")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "converts",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setStat(payload.new as Statistic);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, stat, setStat]);

  const percentageReduction = (
    totalSize: number,
    totalSizeCompressed: number
  ) => {
    return ((totalSize - totalSizeCompressed) / totalSize) * 100;
  };

  return (
    <h1 className="text-gray-500 text-xs ">
      {stat?.imgconverted?.toLocaleString() ?? '0'} imgs converted, compressed
      {formatBytes(stat?.totalsize ?? 0)} of data into{" "}
      {formatBytes(stat?.totalsizeconverted ?? 0)} globally, saved{" "}
      {percentageReduction(stat?.totalsize ?? 0, stat?.totalsizeconverted ?? 0).toFixed(2)}%
      <span className="animate-pulse">🌎</span>
    </h1>
  );
}
