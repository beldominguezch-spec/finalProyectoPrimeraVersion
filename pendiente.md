# Pendiente en Páginas del Tiempo

El inicio de sesión reconoce `User`, `Admin` y `Proveedor` en [auth.js](assets/js/auth.js). Los tres roles ya tienen una redirección para probar que se identifican correctamente.

## Admin

- [pages/admin.html](pages/admin.html) muestra solamente un mensaje de bienvenida y comprueba el rol con JavaScript.
- Conectar más adelante el panel completo [admin/index.html](admin/index.html). Ese panel **todavía puede abrirse mediante su URL directa**; antes de usarlo como administración real hay que controlar su acceso.

## Proveedor

- [pages/proveedor.html](pages/proveedor.html) muestra solamente un mensaje de bienvenida y comprueba el rol con JavaScript.
- Crear más adelante la interfaz y las funciones reales del proveedor.

## Para ambos roles

- Las dos cuentas de prueba definidas en `auth.js` son temporales. Reemplazarlas cuando exista un sistema de autenticación real.
- Durante estas pruebas, `Admin` no se bloquea por contraseñas incorrectas; `Proveedor` mantiene tres intentos y bloqueo de 24 horas. `User` también mantiene su bloqueo actual.
- La protección basada únicamente en `localStorage` sirve para esta versión educativa, pero no es seguridad real para funciones de administración.
