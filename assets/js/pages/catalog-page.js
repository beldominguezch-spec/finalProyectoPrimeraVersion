import { crearTarjetaLibro, obtenerDisponibles } from "../components/book-card.js";
import { actualizarIndicadorCarrito } from "../components/cart-indicator.js";
import { ServicioTienda } from "../services/shop-service.js";
import { formatearMoneda } from "../services/format-service.js";

/* Conecta catálogo, búsqueda, detalle y carrito con el HTML existente. */
export class PaginaCatalogo {
    constructor() {
        this.tienda = new ServicioTienda();
        this.contenedor = null;
        this.buscador = null;
        this.botonBuscar = null;
        this.modal = null;
        this.botonCerrarModal = null;
        this.botonAgregarModal = null;
        this.productoSeleccionadoId = null;
        this.temporizadorMensaje = null;
    }

    /* Busca los elementos necesarios y devuelve false si el HTML aún no está preparado. */
    buscarElementos() {
        this.contenedor = document.querySelector(".categories-container");
        this.buscador = document.getElementById("search");
        this.botonBuscar = document.querySelector(".search button");
        this.modal = document.getElementById("modalDetalleLibro");
        this.botonCerrarModal = document.getElementById("modalCloseButton");
        this.botonAgregarModal = document.getElementById("modalBtnAgregarCarrito");

        return this.contenedor !== null
            && this.buscador !== null
            && this.botonBuscar !== null
            && this.modal !== null
            && this.botonCerrarModal !== null
            && this.botonAgregarModal !== null;
    }

    /* Conecta los eventos una sola vez y presenta el catálogo inicial. */
    iniciar() {
        const pagina = this;

        if (!this.buscarElementos()) {
            return false;
        }

        this.botonBuscar.addEventListener("click", function (evento) {
            evento.preventDefault();
            pagina.buscar();
        });

        this.buscador.addEventListener("input", function () {
            pagina.buscar();
        });

        this.botonCerrarModal.addEventListener("click", function () {
            pagina.cerrarDetalle();
        });

        this.modal.addEventListener("click", function (evento) {
            if (evento.target === pagina.modal) {
                pagina.cerrarDetalle();
            }
        });

        this.botonAgregarModal.addEventListener("click", function () {
            pagina.agregarProducto(pagina.productoSeleccionadoId);
            pagina.cerrarDetalle();
        });

        document.addEventListener("keydown", function (evento) {
            if (evento.key === "Escape") {
                pagina.cerrarDetalle();
            }
        });

        const busqueda = window.location.search;
        if (busqueda.indexOf("?buscar=") === 0) {
            this.buscador.value = decodeURIComponent(busqueda.substring(8));
            this.buscar();
        } else {
            this.renderizarPorCategorias(this.tienda.catalogo);
        }
        actualizarIndicadorCarrito(this.tienda.carrito.obtenerCantidadTotal());
        return true;
    }

    /* Filtra al escribir y recupera las categorías cuando la búsqueda queda vacía. */
    buscar() {
        const termino = this.buscador.value.trim();
        if (termino === "") {
            this.renderizarPorCategorias(this.tienda.catalogo);
        } else {
            this.renderizarResultados(this.tienda.buscarProductos(termino), termino);
        }
    }

    /* Agrupa y dibuja los productos según su categoría. */
    renderizarPorCategorias(productos) {
        const categorias = this.tienda.obtenerCategorias();
        const titulo = document.createElement("h1");

        this.contenedor.textContent = "";
        titulo.textContent = "Explorar libros por categoría";
        this.contenedor.appendChild(titulo);

        for (let i = 0; i < categorias.length; i = i + 1) {
            const productosCategoria = [];
            for (let j = 0; j < productos.length; j = j + 1) {
                if (productos[j].categoria === categorias[i]) {
                    productosCategoria.push(productos[j]);
                }
            }
            if (productosCategoria.length > 0) {
                this.contenedor.appendChild(this.crearSeccion(categorias[i], productosCategoria));
            }
        }
    }

    /* Dibuja una sección única con los resultados del buscador. */
    renderizarResultados(productos, termino) {
        const titulo = document.createElement("h1");

        this.contenedor.textContent = "";
        titulo.textContent = "Resultados para “" + termino + "”";
        this.contenedor.appendChild(titulo);

        if (productos.length === 0) {
            const mensaje = document.createElement("p");
            mensaje.className = "empty-grid-msg";
            mensaje.textContent = "No encontramos libros con ese título, autor, ISBN o categoría.";
            this.contenedor.appendChild(mensaje);
            return;
        }

        this.contenedor.appendChild(this.crearSeccion("Libros encontrados", productos));
    }

    /* Construye una sección de libros (una tarjeta por edición) con el CSS existente. */
    crearSeccion(nombre, productos) {
        const pagina = this;
        const grupos = window.agruparLibrosPorEdicion(productos);
        const seccion = document.createElement("section");
        const encabezado = document.createElement("div");
        const titulo = document.createElement("h2");
        const cuadricula = document.createElement("div");

        seccion.className = "book-list";
        encabezado.className = "section-header";
        cuadricula.className = "books-grid";
        titulo.textContent = nombre + " (" + grupos.length + ")";
        encabezado.appendChild(titulo);
        seccion.appendChild(encabezado);

        for (let i = 0; i < grupos.length; i = i + 1) {
            cuadricula.appendChild(crearTarjetaLibro(grupos[i], "../assets/img/hero-features/libro.png",
                function (grupo) {
                    pagina.agregarDesdeTarjeta(grupo);
                },
                function (grupo) {
                    pagina.mostrarDetalle(grupo);
                }
            ));
        }

        seccion.appendChild(cuadricula);
        return seccion;
    }

