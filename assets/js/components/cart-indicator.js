/* Muestra cuántos ejemplares hay junto al icono del carrito. */
export function actualizarIndicadorCarrito(cantidad) {
    const enlace = document.querySelector(".icon-actions a[href$='cart.html']");
    if (enlace !== null) {

        enlace.classList.add("cart-icon-link");
        let numero = enlace.querySelector(".cart-count-badge");

        if (cantidad > 0) {
            if (numero === null) {
                numero = document.createElement("span");
                numero.className = "cart-count-badge";
                enlace.appendChild(numero);
            }
            numero.textContent = cantidad;
            numero.setAttribute("aria-label", cantidad + " ejemplares en el carrito");
        } else if (numero !== null) {
            numero.remove();
        }
    }
}
