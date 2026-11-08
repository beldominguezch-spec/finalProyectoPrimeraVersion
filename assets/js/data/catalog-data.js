import { crearProductoDesdeDatos } from "../models/product.js";

/* Crea el catálogo inicial a partir de los datos de data-initial.js (única fuente de datos de ejemplo). */
export function crearCatalogoInicial() {
    const libros = [];
    const datos = window.LIBROS_TIENDA || [];

    for (let i = 0; i < datos.length; i = i + 1) {
        libros.push(crearProductoDesdeDatos(datos[i]));
    }
    return libros;
}
