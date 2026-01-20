import { Users, Sprout, FileText } from "lucide-react"
import { Card } from "../components/ui/Card"
import { userAuth } from "../hooks/userAuth"

export const DashBoard = () => {
  const { getRole } = userAuth();
  const rol = getRole();
  console.log(rol);

  return (
  <>
    { rol === 'Administrador' && (
      <>
        <section className="cards-container">
          <Card icono={<Users />} titulo="Usuarios" subtitulo={4} variant="counter"/>
          <Card icono={<Sprout />} titulo="Cultivos" subtitulo={18} variant="counter"/>
          <Card icono={<FileText />} titulo="Informes" subtitulo={57} variant="counter"/>
        </section>
        

      </>
    )}
  </>
  )
}
