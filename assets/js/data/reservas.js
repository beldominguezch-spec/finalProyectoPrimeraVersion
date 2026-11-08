// Reservas temporales de 30 minutos y carrito separado por dueño (cuenta o invitado).
// Se carga como script normal y lo usan tanto catalog.js como los módulos del carrito.
// Hay tres cantidades distintas por libro (cada fila = edición + estado):
//   - físico: el campo "stock" del inventario. Solo baja cuando se confirma una compra.
//   - reservado: lo que hay en carritos con reserva vigente.
//   - disponible: físico menos lo reservado por OTROS clientes.
// AVISO: esto solo funciona dentro de un mismo navegador. No protege contra sobreventas
// entre navegadores distintos; eso se hará en Java y MySQL con transacciones.
window.MINUTOS_RESERVA = 30;

// Devuelve el identificador del dueño del carrito: el id de la cuenta o un código de invitado.
window.obtenerDuenoCarrito = function () {
    if (window.obtenerUsuarioActual) {
        const usuario = window.obtenerUsuarioActual();
        if (usuario !== null) {
            return usuario.id;
        }
    }
    let invitado = localStorage.getItem("paginas_invitado_id");
    if (invitado === null) {
        invitado = "INV-" + new Date().getTime();
        localStorage.setItem("paginas_invitado_id", invitado);
    }
    return invitado;
};

// Guarda la lista de reservas.
window.guardarReservas = function (reservas) {
    localStorage.setItem("paginas_reservas_v1", JSON.stringify(reservas));
};

// Devuelve las reservas vigentes. Las vencidas se eliminan aquí (así se liberan solas).
window.leerReservas = function () {
    const todas = window.leerDatosTienda("paginas_reservas_v1", []);
    const vigentes = [];
    const ahora = new Date().getTime();
    for (let i = 0; i < todas.length; i = i + 1) {
        if (todas[i].vence > ahora) {
            vigentes.push(todas[i]);
        }
    }
    if (vigentes.length !== todas.length) {
        window.guardarReservas(vigentes);
    }
    return vigentes;
};

// Cantidad que un dueño tiene reservada de un libro.
window.cantidadReservadaPor = function (libroId, dueno) {
    const reservas = window.leerReservas();
    let total = 0;
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (String(reservas[i].libroId) === String(libroId) && reservas[i].dueno === dueno) {
            total = total + reservas[i].cantidad;
        }
    }
    return total;
};

// Cantidad que reservan los demás dueños de un libro.
window.cantidadReservadaPorOtros = function (libroId, dueno) {
    const reservas = window.leerReservas();
    let total = 0;
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (String(reservas[i].libroId) === String(libroId) && reservas[i].dueno !== dueno) {
            total = total + reservas[i].cantidad;
        }
    }
    return total;
};

// Recibe el id del libro y su stock físico; devuelve lo disponible para el dueño actual.
window.calcularDisponible = function (libroId, stockFisico) {
    const disponible = Number(stockFisico) - window.cantidadReservadaPorOtros(libroId, window.obtenerDuenoCarrito());
    if (disponible < 0) {
        return 0;
    }
    return disponible;
};

// Busca el stock físico de un libro en el inventario guardado; devuelve 0 si no existe.
window.buscarStockFisico = function (libroId) {
    const libros = window.leerDatosTienda("paginas_libros_v4", []);
    for (let i = 0; i < libros.length; i = i + 1) {
        if (String(libros[i].id) === String(libroId)) {
            return Number(libros[i].stock);
        }
    }
    return 0;
};

// Reserva para el dueño actual la cantidad TOTAL indicada de un libro (no suma: reemplaza).
// Devuelve false, sin cambiar nada, si supera lo disponible.
window.reservarCantidad = function (libroId, cantidadTotal) {
    const dueno = window.obtenerDuenoCarrito();
    const disponible = window.calcularDisponible(libroId, window.buscarStockFisico(libroId));
    if (cantidadTotal < 1 || cantidadTotal > disponible) {
        return false;
    }
    const reservas = window.leerReservas();
    const vence = new Date().getTime() + window.MINUTOS_RESERVA * 60 * 1000;
    let encontrada = false;
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (String(reservas[i].libroId) === String(libroId) && reservas[i].dueno === dueno) {
            reservas[i].cantidad = cantidadTotal;
            reservas[i].vence = vence;
            encontrada = true;
        }
    }
    if (!encontrada) {
        reservas.push({ dueno: dueno, libroId: libroId, cantidad: cantidadTotal, vence: vence });
    }
    window.guardarReservas(reservas);
    return true;
};

