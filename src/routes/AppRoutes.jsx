import { Route, Routes }  from 'react-router-dom'
import { Navigate } from 'react-router-dom'

import { RendAni } from '../components/RendAni'
//import { LoginPage } from '../pages/LoginPage'

import { ProtectedRoutes } from '../components/protections/ProtectedRoutes'
import { PublicProtection } from '../components/protections/PublicProtection'
import { LayoutGeneral } from '../layouts/LayoutGeneral'
import { DashBoard } from '../Pages/DashBoard'
import { Login } from '../Pages/Login'

/**
 * Componente de rutas principales de la aplicación.
 * Define todas las rutas públicas y protegidas según el rol del usuario.
 *
 * Rutas principales:
 * - /               -> LoginPage (protegida como pública)
 * - /admin/*        -> Panel de administrador
 * - /manager/*         -> Panel de manager
 * - /asesor/*      -> Panel de asesor
 * - /productor/*      -> Panel de productor
 *
 * @component
 * @returns {JSX.Element} Elemento JSX con la definición de rutas
 */
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<RendAni />}>
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
          {/*SUBRUTAS DE ADMIN*/}
          

        </Route>

        {/*RUTAS DE MANAGER*/}
        <Route path="manager" element={
          <ProtectedRoutes roles={['Manager', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          {/*SUBRUTAS DE MANAGER*/}

        </Route>

        {/*RUTAS DE ASESOR*/}
        <Route path="asesor" element={
          <ProtectedRoutes roles={['Asesor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          {/*SUBRUTAS DE ASESOR*/}
        </Route>

        {/*RUTAS DE PRODUCTOR*/}
        <Route path="productor" element={
          <ProtectedRoutes roles={['Productor', 'Administrador']}>
            <LayoutGeneral/>
          </ProtectedRoutes>
        }>
          <Route index element={<DashBoard/>} />
          {/*SUBRUTAS DE PRODUCTOR*/}

        </Route>
      </Route>
      <Route path='/*' element={<Navigate to={'/'} />} />
    </Routes>
  )
}
