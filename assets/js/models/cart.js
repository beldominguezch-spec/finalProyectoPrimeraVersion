/* Administra los libros y las cantidades del carrito. */
export class Carrito {
    constructor() {
        this.items = [];
    }

    /* Busca una línea mediante el identificador del producto. */
    buscarItem(productoId) {
        for (let i = 0; i < this.items.length; i = i + 1) {
            if (String(this.items[i].producto.id) === String(productoId)) {
                return this.items[i];
            }
        }
        return null;
    }

    /* Agrega un producto o incrementa la cantidad si ya existe. */
    agregarProducto(producto, cantidad) {
        let cantidadNueva = Number(cantidad);
        const item = this.buscarItem(producto.id);

        if (item !== null) {
            cantidadNueva = item.cantidad + cantidadNueva;
        }

        if (!producto.tieneStock(cantidadNueva)) {
            return false;
        }

        if (item !== null) {
            item.cantidad = cantidadNueva;
        } else {
            this.items.push({ producto: producto, cantidad: cantidadNueva });
        }

        return true;
    }

    /* Cambia la cantidad sin permitir cero, negativos o exceso de stock. */
    actualizarCantidad(productoId, cantidad) {
        const item = this.buscarItem(productoId);
        const cantidadNueva = Number(cantidad);

        if (item === null || cantidadNueva < 1 || !item.producto.tieneStock(cantidadNueva)) {
            return false;
        }

        item.cantidad = cantidadNueva;
        return true;
    }

    /* Elimina la línea correspondiente al identificador recibido. */
    eliminarProducto(productoId) {
        for (let i = 0; i < this.items.length; i = i + 1) {
            if (String(this.items[i].producto.id) === String(productoId)) {
                this.items.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /* Suma ejemplares, no solamente títulos distintos. */
    obtenerCantidadTotal() {
        let total = 0;
        for (let i = 0; i < this.items.length; i = i + 1) {
            total = total + this.items[i].cantidad;
        }
        return total;
    }

    /* Suma el subtotal de todas las líneas. */
    calcularSubtotal() {
        let total = 0;
        for (let i = 0; i < this.items.length; i = i + 1) {
            total = total + this.items[i].producto.precio * this.items[i].cantidad;
        }
        return total;
    }

    /* El envío está acordado en $0. No se cobra IVA. */
    calcularEnvio() {
        return 0;
    }

    /* Suma el valor de los productos y el envío. */
    calcularTotal() {
        return this.calcularSubtotal() + this.calcularEnvio();
    }

    /* Quita todas las líneas después de confirmar una orden. */
    vaciar() {
        this.items = [];
    }
}
