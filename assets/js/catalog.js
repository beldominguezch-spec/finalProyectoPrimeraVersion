// Catálogo de la página principal. Usa los IDs y clases que ya existen en el HTML.
let libroAbierto = null;
let filtroCategoria = "";
let filtroTexto = "";

// Recibe un valor numérico y devuelve su presentación en pesos colombianos.
function moneda(valor) {
    return "$" + Number(valor).toLocaleString("es-CO");
}

// Recibe un identificador y devuelve el libro correspondiente, o null.
function buscarLibroInicio(id) {
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    for (let i = 0; i < libros.length; i = i + 1) {
        if (String(libros[i].id) === String(id)) {
            return libros[i];
        }
    }
    return null;
}

// Recibe cantidad del carrito; actualiza el número visible junto al icono.
function actualizarNumeroCarrito() {
    const enlace = document.querySelector(".icon-actions a[href$='cart.html']");
    if (enlace === null) {
        return;
    }
    const items = window.leerCarritoDueno();
    let cantidad = 0;
    for (let i = 0; i < items.length; i = i + 1) {
        cantidad = cantidad + Number(items[i].cantidad);
    }
    let indicador = enlace.querySelector(".cart-count-badge");
    if (cantidad > 0) {
        if (indicador === null) {
            indicador = document.createElement("span");
            indicador.className = "cart-count-badge";
            enlace.appendChild(indicador);
        }
        indicador.textContent = cantidad;
    } else if (indicador !== null) {
        indicador.remove();
    }
}

// Recibe el ID del libro (una fila = edición + estado); reserva una unidad más por 30 minutos.
function agregarLibroInicio(id) {
    const libro = buscarLibroInicio(id);
    if (libro === null || window.calcularDisponible(libro.id, libro.stock) === 0) {
        alert("Este libro está agotado.");
        return;
    }
    const items = window.leerCarritoDueno();
    let cantidadNueva = 1;
    let linea = null;
    for (let i = 0; i < items.length; i = i + 1) {
        if (String(items[i].productoId) === String(id)) {
            linea = items[i];
            cantidadNueva = Number(items[i].cantidad) + 1;
        }
    }
    // reservarCantidad rechaza la cantidad si supera lo disponible.
    if (!window.reservarCantidad(libro.id, cantidadNueva)) {
        alert("No hay más ejemplares disponibles de este libro en ese estado.");
        return;
    }
    if (linea !== null) {
        linea.cantidad = cantidadNueva;
    } else {
        items.push({ productoId: id, cantidad: 1 });
    }
    window.guardarCarritoDueno(items);
    actualizarNumeroCarrito();
    mostrarLibrosInicio(filtroCategoria, filtroTexto);
    alert("Libro agregado al carrito. Queda reservado por " + window.MINUTOS_RESERVA + " minutos.");
}

