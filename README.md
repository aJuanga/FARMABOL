# 🏥 FARMABOL — Sistema de Inventario y Ventas para Farmacia

Sistema web para gestionar el inventario y las ventas de una farmacia, con
autenticación por roles (ADMIN / VENDEDOR), control de stock, ventas con
transacción SQLite y un dashboard con stock bajo y ventas del día.

## 🧱 Stack

- **Backend:** Node.js + Express
- **Base de datos:** SQLite (`better-sqlite3`)
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Frontend:** HTML + CSS + JavaScript vanilla (carpeta `public/`)
- **Calidad:** ESLint (regla de complejidad)
- **Despliegue:** Render

## 🏛️ Arquitectura en capas

```
routes → controllers → (helpers / database) → SQLite
```

```
farmabol/
├── server.js                 # Monta Express y las rutas
├── src/
│   ├── database.js           # SQLite + 3 tablas (users, products, sales)
│   ├── seed.js               # Datos iniciales (admin, vendedor, productos)
│   ├── middleware/auth.js    # verifyToken + requireRole
│   ├── controllers/          # authController, productController, saleController
│   ├── routes/               # authRoutes, productRoutes, saleRoutes
│   └── utils/helpers.js      # validaciones reutilizables (DRY)
└── public/                   # Frontend (login, productos, ventas, dashboard)
```

## 🚀 Ejecución local

```bash
npm install
cp .env.example .env          # Windows: Copy-Item .env.example .env
npm run seed                  # carga usuarios y productos demo
npm run dev                   # o: npm start
```

Abre **http://localhost:3000**

### 🔑 Credenciales demo

| Rol      | Usuario    | Contraseña |
|----------|------------|------------|
| ADMIN    | `admin`    | `admin123` |
| VENDEDOR | `vendedor` | `vende123` |

> ADMIN gestiona productos; VENDEDOR solo consulta y registra ventas.

## 📡 API REST (`/api`)

| Método | Ruta                          | Rol      | Descripción                  |
|--------|-------------------------------|----------|------------------------------|
| POST   | `/auth/login`                 | público  | Login → devuelve JWT         |
| GET    | `/products`                   | token    | Listar productos             |
| GET    | `/products/:id`               | token    | Ver producto                 |
| POST   | `/products`                   | ADMIN    | Crear producto               |
| PUT    | `/products/:id`               | ADMIN    | Editar producto              |
| DELETE | `/products/:id`               | ADMIN    | Eliminar producto            |
| POST   | `/sales`                      | token    | Registrar venta (transacción)|
| GET    | `/sales`                      | token    | Historial de ventas          |
| GET    | `/sales/dashboard/low-stock`  | token    | Productos con stock < 5      |
| GET    | `/sales/dashboard/today`      | token    | Total de ventas del día      |

Ejemplo de venta: `POST /api/sales` → `{ "product_id": 1, "cantidad": 2 }`

## 🧹 Calidad — ESLint (antes / después del refactor)

La regla `complexity` evidencia la mejora tras extraer las validaciones a
`src/utils/helpers.js` (Fase 5, DRY):

| Estado                         | Warnings | Detalle                                                        |
|--------------------------------|:--------:|----------------------------------------------------------------|
| **ANTES** (validaciones duplicadas) | **4** | `createProduct` compl. 16 · `updateProduct` compl. 15 · `createSale` compl. 10 + 52 líneas |
| **DESPUÉS** (helpers DRY)      | **2**    | Sin duplicación; complejidad concentrada en `helpers.js`       |

```bash
npm run lint        # eslint src server.js
```

## ☁️ Despliegue en Render

1. Sube el repo a GitHub.
2. Render → **New → Web Service** → conecta el repo.
3. **Build:** `npm install` · **Start:** `npm start`
4. Variables: `JWT_SECRET` (clave segura), `DB_PATH=/tmp/farmabol.db`
5. Tras desplegar, en la shell de Render: `npm run seed`.

## 🔒 Seguridad

- Contraseñas con `bcrypt` (hash + salt).
- Rutas protegidas con `Authorization: Bearer <token>`.
- Ventas **transaccionales**: si falla el stock, no se descuenta ni se registra.

---

Proyecto académico — Hito 4 · FARMABOL.
