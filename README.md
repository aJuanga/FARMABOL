# 🏥 FARMABOL — Sistema de Inventario y Ventas para Farmacia

Sistema web para gestionar el inventario y las ventas de una farmacia.
Incluye autenticación con roles, control de stock, registro de ventas transaccional
y un panel con alertas de stock bajo.

## 🧱 Stack

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (`better-sqlite3`)
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Frontend:** HTML + CSS + JavaScript (vanilla, servido como estático)
- **Calidad:** ESLint
- **Despliegue:** Render

## 🏛️ Arquitectura en capas

```
routes → controllers → data access (DAO) → SQLite
```

- `src/routes` — define los endpoints y aplica middlewares de auth.
- `src/controllers` — lógica de cada petición (validación y respuesta).
- `src/data` — acceso a datos (consultas SQL encapsuladas por entidad).
- `src/db` — conexión, esquema y datos de ejemplo (seed).
- `src/middleware` — autenticación JWT, autorización por rol y manejo de errores.
- `public/` — interfaz web (login, inventario, ventas, panel).

## 🚀 Instalación y ejecución local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno
cp .env.example .env        # En Windows PowerShell: Copy-Item .env.example .env

# 3. Cargar datos de ejemplo (usuarios y productos)
npm run seed

# 4. Iniciar
npm run dev      # con recarga automática (nodemon)
# o
npm start
```

Abre **http://localhost:3000**

### 🔑 Credenciales de ejemplo

| Rol       | Email                    | Contraseña |
|-----------|--------------------------|------------|
| Admin     | `admin@farmabol.com`     | `admin123` |
| Vendedor  | `vendedor@farmabol.com`  | `vende123` |

> El **admin** gestiona el inventario; el **vendedor** registra ventas.

## 📡 API REST

Base: `/api`

### Auth
| Método | Ruta             | Descripción                       |
|--------|------------------|-----------------------------------|
| POST   | `/auth/registrar`| Crear usuario                     |
| POST   | `/auth/login`    | Iniciar sesión (devuelve token)   |
| GET    | `/auth/perfil`   | Datos del usuario autenticado     |

### Productos (requiere token)
| Método | Ruta                    | Rol     |
|--------|-------------------------|---------|
| GET    | `/productos`            | todos   |
| GET    | `/productos?buscar=...` | todos   |
| GET    | `/productos/stock-bajo` | todos   |
| GET    | `/productos/:id`        | todos   |
| POST   | `/productos`            | admin   |
| PUT    | `/productos/:id`        | admin   |
| DELETE | `/productos/:id`        | admin   |

### Ventas (requiere token)
| Método | Ruta              | Descripción                         |
|--------|-------------------|-------------------------------------|
| GET    | `/ventas`         | Listar ventas                       |
| GET    | `/ventas/resumen` | Totales del día y generales         |
| GET    | `/ventas/:id`     | Detalle de una venta                |
| POST   | `/ventas`         | Registrar venta `{ items: [...] }`  |

Ejemplo de registro de venta:

```json
POST /api/ventas
{
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 3, "cantidad": 1 }
  ]
}
```

## ☁️ Despliegue en Render

1. Sube el repo a GitHub.
2. En Render: **New → Web Service** y conecta el repositorio.
3. Configuración:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Variables de entorno (Environment):
   - `JWT_SECRET` = una clave segura
   - `DB_PATH` = `/tmp/farmabol.db` (o un disco persistente de Render)
5. Tras el primer despliegue, ejecuta el seed desde la shell de Render: `npm run seed`.

## 📜 Scripts

| Script          | Acción                          |
|-----------------|---------------------------------|
| `npm start`     | Inicia el servidor              |
| `npm run dev`   | Inicia con recarga (nodemon)    |
| `npm run seed`  | Carga usuarios y productos demo |
| `npm run lint`  | Analiza el código con ESLint    |

## 🔒 Notas de seguridad

- Las contraseñas se guardan con `bcrypt` (hash + salt).
- Las rutas protegidas requieren `Authorization: Bearer <token>`.
- Las ventas son **transaccionales**: si falla el stock de un ítem, no se registra nada.

---

Proyecto académico — Hito 4 · FARMABOL.
