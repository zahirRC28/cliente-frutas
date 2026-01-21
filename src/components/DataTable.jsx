import "../styles/table.css";
import { useNavigate } from "react-router-dom";

export const DataTable = ({ title, columnas, data, onClickInfo , todos, limit}) => {
    //con eso puedo configurar cuantos datos mostrar en la tabla con slice ya que extrae dependiedo de los parametros
  const visibleData = limit ? data.slice(0, limit) : data;
  const parseFecha = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }
  //console.log(visibleData);
  const navigate = useNavigate();
  return (
    <div className="table-card">
      <div className="table-header">
        <h3>{title}</h3>
        {todos &&
          <button onClick={() => navigate(todos)} >Ver todos</button>
        }
      </div>

      <table>
        <thead>
          <tr>
            {columnas.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
            {onClickInfo && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {/*Mapeao lo datos y las columnas que necesito*/}
          {visibleData.map((row, index) => (
            <tr key={index}>
              {columnas.map(col => {
                  let value;
                  // Si existe un render personalizado, usarlo
                  if (col.render) {
                    value = col.render(row);
                  } else {
                    // Para fechas que se vean bien formateadas
                    if (col.key.includes("fecha") && row[col.key]) {
                      value = new Date(row[col.key]).toLocaleDateString("es-ES", parseFecha);
                    } else {
                    // Si es null o undefined, mostrar "-" en vez de vacío
                      value = row[col.key] ?? "-";
                    }
                  }
                return <td key={col.key} data-label={col.label}>{value}</td>;
                }
              )}
              {onClickInfo && (
                <td>
                  <button
                    className="table-action-button"
                    onClick={(e) => { e.stopPropagation(); onClickInfo?.(row); }}
                  >
                    Info
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
