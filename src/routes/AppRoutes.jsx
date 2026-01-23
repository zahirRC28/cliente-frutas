import { Route, Routes, Navigate } from 'react-router-dom';

import { RendAni } from '../components/RendAni';
import { ProtectedRoutes } from '../components/protections/ProtectedRoutes';
import { PublicProtection } from '../components/protections/PublicProtection';
import { LayoutGeneral } from '../layouts/LayoutGeneral';
import { DashBoard } from '../Pages/DashBoard';
import { Login } from '../Pages/Login';
import { Cultivos } from '../Pages/Cultivos';
import { Reportes } from '../Pages/ReportesPage';

/**
 * Componente de rutas principales de la aplicación.
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<RendAni/>}>
        <Route index element={
          <PublicProtection>
            <Login/>
          </PublicProtection>
        } />

        {/*RUTAS DE ADMINISTRADOR*/}
        <Route path="admin" element={
          <ProtectedRoutes roles={['Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          {/* Reportes para administrador */}
          <Route path="reportes" element={<Reportes/>} />
        </Route>

        {/*RUTAS DE MANAGER*/}
        <Route path="manager" element={
          <ProtectedRoutes roles={['Manager', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          {/* Reportes para manager */}
          <Route path="reportes" element={<Reportes/>} />
        </Route>

        {/*RUTAS DE ASESOR*/}
        <Route path="asesor" element={
          <ProtectedRoutes roles={['Asesor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          {/* Reportes para asesor */}
          <Route path="reportes" element={<Reportes/>} />
        </Route>

        {/*RUTAS DE PRODUCTOR*/}
        <Route path="productor" element={
          <ProtectedRoutes roles={['Productor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          {/* Reportes para productor */}
          <Route path="reportes" element={<Reportes/>} />
        </Route>
      </Route>

      <Route path='/*' element={<Navigate to={'/'} />} />
    </Routes>
  );
};