import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  positive: boolean;
}

export function SparklineChart({ data, positive }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={positive ? "sparkGreen" : "sparkRed"} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={positive ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)"} stopOpacity={0.3} />
            <stop offset="100%" stopColor={positive ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={positive ? "hsl(142, 71%, 45%)" : "hsl(0, 72%, 51%)"}
          strokeWidth={1.5}
          fill={`url(#${positive ? "sparkGreen" : "sparkRed"})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
