export const ChartWrapper = ({ title, children }) => {
  return (
    <div className="chart-card">

      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};