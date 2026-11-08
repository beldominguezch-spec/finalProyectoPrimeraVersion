/* Convierte un número en moneda colombiana para las vistas. */
export function formatearMoneda(valor) {
    return "$" + Number(valor).toLocaleString("es-CO");
}

/* Convierte una fecha ISO en una fecha legible para el cliente. */
export function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString("es-CO");
}
