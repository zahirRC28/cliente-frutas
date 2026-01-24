import { Route, Routes, Navigate } from 'react-router-dom';

import { RendAni } from '../components/RendAni';
import { ProtectedRoutes } from '../components/protections/ProtectedRoutes';
import { PublicProtection } from '../components/protections/PublicProtection';
import { LayoutGeneral } from '../layouts/LayoutGeneral';
import { DashBoard } from '../Pages/DashBoard';
import { Login } from '../Pages/Login';
import { Cultivos } from '../Pages/Cultivos';
import { Reportes } from '../Pages/ReportesPage';
import Productores from '../Pages/Productores';
import UsuariosPage from '../Pages/Usuarios'; // <-- nueva página

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
          <Route path="reportes" element={<Reportes/>} />
          <Route path="productores" element={<Productores/>} />
          <Route path="users" element={<UsuariosPage/>} /> {/* <-- admin user management */}
          {/* nested redirects para compatibilidad si quieres mantenerlos */}
          <Route path="user" element={<Navigate to="users" replace />} />
        </Route>

        {/*RUTAS DE MANAGER*/}
        <Route path="manager" element={
          <ProtectedRoutes roles={['Manager', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          <Route path="reportes" element={<Reportes/>} />
          <Route path="productores" element={<Productores/>} />
          <Route path="user" element={<Navigate to="productores" replace />} />
          <Route path="users" element={<Navigate to="productores" replace />} />
        </Route>

        {/*RUTAS DE ASESOR*/}
        <Route path="asesor" element={
          <ProtectedRoutes roles={['Asesor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          <Route path="reportes" element={<Reportes/>} />
          <Route path="productores" element={<Productores/>} />
          <Route path="user" element={<Navigate to="productores" replace />} />
          <Route path="users" element={<Navigate to="productores" replace />} />
        </Route>

        {/*RUTAS DE PRODUCTOR*/}
        <Route path="productor" element={
          <ProtectedRoutes roles={['Productor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          <Route path="cultivos" element={<Cultivos/>} />
          <Route path="reportes" element={<Reportes/>} />
        </Route>
      </Route>

      {/* Top-level redirects por compatibilidad */}
      <Route path="/admin/user" element={<Navigate to="/admin/users" replace />} />
      <Route path="/admin/users" element={<Navigate to="/admin/users" replace />} />
      <Route path="/manager/users" element={<Navigate to="/manager/productores" replace />} />
      <Route path="/manager/user" element={<Navigate to="/manager/productores" replace />} />
      <Route path="/asesor/users" element={<Navigate to="/asesor/productores" replace />} />
      <Route path="/asesor/user" element={<Navigate to="/asesor/productores" replace />} />

      <Route path='/*' element={<Navigate to={'/'} />} />
    </Routes>
  );
};