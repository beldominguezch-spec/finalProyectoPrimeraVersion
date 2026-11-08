document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // DATOS DE LA COMPRA
    // No hay artículos hardcodeados: se rellenan con el carrito real
    // del usuario en el momento en que se valida el pago.
    // ============================================================
    const TIENDA = 'Páginas del Tiempo';

    let PRODUCTOS = [];        // [{ descripcion, cantidad, precio }]

    // ============================================================
    // 1. Crear el HTML de las dos ventanas
    // ============================================================
    document.body.insertAdjacentHTML('beforeend', `
        <!-- Ventana 1: formulario de pago -->
        <div class="overlay" id="overlay">
            <div class="modal">
                <button type="button" class="boton-reculiado" aria-label="Cerrar">&times;</button>

                <h2>Finalizar compra</h2>
                <p>------------------------------------</p>
            

                <form id="form-pago" novalidate>
                    <div class="mensaje-error" id="mensaje-error"></div>

                    <h3>Datos de pago</h3>

                    <div class="campo" id="campo-titular">
                        <label for="titular">Nombre del titular</label>
                        <input type="text" id="titular" placeholder="Como aparece en la tarjeta" autocomplete="off">
                    </div>

                    <div class="campo" id="campo-numero">
                        <label for="numero">Número de tarjeta</label>
                        <input type="text" id="numero" placeholder="0000 0000 0000 0000"
                               inputmode="numeric" maxlength="19" autocomplete="off">
                    </div>

                    <div class="fila">
                        <div class="campo" id="campo-vencimiento">
                            <label for="vencimiento">Vencimiento</label>
                            <input type="text" id="vencimiento" placeholder="MM/AA"
                                   inputmode="numeric" maxlength="5" autocomplete="off">
                        </div>
                        <div class="campo" id="campo-cvv">
                            <label for="cvv">CVV</label>
                            <input type="password" id="cvv" placeholder="•••"
                                   inputmode="numeric" maxlength="4" autocomplete="off">
                        </div>
                    </div>

                    <div class="campo" id="campo-tipo">
                        <span class="etiqueta">Tipo de tarjeta</span>
                        <div class="tipos">
                            <label><input type="radio" name="tipo" value="Débito" class="radio-tipo"> Débito</label>
                            <label><input type="radio" name="tipo" value="Crédito" class="radio-tipo"> Crédito</label>
                        </div>
                    </div>

                    <h3>Dirección de envío</h3>

                    <div class="campo" id="campo-direccion">
                        <label for="direccion">Dirección</label>
                        <input type="text" id="direccion" placeholder="Calle, número, apartamento" autocomplete="off">
                    </div>

                    <div class="fila">
                        <div class="campo" id="campo-ciudad">
                            <label for="ciudad">Ciudad</label>
                            <input type="text" id="ciudad" autocomplete="off">
                        </div>
                        <div class="campo" id="campo-departamento">
                            <label for="departamento">Departamento</label>
                            <input type="text" id="departamento" autocomplete="off">
                        </div>
                    </div>

                    <div class="campo" id="campo-postal">
                        <label for="postal">Código postal (opcional)</label>
                        <input type="text" id="postal" inputmode="numeric" maxlength="8" autocomplete="off">
                    </div>

                    <div class="acciones">
                        <button type="button" class="boton-cancelar">Cancelar</button>
                        <button type="submit" class="boton-confirmar">Confirmar compra</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Ventana 2: factura -->
        <div class="overlay" id="overlay-factura">
            <div class="modal">
                <button type="button" class="boton-reculiado" aria-label="Cerrar">&times;</button>
                <h2>¡Compra procesada correctamente!</h2>
                <p>(Prueba: no se realizó ningún pago real.)</p>
                <div class="factura" id="factura-contenido"></div>
                <div class="acciones">
                    <button type="button" class="boton-revisar-pedido">Ver guía de envío</button>
                    <button type="button" class="boton-cerrar-factura">Cerrar</button>
                </div>
            </div>
        </div>
    `);

    // ============================================================
    // 2. Buscar los elementos
    // ============================================================
    const botonAbrir     = document.getElementById('boton-ventas');
    const overlay        = document.getElementById('overlay');
    const overlayFactura = document.getElementById('overlay-factura');
    const form           = document.getElementById('form-pago');
    const mensaje        = document.getElementById('mensaje-error');
    const facturaCont    = document.getElementById('factura-contenido');

    const titular      = document.getElementById('titular');
    const numero       = document.getElementById('numero');
    const vencimiento  = document.getElementById('vencimiento');
    const cvv          = document.getElementById('cvv');
    const direccion    = document.getElementById('direccion');
    const ciudad       = document.getElementById('ciudad');
    const departamento = document.getElementById('departamento');
    const postal       = document.getElementById('postal');

    // ============================================================
    // 3. Abrir y cerrar
    // ============================================================
    function abrirPago() {
        // No se abre el formulario de pago si detrás no hay un carrito real
        if (typeof window.carritoListoParaComprar === 'function') {
            const estado = window.carritoListoParaComprar();
            if (!estado.ok) {
                if (typeof mostrarToast === 'function') mostrarToast(estado.mensaje);
                else if (typeof mostrarToastAuth === 'function') mostrarToastAuth(estado.mensaje);
                return;
            }
        }

        overlay.classList.add('activo');
        titular.focus();
    }

    function cerrarPago() {
        overlay.classList.remove('activo');
        form.reset();          // al cerrar no se guarda ni se envía nada
        limpiarErrores();
    }

    function abrirFactura() {
        overlayFactura.classList.add('activo');
    }

    function cerrarFactura() {
        overlayFactura.classList.remove('activo');
        facturaCont.innerHTML = '';
    }

    botonAbrir.addEventListener('click', abrirPago);

    overlay.querySelector('.boton-reculiado').addEventListener('click', cerrarPago);
    overlay.querySelector('.boton-cancelar').addEventListener('click', cerrarPago);

    overlayFactura.querySelector('.boton-reculiado').addEventListener('click', cerrarFactura);
    overlayFactura.querySelector('.boton-cerrar-factura').addEventListener('click', cerrarFactura);

    // Solo existe esta ventana después de una compra real: desde aquí se muestra la guía de demostración.
    overlayFactura.querySelector('.boton-revisar-pedido').addEventListener('click', () => {
        cerrarFactura();
        if (typeof window.abrirSeguimientoPedido === 'function') window.abrirSeguimientoPedido();
    });

    // Clic en el fondo oscuro
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarPago();
    });
    overlayFactura.addEventListener('click', (e) => {
        if (e.target === overlayFactura) cerrarFactura();
    });

    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (overlayFactura.classList.contains('activo')) cerrarFactura();
        else if (overlay.classList.contains('activo')) cerrarPago();
    });

    // ============================================================
    // 4. Formato de los campos
    // ============================================================

    titular.addEventListener('input', () => {
        titular.value = titular.value.replace(/\d/g, '').slice(0, 32);
    });

    numero.addEventListener('input', () => {
        const digitos = numero.value.replace(/\D/g, '').slice(0, 16);
        numero.value = digitos.replace(/(.{4})/g, '$1 ').trim();
    });

    vencimiento.addEventListener('input', () => {
        const d = vencimiento.value.replace(/\D/g, '').slice(0, 4);
        vencimiento.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
    });

    cvv.addEventListener('input', () => {
        cvv.value = cvv.value.replace(/\D/g, '').slice(0, 4);
    });

    postal.addEventListener('input', () => {
        postal.value = postal.value.replace(/\D/g, '').slice(0, 8);
    });

    // ============================================================
    // 5. Validación
    // ============================================================
    function limpiarErrores() {
        mensaje.classList.remove('visible');
        mensaje.textContent = '';
        document.querySelectorAll('.campo.error').forEach(c => c.classList.remove('error'));
        form.querySelectorAll('.campo').forEach(c => { c.style.outline = ''; });
    }

    function marcar(idCampo) {
        document.getElementById(idCampo).classList.add('error');
    }

    function vencimientoValido(valor) {
        if (!/^\d{2}\/\d{2}$/.test(valor)) return false;
        const mes  = parseInt(valor.slice(0, 2), 10);
        const anio = 2000 + parseInt(valor.slice(3), 10);
        if (mes < 1 || mes > 12) return false;
        const hoy = new Date();
        const actual = hoy.getFullYear() * 12 + hoy.getMonth();
        return anio * 12 + (mes - 1) >= actual;
    }

