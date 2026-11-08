// Solo se muestra el perfil si el usuario inició sesión.
if (window.protegerPagina("./login.html")) {
    const usuario = window.obtenerUsuarioActual();
    const formulario = document.getElementById("profileForm");
    const nombres = document.getElementById("profileNames");
    const apellidos = document.getElementById("profileSurnames");
    const correo = document.getElementById("profileEmail");
    const direccion = document.getElementById("profileAddress");
    const mensaje = document.getElementById("profileMessage");

    // La sesión lee estos datos de la cuenta guardada en localStorage.
    nombres.value = usuario.nombres;
    apellidos.value = usuario.apellidos;
    correo.value = usuario.correo;
    direccion.value = usuario.direccion;

    // Las cuentas antiguas guardaban el nombre y el apellido juntos.
    if (nombres.value === "" && apellidos.value === "" && usuario.nombre) {
        const espacio = usuario.nombre.indexOf(" ");
        if (espacio > -1) {
            nombres.value = usuario.nombre.substring(0, espacio);
            apellidos.value = usuario.nombre.substring(espacio + 1);
        } else {
            nombres.value = usuario.nombre;
        }
    }

    // Guarda los cambios en la cuenta del usuario que inició sesión.
    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();
        nombres.value = nombres.value.trim();
        apellidos.value = apellidos.value.trim();
        correo.value = correo.value.trim().toLowerCase();
        direccion.value = direccion.value.trim();
        if (nombres.value === "" || apellidos.value === "" || correo.value === "") {
            mensaje.textContent = "Complete nombres, apellidos y correo.";
            return;
        }

        const usuarioActual = window.obtenerUsuarioActual();
        if (usuarioActual === null) {
            window.location.replace("./login.html");
            return;
        }

        const cuentas = leerCuentas();
        // Reutiliza la búsqueda sencilla del inicio de sesión.
        const cuentaActual = buscarUsuario(usuarioActual.correo, cuentas);
        const otraCuenta = buscarUsuario(correo.value, cuentas);
        if (otraCuenta !== null && otraCuenta.id !== cuentaActual.id) {
            mensaje.textContent = "Ese correo ya pertenece a otra cuenta.";
            return;
        }

        cuentaActual.nombres = nombres.value;
        cuentaActual.apellidos = apellidos.value;
        cuentaActual.nombre = nombres.value + " " + apellidos.value;
        cuentaActual.correo = correo.value;
        cuentaActual.direccion = direccion.value;

        // Guarda los cambios para recuperarlos después de recargar la página.
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
        // Actualiza la sesión por si el usuario cambió su correo.
        localStorage.setItem("paginas_sesion_actual", JSON.stringify({
            id: cuentaActual.id,
            nombre: cuentaActual.nombre,
            correo: cuentaActual.correo
        }));

        mensaje.textContent = "Cambios guardados correctamente.";
    });

    // Cambio de contraseña: la nueva solo se guarda si todas las comprobaciones pasan.
    const formularioClave = document.getElementById("passwordForm");
    const claveActual = document.getElementById("passwordActual");
    const claveNueva = document.getElementById("passwordNueva");
    const claveConfirmar = document.getElementById("passwordConfirmar");
    const mensajeClave = document.getElementById("passwordMessage");

    formularioClave.addEventListener("submit", function (evento) {
        evento.preventDefault();
        mensajeClave.textContent = "";

        if (claveActual.value === "" || claveNueva.value === "" || claveConfirmar.value === "") {
            mensajeClave.textContent = "Complete los tres campos de contraseña.";
            return;
        }

        const usuarioActual = window.obtenerUsuarioActual();
        if (usuarioActual === null) {
            window.location.replace("./login.html");
            return;
        }
        const cuentas = leerCuentas();
        const cuentaActual = buscarUsuario(usuarioActual.correo, cuentas);
        if (cuentaActual === null) {
            mensajeClave.textContent = "No se encontró la cuenta.";
            return;
        }

        if (claveActual.value !== cuentaActual.clave) {
            mensajeClave.textContent = "La contraseña actual no es correcta. No se cambió nada.";
            return;
        }
        // Mismo mínimo que pide el registro.
        if (claveNueva.value.length < 6) {
            mensajeClave.textContent = "La nueva contraseña debe tener al menos 6 caracteres.";
            return;
        }
        if (claveNueva.value !== claveConfirmar.value) {
            mensajeClave.textContent = "La nueva contraseña y su confirmación no coinciden. No se cambió nada.";
            return;
        }

        cuentaActual.clave = claveNueva.value;
        localStorage.setItem("paginas_cuentas_v1", JSON.stringify(cuentas));
        claveActual.value = "";
        claveNueva.value = "";
        claveConfirmar.value = "";
        mensajeClave.textContent = "Contraseña actualizada correctamente.";
    });
}
