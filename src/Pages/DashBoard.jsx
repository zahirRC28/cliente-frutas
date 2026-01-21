import { Users, Sprout, FileText } from "lucide-react";
import { Card } from "../components/ui/Card";
import { userAuth } from "../hooks/userAuth";

export const DashBoard = () => {
  const auth = userAuth() || {};
  const getRole = auth.getRole || (() => 'Invitado');
  const rol = getRole();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Panel de Control</h1>
      
      {/* VISTA ADMINISTRADOR */}
      {rol === 'Administrador' && (
        <section className="cards-container">
          <Card icono={<Users />} titulo="Usuarios" subtitulo={4} variant="counter"/>
          <Card icono={<Sprout />} titulo="Cultivos Totales" subtitulo={18} variant="counter"/>
          <Card icono={<FileText />} titulo="Informes" subtitulo={57} variant="counter"/>
        </section>
      )}

      {/* VISTA PRODUCTOR (Simplificada) */}
      {rol === 'Productor' && (
        <div>
            <p>Bienvenido a tu panel de gestión.</p>
            <section className="cards-container">
                <Card icono={<Sprout />} titulo="Mis Cultivos Activos" subtitulo={2} variant="counter"/>
            </section>
        </div>
      )}
    </div>
  );
};