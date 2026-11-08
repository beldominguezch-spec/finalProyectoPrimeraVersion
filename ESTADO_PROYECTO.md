# Estado del proyecto - Páginas del Tiempo (frontend)

Copias de seguridad: `../_backup/` (una por bloque).

## Bloque 1 - Navegación, autenticación y registro (TERMINADO)
- Registro: selector "Tipo de cuenta" (Cliente / Proveedor). Admin nunca se registra desde la web.
- Las cuentas nuevas guardan intentosFallidos / isBlocked / bloqueadoHasta (bloqueo 3 intentos, 24 h; Admin exento).
- Admin entra directo al panel real `admin/index.html`, ahora protegido por rol (antes se abría por URL).
- Logout del panel admin corregido (ruta rota `./pages/login.html`) y ahora cierra la sesión.
- Menú de la burbuja: Admin/Proveedor ven "Mi panel" en vez de "Ver Perfil" (que es de cliente).
- Archivos: assets/js/auth.js, pages/register.html, pages/admin.html, admin/index.html, assets/css/pages/auth.css.

## Bloque 2 - Catálogo, estados y selección de ejemplares (TERMINADO, sin probar en navegador)
- Modelo: cada fila del inventario (`paginas_libros_v4`) = una edición (ISBN + encuadernación) en UN estado, con su stock. `precio` guardado = precio BASE.
- Nuevo `assets/js/data/precios.js` (única fuente): descuentos Excelente 0 %, Bueno 10 %, Aceptable 30 %, `calcularPrecioFinal`, `agruparLibrosPorEdicion`. Solo para mostrar; Java será la autoridad.
- Catálogo (`book-categories.html`) y portada (`index.html`): una tarjeta por edición con estados disponibles, "Desde $X" y stock total. El modal tiene selector de estado con precio/descuento y disponibilidad por estado.
- "Añadir" en la tarjeta: directo si hay un solo estado; si hay varios abre el modal para elegir.
- El carrito sigue usando el ID de la fila, por lo que valida stock por estado sin cambios.
- Datos de ejemplo: solo en `data-initial.js` (ya no duplicados en `catalog-data.js`); se agregaron ejemplares extra en otros estados (ids 111-118).
- MIGRACIÓN (una sola vez, clave `paginas_catalogo_estados_v1`): NO borra nada; conserva libros del admin y el carrito, y solo agrega los ejemplares de ejemplo que falten (por id o edición+estado).
- Archivos: data/precios.js (nuevo), data-initial.js, data/catalog-data.js, models/product.js, components/book-card.js, pages/catalog-page.js, catalog.js, index.html, pages/book-categories.html, pages/cart.html.

## Bloque 2b - Reserva de 30 min, carrito por dueño, factura por estado (TERMINADO)
- Nuevo `assets/js/data/reservas.js` (única lógica de reservas, script normal). Tres cantidades separadas por libro (fila = edición+estado): físico (`stock`), reservado (`paginas_reservas_v1`) y disponible (= físico − reservado por OTROS).
- Añadir/cambiar cantidad reserva 30 min (se renueva); eliminar, vaciar o vencer libera. Al comprar sale el stock físico y se borran las reservas (si la reserva había vencido se intenta reservar de nuevo antes de confirmar).
- Carrito por dueño: `paginas_carrito_v2_<idCuenta | INV-codigo>`. Al iniciar sesión, el carrito y reservas del invitado pasan a la cuenta (`auth.js` → `transferirCarritoInvitado`). La clave vieja `paginas_carrito_v1` ya no se usa (carritos viejos se ignoran).
- Tarjetas, modal (portada y catálogo) y carrito usan la disponibilidad. El modal actualiza precio y disponibilidad al cambiar de estado (verificado). La página del carrito revisa vencimientos cada 30 s.
- Corregido: recomendaciones del carrito pasaban un libro suelto a la tarjeta (roto desde el bloque 2).
- Factura: la descripción incluye el estado ("Título (Estado)"), así el mismo título en estados distintos son líneas distintas; pedidos guardan `estado` por ejemplar.
- Precios existentes = base; descuento aplicado una sola vez (verificado: guardar no cambia el base; pedidos viejos conservan su precio).
- Verificado con Chrome headless (30 comprobaciones): reservas, última unidad entre dos dueños, liberación, vencimiento, transferencia al login, compra y modal. 
- LÍMITE: son reservas solo del navegador; NO protegen contra sobreventa entre navegadores. La protección real será Java + MySQL con transacciones.
- Archivos: data/reservas.js (nuevo), models/product.js, models/order.js, services/storage-service.js, services/shop-service.js, components/book-card.js, pages/catalog-page.js, pages/cart-page.js, pages/checkout.js, catalog.js, auth.js, index.html, pages/{book-categories,cart,login}.html.

