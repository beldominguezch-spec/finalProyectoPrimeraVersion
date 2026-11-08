import { formatearMoneda } from "../services/format-service.js";

// Recibe etiqueta, clase y texto; devuelve un elemento HTML.
function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);
    elemento.className = clase;
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

// Recibe un grupo (misma edición, varios estados) y devuelve los ejemplares con stock.
export function obtenerDisponibles(grupo) {
    const disponibles = [];
    for (let i = 0; i < grupo.libros.length; i = i + 1) {
        if (grupo.libros[i].obtenerDisponible() > 0) {
            disponibles.push(grupo.libros[i]);
        }
    }
    return disponibles;
}

// Recibe un grupo de una edición, una imagen de respaldo y las dos acciones de sus botones.
// Devuelve una tarjeta que conserva las clases del CSS existente.
export function crearTarjetaLibro(grupo, rutaImagen, alAgregar, alVerDetalle) {
    const libro = grupo.libros[0];
    const disponibles = obtenerDisponibles(grupo);
    let stockTotal = 0;
    let precioMenor = libro.precio;
    let estados = "";
    for (let i = 0; i < disponibles.length; i = i + 1) {
        stockTotal = stockTotal + disponibles[i].obtenerDisponible();
        if (i === 0 || disponibles[i].precio < precioMenor) {
            precioMenor = disponibles[i].precio;
        }
        estados = estados + (i > 0 ? " · " : "") + disponibles[i].estado;
    }

    const tarjeta = crearElemento("article", "book-card");
    const portada = crearElemento("div", "book-card-cover");
    const categoria = crearElemento("span", "book-badge category", libro.categoria);
    const imagen = document.createElement("img");
    const informacion = crearElemento("div", "book-card-info");
    const titulo = crearElemento("h3", "book-card-title", libro.titulo);
    const autor = crearElemento("p", "book-card-author", libro.autor);
    const textoEstados = crearElemento("p", "book-card-author", estados === "" ? "Sin ejemplares" : "Estado: " + estados);
    const filaPrecio = crearElemento("div", "book-card-price-row");
    const textoPrecio = (disponibles.length > 1 ? "Desde " : "") + formatearMoneda(precioMenor);
    const precio = crearElemento("div", "book-card-price", textoPrecio);
    const stock = crearElemento("div", "book-card-stock available", "✓ En stock (" + stockTotal + ")");
    const acciones = crearElemento("div", "book-card-actions");
    const botonDetalle = crearElemento("button", "btn-card-detail", "Ver libro");
    const botonAgregar = crearElemento("button", "btn-card-cart", "Añadir");

    imagen.src = libro.imagen;
    imagen.alt = "Portada de " + libro.titulo;
    imagen.onerror = function () {
        this.onerror = null;
        this.src = rutaImagen;
    };
    if (stockTotal === 0) {
        stock.className = "book-card-stock out";
        stock.textContent = "Agotado";
        botonAgregar.disabled = true;
    }
    botonDetalle.type = "button";
    botonAgregar.type = "button";
    botonDetalle.addEventListener("click", function () { alVerDetalle(grupo); });
    botonAgregar.addEventListener("click", function () { alAgregar(grupo); });

    portada.appendChild(categoria);
    portada.appendChild(imagen);
    filaPrecio.appendChild(precio);
    filaPrecio.appendChild(stock);
    acciones.appendChild(botonDetalle);
    acciones.appendChild(botonAgregar);
    informacion.appendChild(titulo);
    informacion.appendChild(autor);
    informacion.appendChild(textoEstados);
    informacion.appendChild(filaPrecio);
    informacion.appendChild(acciones);
    tarjeta.appendChild(portada);
    tarjeta.appendChild(informacion);
    return tarjeta;
}
