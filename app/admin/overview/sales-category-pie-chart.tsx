/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useColorStore from "@/hooks/use-color-store";
import { useTheme } from "next-themes";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const PIE_COLORS: { [key: string]: { light: string; dark: string } } = {
  Yellow: {
    light: "#f6e27f",
    dark: "#f1d541",
  },
  Blue: {
    light: "#8ab6f9",
    dark: "#3399ff",
  },
  Green: {
    light: "#7fdc92",
    dark: "#06dc06",
  },
  Red: {
    light: "#f28b82",
    dark: "#ff3333",
  },
};

export default function SalesCategoryPieChart({ data }: { data: any[] }) {
  const { theme } = useTheme();
  const { color } = useColorStore(theme);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <>
        <text
          x={x}
          y={y}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          className="text-xs"
        >
          {`${data[index]._id} ${data[index].totalSales} sales`}
        </text>
      </>
    );
  };

  const selected = PIE_COLORS[color?.name || "Blue"];
  const chartColor = theme === "dark" ? selected.dark : selected.light;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="totalSales"
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColor} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