    /* Con un solo estado disponible agrega directo; con varios, pide elegir el estado. */
    agregarDesdeTarjeta(grupo) {
        const disponibles = obtenerDisponibles(grupo);
        if (disponibles.length === 1) {
            this.agregarProducto(disponibles[0].id);
        } else if (disponibles.length > 1) {
            this.mostrarDetalle(grupo);
            this.mostrarMensaje("Elige el estado del ejemplar que deseas.");
        }
    }

    /* Recibe el ID de un ejemplar (libro + estado); agrega una unidad y actualiza el carrito. */
    agregarProducto(productoId) {
        const producto = this.tienda.buscarProducto(productoId);

        if (producto === null) {
            return;
        }

        const agregado = this.tienda.agregarAlCarrito(productoId, 1);
        if (agregado) {
            actualizarIndicadorCarrito(this.tienda.carrito.obtenerCantidadTotal());
            this.mostrarMensaje("“" + producto.titulo + "” (" + producto.estado + ") se agregó al carrito.");
            // Se vuelven a dibujar las tarjetas para mostrar la disponibilidad actualizada.
            this.buscar();
        } else {
            this.mostrarMensaje("No es posible agregar más unidades: ya reservaste todo lo disponible de ese estado.");
        }
    }

    /* Completa el modal con la edición elegida y un selector de estado. */
    mostrarDetalle(grupo) {
        const pagina = this;
        const libro = grupo.libros[0];
        const disponibles = obtenerDisponibles(grupo);
        const selector = document.createElement("select");

        document.getElementById("modalLibroTitulo").textContent = libro.titulo;
        document.getElementById("modalLibroAutor").textContent = libro.autor;
        document.getElementById("modalLibroCategoria").textContent = libro.categoria;
        document.getElementById("modalLibroIsbn").textContent = libro.isbn;
        document.getElementById("modalLibroEncuadernacion").textContent = libro.encuadernacion;
        document.getElementById("modalLibroSinopsis").textContent = libro.descripcion;
        document.getElementById("modalLibroPortada").src = libro.imagen;

        // Un option por estado con ejemplares; el precio y la disponibilidad cambian al elegir.
        const contenedorEstado = document.getElementById("modalLibroEstado");
        contenedorEstado.textContent = "";
        for (let i = 0; i < disponibles.length; i = i + 1) {
            const opcion = document.createElement("option");
            opcion.value = disponibles[i].id;
            opcion.textContent = disponibles[i].estado;
            selector.appendChild(opcion);
        }
        selector.addEventListener("change", function () {
            pagina.mostrarEstadoElegido(selector.value);
        });
        if (disponibles.length > 0) {
            contenedorEstado.appendChild(selector);
            this.mostrarEstadoElegido(disponibles[0].id);
        } else {
            contenedorEstado.textContent = "Sin ejemplares";
            this.productoSeleccionadoId = null;
            document.getElementById("modalLibroStock").textContent = "Agotado";
            document.getElementById("modalLibroPrecio").textContent = formatearMoneda(libro.precio);
            this.botonAgregarModal.disabled = true;
        }
        this.modal.classList.add("active");
        this.modal.setAttribute("aria-hidden", "false");
    }

    /* Muestra precio (con descuento si aplica) y disponibilidad del estado elegido. */
    mostrarEstadoElegido(productoId) {
        const producto = this.tienda.buscarProducto(productoId);
        const descuento = window.descuentoPorEstado(producto.estado);
        let textoPrecio = formatearMoneda(producto.precio);

        if (descuento > 0) {
            textoPrecio = textoPrecio + " (" + descuento + " % de descuento sobre " + formatearMoneda(producto.precioBase) + ")";
        }
        this.productoSeleccionadoId = producto.id;
        document.getElementById("modalLibroPrecio").textContent = textoPrecio;
        document.getElementById("modalLibroStock").textContent = producto.obtenerDisponible() + " ejemplares disponibles";
        this.botonAgregarModal.disabled = producto.obtenerDisponible() === 0;
    }

    /* Oculta el modal de detalle y limpia su selección. */
    cerrarDetalle() {
        if (this.modal !== null) {
            this.modal.classList.remove("active");
            this.modal.setAttribute("aria-hidden", "true");
        }
        this.productoSeleccionadoId = null;
    }

    /* Muestra un aviso temporal accesible sin utilizar alert(). */
    mostrarMensaje(texto) {
        let mensaje = document.getElementById("vintageToast");
        if (mensaje === null) {
            mensaje = document.createElement("div");
            mensaje.id = "vintageToast";
            mensaje.className = "vintage-toast";
            mensaje.setAttribute("role", "status");
            document.body.appendChild(mensaje);
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
    const pagina = new PaginaCatalogo();
    pagina.iniciar();
});
