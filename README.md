
# Cliente Frutas - Plataforma de Gestión Agrícola

Aplicación web moderna para la gestión de cultivos, incidencias, reportes, usuarios y comunicación en tiempo real para productores, asesores, managers y administradores agrícolas.

---

## Instalación y Puesta en Marcha

1. **Clona el repositorio:**
	```bash
	git clone <URL_DEL_REPO>
	cd cliente-frutas
	```
2. **Instala las dependencias:**
	```bash
	yarn install
	# o
	npm install
	```
3. **Configura variables de entorno:**
	- Crea un archivo `.env` y define `VITE_BACKEND_URL` con la URL de tu backend.
4. **Inicia la app en modo desarrollo:**
	```bash
	yarn dev
	# o
	npm run dev
	```

---

## Dependencias Principales

| Paquete                | Uso principal                                                                 |
|------------------------|------------------------------------------------------------------------------|
| react, react-dom       | Librería principal de UI                                                      |
| react-router-dom       | Ruteo SPA                                                                     |
| axios                  | Llamadas HTTP (algunas partes)                                                |
| socket.io-client       | Comunicación en tiempo real (chat, notificaciones)                            |
| js-cookie              | Manejo de autenticación y persistencia de sesión                              |
| jwt-decode             | Decodificación de JWT para roles y usuarios                                   |
| chart.js, react-chartjs-2, recharts | Gráficas y visualización de datos                                |
| leaflet, react-leaflet, leaflet-draw, react-leaflet-draw | Mapas interactivos y dibujo de parcelas     |
| @turf/turf             | Operaciones geoespaciales (validación de polígonos, centroides, etc.)         |
| sweetalert2            | Diálogos y alertas modales                                                    |
| react-toastify         | Notificaciones tipo toast                                                     |
| lucide-react           | Iconografía moderna                                                           |
| @react-three/fiber, @react-three/drei, three | Visor 360° de parcelas                                 |
| prop-types             | Validación de props en componentes                                            |
| react-markdown         | Renderizado de respuestas del chatbot                                         |

---

## Estructura del Proyecto

```
src/
  App.jsx                # Componente raíz
  main.jsx               # Entry point
  assets/                # Imágenes y recursos estáticos
  components/            # Componentes reutilizables
	 chatbotAgricola.css  # Estilos del chatbot
	 ChatbotAgricola.jsx  # Chatbot agrícola con IA
	 DataTable.jsx        # Tabla de datos reutilizable
	 ...
	 Cultivos/            # Componentes de gestión de cultivos
	 dashboards/          # Dashboards por rol
	 map/                 # Mapa interactivo (Leaflet)
	 protections/         # Rutas protegidas y públicas
	 sidebar/             # Sidebar de navegación
	 ui/                  # UI: Card, Notificaciones, Toast
  contexts/              # Contextos globales (usuario, socket)
  helpers/               # Funciones utilitarias (fetch, cache, coords, etc.)
  hooks/                 # Hooks personalizados (auth, cultivos, reportes, chat, etc.)
  layouts/               # Layouts generales
  Pages/                 # Vistas principales (Cultivos, Reportes, Incidencias, etc.)
  routes/                # Definición de rutas principales
  styles/                # Estilos globales y por componente
```

---

## Rutas Principales (SPA)

La navegación y permisos están basados en roles: Administrador, Manager, Asesor, Productor.

| Ruta base         | Rol(es)           | Vistas disponibles                                                                 |
|-------------------|-------------------|------------------------------------------------------------------------------------|
| `/`               | Público           | Login                                                                              |
| `/admin/*`        | Administrador     | Dashboard, Cultivos, Reportes, Incidencias, Productores, Usuarios, Chat, Chatbot    |
| `/manager/*`      | Manager           | Dashboard, Cultivos, Reportes, Incidencias, Productores, Chat, Chatbot              |
| `/asesor/*`       | Asesor            | Dashboard, Cultivos, Reportes, Incidencias, Productores, Chat, Chatbot              |
| `/productor/*`    | Productor         | Dashboard, Cultivos, Reportes, Incidencias, Chat, Chatbot                           |

**Ejemplo de rutas:**
- `/admin/cultivos` → Gestión de cultivos (admin)
- `/manager/reportes` → Reportes de productores
- `/asesor/incidencias` → Incidencias asignadas
- `/productor/chat` → Mensajería directa

---

## Modelos y Funcionalidades Clave

### Usuario
- Autenticación JWT, roles (Administrador, Manager, Asesor, Productor)
- Gestión CRUD de usuarios (solo admin)

### Cultivo
- Registro de parcelas mediante mapa interactivo (Leaflet + Turf)
- Validación de solapamiento de zonas
- Visualización de datos históricos, alertas, galería multimedia y visor 360°

### Reporte
- Creación, edición y filtrado de reportes asociados a cultivos
- Filtros por productor y búsqueda por título

### Incidencia
- Registro y gestión de incidencias por cultivo
- Flujos diferenciados según rol (Productor, Asesor, Manager, Admin)

### Chat y Notificaciones
- Chat en tiempo real entre usuarios (socket.io)
- Notificaciones push y panel de alertas

### Chatbot Agrícola
- Asistente IA para consultas agrícolas, integrado vía API

---

## Scripts útiles

- `yarn dev` / `npm run dev` — Inicia el servidor de desarrollo
- `yarn build` / `npm run build` — Compila la app para producción
- `yarn lint` / `npm run lint` — Linting del código

---

## Notas adicionales

- El backend debe estar corriendo y accesible en la URL configurada en `.env`.
- El sistema está preparado para ampliarse con nuevos roles, vistas y módulos.
- Para producción, se recomienda servir la app compilada (`dist/`) desde un servidor estático.

---

