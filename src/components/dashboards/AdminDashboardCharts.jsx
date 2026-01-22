import { useState } from "react";
import { LineChart } from "../charts/LineChart";
import { PieChart } from "../charts/PieChart";
import { ChartWrapper } from "../charts/ChartWrapper";
import { buildMonthChart, buildChartFromKeyValue } from "../../helpers/chartHelpers";

export const AdminDashboardCharts = ({ reportes, cultivos }) => {
  const [year, setYear] = useState(new Date().getFullYear());

  // 🔹 Reportes por mes
  const reportesPorMes = buildMonthChart(reportes);

  // 🔹 Cultivos por tipo
  const cultivosPorTipo = buildChartFromKeyValue(
    cultivos,
    "tipo_cultivo",
    "id" // solo contar
  );

  return (
    <>
        <div className="charts-grid">
            <ChartWrapper title="Reportes por mes">
            <LineChart
                labels={reportesPorMes.labels}
                data={reportesPorMes.data}
                label="Reportes"
            />
            </ChartWrapper>

            <ChartWrapper title="Cultivos por tipo">
            <PieChart
                labels={cultivosPorTipo.labels}
                data={cultivosPorTipo.data}
                label="Cultivos"
            />
            </ChartWrapper>
        </div>
    </>
  );
};