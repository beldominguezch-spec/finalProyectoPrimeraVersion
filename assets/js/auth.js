// Registro y sesión para las páginas que ya tienen formularios.
// Los botones del HTML llaman ejecutarRegistro y ejecutarLogin.

// Devuelve las cuentas guardadas o un array vacío si aún no hay usuarios.
function leerCuentas() {
    const texto = localStorage.getItem("paginas_cuentas_v1");
    if (texto === null) {
        return [];
    }
    return JSON.parse(texto);
}

// Busca un correo en las cuentas guardadas y devuelve el usuario o null.
function buscarUsuario(correo, cuentas) {
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].correo === correo) {
            return cuentas[i];
        }
    }
    return null;
}

// Agrega dos cuentas temporales para probar la entrada de Admin y Proveedor.
// Se guardan una sola vez para conservar sus intentos fallidos y bloqueos.
function crearCuentasPrueba() {
    const cuentas = leerCuentas();
    const pruebas = [
        {
            id: "ADMIN-DEMO",
            nombres: "Admin",
            apellidos: "Prueba",
            nombre: "Admin Prueba",
            correo: "admin.prueba@paginasdeltiempo.test",
            clave: "Admin1234",
            rol: "Admin",
            intentosFallidos: 0,
            isBlocked: false,
            bloqueadoHasta: 0
        },
        {
            id: "PROV-DEMO",
            nombres: "Proveedor",
            apellidos: "Prueba",
            nombre: "Proveedor Prueba",
            correo: "proveedor.prueba@paginasdeltiempo.test",
            clave: "Proveedor1234",
            rol: "Proveedor",
            intentosFallidos: 0,
            isBlocked: false,
            bloqueadoHasta: 0
        }
    ];
    let seAgrego = false;

    for (let i = 0; i < pruebas.length; i = i + 1) {
        if (buscarUsuario(pruebas[i].correo, cuentas) === null) {
            cuentas.push(pruebas[i]);
            seAgrego = true;
        }
    }

    if (seAgrego) {
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    }
}

crearCuentasPrueba();

// Devuelve el rol de una cuenta sin cambiar el valor que ya tiene guardado.
function identificarRol(cuenta) {
    const rol = (cuenta.rol || "User").toLowerCase();
    if (rol === "admin" || rol === "administrador") {
        return "Admin";
    }
    if (rol === "proveedor") {
        return "Proveedor";
    }
    if (rol === "user" || rol === "lector" || rol === "cliente") {
        return "User";
    }
    return null;
}

// Recibe la fecha de desbloqueo y devuelve el tiempo que falta en horas y minutos.
function tiempoRestante(bloqueadoHasta) {
    const minutosTotales = Math.ceil((bloqueadoHasta - new Date().getTime()) / 60000);
    const horas = Math.floor(minutosTotales / 60);
    const minutos = minutosTotales - horas * 60;
    let textoHoras = " horas";
    let textoMinutos = " minutos";
    if (horas === 1) {
        textoHoras = " hora";
    }
    if (minutos === 1) {
        textoMinutos = " minuto";
    }
    return horas + textoHoras + " y " + minutos + textoMinutos;
}

// Devuelve el usuario de la sesión si todavía existe su cuenta; si no, null.
window.obtenerUsuarioActual = function () {
    const texto = localStorage.getItem("paginas_sesion_actual");
    if (texto === null) {
        return null;
    }
    const sesion = JSON.parse(texto);
    if (sesion === null || !sesion.id || !sesion.correo) {
        return null;
    }
    const cuentas = leerCuentas();
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].id === sesion.id && cuentas[i].correo === sesion.correo) {
            return {
                id: cuentas[i].id,
                nombres: cuentas[i].nombres || "",
                apellidos: cuentas[i].apellidos || "",
                nombre: cuentas[i].nombre,
                correo: cuentas[i].correo,
                rol: identificarRol(cuentas[i]),
                direccion: cuentas[i].direccion || "",
                foto: cuentas[i].foto || ""
            };
        }
    }
    return null;
};

// Cierra la sesión actual. Conserva las cuentas y los libros del carrito.
window.cerrarSesion = function () {
    localStorage.removeItem("paginas_sesion_actual");
};

// Recibe la ruta al login y el rol permitido; protege cada página según su rol.
window.protegerPagina = function (rutaLogin, rolPermitido) {
    const usuario = window.obtenerUsuarioActual();
    const rol = rolPermitido || "User";
    if (usuario === null || usuario.rol !== rol) {
        window.location.replace(rutaLogin);
        return false;
    }
    return true;
};

