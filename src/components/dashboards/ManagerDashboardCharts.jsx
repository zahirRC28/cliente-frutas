import { PieChart } from '../charts/PieChart';
import { ChartWrapper } from '../charts/ChartWrapper';
import { buildChartFromKeyValue } from '../../helpers/chartHelpers';

export const ManagerDashboardCharts = ({ cultivos }) => {
  // Gráfico de cultivos por tipo
  const cultivosPorTipo = buildChartFromKeyValue(cultivos || [], 'tipo_cultivo');

  return (
    <ChartWrapper title="Cultivos por tipo">
      <PieChart
        labels={cultivosPorTipo.labels}
        data={cultivosPorTipo.data}
        label="Cultivos"
      />
    </ChartWrapper>
  );
}
