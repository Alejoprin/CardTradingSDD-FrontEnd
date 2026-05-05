# Guia de Despliegue — CardTrading Platform Frontend

Esta guia explica como construir y desplegar el frontend en distintos entornos.

---

## Requisitos previos

- Node.js >= 18 y npm >= 9 instalados en la maquina de build
- Backend API disponible y corriendo antes de servir el frontend
- Variable de entorno `VITE_API_BASE_URL` configurada correctamente

---

## 1. Variables de entorno

Antes de cualquier build, definir las variables de entorno. Crear el archivo correspondiente al entorno:

| Archivo | Cuando se usa |
|---------|---------------|
| `.env.local` | Desarrollo local (no se commitea) |
| `.env.production` | Build de produccion |
| `.env.staging` | Build de staging (opcional) |

Contenido minimo:

```env
VITE_API_BASE_URL=https://api.tudominio.com/api/v1
```

> Todas las variables para Vite deben comenzar con `VITE_`. Se embeben en el bundle en tiempo de build — no son secretas.

---

## 2. Build de produccion

```bash
# Instalar dependencias
npm install

# Generar el build optimizado
npm run build
```

El output se genera en la carpeta `build/`. Contiene archivos estaticos listos para ser servidos:

```
build/
├── index.html
├── static/
│   └── assets/   # Bundle JS + CSS minificados con hash
└── ...
```

---

## 3. Opciones de despliegue

### Opcion A — Servidor estatico local (prueba rapida)

```bash
npm install -g serve
serve -s build -l 3000
```

Acceder en `http://localhost:3000`.

---

### Opcion B — Nginx

Configuracion basica para un SPA (todas las rutas deben redirigir a `index.html`):

```nginx
server {
    listen 80;
    server_name tudominio.com;

    root /var/www/cardtrading/build;
    index index.html;

    # Redirigir todas las rutas al index para React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estaticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Sin cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

**Pasos:**

```bash
# En la maquina de build
npm run build

# Copiar build al servidor
scp -r build/ usuario@servidor:/var/www/cardtrading/

# En el servidor
sudo systemctl reload nginx
```

---

### Opcion C — Apache

Crear un archivo `.htaccess` dentro de `build/`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Luego copiar la carpeta `build/` al `DocumentRoot` configurado en Apache.

---

### Opcion D — Docker

Crear `Dockerfile` en la raiz del proyecto:

```dockerfile
# Etapa 1: build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Etapa 2: servidor Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Crear `nginx.conf` en la raiz:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Construir y correr:

```bash
# Build de la imagen
docker build \
  --build-arg VITE_API_BASE_URL=https://api.tudominio.com/api/v1 \
  -t cardtrading-frontend:latest .

# Correr el contenedor
docker run -d -p 80:80 --name cardtrading-frontend cardtrading-frontend:latest
```

---

### Opcion E — Vercel

```bash
# Instalar CLI de Vercel
npm install -g vercel

# Desplegar (la primera vez pregunta por configuracion)
vercel --prod
```

En el dashboard de Vercel, agregar la variable de entorno:
- `VITE_API_BASE_URL` = `https://api.tudominio.com/api/v1`

Vercel detecta automaticamente Vite y configura el rewrite de rutas para SPA.

---

### Opcion F — Netlify

```bash
# Instalar CLI de Netlify
npm install -g netlify-cli

# Build y deploy
netlify deploy --prod --dir=build
```

Crear `public/_redirects` (o `netlify.toml`) para el enrutamiento SPA:

```
# public/_redirects
/*    /index.html   200
```

En el dashboard de Netlify, agregar la variable de entorno:
- `VITE_API_BASE_URL` = `https://api.tudominio.com/api/v1`

---

### Opcion G — GitHub Pages

```bash
# Instalar gh-pages
npm install --save-dev gh-pages
```

Agregar en `package.json`:

```json
{
  "homepage": "https://tuusuario.github.io/cardtrading-frontend",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

```bash
npm run deploy
```

> **Nota**: GitHub Pages no soporta SPA routing nativo. Agregar un archivo `404.html` identico a `index.html` como workaround, o usar un dominio personalizado con Netlify/Vercel.

---

## 4. Configuracion de CORS en el backend

El backend debe permitir requests desde el dominio del frontend. Ejemplo para Spring Boot:

```java
@CrossOrigin(origins = "https://tudominio.com")
```

O configuracion global con `allowedOrigins` en el `WebMvcConfigurer`.

Para el refresh token con cookies `httpOnly`, el backend debe incluir:

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://tudominio.com  (no usar * con credentials)
```

---

## 5. HTTPS en produccion

El backend utiliza cookies `httpOnly` para el refresh token. Para que el navegador envie estas cookies en requests cross-origin:

- El frontend **debe** estar en HTTPS en produccion
- El backend **debe** estar en HTTPS en produccion
- La cookie del refresh token debe tener el atributo `SameSite=None; Secure`

---

## 6. Checklist de despliegue

- [ ] `VITE_API_BASE_URL` apunta al backend de produccion
- [ ] `npm run build` completa sin errores ni warnings criticos
- [ ] Servidor configurado para redirigir todas las rutas a `index.html` (SPA routing)
- [ ] Cache configurado: `index.html` sin cache, `/static/` con cache largo
- [ ] HTTPS activo en frontend y backend
- [ ] CORS configurado en el backend para el dominio del frontend
- [ ] Cookie de refresh token con `SameSite=None; Secure` en el backend
- [ ] Verificar login, navegacion y refresh de token en el entorno desplegado

---

## 7. Comandos de referencia rapida

```bash
# Desarrollo local
npm install
npm start                        # http://localhost:3000

# Build de produccion
npm run build                    # Output en build/

# Servir build localmente (verificacion)
npx serve -s build

# Ver tamano del bundle
npx source-map-explorer 'build/static/js/*.js'
```
