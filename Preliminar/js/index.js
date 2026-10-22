document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. ESTADO GLOBAL Y ALMACENAMIENTO
    // ==========================================
    const listaSolicitudes = [];
    let contadorTickets = 1;

    // Mapeos de texto legible
    const etiquetasProblemas = {
        inscripcion: "Error de inscripción",
        pagos: "Pasarela de pagos",
        certificado: "Certificado no disponible",
        boleta: "Boleta o factura"
    };

    const etiquetasMediosPago = {
        billetera: "Billetera digital",
        tarjeta: "Tarjeta de crédito/débito",
        transferencia: "Transferencia bancaria"
    };

    // ==========================================
    // 2. NAVEGACIÓN Y VISTAS (SPA)
    // ==========================================
    window.switchView = function(viewId) {
        document.querySelectorAll('.view-section').forEach(el => {
            el.style.display = 'none';
        });

        const targetView = document.getElementById('view-' + viewId);
        if (targetView) {
            targetView.style.display = 'block';
        }

        const tabNueva = document.getElementById('tabNuevaSolicitud');
        const tabMis = document.getElementById('tabMisSolicitudes');

        if (viewId === 'mis-solicitudes') {
            if (tabNueva) tabNueva.classList.remove('active');
            if (tabMis) tabMis.classList.add('active');
            renderizarMisSolicitudes();
        } else {
            if (tabNueva) tabNueva.classList.add('active');
            if (tabMis) tabMis.classList.remove('active');
        }
    };

    // ==========================================
    // 3. REFERENCIAS Y RESTRICCIONES DEL DOM
    // ==========================================
    const inputCodigoAlumno = document.getElementById("inputCodigoAlumno");
    const errorCodigoAlumno = document.getElementById("errorCodigoAlumno");
    const inputNombres = document.getElementById("inputNombres");
    const inputCorreo = document.getElementById("inputCorreo");
    const selectMedioPago = document.getElementById("selectMedioPago");
    const inputNumOperacion = document.getElementById("inputNumOperacion");
    const inputMonto = document.getElementById("inputMonto");
    const inputFechaPago = document.getElementById("inputFechaPago");
    const textareaDescripcion = document.getElementById("textareaDescripcion");
    const numContador = document.getElementById("numContador");

    const btnContinuarPaso1 = document.getElementById("btnContinuarPaso1");
    const btnContinuarPaso2 = document.getElementById("btnContinuarPaso2");
    const btnConfirmarP3 = document.getElementById("btnConfirmarP3");

    const radiosProblema = document.querySelectorAll("input[name='problema']");
    const cardProblemas = document.querySelectorAll(".option-card");

    // Deshabilitar fechas futuras en el selector de fecha
    if (inputFechaPago) {
        const hoy = new Date().toISOString().split("T")[0];
        inputFechaPago.setAttribute("max", hoy);
    }

    // ==========================================
    // 4. VALIDACIONES DE ENTRADA
    // ==========================================

    // Solo letras y números en código de alumno
    if (inputCodigoAlumno) {
    inputCodigoAlumno.addEventListener("keydown", (evento) => {
        // Teclas de control permitidas para navegación y borrado
        const teclasPermitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
        
        if (teclasPermitidas.includes(evento.key)) {
            if (errorCodigoAlumno) errorCodigoAlumno.style.display = 'none';
            return;
        }

        // /\D/ detecta cualquier carácter que NO sea un dígito numérico (0-9)
        if (/\D/.test(evento.key)) {
            evento.preventDefault(); // Bloquea la tecla no numérica
            if (errorCodigoAlumno) errorCodigoAlumno.style.display = 'block'; // Muestra error
        } else {
            if (errorCodigoAlumno) errorCodigoAlumno.style.display = 'none'; // Oculta error
        }
    });
}

    // Solo letras y espacios en nombres
    if (inputNombres) {
        inputNombres.addEventListener("keydown", (e) => {
            const permitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", " "];
            if (permitidas.includes(e.key)) return;
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(e.key)) e.preventDefault();
        });
    }

    // Solo números en N° de Operación
    if (inputNumOperacion) {
        inputNumOperacion.addEventListener("keydown", (e) => {
            const permitidas = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
            if (permitidas.includes(e.key)) return;
            if (!/^[0-9]$/.test(e.key)) e.preventDefault();
        });
    }

    // Formatear monto a 2 decimales al perder foco
    if (inputMonto) {
        inputMonto.addEventListener("blur", () => {
            let val = parseFloat(inputMonto.value);
            if (!isNaN(val) && val > 0) {
                inputMonto.value = val.toFixed(2);
            } else if (val <= 0) {
                alert("El monto pagado debe ser mayor a 0.");
                inputMonto.value = "";
            }
        });
    }

    // Validar número de caracteres restantes para la descripción
    if (textareaDescripcion && numContador) {
        const LIMITE_MAXIMO = 100; // Ajustar según el maxlength de tu HTML

        textareaDescripcion.addEventListener("input", () => {
        const longitudActual = textareaDescripcion.value.length;
        const restantes = LIMITE_MAXIMO - longitudActual;
        numContador.textContent = restantes;
        });
    }

    // Selección visual de tarjetas
    radiosProblema.forEach((radio) => {
        radio.addEventListener("change", () => {
            cardProblemas.forEach(card => card.classList.remove("selected"));
            const tarjetaPadre = radio.closest(".option-card");
            if (tarjetaPadre) tarjetaPadre.classList.add("selected");
        });
    });

    // ==========================================
    // 5. FLUJO ENTRE PASOS
    // ==========================================

    if (btnContinuarPaso1) {
        btnContinuarPaso1.addEventListener("click", () => switchView('paso2'));
    }

    if (btnContinuarPaso2) {
        btnContinuarPaso2.addEventListener("click", () => {
            if (!inputCodigoAlumno.value.trim()) { alert("Ingresa tu Código de alumno."); inputCodigoAlumno.focus(); return; }
            if (!inputNombres.value.trim()) { alert("Ingresa tus Nombres y Apellidos."); inputNombres.focus(); return; }
            if (!inputCorreo.value.trim() || !inputCorreo.value.includes("@")) { alert("Ingresa un Correo válido."); inputCorreo.focus(); return; }
            if (!selectMedioPago.value) { alert("Selecciona un Medio de pago."); selectMedioPago.focus(); return; }
            if (!inputNumOperacion.value.trim()) { alert("Ingresa el Número de operación."); inputNumOperacion.focus(); return; }
            if (!inputMonto.value || parseFloat(inputMonto.value) <= 0) { alert("Ingresa un Monto válido."); inputMonto.focus(); return; }
            if (!inputFechaPago.value) { alert("Selecciona la Fecha de pago."); inputFechaPago.focus(); return; }

            const probVal = document.querySelector("input[name='problema']:checked")?.value || "pagos";
            
            document.getElementById("summaryProblema").textContent = etiquetasProblemas[probVal] || "Pasarela de pagos";
            document.getElementById("summaryCodigo").textContent = inputCodigoAlumno.value.trim().toUpperCase();
            document.getElementById("summaryAlumno").textContent = inputNombres.value.trim();
            document.getElementById("summaryCorreo").textContent = inputCorreo.value.trim();
            document.getElementById("summaryMedioPago").textContent = etiquetasMediosPago[selectMedioPago.value] || selectMedioPago.value;
            document.getElementById("summaryNumOperacion").textContent = inputNumOperacion.value.trim();
            document.getElementById("summaryMonto").textContent = `S/ ${parseFloat(inputMonto.value).toFixed(2)}`;
            document.getElementById("summaryFecha").textContent = inputFechaPago.value;
            document.getElementById("summaryDescripcion").textContent = textareaDescripcion.value.trim() || "Sin descripción adicional";

            switchView('paso3');
        });
    }

    if (btnConfirmarP3) {
        btnConfirmarP3.addEventListener("click", () => {
            const numTicket = `TK-2026-${String(contadorTickets).padStart(4, '0')}`;
            contadorTickets++;

            const probVal = document.querySelector("input[name='problema']:checked")?.value || "pagos";
            const tipoTexto = etiquetasProblemas[probVal] || "Pasarela de pagos";

            document.getElementById("ticketNumberDisplay").textContent = numTicket;
            document.getElementById("ticketProblemType").textContent = tipoTexto;

            // Guardar solicitud
            listaSolicitudes.push({
                ticket: numTicket,
                problema: tipoTexto,
                codigo: inputCodigoAlumno.value.trim().toUpperCase(),
                alumno: inputNombres.value.trim(),
                monto: parseFloat(inputMonto.value).toFixed(2),
                fecha: inputFechaPago.value,
                estado: "En proceso"
            });

            // Actualizar contador del tab
            const counterNav = document.getElementById("counterMisSolicitudes");
            if (counterNav) counterNav.textContent = listaSolicitudes.length;

            switchView('paso4');
        });
    }

    // ==========================================
    // 6. RENDERIZADO Y SUMATORIA DE SOLICITUDES
    // ==========================================
    function renderizarMisSolicitudes() {
        const emptyState = document.getElementById("emptyStateContainer");
        const totalText = document.getElementById("totalSolicitudesText");
        const counterNav = document.getElementById("counterMisSolicitudes");

        const cantidad = listaSolicitudes.length;

        // Sumatoria acumulada utilizando reduce()
        const sumaTotal = listaSolicitudes.reduce((acc, item) => acc + parseFloat(item.monto || 0), 0);

        if (counterNav) counterNav.textContent = cantidad;

        if (totalText) {
            totalText.textContent = `${cantidad} solicitud(es) registrada(s) | Total acumulado: S/ ${sumaTotal.toFixed(2)}`;
        }

        if (cantidad === 0) {
            if (emptyState) emptyState.style.display = "block";
        } else {
            if (emptyState) emptyState.style.display = "none";

            document.querySelectorAll(".ticket-card-item").forEach(t => t.remove());

            const contenedorPadre = document.getElementById("contentMisSolicitudes");

            listaSolicitudes.forEach(item => {
                const card = document.createElement("div");
                card.className = "request-card ticket-card-item";
                card.style.marginTop = "12px";
                card.innerHTML = `
                    <p class="request-meta"><strong>TICKET:</strong> <span>${item.ticket}</span></p>
                    <p class="request-meta"><strong>TIPO:</strong> <span>${item.problema}</span></p>
                    <p class="request-meta"><strong>ALUMNO:</strong> <span>${item.alumno} (${item.codigo})</span></p>
                    <p class="request-meta"><strong>MONTO:</strong> <span>S/ ${parseFloat(item.monto).toFixed(2)}</span></p>
                    <p class="request-meta"><strong>FECHA PAGO:</strong> <span>${item.fecha}</span></p>
                    <p class="request-meta"><strong>ESTADO:</strong> <span class="badge badge-warning">${item.estado}</span></p>
                `;
                contenedorPadre.appendChild(card);
            });
        }
    }
});