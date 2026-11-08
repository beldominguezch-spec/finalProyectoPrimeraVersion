// Reglas de precio y estado de los libros. Se carga como script normal y lo usan
// tanto la portada (catalog.js) como el catálogo (módulos), para no repetir la lógica.
// Es solo para mostrar: el cálculo definitivo lo hará Java cuando exista el backend.
window.PRECIO_BASE_MINIMO = 20000;
window.ESTADOS_LIBRO = ["Excelente", "Bueno", "Aceptable"];

// Recibe el estado y devuelve su porcentaje de descuento.
window.descuentoPorEstado = function (estado) {
    if (estado === "Bueno") {
        return 10;
    }
    if (estado === "Aceptable") {
        return 30;
    }
    return 0;
};

// Recibe el precio base y el estado; devuelve el precio final con descuento.
window.calcularPrecioFinal = function (precioBase, estado) {
    const descuento = window.descuentoPorEstado(estado);
    return Math.round(Number(precioBase) * (100 - descuento) / 100);
};

// Recibe una lista de libros (filas por estado) y los agrupa por edición (ISBN + encuadernación).
// Devuelve [{ clave, libros: [...ordenados Excelente, Bueno, Aceptable] }].
window.agruparLibrosPorEdicion = function (libros) {
    const grupos = [];
    for (let i = 0; i < libros.length; i = i + 1) {
        const clave = libros[i].isbn + "|" + libros[i].encuadernacion;
        let grupo = null;
        for (let j = 0; j < grupos.length; j = j + 1) {
            if (grupos[j].clave === clave) {
                grupo = grupos[j];
            }
        }
        if (grupo === null) {
            grupo = { clave: clave, libros: [] };
            grupos.push(grupo);
        }
        grupo.libros.push(libros[i]);
    }
    for (let i = 0; i < grupos.length; i = i + 1) {
        grupos[i].libros.sort(function (a, b) {
            return window.ESTADOS_LIBRO.indexOf(a.estado) - window.ESTADOS_LIBRO.indexOf(b.estado);
        });
    }
    return grupos;
};