// Recibe etiqueta, clase y texto; devuelve un elemento listo para el HTML.
function elementoInicio(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Recibe un grupo (misma edición, varios estados); devuelve los ejemplares con stock.
function disponiblesInicio(grupo) {
    const disponibles = [];
    for (let i = 0; i < grupo.libros.length; i = i + 1) {
        if (window.calcularDisponible(grupo.libros[i].id, grupo.libros[i].stock) > 0) {
            disponibles.push(grupo.libros[i]);
        }
    }
    return disponibles;
}

// Recibe un grupo de una edición; devuelve su tarjeta con botones de detalle y carrito.
function tarjetaInicio(grupo) {
    const libro = grupo.libros[0];
    const disponibles = disponiblesInicio(grupo);
    let stockTotal = 0;
    let precioMenor = window.calcularPrecioFinal(libro.precio, libro.estado);
    let estados = "";
    for (let i = 0; i < disponibles.length; i = i + 1) {
        const precioFinal = window.calcularPrecioFinal(disponibles[i].precio, disponibles[i].estado);
        stockTotal = stockTotal + window.calcularDisponible(disponibles[i].id, disponibles[i].stock);
        if (i === 0 || precioFinal < precioMenor) {
            precioMenor = precioFinal;
        }
        estados = estados + (i > 0 ? " · " : "") + disponibles[i].estado;
    }
    const tarjeta = elementoInicio("article", "book-card");
    const portada = elementoInicio("div", "book-card-cover");
    const categoria = elementoInicio("span", "book-badge category", libro.categoria);
    const imagen = document.createElement("img");
    const datos = elementoInicio("div", "book-card-info");
    const titulo = elementoInicio("h3", "book-card-title", libro.titulo);
    const autor = elementoInicio("p", "book-card-author", libro.autor);
    const textoEstados = elementoInicio("p", "book-card-author", estados === "" ? "Sin ejemplares" : "Estado: " + estados);
    const precioFila = elementoInicio("div", "book-card-price-row");
    const precio = elementoInicio("div", "book-card-price", (disponibles.length > 1 ? "Desde " : "") + moneda(precioMenor));
    const stock = elementoInicio("div", "book-card-stock available", "✓ En stock (" + stockTotal + ")");
    const acciones = elementoInicio("div", "book-card-actions");
    const detalle = elementoInicio("button", "btn-card-detail", "Ver libro");
    const agregar = elementoInicio("button", "btn-card-cart", "Añadir");

    imagen.src = libro.portada || libro.imagen || "https://covers.openlibrary.org/b/isbn/" + libro.isbn + "-M.jpg";
    imagen.alt = "Portada de " + libro.titulo;
    imagen.onerror = function () {
        this.onerror = null;
        this.src = "./assets/img/hero-features/libro.png";
    };
    if (stockTotal === 0) {
        stock.className = "book-card-stock out";
        stock.textContent = "Agotado";
        agregar.disabled = true;
    }
    detalle.type = "button";
    agregar.type = "button";
    detalle.onclick = function () { abrirLibroInicio(grupo); };
    agregar.onclick = function () {
        // Con un solo estado se agrega directo; con varios se pide elegir el estado.
        if (disponibles.length === 1) {
            agregarLibroInicio(disponibles[0].id);
        } else {
            abrirLibroInicio(grupo);
        }
    };

    portada.appendChild(categoria);
    portada.appendChild(imagen);
    precioFila.appendChild(precio);
    precioFila.appendChild(stock);
    acciones.appendChild(detalle);
    acciones.appendChild(agregar);
    datos.appendChild(titulo);
    datos.appendChild(autor);
    datos.appendChild(textoEstados);
    datos.appendChild(precioFila);
    datos.appendChild(acciones);
    tarjeta.appendChild(portada);
    tarjeta.appendChild(datos);
    return tarjeta;
}

// Recibe una categoría y un texto de búsqueda; llena las cuadrículas existentes.
function mostrarLibrosInicio(categoria, texto) {
    filtroCategoria = categoria;
    filtroTexto = texto;
    const secciones = ["featured-books", "best-sellers", "top-rated", "new-releases"];
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    const filtrados = [];
    for (let i = 0; i < libros.length; i = i + 1) {
        const libro = libros[i];
        const coincideCategoria = categoria === "" || libro.categoria === categoria;
        const palabras = (libro.titulo + " " + libro.autor + " " + libro.isbn).toLowerCase();
        if (coincideCategoria && palabras.indexOf(texto.toLowerCase()) !== -1) {
            filtrados.push(libro);
        }
    }
    const grupos = window.agruparLibrosPorEdicion(filtrados);
    for (let i = 0; i < secciones.length; i = i + 1) {
        const seccion = document.getElementById(secciones[i]);
        const cuadricula = seccion.querySelector(".books-grid");
        cuadricula.textContent = "";
        seccion.hidden = (categoria !== "" || texto !== "") && i > 0;
        if (!seccion.hidden) {
            // El HTML tiene apartados de ventas y calificaciones, pero no hay
            // datos para afirmar qué libros ocupan esos puestos.
            if (categoria === "" && texto === "" && (i === 1 || i === 2)) {
                const aviso = i === 1 ? "No hay un ranking de ventas disponible." : "No hay calificaciones disponibles.";
                cuadricula.appendChild(elementoInicio("p", "empty-grid-msg", aviso));
                continue;
            }
            const inicio = 0;
            const fin = (categoria !== "" || texto !== "") ? grupos.length : 4;
            for (let j = inicio; j < fin && j < grupos.length; j = j + 1) {
                cuadricula.appendChild(tarjetaInicio(grupos[j]));
            }
        }
    }
    const banner = document.getElementById("filtroBannerContenedor");
    if (banner !== null) {
        banner.textContent = categoria !== "" ? "Categoría: " + categoria : (texto !== "" ? "Resultados para: " + texto : "");
    }
}

// Lee los libros y conecta las categorías con la cuadrícula ya existente.
function mostrarCategoriasInicio() {
    const lista = document.getElementById("categoriesList");
    if (lista === null) {
        return;
    }
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    const categorias = [];
    for (let i = 0; i < libros.length; i = i + 1) {
        let repetida = false;
        for (let j = 0; j < categorias.length; j = j + 1) {
            if (categorias[j] === libros[i].categoria) {
                repetida = true;
            }
        }
        if (!repetida) {
            categorias.push(libros[i].categoria);
        }
    }
    lista.textContent = "";
    for (let i = 0; i < categorias.length; i = i + 1) {
        const item = document.createElement("li");
        const enlace = elementoInicio("a", "", categorias[i]);
        enlace.href = "#featured-books";
        enlace.onclick = function () { mostrarLibrosInicio(categorias[i], ""); };
        item.appendChild(enlace);
        lista.appendChild(item);
    }
}

// Recibe un grupo (edición) y llena el modal de detalle con un selector de estado.
function abrirLibroInicio(grupo) {
    const libro = grupo.libros[0];
    const disponibles = disponiblesInicio(grupo);
    const selector = document.createElement("select");
    const contenedorEstado = document.getElementById("modalLibroEstado");

    document.getElementById("modalLibroTitulo").textContent = libro.titulo;
    document.getElementById("modalLibroAutor").textContent = libro.autor;
    document.getElementById("modalLibroCategoria").textContent = libro.categoria;
    document.getElementById("modalLibroIsbn").textContent = libro.isbn;
    document.getElementById("modalLibroEncuadernacion").textContent = libro.encuadernacion;
    document.getElementById("modalLibroSinopsis").textContent = libro.descripcion;
    document.getElementById("modalLibroPortada").src = libro.portada || libro.imagen || "https://covers.openlibrary.org/b/isbn/" + libro.isbn + "-M.jpg";

    contenedorEstado.textContent = "";
    libroAbierto = null;
    if (disponibles.length === 0) {
        contenedorEstado.textContent = "Sin ejemplares";
        document.getElementById("modalLibroStock").textContent = "Agotado";
        document.getElementById("modalLibroPrecio").textContent = moneda(window.calcularPrecioFinal(libro.precio, libro.estado));
        document.getElementById("modalBtnAgregarCarrito").disabled = true;
    } else {
        for (let i = 0; i < disponibles.length; i = i + 1) {
            const opcion = document.createElement("option");
            opcion.value = disponibles[i].id;
            opcion.textContent = disponibles[i].estado;
            selector.appendChild(opcion);
        }
        selector.onchange = function () { mostrarEstadoInicio(selector.value); };
        contenedorEstado.appendChild(selector);
        mostrarEstadoInicio(disponibles[0].id);
    }
    document.getElementById("modalDetalleLibro").classList.add("active");
}

// Recibe el ID de un ejemplar; muestra su precio con descuento y su disponibilidad.
function mostrarEstadoInicio(id) {
    const libro = buscarLibroInicio(id);
    const descuento = window.descuentoPorEstado(libro.estado);
    let texto = moneda(window.calcularPrecioFinal(libro.precio, libro.estado));
    if (descuento > 0) {
        texto = texto + " (" + descuento + " % de descuento sobre " + moneda(libro.precio) + ")";
    }
    libroAbierto = libro.id;
    document.getElementById("modalLibroPrecio").textContent = texto;
    const disponible = window.calcularDisponible(libro.id, libro.stock);
    document.getElementById("modalLibroStock").textContent = disponible + " disponibles";
    document.getElementById("modalBtnAgregarCarrito").disabled = disponible === 0;
}

// El botón de cerrar del HTML llama esta función directamente.
function cerrarModalDetalle() {
    const modal = document.getElementById("modalDetalleLibro");
    if (modal !== null) {
        modal.classList.remove("active");
    }
    libroAbierto = null;
}

document.addEventListener("DOMContentLoaded", function () {
    actualizarNumeroCarrito();
    const buscador = document.getElementById("search");
    const botonBuscar = document.querySelector(".search button");
    if (buscador !== null && botonBuscar !== null) {
        botonBuscar.onclick = function (evento) {
            evento.preventDefault();
            if (document.getElementById("featured-books") !== null) {
                mostrarLibrosInicio("", buscador.value.trim());
            } else {
                window.location.href = "./book-categories.html?buscar=" + encodeURIComponent(buscador.value.trim());
            }
        };
    }
    if (document.getElementById("featured-books") !== null) {
        mostrarCategoriasInicio();
        mostrarLibrosInicio("", "");
        document.getElementById("modalBtnAgregarCarrito").onclick = function () {
            if (libroAbierto !== null) {
                agregarLibroInicio(libroAbierto);
            }
        };
        document.getElementById("modalDetalleLibro").onclick = function (evento) {
            if (evento.target === this) {
                cerrarModalDetalle();
            }
        };
    }
    const abrirMenu = document.querySelector(".menu-toggle");
    const cerrarMenu = document.querySelector(".close-menu");
    const menu = document.querySelector(".mobile-sidebar");
    const fondo = document.querySelector(".overlay");
    if (abrirMenu !== null && cerrarMenu !== null && menu !== null && fondo !== null) {
        abrirMenu.onclick = function () { menu.classList.add("active"); fondo.classList.add("active"); };
        cerrarMenu.onclick = function () { menu.classList.remove("active"); fondo.classList.remove("active"); };
        fondo.onclick = function () { menu.classList.remove("active"); fondo.classList.remove("active"); };
    }
});
