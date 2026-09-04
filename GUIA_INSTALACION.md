# 🏠 NovaCasa - Guía de Instalación Completa

Esta guía te explica paso a paso cómo configurar y ejecutar el proyecto **NovaCasa** en otro computador, incluyendo la base de datos MySQL.

---

## 📋 Requisitos previos

Antes de empezar, necesitas tener instalado en el nuevo computador:

| Herramienta | Versión mínima | Descarga |
|-------------|----------------|----------|
| **Node.js** | 18 o superior | https://nodejs.org/ |
| **MySQL** | 8.0 o superior | https://dev.mysql.com/downloads/ |
| **Git** (opcional) | Cualquiera | https://git-scm.com/ |

> 💡 **Verifica que Node.js esté instalado** abriendo una terminal y ejecutando:
> ```
> node -v
> npm -v
> ```

---

## 🚀 Paso 1: Obtener el código del proyecto

### Opción A: Clonar desde GitHub
```bash
git clone https://github.com/leecodingg-02/ALMACEN-BD.git
cd ALMACEN-BD
```

### Opción B: Copiar la carpeta manualmente
Copia toda la carpeta `AlmacenWeb` a una USB, disco duro o envíala por correo, y pégala en el nuevo computador.

---

## 📦 Paso 2: Instalar las dependencias

Abre una terminal **dentro de la carpeta del proyecto** y ejecuta:

```bash
npm install
```

Esto instalará todas las dependencias necesarias (React, Express, MySQL, bcrypt, etc.).

---

## 🗄️ Paso 3: Configurar la base de datos MySQL

### 3.1. Iniciar el servicio MySQL

Asegúrate de que MySQL esté corriendo en el nuevo computador.

- **Windows**: Abre "Servicios" (escribe `services.msc` en el menú inicio) y verifica que `MySQL80` esté en estado "En ejecución".
- **macOS/Linux**: Ejecuta `sudo service mysql start` o `sudo systemctl start mysql`.

### 3.2. Configurar el archivo `.env`

Abre el archivo **`.env`** en la raíz del proyecto y edita las credenciales con las de **tu** MySQL:

```env
# Credenciales de la base de datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_AQUI   ← Cambia esto por tu contraseña real
DB_NAME=bd_almacen_1
DB_PORT=3306

# Puerto del servidor backend
PUERTO_SERVIDOR=3001
```

> ⚠️ **IMPORTANTE**: Cambia `DB_PASSWORD` por la contraseña de root de MySQL en el nuevo computador. Si tu MySQL no tiene contraseña, déjalo vacío: `DB_PASSWORD=`

### 3.3. Importar la base de datos

Tienes dos opciones:

**Opción A: Importar datos de ejemplo (base de datos nueva)**

```bash
npm run init-db
```

**Opción B: Importar un backup con tus datos (recomendado si quieres tus usuarios)**

```bash
npm run importar-backup
```

> Ver la sección "Exportar e importar la base de datos" más abajo para más detalles.

---

## ▶️ Paso 4: Iniciar el proyecto

Necesitas **dos terminales** (o dos pestañas de terminal):

### Terminal 1: Iniciar el backend (servidor)

```bash
npm run server
```

Verás:
```
🚀 Servidor NovaCasa corriendo en http://localhost:3001
✅ Conexión exitosa con MySQL — Base de datos: "bd_almacen_1"
```

### Terminal 2: Iniciar el frontend (Vite)

```bash
npm run dev
```

Verás:
```
VITE v8.2.2 ready in 1288 ms
➜  Local:   http://localhost:5173/
```

---

## 🌐 Paso 5: Abrir la aplicación

Abre tu navegador y ve a:

```
http://localhost:5173
```

¡Listo! La aplicación NovaCasa debería estar funcionando.

---

## 💾 Exportar e importar la base de datos (llevar tus datos a otro computador)

### Exportar (en tu computador actual)

Para guardar todos los datos actuales (usuarios, productos, ventas, etc.) en un archivo:

```bash
npm run exportar-bd
```

Esto genera un archivo en la carpeta `BDMysql/` con un nombre como:
```
backup_bd_almacen_1_20260904.sql
```

### Importar (en el otro computador)

1. Copia el archivo `backup_*.sql` a la carpeta `BDMysql/` del proyecto en el otro computador.
2. Ejecuta:

```bash
npm run importar-backup
```

Esto importa automáticamente el backup más reciente que encuentre en la carpeta `BDMysql/`.

> ⚠️ **Importante**: El backup incluye TODOS los datos (usuarios, productos, ventas, etc.). Si en el otro computador ya hay datos, serán reemplazados por los del backup.

---

## 🛠️ Solución de problemas comunes

### ❌ Error: "No se pudo conectar con el servidor"
- Verifica que el backend esté corriendo (`npm run server` en una terminal separada).
- Verifica que MySQL esté iniciado.

### ❌ Error: "ER_ACCESS_DENIED_ERROR"
- La contraseña de MySQL en el `.env` es incorrecta.
- Abre `.env` y corrige `DB_PASSWORD`.

### ❌ Error: "ECONNREFUSED" en el puerto 3306
- MySQL no está corriendo. Inicia el servicio MySQL.

### ❌ Error: "Cannot POST /api/usuarios/login"
- El backend está ejecutando una versión antigua del código.
- Detén el servidor (Ctrl+C) y vuelve a ejecutar `npm run server`.

### ❌ El puerto 3001 o 5173 ya está en uso
- Cambia `PUERTO_SERVIDOR` en el `.env` para el backend.
- Para el frontend, Vite elegirá automáticamente otro puerto.

### ❌ Error al exportar: "mysqldump no encontrado"
- Verifica que la ruta de `mysqldump.exe` en `server/exportar_bd.js` sea correcta.
- La ruta por defecto es: `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe`

---

## 📁 Estructura del proyecto

```
AlmacenWeb/
├── .env                    ← Configuración de MySQL (editar aquí)
├── package.json            ← Dependencias y scripts
├── vite.config.js          ← Configuración de Vite + proxy
├── BDMysql/
│   ├── BD_almacen_NovaCasa.sql   ← Script SQL de la base de datos
│   └── backup_*.sql              ← Backups exportados
├── server/
│   ├── servidor.js         ← Servidor Express principal
│   ├── conexion.js         ← Conexión a MySQL
│   ├── importar_bd.js      ← Script para importar la BD (datos de ejemplo)
│   ├── exportar_bd.js      ← Script para exportar la BD (backup)
│   ├── importar_backup.js  ← Script para importar un backup
│   └── rutas/              ← Rutas de la API
└── src/
    ├── main.jsx            ← Punto de entrada de React
    ├── App.jsx             ← Componente principal
    ├── componentes/        ← Componentes reutilizables
    ├── paginas/            ← Páginas de la aplicación
    └── servicios/          ← Servicios de conexión a la API
```

---

## 📝 Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala todas las dependencias |
| `npm run init-db` | Importa la base de datos MySQL (datos de ejemplo) |
| `npm run exportar-bd` | Exporta la base de datos con todos los datos actuales |
| `npm run importar-backup` | Importa un backup exportado previamente |
| `npm run server` | Inicia el backend (puerto 3001) |
| `npm run dev` | Inicia el frontend (puerto 5173) |
| `npm run build` | Compila el proyecto para producción |
| `npm run preview` | Previsualiza la versión compilada |