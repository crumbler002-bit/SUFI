"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card } from "@/components/ui/Card";

const HOURS = ["5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161422] border border-[#332F52] rounded-[8px] px-3 py-2 text-[11px]">
      <p className="text-[#5a5480] mb-1 font-mono">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value}%</p>
      ))}
    </div>
  );
};

interface Props {
  demand: number[];
}

export function DemandChart({ demand }: Props) {
  const chartData = demand.map((v, i) => ({ time: HOURS[i], demand: v }));

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[12px] font-medium text-[#ede9ff]">Demand Forecast · Tonight</div>
          <div className="text-[10px] text-[#5a5480] font-mono mt-[2px]">Predicted covers by hour</div>
        </div>
        <div className="flex gap-3 text-[10px] text-[#5a5480]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-[2px] bg-purple-500 inline-block" />Predicted
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} barSize={28}>
          <XAxis dataKey="time" tick={{ fill: "#5a5480", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(124,58,237,0.08)" }} />
          <Bar dataKey="demand" name="demand" fill="#7C3AED" radius={[4, 4, 0, 0]}
            label={{ position: "top", fill: "#5a5480", fontSize: 9, formatter: (v: number) => `${v}%` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