## Bloque 3 - Carrito, cantidades y validación de inventario (TERMINADO)
- Casi todo se hizo en el 2b (reserva, cantidades +/−, eliminar, validación por estado). En este bloque:
- Botón "Vaciar carrito" en `pages/cart.html` (pide confirmación y libera todas las reservas).
- El carrito se vuelve a leer al volver a la pestaña (`focus`) y cada 30 s (reservas vencidas).
- Corregido: `about-us`, `contact`, `register` y `profile` cargan `catalog.js` (contador del carrito) y les faltaba `reservas.js`.
- Verificado con Chrome headless: carrito con 2 libros, sumar (reserva sube), eliminar (reserva baja a 0), recomendaciones (4), vaciar (reservas vacías y estado vacío visible); 7 páginas sin errores de consola.
- Archivos: pages/cart.html, assets/js/pages/cart-page.js, pages/{about-us,contact,register,profile}.html.

## Bloque 4 - Checkout simulado, factura y confirmación (TERMINADO)
- Sin IVA: eliminado de `cart.js` (`calcularIva` → `calcularEnvio`, hoy $0), `order.js`, `storage-service.js` (pedidos ahora guardan `envio`, no `iva`), `cart.html` (fila IVA) y `cart-page.js`. Total = subtotal + envío ($0).
- La factura se arma con la orden ya registrada (`window.ultimaOrdenCreada`): subtotal, envío y total vienen de un solo lugar. Muestra pedido, cliente (nombre y correo de la CUENTA), dirección de envío, "Pago: Tarjeta (pago simulado)" y las líneas por título+estado. Ya no muestra titular ni últimos 4 dígitos.
- El pedido guarda el nombre de la cuenta (antes guardaba el titular de la tarjeta), dirección/ciudad/departamento y `metodoPago`.
- El formulario de tarjeta NO se tocó (campos, apariencia, validaciones). Sus datos no se envían ni se guardan en ningún lado.
- Verificado con Chrome headless (flujo completo): formulario vacío rechazado; con datos válidos se crea el pedido, el stock físico baja (101: 8→6, 111: 3→2), las reservas quedan vacías, el carrito queda vacío, y se muestra la factura sin IVA. Se buscó número de tarjeta, titular y fecha en todo localStorage: no aparecen.
- Archivos: models/cart.js, models/order.js, services/storage-service.js, pages/cart-page.js, pages/checkout.js, pages/cart.html.
- PENDIENTE (bloque 5): el botón "Revisar pedido" de la factura abre `abrirSeguimiento()`, una simulación de estados de envío que tú pediste no mantener; se reemplaza por la guía simulada `SIM-2026-000123` + enlace a Interrapidísimo.

