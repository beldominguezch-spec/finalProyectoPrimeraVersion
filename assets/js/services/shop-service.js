import { crearCatalogoInicial } from "../data/catalog-data.js";
import "../auth.js";
import { crearProductoDesdeDatos } from "../models/product.js";
import { Carrito } from "../models/cart.js";
import { OrdenCompra } from "../models/order.js";
import { ServicioAlmacenamiento } from "./storage-service.js";

/* Coordina libros, carrito, stock y almacenamiento sin manipular el HTML. */
export class ServicioTienda {
    constructor() {
        this.almacenamiento = new ServicioAlmacenamiento();
        this.catalogo = [];
        this.carrito = new Carrito();
        this.cargarCatalogo();
        this.cargarCarrito();
    }

    /* Recupera el catálogo o crea sus datos iniciales en la primera visita. */
    cargarCatalogo() {
        const datos = this.almacenamiento.cargarCatalogo();

        if (datos === null) {
            this.catalogo = crearCatalogoInicial();
            this.almacenamiento.guardarCatalogo(this.catalogo);
            return;
        }

        for (let i = 0; i < datos.length; i = i + 1) {
            this.catalogo.push(crearProductoDesdeDatos(datos[i]));
        }
    }

    /* Relaciona cada línea guardada con su producto real del catálogo.
       Solo llegan aquí las líneas con reserva vigente (las vencidas ya se quitaron). */
    cargarCarrito() {
        const datos = this.almacenamiento.cargarCarrito();

        this.carrito.vaciar();
        for (let i = 0; i < datos.length; i = i + 1) {
            const producto = this.buscarProducto(datos[i].productoId);
            if (producto !== null && producto.tieneStock(datos[i].cantidad)) {
                this.carrito.agregarProducto(producto, datos[i].cantidad);
            } else {
                // El libro ya no existe o no alcanza el stock: se libera su reserva.
                window.liberarReserva(datos[i].productoId);
            }
        }
    }

    /* Vuelve a leer el carrito guardado. Devuelve true si cambió (por ejemplo, por una reserva vencida). */
    recargarCarrito() {
        const cantidadAntes = this.carrito.obtenerCantidadTotal();
        this.actualizarStockDesdeStorage();
        this.cargarCarrito();
        return cantidadAntes !== this.carrito.obtenerCantidadTotal();
    }

    /* Recupera libros y stock actualizados desde localStorage. */
    actualizarStockDesdeStorage() {
        const datos = this.almacenamiento.cargarCatalogo();
        if (datos === null) {
            return;
        }
        const librosActuales = [];
        for (let i = 0; i < datos.length; i = i + 1) {
            librosActuales.push(crearProductoDesdeDatos(datos[i]));
        }
        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            let encontrado = false;
            for (let j = 0; j < librosActuales.length; j = j + 1) {
                if (String(this.carrito.items[i].producto.id) === String(librosActuales[j].id)) {
                    this.carrito.items[i].producto = librosActuales[j];
                    encontrado = true;
                }
            }
            if (!encontrado) {
                this.carrito.items[i].producto.stock = 0;
            }
        }
        this.catalogo = librosActuales;
    }

    /* Busca un producto recorriendo el catálogo. */
    buscarProducto(productoId) {
        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            if (String(this.catalogo[i].id) === String(productoId)) {
                return this.catalogo[i];
            }
        }
        return null;
    }

    /* Obtiene nombres de categorías sin repetir. */
    obtenerCategorias() {
        const categorias = [];

        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            let existe = false;
            for (let j = 0; j < categorias.length; j = j + 1) {
                if (categorias[j] === this.catalogo[i].categoria) {
                    existe = true;
                }
            }
            if (!existe) {
                categorias.push(this.catalogo[i].categoria);
            }
        }
        return categorias;
    }

    /* Busca por título, autor, ISBN o categoría con comparaciones básicas. */
    buscarProductos(termino) {
        const resultado = [];
        const texto = String(termino || "").toLowerCase();

        for (let i = 0; i < this.catalogo.length; i = i + 1) {
            const producto = this.catalogo[i];
            let coincide = producto.titulo.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.autor.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.isbn.toLowerCase().indexOf(texto) !== -1;
            coincide = coincide || producto.categoria.toLowerCase().indexOf(texto) !== -1;

            if (coincide) {
                resultado.push(producto);
            }
        }
        return resultado;
    }

    /* Agrega una cantidad: primero reserva 30 minutos y luego guarda el carrito. */
    agregarAlCarrito(productoId, cantidad) {
        this.actualizarStockDesdeStorage();
        const producto = this.buscarProducto(productoId);
        if (producto === null) {
            return false;
        }
        const item = this.carrito.buscarItem(productoId);
        let cantidadNueva = Number(cantidad);
        if (item !== null) {
            cantidadNueva = item.cantidad + cantidadNueva;
        }
        if (!window.reservarCantidad(productoId, cantidadNueva)) {
            return false;
        }
        this.carrito.agregarProducto(producto, cantidad);
        this.almacenamiento.guardarCarrito(this.carrito);
        return true;
    }

    /* Modifica la cantidad: actualiza la reserva y guarda el cambio válido. */
    actualizarCantidad(productoId, cantidad) {
        this.actualizarStockDesdeStorage();
        if (this.carrito.buscarItem(productoId) === null || !window.reservarCantidad(productoId, Number(cantidad))) {
            return false;
        }
        const actualizado = this.carrito.actualizarCantidad(productoId, cantidad);
        if (actualizado) {
            this.almacenamiento.guardarCarrito(this.carrito);
        }
        return actualizado;
    }

    /* Elimina un producto, libera su reserva y guarda el carrito. */
    eliminarDelCarrito(productoId) {
        const eliminado = this.carrito.eliminarProducto(productoId);
        if (eliminado) {
            window.liberarReserva(productoId);
            this.almacenamiento.guardarCarrito(this.carrito);
        }
        return eliminado;
    }

    /* Vacía el carrito y libera todas sus reservas. */
    vaciarCarrito() {
        this.carrito.vaciar();
        window.liberarTodasMisReservas();
        this.almacenamiento.guardarCarrito(this.carrito);
    }

    /*
     * Valida todo el inventario, crea la orden, descuenta stock y vacía el carrito.
     * Primero valida todas las líneas para evitar una compra procesada parcialmente.
     */
    confirmarCompra(cliente) {
        const sesion = this.almacenamiento.obtenerSesion();
        if (sesion === null || !sesion.id || this.carrito.items.length === 0) {
            return null;
        }

        // Leemos el stock más reciente por si otra pestaña compró antes.
        this.actualizarStockDesdeStorage();

        // Cada línea debe tener reserva vigente; si venció, se intenta reservar de nuevo.
        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            const linea = this.carrito.items[i];
            if (!linea.producto.tieneStock(linea.cantidad) || !window.reservarCantidad(linea.producto.id, linea.cantidad)) {
                return null;
            }
        }

        const orden = new OrdenCompra(cliente, this.carrito);

        // Aquí sí sale el inventario físico, y la reserva ya no hace falta.
        for (let i = 0; i < this.carrito.items.length; i = i + 1) {
            this.carrito.items[i].producto.comprar(this.carrito.items[i].cantidad);
        }

        this.almacenamiento.guardarCatalogo(this.catalogo);
        // Cada pedido recibe su propio número y su propio código de guía de demostración.
        orden.numero = this.almacenamiento.generarNumeroPedido();
        orden.guia = this.almacenamiento.generarGuia();
        this.almacenamiento.guardarOrden(orden);
        this.vaciarCarrito();
        return orden;
    }
}
