// Esta clase conserva los libros, las cantidades y los precios de una compra.
export class OrdenCompra {
    constructor(cliente, carrito) {
        this.numero = "";  // lo asigna ServicioTienda al confirmar la compra
        this.cliente = cliente;
        this.fecha = new Date().toISOString();
        this.estado = "Confirmada";
        this.detalles = [];
        this.subtotal = 0;
        this.envio = 0;
        this.total = 0;

        // Cada detalle guarda el precio al comprar; el stock puede cambiar después.
        for (let i = 0; i < carrito.items.length; i = i + 1) {
            const item = carrito.items[i];
            const precio = item.producto.precio;
            const subtotal = precio * item.cantidad;
            this.detalles.push({
                productoId: item.producto.id,
                titulo: item.producto.titulo,
                estado: item.producto.estado,
                precioUnitario: precio,
                cantidad: item.cantidad,
                subtotal: subtotal
            });
            this.subtotal = this.subtotal + subtotal;
        }

        // El envío sale del carrito (hoy $0). No hay IVA.
        this.envio = carrito.calcularEnvio();
        this.total = this.subtotal + this.envio;
        this.metodoPago = "Tarjeta (pago simulado)";
        this.guia = "";
    }
}
