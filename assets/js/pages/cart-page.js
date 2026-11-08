import { actualizarIndicadorCarrito } from "../components/cart-indicator.js";
import { crearTarjetaLibro } from "../components/book-card.js";
import { ServicioTienda } from "../services/shop-service.js";
import { formatearMoneda } from "../services/format-service.js";

/* Conecta los botones y formularios del carrito con sus datos. */
export class PaginaCarrito {
    constructor() {
        this.tienda = new ServicioTienda();
        this.lista = null;
        this.distribucion = null;
        this.estadoVacio = null;
        this.textoCantidad = null;
        this.recomendaciones = null;
        this.botonFinalizar = null;
        this.botonRevisar = null;
        this.ventanaSeguimiento = null;
        this.temporizadorMensaje = null;
    }

    /* Busca los elementos existentes; devuelve false si falta alguno. */
    buscarElementos() {
        this.lista = document.getElementById("cartItemsList");
        this.distribucion = document.getElementById("cartLayout");
        this.estadoVacio = document.getElementById("emptyCartState");
        this.textoCantidad = document.getElementById("cartPageCount");
        this.recomendaciones = document.getElementById("recommendedBooksGrid");
        this.botonFinalizar = document.getElementById("boton-ventas");
        this.botonRevisar = document.getElementById("boton-revisar");

        return this.lista !== null
            && this.distribucion !== null
            && this.estadoVacio !== null
            && this.textoCantidad !== null
            && this.recomendaciones !== null
            && this.botonFinalizar !== null;
    }

