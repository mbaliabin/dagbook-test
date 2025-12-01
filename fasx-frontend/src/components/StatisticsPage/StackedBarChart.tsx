import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CustomTooltip } from "./CustomTooltip";

interface Props {
  data: any[];
  keys: string[];
  colors: Record<string, string>;
  formatHours?: boolean;
  height?: number;
}

export const StackedBarChart = ({ data, keys, colors, formatHours = false, height = 280 }: Props) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} barGap={0} barCategoryGap={1}>
      <XAxis dataKey="name" tick={{ fill: "#888", fontSize: 12 }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip formatHours={formatHours} />} />
      {keys.map(key => (
        <Bar
          key={key}
          dataKey={key}
          stackId="a"
          fill={colors[key]}
          radius={[key === keys[keys.length - 1] ? 4 : 0, key === keys[keys.length - 1] ? 4 : 0, 0, 0]}
        />
      ))}
    </BarChart>
  </ResponsiveContainer>
);