// Libera la reserva de un libro del dueño actual (al eliminarlo del carrito).
window.liberarReserva = function (libroId) {
    const dueno = window.obtenerDuenoCarrito();
    const reservas = window.leerReservas();
    const restantes = [];
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (!(String(reservas[i].libroId) === String(libroId) && reservas[i].dueno === dueno)) {
            restantes.push(reservas[i]);
        }
    }
    window.guardarReservas(restantes);
};

// Libera todas las reservas del dueño actual (al vaciar el carrito o confirmar la compra).
window.liberarTodasMisReservas = function () {
    const dueno = window.obtenerDuenoCarrito();
    const reservas = window.leerReservas();
    const restantes = [];
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (reservas[i].dueno !== dueno) {
            restantes.push(reservas[i]);
        }
    }
    window.guardarReservas(restantes);
};

// Minutos que le quedan a la reserva de un libro del dueño actual (0 si no tiene).
window.minutosRestantesReserva = function (libroId) {
    const dueno = window.obtenerDuenoCarrito();
    const reservas = window.leerReservas();
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (String(reservas[i].libroId) === String(libroId) && reservas[i].dueno === dueno) {
            return Math.ceil((reservas[i].vence - new Date().getTime()) / 60000);
        }
    }
    return 0;
};

// Guarda el carrito de un dueño. Cada línea es { productoId, cantidad }.
window.guardarCarritoDe = function (dueno, lineas) {
    localStorage.setItem("paginas_carrito_v2_" + dueno, JSON.stringify(lineas));
};

// Devuelve el carrito del dueño actual. Quita las líneas cuya reserva venció
// y limita la cantidad a lo que sigue reservado.
window.leerCarritoDueno = function () {
    const dueno = window.obtenerDuenoCarrito();
    const guardado = window.leerDatosTienda("paginas_carrito_v2_" + dueno, []);
    const lineas = [];
    for (let i = 0; i < guardado.length; i = i + 1) {
        const reservada = window.cantidadReservadaPor(guardado[i].productoId, dueno);
        if (reservada > 0) {
            let cantidad = Number(guardado[i].cantidad);
            if (cantidad > reservada) {
                cantidad = reservada;
            }
            lineas.push({ productoId: guardado[i].productoId, cantidad: cantidad });
        }
    }
    if (lineas.length !== guardado.length) {
        window.guardarCarritoDe(dueno, lineas);
    }
    return lineas;
};

// Guarda el carrito del dueño actual.
window.guardarCarritoDueno = function (lineas) {
    window.guardarCarritoDe(window.obtenerDuenoCarrito(), lineas);
};

// Al iniciar sesión: pasa el carrito y las reservas del invitado a la cuenta.
// Recibe el id de la cuenta que acaba de entrar.
window.transferirCarritoInvitado = function (idCuenta) {
    const invitado = localStorage.getItem("paginas_invitado_id");
    if (invitado === null) {
        return;
    }
    const lineasInvitado = window.leerDatosTienda("paginas_carrito_v2_" + invitado, []);
    const lineasCuenta = window.leerDatosTienda("paginas_carrito_v2_" + idCuenta, []);
    const reservas = window.leerReservas();

    // Junta las líneas del invitado con las de la cuenta.
    for (let i = 0; i < lineasInvitado.length; i = i + 1) {
        let encontrada = false;
        for (let j = 0; j < lineasCuenta.length; j = j + 1) {
            if (String(lineasCuenta[j].productoId) === String(lineasInvitado[i].productoId)) {
                lineasCuenta[j].cantidad = Number(lineasCuenta[j].cantidad) + Number(lineasInvitado[i].cantidad);
                encontrada = true;
            }
        }
        if (!encontrada) {
            lineasCuenta.push(lineasInvitado[i]);
        }
    }

    // Pasa las reservas del invitado a la cuenta (suma si ya había del mismo libro).
    const nuevas = [];
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (reservas[i].dueno !== invitado) {
            nuevas.push(reservas[i]);
        }
    }
    for (let i = 0; i < reservas.length; i = i + 1) {
        if (reservas[i].dueno === invitado) {
            let existe = false;
            for (let j = 0; j < nuevas.length; j = j + 1) {
                if (nuevas[j].dueno === idCuenta && String(nuevas[j].libroId) === String(reservas[i].libroId)) {
                    nuevas[j].cantidad = nuevas[j].cantidad + reservas[i].cantidad;
                    nuevas[j].vence = reservas[i].vence;
                    existe = true;
                }
            }
            if (!existe) {
                nuevas.push({ dueno: idCuenta, libroId: reservas[i].libroId, cantidad: reservas[i].cantidad, vence: reservas[i].vence });
            }
        }
    }
    window.guardarReservas(nuevas);
    window.guardarCarritoDe(idCuenta, lineasCuenta);
    localStorage.removeItem("paginas_carrito_v2_" + invitado);
};
