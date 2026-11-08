/*
 * Esta clase representa un libro usado de la tienda.
 * Sus propiedades guardan datos del libro; stock es la cantidad disponible.
 */
export class Libro {
    constructor(id, titulo, precio, imagen, descripcion, stock, autor, isbn, categoria, encuadernacion, estado) {
        this.id = id;
        this.titulo = titulo;
        // precioBase es el valor guardado; precio es el final según el estado (solo para mostrar).
        this.precioBase = Number(precio);
        this.precio = window.calcularPrecioFinal(this.precioBase, estado);
        this.imagen = imagen;
        this.descripcion = descripcion;
        this.stock = Number(stock);
        this.autor = autor;
        this.isbn = isbn;
        this.categoria = categoria;
        this.encuadernacion = encuadernacion;
        this.estado = estado;
    }

    /* Devuelve el precio unitario del producto. */
    obtenerPrecioUnitario() {
        return this.precio;
    }

    /* Devuelve lo disponible: stock físico menos lo reservado por otros clientes. */
    obtenerDisponible() {
        return window.calcularDisponible(this.id, this.stock);
    }

    /* Comprueba si hay disponibilidad suficiente para la cantidad solicitada. */
    tieneStock(cantidad) {
        return cantidad > 0 && cantidad <= this.obtenerDisponible();
    }

    /* Recibe la cantidad comprada; resta stock y devuelve true si pudo hacerlo. */
    comprar(cantidad) {
        if (!this.tieneStock(cantidad)) {
            return false;
        }

        this.stock = this.stock - cantidad;
        return true;
    }

    /* Devuelve los datos sencillos que JSON.stringify puede guardar. */
    convertirADatos() {
        return {
            id: this.id,
            titulo: this.titulo,
            precio: this.precioBase,
            portada: this.imagen,
            descripcion: this.descripcion,
            stock: this.stock,
            autor: this.autor,
            isbn: this.isbn,
            categoria: this.categoria,
            encuadernacion: this.encuadernacion,
            estado: this.estado
        };
    }
}

/* Recibe datos guardados y devuelve de nuevo un Libro con sus métodos. */
export function crearProductoDesdeDatos(datos) {
    return new Libro(
        datos.id,
        datos.titulo,
        datos.precio,
        datos.portada || datos.imagen || "https://covers.openlibrary.org/b/isbn/" + datos.isbn + "-M.jpg",
        datos.descripcion,
        datos.stock,
        datos.autor,
        datos.isbn,
        datos.categoria,
        datos.encuadernacion,
        datos.estado
    );
}
