"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GraficoChartPoint } from "../types";

interface GraficoEntradasRetornosProps {
  data: GraficoChartPoint[];
}

export function GraficoEntradasRetornos({ data }: GraficoEntradasRetornosProps) {
  return (
    <div className="w-full" style={{ height: 370 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="mes"
            label={{ value: "Meses del año", position: "insideBottom", offset: -5 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) =>
              typeof value === "number"
                ? value.toLocaleString("es-CO")
                : String(value ?? "")
            }
            labelFormatter={(label) => String(label)}
          />
          <Legend verticalAlign="bottom" height={36} />
          <Bar
            dataKey="entradas"
            name="Entradas"
            fill="#4f81bc"
            barSize={28}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="retornos"
            name="Retornos"
            stroke="#c0504d"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="posibles"
            name="Posibles Retornos"
            fill="#9bbb59"
            stroke="#7a9a3f"
            fillOpacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