// Recibe el evento del formulario. Guarda una cuenta y devuelve false para no recargar.
window.ejecutarRegistro = function (evento) {
    evento.preventDefault();
    const formulario = document.getElementById("registerForm");
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }

    const clave = document.getElementById("password").value;
    if (clave !== document.getElementById("confirm-password").value) {
        alert("Las contraseñas no coinciden.");
        return false;
    }

    const correo = document.getElementById("email").value.trim().toLowerCase();
    const cuentas = leerCuentas();
    for (let i = 0; i < cuentas.length; i = i + 1) {
        if (cuentas[i].correo === correo) {
            alert("Ya existe una cuenta con ese correo.");
            return false;
        }
    }

    // Solo se permite crear Cliente o Proveedor; el Admin nunca se registra desde aquí.
    let rolElegido = "User";
    if (document.getElementById("account-type").value === "Proveedor") {
        rolElegido = "Proveedor";
    }
    const nombres = document.getElementById("names").value.trim();
    const apellidos = document.getElementById("surnames").value.trim();
    cuentas.push({
        id: "USR-" + new Date().getTime(),
        nombres: nombres,
        apellidos: apellidos,
        nombre: nombres + " " + apellidos,
        correo: correo,
        clave: clave,
        rol: rolElegido,
        intentosFallidos: 0,
        isBlocked: false,
        bloqueadoHasta: 0,
        foto: ""
    });
    localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    alert("Cuenta creada. Ahora inicia sesión.");
    window.location.href = "./login.html";
    return false;
};

// Recibe el evento del formulario. Busca al usuario y comprueba su contraseña.
window.ejecutarLogin = function (evento) {
    evento.preventDefault();
    const formulario = document.getElementById("loginForm");
    if (!formulario.checkValidity()) {
        formulario.reportValidity();
        return false;
    }

    const correo = document.getElementById("email").value.trim().toLowerCase();
    const clave = document.getElementById("password").value;
    const cuentas = leerCuentas();
    const usuarioEncontrado = buscarUsuario(correo, cuentas);

    if (usuarioEncontrado === null) {
        alert("El usuario no existe. Verifique sus datos o regístrese.");
        return false;
    }

    const rol = identificarRol(usuarioEncontrado);
    // Admin no usa bloqueo. También se limpia un bloqueo anterior de prueba.
    if (rol === "Admin") {
        usuarioEncontrado.intentosFallidos = 0;
        usuarioEncontrado.isBlocked = false;
        usuarioEncontrado.bloqueadoHasta = 0;
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    }

    // User y Proveedor sí conservan el bloqueo de 24 horas.
    const ahora = new Date().getTime();
    if (usuarioEncontrado.isBlocked === true) {
        if (usuarioEncontrado.bloqueadoHasta > ahora) {
            alert("La cuenta está bloqueada. Tiempo restante: " + tiempoRestante(usuarioEncontrado.bloqueadoHasta) + ".");
            return false;
        }

        // Pasadas 24 horas, se desbloquea y los intentos vuelven a cero.
        usuarioEncontrado.isBlocked = false;
        usuarioEncontrado.intentosFallidos = 0;
        usuarioEncontrado.bloqueadoHasta = 0;
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    }

    // La contraseña correcta borra los intentos anteriores.
    if (clave === usuarioEncontrado.clave) {
        usuarioEncontrado.intentosFallidos = 0;
        usuarioEncontrado.isBlocked = false;
        usuarioEncontrado.bloqueadoHasta = 0;
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));

        // Evita conservar la sesión de otra cuenta al cambiar de usuario.
        window.cerrarSesion();
        if (rol === null) {
            alert("El rol de esta cuenta no se reconoce.");
            return false;
        }

        // La cuenta y su rol se recuperan desde esta sesión al abrir otra página.
        localStorage.setItem("paginas_sesion_actual", JSON.stringify({
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            correo: usuarioEncontrado.correo
        }));
        // El carrito y las reservas que se hicieron como invitado pasan a esta cuenta.
        if (window.transferirCarritoInvitado) {
            window.transferirCarritoInvitado(usuarioEncontrado.id);
        }
        alert("Inicio de sesión exitoso.");
        // Cada rol abre su página. User conserva el regreso al carrito.
        if (rol === "Admin") {
            window.location.href = "../admin/index.html";
        } else if (rol === "Proveedor") {
            window.location.href = "./proveedor.html";
        } else if (window.location.search === "?volver=carrito") {
            window.location.href = "./cart.html";
        } else {
            window.location.href = "../index.html";
        }
        return false;
    }

    // Admin puede volver a intentar sin que su cuenta se bloquee.
    if (rol === "Admin") {
        alert("Contraseña incorrecta.");
        return false;
    }

    // En User y Proveedor, cada contraseña incorrecta suma un intento.
    let intentos = usuarioEncontrado.intentosFallidos || 0;
    intentos++;
    usuarioEncontrado.intentosFallidos = intentos;

    if (intentos >= 3) {
        // Al tercer fallo, el bloqueo dura 24 horas desde este momento.
        usuarioEncontrado.isBlocked = true;
        usuarioEncontrado.bloqueadoHasta = ahora + 24 * 60 * 60 * 1000;
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
        alert("Cuenta bloqueada por superar el número máximo de intentos. Tiempo restante: " + tiempoRestante(usuarioEncontrado.bloqueadoHasta) + ".");
        return false;
    }

    localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
    if (intentos === 1) {
        alert("Contraseña incorrecta. Le quedan 2 intentos.");
    } else {
        alert("Contraseña incorrecta. Le queda 1 intento.");
    }
    return false;
};