## Bloque 5 - Guía simulada y seguimiento del pedido (TERMINADO)
- Código `SIM-AAAA-NNNNNN` por pedido (`storage-service.js`: `generarGuia()` con contador que solo sube `paginas_contador_guias_v1` + revisión contra los pedidos guardados). Se asigna en `confirmarCompra` y se guarda en el pedido (`guia`), así no cambia al consultar de nuevo. `asegurarGuia(pedidoId)` crea y guarda una sola vez la guía de pedidos anteriores que no la tengan.
- Factura: muestra "Guía de envío (demostración, no es real)". Botón "Revisar pedido" → "Ver guía de envío" (factura y carrito vacío).
- Se eliminó la simulación de estados de envío ("en camino"/"llegó", temporizador de 7 s y `paginas_seguimiento_v1`). La ventana ahora muestra pedido, código, aviso de demostración (no es envío real, sin validez de transporte, el sitio no rastrea el pedido) y enlace a https://www.interrapidisimo.com/sigue-tu-envio/ (nueva pestaña). Sin APIs externas.
- Verificado (Chrome headless): guía en factura = guía guardada = guía del modal; reabrir muestra la misma; pedidos 1, 2 y 3 reciben SIM-2026-000001/2/3 distintos; pedido sin guía recibe una única y estable; enlace correcto; total de la factura y sin IVA intactos; stock y reservas correctos tras las compras.
- Número de pedido corregido: ahora es `PDT-AAAA-NNNNNN` con contador que solo sube (`paginas_contador_pedidos_v1`, `generarNumeroPedido()` en `storage-service.js`, asignado en `confirmarCompra`) y revisado contra los pedidos guardados. Antes usaba la hora en ms y podía repetirse. Verificado: 6 pedidos seguidos con reloj detenido, todos distintos; la factura y la guía siguen bien. Los pedidos anteriores conservan su número `PDT-<hora>`. Archivos: models/order.js, services/shop-service.js, services/storage-service.js.
- Archivos: models/order.js, services/storage-service.js, services/shop-service.js, pages/cart-page.js, pages/checkout.js, pages/cart.html.

## Correcciones previas al bloque 6 (TERMINADAS)
**1. Cambiar contraseña (pages/profile.html)**
- Segundo formulario "Cambiar contraseña" debajo del de datos: actual, nueva y confirmar. Lógica en `profile-page.js`, sobre la clave `clave` de `paginas_cuentas_v1` (la misma que usa el login).
- Validaciones: ningún campo vacío; la actual debe coincidir; nueva de al menos 6 caracteres (mismo mínimo que el registro); nueva = confirmación. Si algo falla se muestra el mensaje y NO se cambia nada. Si todo está bien se guarda, se limpian los campos y se confirma.
- Probado (Chrome headless): vacío, actual vacía, actual incorrecta, nueva corta, confirmación distinta (todos sin cambiar la clave), cambio correcto, y que la clave anterior deja de servir como "actual".
**2. Historial de pedidos (pages/orders.html, assets/js/pages/orders-page.js, assets/css/pages/orders.css)**
- Acceso: "Mis pedidos" en el menú de la burbuja (solo clientes, `auth.js`) y enlace en el perfil. Solo entra el rol Cliente.
- Lee `paginas_pedidos_v1` y muestra solo los que tienen `usuarioId` igual al de la sesión, del más reciente al más antiguo. No crea, modifica ni borra pedidos. Sin pedidos: "Aún no tienes pedidos registrados."
- Lista: PDT, fecha, libros, total, estado, guía SIM. Detalle: libros por condición con cantidad, precio unitario y subtotal, subtotal/envío/total, datos de envío de esa compra, "Tarjeta (pago simulado)" y guía, con acceso a la ventana de guía de demostración (mismo aviso y enlace a Interrapidísimo). Pedidos antiguos sin guía reciben una única al abrir la ventana (`asegurarGuia`).
- Probado: cliente con 2 pedidos ve solo los suyos (más reciente primero); otro cliente ve solo el suyo y no aparece el título del primero; cliente sin compras ve el mensaje; el número de pedidos guardados no cambia; cerrar sesión solo borra la sesión, no los pedidos.
- Archivos modificados: profile.html, profile-page.js, profile.css, auth.js. Nuevos: orders.html, orders-page.js, orders.css. Respaldo en `_backup/Frontend-correcciones-*`.

## Pendientes
- Admin: validar precio base mínimo $20.000 y estado Excelente/Bueno/Aceptable al crear/editar libros (bloque 6).
- Bloques 3-8 según el orden acordado.

## Errores conocidos
- Seguridad solo con localStorage (académica); la real irá en Java.
- Admin usa `paginas_usuarios_v2` aparte de `paginas_cuentas_v1` (se unificará en el bloque 6).
- Cuentas de prueba: admin.prueba@paginasdeltiempo.test / Admin1234, proveedor.prueba@paginasdeltiempo.test / Proveedor1234.
- Verificado con Chrome headless: portada, categorías y carrito cargan sin errores de consola y muestran estados/precios correctos. Falta probar el flujo completo a mano.
