// Historial de pedidos del cliente. Solo lee los pedidos guardados; no crea, cambia ni borra ninguno.
import { ServicioAlmacenamiento } from "../services/storage-service.js";

if (window.protegerPagina("./login.html")) {
    const usuario = window.obtenerUsuarioActual();
    const almacenamiento = new ServicioAlmacenamiento();
    const zonaLista = document.getElementById("ordersList");
    const zonaDetalle = document.getElementById("orderDetail");
    let ventanaGuia = null;

    function dinero(valor) {
        return "$" + Number(valor).toLocaleString("es-CO");
    }

    function formatearFecha(texto) {
        const fecha = new Date(texto);
        if (isNaN(fecha.getTime())) {
            return "Fecha no disponible";
        }
        return fecha.toLocaleDateString("es-CO") + " " + fecha.toLocaleTimeString("es-CO");
    }

    function crear(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);
        if (clase !== "") {
            elemento.className = clase;
        }
        if (texto !== undefined) {
            elemento.textContent = texto;
        }
        return elemento;
    }

    // Devuelve solo los pedidos de este usuario, del más reciente al más antiguo.
    // Los pedidos se guardan uno tras otro, así que basta recorrerlos desde el final.
    function pedidosDelUsuario() {
        const todos = almacenamiento.leer(almacenamiento.claveOrdenes, []);
        const propios = [];
        for (let i = todos.length - 1; i >= 0; i = i - 1) {
            if (todos[i].usuarioId === usuario.id) {
                propios.push(todos[i]);
            }
        }
        return propios;
    }

    // Cada fila de items es un ejemplar; aquí se juntan los iguales (mismo título, estado y precio).
    function agruparLineas(items) {
        const lineas = [];
        for (let i = 0; i < items.length; i = i + 1) {
            let encontrada = null;
            for (let j = 0; j < lineas.length; j = j + 1) {
                if (lineas[j].titulo === items[i].titulo && lineas[j].estado === items[i].estado && lineas[j].precio === items[i].precio) {
                    encontrada = lineas[j];
                }
            }
            if (encontrada === null) {
                lineas.push({ titulo: items[i].titulo, estado: items[i].estado || "No indicado", precio: items[i].precio, cantidad: 1 });
            } else {
                encontrada.cantidad = encontrada.cantidad + 1;
            }
        }
        return lineas;
    }

    function mostrarLista() {
        const pedidos = pedidosDelUsuario();
        zonaDetalle.hidden = true;
        zonaLista.hidden = false;
        zonaLista.textContent = "";

        if (pedidos.length === 0) {
            zonaLista.appendChild(crear("div", "orders-empty", "Aún no tienes pedidos registrados."));
            return;
        }

        for (let i = 0; i < pedidos.length; i = i + 1) {
            const pedido = pedidos[i];
            const tarjeta = crear("div", "order-card");
            const datos = crear("div", "");
            const guia = pedido.guia ? pedido.guia : "Sin guía todavía";
            const boton = crear("button", "orders-btn", "Ver detalle");

            datos.appendChild(crear("strong", "", "Pedido " + pedido.id));
            datos.appendChild(crear("p", "", formatearFecha(pedido.fecha)));
            datos.appendChild(crear("p", "", "Libros: " + pedido.items.length + " · Total pagado: " + dinero(pedido.total)));
            datos.appendChild(crear("p", "", "Estado: " + (pedido.estado || "Confirmada") + " · Guía de demostración: " + guia));
            boton.type = "button";
            boton.addEventListener("click", function () {
                mostrarDetalle(pedido);
            });
            tarjeta.appendChild(datos);
            tarjeta.appendChild(boton);
            zonaLista.appendChild(tarjeta);
        }
    }

    function mostrarDetalle(pedido) {
        const lineas = agruparLineas(pedido.items);
        const envio = pedido.envio ? pedido.envio : 0;
        const tabla = crear("table", "");
        const encabezado = crear("tr", "");
        const textosEncabezado = ["Libro", "Condición", "Cantidad", "Precio unitario", "Subtotal"];
        let subtotal = 0;

        zonaLista.hidden = true;
        zonaDetalle.hidden = false;
        zonaDetalle.textContent = "";

        for (let i = 0; i < textosEncabezado.length; i = i + 1) {
            encabezado.appendChild(crear("th", "", textosEncabezado[i]));
        }
        tabla.appendChild(encabezado);
        for (let i = 0; i < lineas.length; i = i + 1) {
            const fila = crear("tr", "");
            const parcial = lineas[i].precio * lineas[i].cantidad;
            subtotal = subtotal + parcial;
            fila.appendChild(crear("td", "", lineas[i].titulo));
            fila.appendChild(crear("td", "", lineas[i].estado));
            fila.appendChild(crear("td", "", String(lineas[i].cantidad)));
            fila.appendChild(crear("td", "", dinero(lineas[i].precio)));
            fila.appendChild(crear("td", "", dinero(parcial)));
            tabla.appendChild(fila);
        }

        const envioDatos = crear("div", "order-info");
        envioDatos.appendChild(crear("strong", "", "Datos de envío de esta compra"));
        envioDatos.appendChild(crear("br", ""));
        envioDatos.appendChild(document.createTextNode("Cliente: " + (pedido.usuario || "No registrado")));
        envioDatos.appendChild(crear("br", ""));
        envioDatos.appendChild(document.createTextNode("Correo: " + (pedido.email || "No registrado")));
        envioDatos.appendChild(crear("br", ""));
        envioDatos.appendChild(document.createTextNode("Dirección: " + (pedido.direccion || "No registrada")));
        envioDatos.appendChild(crear("br", ""));
        envioDatos.appendChild(document.createTextNode("Ciudad: " + (pedido.ciudad || "No registrada") + " · Departamento: " + (pedido.departamento || "No registrado")));

        const pagoGuia = crear("div", "order-info");
        pagoGuia.appendChild(document.createTextNode("Método de pago: " + (pedido.metodoPago || "Tarjeta (pago simulado)")));
        pagoGuia.appendChild(crear("br", ""));
        pagoGuia.appendChild(document.createTextNode("Guía de demostración: " + (pedido.guia ? pedido.guia : "Sin guía todavía")));

        const totales = crear("div", "order-totals");
        totales.appendChild(crear("p", "", "Subtotal: " + dinero(subtotal)));
        totales.appendChild(crear("p", "", "Envío: " + dinero(envio)));
        totales.appendChild(crear("p", "", "Total: " + dinero(pedido.total)));

        const acciones = crear("div", "order-actions");
        const botonGuia = crear("button", "orders-btn", "Ver guía de envío");
        const botonVolver = crear("button", "orders-btn", "Volver al historial");
        botonGuia.type = "button";
        botonVolver.type = "button";
        botonGuia.addEventListener("click", function () {
            abrirGuia(pedido);
        });
        botonVolver.addEventListener("click", function () {
            mostrarLista();
        });
        acciones.appendChild(botonGuia);
        acciones.appendChild(botonVolver);

        zonaDetalle.appendChild(crear("h3", "", "Pedido " + pedido.id));
        zonaDetalle.appendChild(crear("p", "", "Fecha de compra: " + formatearFecha(pedido.fecha) + " · Estado: " + (pedido.estado || "Confirmada")));
        zonaDetalle.appendChild(tabla);
        zonaDetalle.appendChild(totales);
        zonaDetalle.appendChild(envioDatos);
        zonaDetalle.appendChild(pagoGuia);
        zonaDetalle.appendChild(acciones);
    }

    // Misma ventana de guía de demostración que usa el carrito.
    function abrirGuia(pedido) {
        cerrarGuia();
        // Si es un pedido antiguo sin guía, se le crea una y queda guardada para siempre.
        const guia = almacenamiento.asegurarGuia(pedido.id);

        const fondo = crear("div", "track-overlay");
        const ventana = crear("div", "track-modal");
        const cerrar = crear("button", "track-close", "×");
        const codigo = crear("p", "", guia);
        const enlace = crear("a", "orders-btn", "Ir a Interrapidísimo (sitio oficial)");
        const botonCerrar = crear("button", "orders-btn", "Cerrar");

        codigo.style.fontWeight = "bold";
        codigo.style.fontSize = "1.3rem";
        enlace.href = "https://www.interrapidisimo.com/sigue-tu-envio/";
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        enlace.style.display = "inline-block";
        enlace.style.marginRight = "0.5rem";
        fondo.setAttribute("role", "dialog");
        fondo.setAttribute("aria-modal", "true");
        fondo.setAttribute("aria-label", "Guía de envío de demostración");
        cerrar.type = "button";
        cerrar.setAttribute("aria-label", "Cerrar");
        botonCerrar.type = "button";
        cerrar.addEventListener("click", cerrarGuia);
        botonCerrar.addEventListener("click", cerrarGuia);
        fondo.addEventListener("click", function (evento) {
            if (evento.target === fondo) {
                cerrarGuia();
            }
        });

        ventana.appendChild(cerrar);
        ventana.appendChild(crear("div", "track-icon", "📦"));
        ventana.appendChild(crear("h2", "", "Guía de envío de demostración"));
        ventana.appendChild(crear("p", "", "Pedido: " + pedido.id));
        ventana.appendChild(codigo);
        ventana.appendChild(crear("p", "", "Esta guía es solo de demostración: no corresponde a un envío real y no tiene validez para el transporte. El enlace lleva a la página oficial de Interrapidísimo, pero ese sitio no permite rastrear este pedido."));
        ventana.appendChild(enlace);
        ventana.appendChild(botonCerrar);
        fondo.appendChild(ventana);
        document.body.appendChild(fondo);
        ventanaGuia = fondo;
    }

    function cerrarGuia() {
        if (ventanaGuia !== null) {
            ventanaGuia.remove();
            ventanaGuia = null;
        }
    }

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            cerrarGuia();
        }
    });

    mostrarLista();
}