form.addEventListener('submit', (e) => {
    e.preventDefault(); // nunca se envía nada a ningún servidor
    limpiarErrores();

    const faltantes = [];
    const invalidos = [];
    const tipo = form.querySelector('input[name="tipo"]:checked');
    const soloNumero = numero.value.replace(/\s/g, '');

    if (!titular.value.trim()) {
        faltantes.push('Nombre del titular');
        marcar('campo-titular');
    }

    if (!soloNumero) {
        faltantes.push('Número de tarjeta');
        marcar('campo-numero');
    } else if (soloNumero.length !== 16) {
        invalidos.push('El número de tarjeta debe tener 16 dígitos');
        marcar('campo-numero');
    }

    // La fecha solo se revisa que no esté vacía (puede ser cualquier valor)
    if (!vencimiento.value) {
        faltantes.push('Fecha de vencimiento');
        marcar('campo-vencimiento');
    }

    if (!cvv.value) {
        faltantes.push('Código de seguridad (CVV)');
        marcar('campo-cvv');
    } else if (cvv.value.length < 3) {
        invalidos.push('El CVV debe tener 3 o 4 dígitos');
        marcar('campo-cvv');
    }

    if (!tipo) {
        faltantes.push('Tipo de tarjeta (débito o crédito)');
        marcar('campo-tipo');
    }

    if (!direccion.value.trim()) {
        faltantes.push('Dirección de envío');
        marcar('campo-direccion');
    }

    if (!ciudad.value.trim()) {
        faltantes.push('Ciudad');
        marcar('campo-ciudad');
    }

    if (!departamento.value.trim()) {
        faltantes.push('Departamento');
        marcar('campo-departamento');
    }
    // Si hay problemas, mostrar cuáles y marcar los campos
    if (faltantes.length || invalidos.length) {
        form.querySelectorAll('.campo').forEach(campo => {
            campo.style.outline = '2px solid red';
        });
        let texto = '';
        if (faltantes.length) texto += 'Falta completar: ' + faltantes.join(', ') + '.';
        if (invalidos.length) texto += (texto ? '\n' : '') + invalidos.join('. ') + '.';
        mensaje.textContent = texto;
        mensaje.style.whiteSpace = 'pre-line';
        mensaje.classList.add('visible');
        mensaje.scrollIntoView({ block: 'nearest' });
        return;
    }

    // Todo correcto: crear el pedido real en localStorage.
    // Esto descuenta el stock, registra el pedido y vacía el carrito.
    // Nos quedamos con los artículos para poder pintar la factura.
    if (typeof window.crearPedidoDesdeCarrito === 'function') {
        const comprados = window.crearPedidoDesdeCarrito() || [];
        const agrupados = [];
        comprados.forEach(item => {
            // La descripción incluye el estado: el mismo título en otro estado es otra línea.
            const descripcion = item.estado ? item.titulo + " (" + item.estado + ")" : item.titulo;
            const yaExiste = agrupados.find(x => x.descripcion === descripcion);
            if (yaExiste) {
                yaExiste.cantidad += 1;
            } else {
                agrupados.push({
                    descripcion: descripcion,
                    cantidad: 1,
                    precio: Number(item.precio) || 0
                });
            }
        });
        PRODUCTOS = agrupados;
    }

    // armar la factura, cerrar el formulario y abrir la factura
    generarFactura({
        direccion: direccion.value.trim(),
        ciudad: ciudad.value.trim(),
        departamento: departamento.value.trim(),
        postal: postal.value.trim()
    });

    cerrarPago();
    abrirFactura();
});
    // ============================================================
    // 6. Factura
    // ============================================================
    function esc(texto) {
        // Evita que lo escrito en el formulario se interprete como HTML
        return String(texto).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    function dinero(n) {
        return '$' + Math.round(n).toLocaleString('es-CO');
    }

    function generarFactura(d) {
        // Los valores salen de la orden ya registrada: subtotal, envío (hoy $0) y total. No hay IVA.
        const orden = window.ultimaOrdenCreada;
        const ahora = new Date();
        const numeroFactura = 'F-' + ahora.getTime().toString().slice(-8);
        const fecha = ahora.toLocaleDateString('es-CO', {
            day: '2-digit', month: 'long', year: 'numeric'
        });

        const subtotal = orden.subtotal;
        const envio = orden.envio;
        const total = orden.total;

        const filas = PRODUCTOS.map(p => `
            <tr>
                <td>${esc(p.descripcion)}</td>
                <td>${p.cantidad}</td>
                <td>${dinero(p.precio)}</td>
                <td>${dinero(p.cantidad * p.precio)}</td>
            </tr>
        `).join('');

        // El cliente es la cuenta con sesión, no el titular de la tarjeta.
        facturaCont.innerHTML = `
            <h3>${esc(TIENDA)} - Factura ${numeroFactura}</h3>
            <p><strong>Pedido:</strong> ${esc(orden.numero)}</p>
            <p>Fecha: ${fecha}</p>
            <p><strong>Cliente:</strong> ${esc(orden.cliente.nombre)} (${esc(orden.cliente.correo)})</p>
            <p><strong>Envío a:</strong> ${esc(d.direccion)}, ${esc(d.ciudad)}, ${esc(d.departamento)}${d.postal ? ' (CP ' + esc(d.postal) + ')' : ''}</p>
            <p><strong>Pago:</strong> ${esc(orden.metodoPago)}</p>
            <p><strong>Guía de envío (demostración, no es real):</strong> ${esc(orden.guia)}</p>

            <table>
                <thead>
                    <tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr>
                </thead>
                <tbody>${filas}</tbody>
            </table>

            <p>Subtotal: ${dinero(subtotal)}</p>
            <p>Envío: ${dinero(envio)}</p>
            <p><strong>Total: ${dinero(total)}</strong></p>
        `;
    }
});
