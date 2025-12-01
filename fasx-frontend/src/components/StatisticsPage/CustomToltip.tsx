import { formatMinutes } from "../hooks/useStatsData";

export const CustomTooltip = ({ active, payload, label, formatHours = false }: any) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);

  const formatValue = (v: number) => formatHours ? formatMinutes(v) : `${v} км`;

  return (
    <div className="bg-[#111]/95 border border-[#333] p-3 rounded-lg shadow-2xl text-sm backdrop-blur-md">
      <p className="font-bold text-gray-100 mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-gray-400">{p.name}</span>
          <span className="font-mono" style={{ color: p.fill }}>
            {formatValue(p.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-[#333] mt-2 pt-2 flex justify-between font-bold">
        <span>Итого</span>
        <span className="text-blue-400">{formatValue(total)}</span>
      </div>
    </div>
  );
};