export const buildChartFromKeyValue = (rows, key) => {
  const map = {};

  rows.forEach(r => {
    map[r[key]] = (map[r[key]] || 0) + 1;
  });

  return {
    labels: Object.keys(map),
    data: Object.values(map)
  };
};

export const buildMonthChart = (rows) => {
  const months = Array(12).fill(0);

  rows.forEach(r => {
    const month = new Date(r.fecha_reporte).getMonth();
    months[month]++;
  });

  return {
    labels: [
      "Ene","Feb","Mar","Abr","May","Jun",
      "Jul","Ago","Sep","Oct","Nov","Dic"
    ],
    data: months
  };
};