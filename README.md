# CardTrading Platform — Frontend

Aplicación web de intercambio de cartas coleccionables. Permite a los usuarios registrar su colección, explorar el catálogo global, proponer intercambios (trades) con otros coleccionistas y gestionar su perfil.

---

## Modulos y funcionalidades

### Autenticacion
- Registro e inicio de sesion con email y contraseña
- Restablecimiento de contraseña por email (dos pasos: solicitud + confirmacion)
- Cierre de sesion con limpieza de tokens
- Refresh automatico de tokens (interceptor Axios — sin interrupcion al usuario)

### Gestion de Cartas
- Inventario personal con busqueda, filtros por rareza/condicion y paginacion
- Catalogo global: todas las cartas de todos los usuarios
- Vista de detalle con imagen, especificaciones completas e informacion del propietario
- Crear, editar y eliminar cartas propias (con upload de imagen)

### Sistema de Trades
- Proponer intercambios seleccionando cartas propias y cartas del otro usuario (stepper de 3 pasos)
- Listar trades propios organizados por estado (Pendientes, Activos, Completados, Rechazados, Cancelados)
- Ver detalle completo de un trade con informacion de la contraparte
- Aceptar, rechazar o cancelar trades con confirmacion modal

### Perfil de Usuario
- Ver y editar perfil propio (avatar, bio, informacion de contacto)
- Cambio de contraseña desde el perfil
- Perfil publico de otros usuarios con sus cartas disponibles y estadisticas

### Dashboard
- Resumen de actividad: total de cartas, trades pendientes, trades completados
- Accesos rapidos a las funciones principales
- Feed de actividad reciente

### Panel de Administracion
- Dashboard de KPIs del sistema
- Gestion de usuarios: busqueda, filtros y ban
- Gestion de trades: vista de todos los intercambios del sistema
- Estadisticas con graficos (usuarios por periodo, cartas por rareza, trades por estado)

---

## Stack tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| Framework | React 18 (Create React App) |
| Enrutamiento | React Router v6 (`createBrowserRouter`) |
| HTTP | Axios con interceptores de request/response |
| Estado global | Context API (Auth, Notification, UI) |
| Graficos | recharts |
| Validacion de props | PropTypes |
| Estilos | CSS Modules + CSS Custom Properties |
| Build tool | react-scripts (CRA) |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── common/        # Button, Input, Card, Badge, Modal, Spinner, Toast, ErrorBoundary
│   ├── layout/        # Header, Sidebar, Footer, MainLayout
│   ├── forms/         # LoginForm, RegisterForm, CardForm
│   └── features/      # auth, cards, trades, profile, dashboard, admin
├── pages/             # Una page por vista (LoginPage, InventoryPage, TradesPage, etc.)
├── hooks/             # Hooks de dominio (useInventory, useTradeBuilder, useDashboard, etc.)
├── services/          # api.js, authService, cardService, tradeService, userService, adminService
├── context/           # AuthContext, NotificationContext, UIContext
├── styles/            # colors.css, typography.css, globals.css, theme.js
└── utils/             # validators, formatters, constants, errors, logger
```

**Regla de capas**: `common → layout → forms → features → pages` (importacion estrictamente en esta direccion).

---

## Requisitos previos

- Node.js >= 18
- npm >= 9
- Backend de la API corriendo en `http://localhost:8080/api/v1` (o la URL configurada)

---

## Configuracion del entorno

Crear un archivo `.env.local` en la raiz del proyecto:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api/v1
```

> El archivo `.env.example` incluido en el repositorio sirve como referencia.

---

## Comandos disponibles

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:3000)
npm start

# Build de produccion
npm run build

# Ejecutar tests
npm test
```

---

## Autenticacion y tokens

- **Access token**: almacenado en memoria (`storageService`) — nunca en `localStorage`
- **Refresh token**: gestionado via cookie `httpOnly` establecida por el servidor
- El interceptor de respuesta de Axios detecta errores 401, realiza el refresh automaticamente y reintenta la request original
- Si el refresh falla, se ejecuta logout y se redirige a `/login`

---

## Paleta de colores (design tokens)

El sistema de diseño usa una paleta monocromatica definida en `src/styles/colors.css`:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-neutral-50` | `#FAFAFA` | Fondo de pagina |
| `--color-neutral-900` | `#212121` | Texto principal |
| `--color-accent-main` | `#1E88E5` | Color primario / CTAs |
| `--color-success` | `#4CAF50` | Estados exitosos |
| `--color-error` | `#F44336` | Errores y alertas |

---

## Variables de entorno

| Variable | Descripcion | Ejemplo |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | URL base de la API REST | `http://localhost:8080/api/v1` |

---

## Navegadores soportados

**Produccion**: Chrome, Firefox, Edge, Safari (ultima version y anterior)
**Desarrollo**: ultima version de Chrome, Firefox y Safari

---

## Notas adicionales

- La aplicacion es un SPA (Single Page Application) — no tiene SSR
- No hay modo offline ni WebSockets
- El panel de administracion en `/admin` solo es accesible para usuarios con rol `ADMIN`
- Maximo 3 cartas por lado en una propuesta de trade (`MAX_TRADE_CARDS_PER_SIDE`)