// Devuelve las iniciales del primer nombre y del primer apellido.
function obtenerIniciales(usuario) {
    let nombres = usuario.nombres || "";
    let apellidos = usuario.apellidos || "";
    if (nombres === "" || apellidos === "") {
        const partes = usuario.nombre.trim().split(" ");
        nombres = partes[0];
        apellidos = partes[partes.length - 1];
    }
    return nombres.charAt(0).toUpperCase() + apellidos.charAt(0).toUpperCase();
}

// Coloca la burbuja y el menú en el espacio de sesión del encabezado.
document.addEventListener("DOMContentLoaded", function () {
    const usuario = window.obtenerUsuarioActual();
    if (usuario === null) {
        return;
    }
    const zonas = document.getElementsByClassName("auth-actions");
    const enPaginas = window.location.pathname.indexOf("/pages/") !== -1;
    let rutaPerfil = enPaginas ? "./profile.html" : "./pages/profile.html";
    // Admin y Proveedor no tienen perfil de cliente: su menú los lleva a su panel.
    if (usuario.rol === "Admin") {
        rutaPerfil = enPaginas ? "../admin/index.html" : "./admin/index.html";
    } else if (usuario.rol === "Proveedor") {
        rutaPerfil = enPaginas ? "./proveedor.html" : "./pages/proveedor.html";
    }
    const rutaLogin = enPaginas ? "./login.html" : "./pages/login.html";

    for (let i = 0; i < zonas.length; i = i + 1) {
        const contenedor = document.createElement("div");
        const burbuja = document.createElement("button");
        const menu = document.createElement("div");
        const perfil = document.createElement("a");
        const salir = document.createElement("a");

        contenedor.className = "profile-menu";
        burbuja.className = "profile-bubble";
        burbuja.type = "button";
        burbuja.setAttribute("aria-label", "Abrir menú de perfil");
        burbuja.setAttribute("aria-expanded", "false");
        if (usuario.foto) {
            const imagen = document.createElement("img");
            imagen.src = usuario.foto;
            imagen.alt = "Foto de perfil";
            burbuja.appendChild(imagen);
        } else {
            burbuja.textContent = obtenerIniciales(usuario);
        }

        menu.className = "profile-dropdown";
        menu.hidden = true;
        perfil.href = rutaPerfil;
        perfil.textContent = usuario.rol === "User" ? "Ver Perfil" : "Mi panel";
        salir.href = rutaLogin;
        salir.textContent = "Cerrar Sesión";
        burbuja.addEventListener("click", function () {
            menu.hidden = !menu.hidden;
            burbuja.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
        });
        salir.addEventListener("click", function (evento) {
            evento.preventDefault();
            window.cerrarSesion();
            window.location.href = rutaLogin;
        });

        menu.appendChild(perfil);
        menu.appendChild(salir);
        contenedor.appendChild(burbuja);
        contenedor.appendChild(menu);
        zonas[i].textContent = "";
        zonas[i].appendChild(contenedor);
    }
});