    /* Conecta el carrito con las ventanas nuevas de compra y factura. */
    iniciar() {
        const pagina = this;

        if (!this.buscarElementos()) {
            return false;
        }

        // El código de las ventanas llama estas dos funciones al abrir y confirmar.
        window.carritoListoParaComprar = function () {
            return pagina.validarCompra();
        };
        window.crearPedidoDesdeCarrito = function () {
            return pagina.crearPedido();
        };

        // Se comprueba de nuevo justo antes de enviar el formulario de pago.
        document.addEventListener("submit", function (evento) {
            if (evento.target.id === "form-pago") {
                const estado = pagina.validarCompra();
                if (!estado.ok) {
                    evento.preventDefault();
                    evento.stopPropagation();
                    const mensaje = document.getElementById("mensaje-error");
                    mensaje.textContent = estado.mensaje;
                    mensaje.classList.add("visible");
                }
            }
        }, true);

        // La guía de demostración se abre desde la factura o desde el carrito vacío tras una compra.
        window.abrirSeguimientoPedido = function () {
            pagina.abrirSeguimiento();
        };
        if (this.botonRevisar !== null) {
            this.botonRevisar.addEventListener("click", function () {
                pagina.abrirSeguimiento();
            });
        }
        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                pagina.cerrarSeguimiento();
            }
        });

        // Vaciar el carrito libera todas las reservas.
        const botonVaciar = document.getElementById("boton-vaciar");
        if (botonVaciar !== null) {
            botonVaciar.addEventListener("click", function () {
                if (window.confirm("¿Vaciar el carrito? Se liberarán los ejemplares reservados.")) {
                    pagina.tienda.vaciarCarrito();
                    pagina.renderizar();
                }
            });
        }

        // Al volver a esta pestaña se vuelve a leer el carrito por si cambió en otra.
        window.addEventListener("focus", function () {
            if (pagina.tienda.recargarCarrito()) {
                pagina.renderizar();
            }
        });

        this.renderizar();

        // Cada 30 segundos se revisa si alguna reserva de 30 minutos venció.
        window.setInterval(function () {
            if (pagina.tienda.recargarCarrito()) {
                pagina.renderizar();
                pagina.mostrarMensaje("Venció la reserva de algunos libros y se quitaron del carrito.");
            }
        }, 30000);
        return true;
    }

    /* Crea un elemento con clase y texto opcionales para evitar repetición. */
    crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase) {
            elemento.className = clase;
        }
        if (texto !== undefined) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    /* Actualiza listado, totales, estado vacío, recomendaciones e indicador. */
    renderizar() {
        const cantidad = this.tienda.carrito.obtenerCantidadTotal();
        const tieneItems = this.tienda.carrito.items.length > 0;

        if (cantidad === 1) {
            this.textoCantidad.textContent = "1 ejemplar reservado en tu carrito";
        } else {
            this.textoCantidad.textContent = cantidad + " ejemplares reservados en tu carrito";
        }

        this.distribucion.hidden = !tieneItems;
        this.estadoVacio.hidden = tieneItems;
        this.botonFinalizar.disabled = !tieneItems;
        if (this.botonRevisar !== null) {
            this.botonRevisar.hidden = !this.usuarioTienePedidos();
        }
        this.renderizarItems();
        this.renderizarResumen();
        this.renderizarRecomendaciones();
        actualizarIndicadorCarrito(cantidad);
    }

    /* Limpia el contenedor y dibuja una fila por cada libro del carrito. */
    renderizarItems() {
        this.lista.textContent = "";
        for (let i = 0; i < this.tienda.carrito.items.length; i = i + 1) {
            this.lista.appendChild(this.crearFilaItem(this.tienda.carrito.items[i]));
        }
    }

    /* Construye los elementos visuales de una línea del carrito. */
    crearFilaItem(item) {
        const pagina = this;
        const producto = item.producto;
        const articulo = this.crearElemento("article", "cart-item");
        const portada = this.crearElemento("div", "book-card-cover cart-item-cover");
        const categoria = this.crearElemento("span", "book-badge category", producto.categoria);
        const imagen = this.crearElemento("img");
        const detalles = this.crearElemento("div", "cart-item-details");
        const titulo = this.crearElemento("h2", "cart-item-title", producto.titulo);
        const autor = this.crearElemento("p", "cart-item-author", producto.autor);
        const meta = this.crearElemento("p", "cart-item-meta", producto.categoria + " · " + producto.encuadernacion + " · Estado: " + producto.estado);
        const isbn = this.crearElemento("p", "cart-item-meta", "ISBN " + producto.isbn);
        const stock = this.crearElemento("div", "book-card-stock available", "✓ Reservado por " + window.minutosRestantesReserva(producto.id) + " min · Disponible: " + producto.obtenerDisponible());
        const cantidad = this.crearElemento("div", "cart-item-quantity");
        const etiquetaCantidad = this.crearElemento("span", "cart-item-label", "Cantidad");
        const control = this.crearElemento("div", "qty-control");
        const botonRestar = this.crearElemento("button", "qty-btn", "−");
        const valorCantidad = this.crearElemento("span", "qty-value", item.cantidad);
        const botonSumar = this.crearElemento("button", "qty-btn", "+");
        const botonEliminar = this.crearElemento("button", "cart-item-remove", "× Eliminar");
        const precio = this.crearElemento("div", "cart-item-price");

        articulo.dataset.productoId = producto.id;
        imagen.src = producto.imagen;
        imagen.alt = "Portada de " + producto.titulo;
        imagen.loading = "lazy";
        imagen.addEventListener("error", function () {
            this.src = "../assets/img/hero-features/libro.png";
        });

        botonRestar.type = "button";
        botonRestar.dataset.accion = "restar";
        botonRestar.disabled = item.cantidad === 1;
        botonRestar.setAttribute("aria-label", "Restar un ejemplar de " + producto.titulo);
        botonRestar.addEventListener("click", function () {
            pagina.cambiarCantidad(producto.id, item.cantidad - 1);
        });

        botonSumar.type = "button";
        botonSumar.dataset.accion = "sumar";
        botonSumar.disabled = item.cantidad >= producto.obtenerDisponible();
        botonSumar.setAttribute("aria-label", "Sumar un ejemplar de " + producto.titulo);
        botonSumar.addEventListener("click", function () {
            pagina.cambiarCantidad(producto.id, item.cantidad + 1);
        });

        botonEliminar.type = "button";
        botonEliminar.dataset.accion = "eliminar";
        botonEliminar.setAttribute("aria-label", "Eliminar " + producto.titulo + " del carrito");
        botonEliminar.addEventListener("click", function () {
            pagina.tienda.eliminarDelCarrito(producto.id);
            pagina.renderizar();
        });

        precio.appendChild(this.crearElemento("strong", "cart-item-current-price", formatearMoneda(producto.precio * item.cantidad)));
        precio.appendChild(this.crearElemento("span", "cart-item-line-total", item.cantidad + " × " + formatearMoneda(producto.obtenerPrecioUnitario())));

        portada.appendChild(categoria);
        portada.appendChild(imagen);
        detalles.appendChild(titulo);
        detalles.appendChild(autor);
        detalles.appendChild(meta);
        detalles.appendChild(isbn);
        detalles.appendChild(stock);
        control.appendChild(botonRestar);
        control.appendChild(valorCantidad);
        control.appendChild(botonSumar);
        cantidad.appendChild(etiquetaCantidad);
        cantidad.appendChild(control);
        cantidad.appendChild(botonEliminar);
        articulo.appendChild(portada);
        articulo.appendChild(detalles);
        articulo.appendChild(cantidad);
        articulo.appendChild(precio);
        return articulo;
    }

    /* Recibe un ID y la nueva cantidad; devuelve el carrito actualizado en el HTML. */
    cambiarCantidad(productoId, cantidadNueva) {
        const actualizado = this.tienda.actualizarCantidad(productoId, cantidadNueva);

        if (!actualizado) {
            this.mostrarMensaje("No se puede usar esa cantidad. Revisa el stock disponible.");
        }
        this.renderizar();
    }

    /* Devuelve el pedido más reciente del usuario con sesión, o null si no tiene. */
    obtenerUltimoPedido() {
        const usuario = window.obtenerUsuarioActual();
        if (usuario === null) {
            return null;
        }
        const almacenamiento = this.tienda.almacenamiento;
        const ordenes = almacenamiento.leer(almacenamiento.claveOrdenes, []);
        let ultimo = null;
        for (let i = 0; i < ordenes.length; i = i + 1) {
            if (ordenes[i].usuarioId === usuario.id) {
                ultimo = ordenes[i];
            }
        }
        return ultimo;
    }

    /* Devuelve true solo si el usuario con sesión ya tiene una compra registrada. */
    usuarioTienePedidos() {
        return this.obtenerUltimoPedido() !== null;
    }

    /* Muestra la guía de DEMOSTRACIÓN del último pedido y el enlace oficial de Interrapidísimo.
       No consulta ningún servicio externo y no simula estados de envío. */
    abrirSeguimiento() {
        const pagina = this;
        const pedido = this.obtenerUltimoPedido();
        if (pedido === null) {
            return;
        }
        this.cerrarSeguimiento();

        // La guía se guarda con el pedido: siempre es la misma al consultar de nuevo.
        const guia = this.tienda.almacenamiento.asegurarGuia(pedido.id);

        const fondo = this.crearElemento("div", "track-overlay");
        const ventana = this.crearElemento("div", "track-modal");
        const cerrar = this.crearElemento("button", "track-close", "×");
        const icono = this.crearElemento("div", "track-icon", "📦");
        const titulo = this.crearElemento("h2", "", "Guía de envío de demostración");
        const textoPedido = this.crearElemento("p", "", "Pedido: " + pedido.id);
        const codigo = this.crearElemento("p", "", guia);
        const aviso = this.crearElemento("p", "", "Esta guía es solo de demostración: no corresponde a un envío real y no tiene validez para el transporte. El enlace lleva a la página oficial de Interrapidísimo, pero ese sitio no permite rastrear este pedido.");
        const enlace = this.crearElemento("a", "btn-review-order", "Ir a Interrapidísimo (sitio oficial)");
        const botonCerrar = this.crearElemento("button", "btn-review-order", "Cerrar");

        codigo.style.fontWeight = "bold";
        codigo.style.fontSize = "1.3rem";
        enlace.href = "https://www.interrapidisimo.com/sigue-tu-envio/";
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        fondo.setAttribute("role", "dialog");
        fondo.setAttribute("aria-modal", "true");
        fondo.setAttribute("aria-label", "Guía de envío de demostración");
        cerrar.type = "button";
        cerrar.setAttribute("aria-label", "Cerrar");
        botonCerrar.type = "button";

        cerrar.addEventListener("click", function () {
            pagina.cerrarSeguimiento();
        });
        botonCerrar.addEventListener("click", function () {
            pagina.cerrarSeguimiento();
        });
        fondo.addEventListener("click", function (evento) {
            if (evento.target === fondo) {
                pagina.cerrarSeguimiento();
            }
        });

        ventana.appendChild(cerrar);
        ventana.appendChild(icono);
        ventana.appendChild(titulo);
        ventana.appendChild(textoPedido);
        ventana.appendChild(codigo);
        ventana.appendChild(aviso);
        ventana.appendChild(enlace);
        ventana.appendChild(botonCerrar);
        fondo.appendChild(ventana);
        document.body.appendChild(fondo);
        this.ventanaSeguimiento = fondo;
    }

    /* Cierra la ventana de la guía. */
    cerrarSeguimiento() {
        if (this.ventanaSeguimiento !== null) {
            this.ventanaSeguimiento.remove();
            this.ventanaSeguimiento = null;
        }
    }

    /* Actualiza subtotal, envío y total de la compra (sin IVA). */
    renderizarResumen() {
        const cantidad = this.tienda.carrito.obtenerCantidadTotal();

        document.getElementById("summarySubtotalLabel").textContent = "Subtotal (" + cantidad + " ejemplares)";
        document.getElementById("summarySubtotal").textContent = formatearMoneda(this.tienda.carrito.calcularSubtotal());
        document.getElementById("summaryShipping").textContent = formatearMoneda(this.tienda.carrito.calcularEnvio());
        document.getElementById("summaryTotal").textContent = formatearMoneda(this.tienda.carrito.calcularTotal());
    }

    /* Muestra hasta cuatro libros disponibles que no estén ya en el carrito. */
    renderizarRecomendaciones() {
        const pagina = this;
        let mostrados = 0;

        this.recomendaciones.textContent = "";
        for (let i = 0; i < this.tienda.catalogo.length && mostrados < 4; i = i + 1) {
            const producto = this.tienda.catalogo[i];
            if (producto.obtenerDisponible() > 0 && this.tienda.carrito.buscarItem(producto.id) === null) {
                this.recomendaciones.appendChild(crearTarjetaLibro({ clave: producto.id, libros: [producto] }, "../assets/img/hero-features/libro.png",
                    function (grupo) {
                        pagina.agregarRecomendacion(grupo.libros[0].id);
                    },
                    function () {
                        window.location.href = "./book-categories.html";
                    }
                ));
                mostrados = mostrados + 1;
            }
        }
    }

    /* Agrega una recomendación y vuelve a calcular la página. */
    agregarRecomendacion(productoId) {
        const producto = this.tienda.buscarProducto(productoId);
        if (this.tienda.agregarAlCarrito(productoId, 1)) {
            this.mostrarMensaje("“" + producto.titulo + "” se agregó al carrito.");
            this.renderizar();
        } else {
            this.mostrarMensaje("No hay más ejemplares disponibles de este libro.");
        }
    }

    /* Comprueba sesión, carrito y stock antes de abrir o confirmar la compra. */
    validarCompra() {
        const usuario = window.obtenerUsuarioActual();
        let mensaje = "";

        if (usuario === null || usuario.rol !== "User") {
            mensaje = "Debes iniciar sesión antes de comprar.";
        } else if (this.tienda.carrito.items.length === 0) {
            mensaje = "El carrito está vacío.";
        } else {
            // Leemos el stock más reciente antes de aceptar el pedido.
            this.tienda.actualizarStockDesdeStorage();
            for (let i = 0; i < this.tienda.carrito.items.length; i = i + 1) {
                const item = this.tienda.carrito.items[i];
                if (!item.producto.tieneStock(item.cantidad)) {
                    mensaje = "No hay suficientes ejemplares de “" + item.producto.titulo + "”.";
                    break;
                }
            }
        }

        if (mensaje !== "") {
            this.mostrarMensaje(mensaje);
            return { ok: false, mensaje: mensaje };
        }
        return { ok: true, mensaje: "" };
    }

    /* La ventana nueva pide los libros comprados para construir su factura. */
    crearPedido() {
        const usuario = window.obtenerUsuarioActual();
        const cliente = {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            direccion: document.getElementById("direccion").value.trim(),
            ciudad: document.getElementById("ciudad").value.trim(),
            departamento: document.getElementById("departamento").value.trim()
        };

        // El servicio conserva la compra, descuenta el stock y vacía el carrito.
        const orden = this.tienda.confirmarCompra(cliente);
        if (orden === null) {
            // Sin pedido real no permitimos que se muestre una factura de éxito.
            const mensaje = document.getElementById("mensaje-error");
            mensaje.textContent = "No fue posible confirmar la compra. Verifica el stock.";
            mensaje.classList.add("visible");
            throw new Error("No fue posible confirmar la compra. Verifica el stock.");
        }

        // La factura lee los valores de la orden registrada (no los recalcula).
        window.ultimaOrdenCreada = orden;

        const comprados = [];
        for (let i = 0; i < orden.detalles.length; i = i + 1) {
            const detalle = orden.detalles[i];
            for (let j = 0; j < detalle.cantidad; j = j + 1) {
                comprados.push({ titulo: detalle.titulo, estado: detalle.estado, precio: detalle.precioUnitario });
            }
        }

        this.renderizar();
        return comprados;
    }

    /* Presenta mensajes breves de estado para las operaciones del carrito. */
    mostrarMensaje(texto) {
        const mensaje = document.getElementById("cartStatusMessage");
        if (mensaje === null) {
            return;
        }

        window.clearTimeout(this.temporizadorMensaje);
        mensaje.textContent = texto;
        mensaje.classList.add("visible");
        this.temporizadorMensaje = window.setTimeout(function () {
            mensaje.classList.remove("visible");
        }, 2600);
    }
}

/* Inicia los eventos cuando el HTML ya está disponible. */
document.addEventListener("DOMContentLoaded", function () {
    if (window.protegerPagina("./login.html?volver=carrito")) {
        const pagina = new PaginaCarrito();
        pagina.iniciar();
    }
});
