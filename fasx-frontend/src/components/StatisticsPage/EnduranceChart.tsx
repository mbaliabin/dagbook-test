// src/pages/StatisticsPage/components/EnduranceChart.tsx
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

export const EnduranceChart = ({ data, zones }: { data: any[], zones: any[] }) => (
  <div className="bg-[#1a1a1d] p-5 rounded-2xl shadow-lg">
    <h2 className="text-lg font-semibold mb-4 text-gray-100">Зоны выносливости</h2>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={0} barCategoryGap="0%">
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#888", fontSize:12}}/>
          <Tooltip content={<CustomTooltip formatHours={true} />} />
          {zones.map(z => (
            <Bar key={z.zone} dataKey={z.zone} stackId="a" fill={z.color} radius={[4,4,0,0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);