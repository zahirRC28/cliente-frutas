export const ChartWrapper = ({ title, children }) => {
  return (
    <div className="chart-card">
      <h3>{title}</h3>
      <div className="chart-body">
        {children}
      </div>
    </div>
  );
};