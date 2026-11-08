/* Centraliza el acceso a localStorage para no mezclar almacenamiento con la interfaz. */
export class ServicioAlmacenamiento {
    constructor() {
        // Esta es la misma clave que usa la administración para su inventario.
        this.claveCatalogo = "paginas_libros_v4";
        this.claveOrdenes = "paginas_pedidos_v1";
        this.claveSesion = "paginas_sesion_actual";
    }

    /* Recibe una clave; devuelve los datos guardados o el valor alternativo. */
    leer(clave, valorAlternativo) {
        const texto = localStorage.getItem(clave);
        if (texto === null) {
            return valorAlternativo;
        }
        return JSON.parse(texto);
    }

    /* Convierte un valor a JSON y lo guarda en el navegador. */
    guardar(clave, valor) {
        localStorage.setItem(clave, JSON.stringify(valor));
    }

    /* Recupera la sesión creada por auth.js al iniciar sesión. */
    obtenerSesion() {
        return window.obtenerUsuarioActual();
    }

    /* Guarda el catálogo convirtiendo cada clase en datos sencillos. */
    guardarCatalogo(productos) {
        const datos = [];
        for (let i = 0; i < productos.length; i = i + 1) {
            datos.push(productos[i].convertirADatos());
        }
        return this.guardar(this.claveCatalogo, datos);
    }

    /* Recupera los datos del catálogo; las clases se reconstruyen en ServicioTienda. */
    cargarCatalogo() {
        return this.leer(this.claveCatalogo, null);
    }

    /* Guarda únicamente identificador y cantidad de cada línea del carrito. */
    guardarCarrito(carrito) {
        const datos = [];
        for (let i = 0; i < carrito.items.length; i = i + 1) {
            datos.push({
                productoId: carrito.items[i].producto.id,
                cantidad: carrito.items[i].cantidad
            });
        }
        // Cada cuenta (o invitado) tiene su propio carrito; ver data/reservas.js.
        window.guardarCarritoDueno(datos);
    }

    /* Recupera las líneas del carrito del dueño actual, sin las de reserva vencida. */
    cargarCarrito() {
        return window.leerCarritoDueno();
    }

    /* Agrega una orden al historial sin sobrescribir las compras anteriores. */
    guardarOrden(orden) {
        const ordenes = this.leer(this.claveOrdenes, []);
        // Administración muestra una fila por ejemplar. Así conserva las cantidades.
        const items = [];
        for (let i = 0; i < orden.detalles.length; i = i + 1) {
            for (let j = 0; j < orden.detalles[i].cantidad; j = j + 1) {
                items.push({ titulo: orden.detalles[i].titulo, estado: orden.detalles[i].estado, precio: orden.detalles[i].precioUnitario });
            }
        }
        ordenes.push({
            id: orden.numero,
            usuarioId: orden.cliente.id,
            usuario: orden.cliente.nombre,
            email: orden.cliente.correo,
            direccion: orden.cliente.direccion,
            ciudad: orden.cliente.ciudad,
            departamento: orden.cliente.departamento,
            items: items,
            subtotal: orden.subtotal,
            envio: orden.envio,
            metodoPago: orden.metodoPago,
            guia: orden.guia,
            total: orden.total,
            fecha: orden.fecha,
            estado: orden.estado
        });
        return this.guardar(this.claveOrdenes, ordenes);
    }

    /*
     * Crea un código de guía de DEMOSTRACIÓN, por ejemplo SIM-2026-000123.
     * Un contador que solo sube evita repetirlo; además se revisa contra los pedidos guardados.
     * No es una guía real de transporte.
     */
    generarGuia() {
        const anio = new Date().getFullYear();
        const ordenes = this.leer(this.claveOrdenes, []);
        let contador = this.leer("paginas_contador_guias_v1", 0);
        let guia = "";
        let repetida = true;

        while (repetida) {
            contador = contador + 1;
            let numero = String(contador);
            while (numero.length < 6) {
                numero = "0" + numero;
            }
            guia = "SIM-" + anio + "-" + numero;

            repetida = false;
            for (let i = 0; i < ordenes.length; i = i + 1) {
                if (ordenes[i].guia === guia) {
                    repetida = true;
                }
            }
        }
        this.guardar("paginas_contador_guias_v1", contador);
        return guia;
    }

    /* Devuelve la guía de un pedido. Si es un pedido anterior sin guía, se la crea y la guarda una sola vez. */
    asegurarGuia(pedidoId) {
        const ordenes = this.leer(this.claveOrdenes, []);
        for (let i = 0; i < ordenes.length; i = i + 1) {
            if (ordenes[i].id === pedidoId) {
                if (!ordenes[i].guia) {
                    ordenes[i].guia = this.generarGuia();
                    this.guardar(this.claveOrdenes, ordenes);
                }
                return ordenes[i].guia;
            }
        }
        return "";
    }

    /*
     * Crea el número de pedido, por ejemplo PDT-2026-000001.
     * Un contador que solo sube evita repetirlo aunque dos pedidos se creen en el mismo instante;
     * además se revisa contra los pedidos ya guardados (los anteriores usaban PDT-<hora>).
     */
    generarNumeroPedido() {
        const anio = new Date().getFullYear();
        const ordenes = this.leer(this.claveOrdenes, []);
        let contador = this.leer("paginas_contador_pedidos_v1", 0);
        let numeroPedido = "";
        let repetido = true;

        while (repetido) {
            contador = contador + 1;
            let digitos = String(contador);
            while (digitos.length < 6) {
                digitos = "0" + digitos;
            }
            numeroPedido = "PDT-" + anio + "-" + digitos;

            repetido = false;
            for (let i = 0; i < ordenes.length; i = i + 1) {
                if (ordenes[i].id === numeroPedido) {
                    repetido = true;
                }
            }
        }
        this.guardar("paginas_contador_pedidos_v1", contador);
        return numeroPedido;
    }
}
