//==================================================
// GÉNESIS - PLATAFORMA DE INGRESO Y SALIDA
//==================================================

const funcionarios = [
    { id:1, cedula:"9296173", nombre:"AMAURY MANUEL CASTILLO HERNÁNDEZ", cargo:"TÉCNICO OPERATIVO DE TRÁNSITO" },
    { id:2, cedula:"9295374", nombre:"OSVALDO JOSÉ LORDUY PÁJARO", cargo:"AGENTE DE TRÁNSITO" },
    { id:3, cedula:"9298868", nombre:"LEIBER DE JESÚS BARRIOS TORRES", cargo:"AGENTE DE TRÁNSITO" },
    { id:4, cedula:"1050967018", nombre:"LUIS JAVIER ESPINOSA AGUDELO", cargo:"AGENTE DE TRÁNSITO" },
    { id:5, cedula:"9283424", nombre:"ANTONIO VÍCTOR PAYARES SIMANCAS", cargo:"AGENTE DE TRÁNSITO" },
    { id:6, cedula:"73575493", nombre:"PAULO CÉSAR CABALLERO MERCADO", cargo:"AGENTE DE TRÁNSITO" },
    { id:7, cedula:"73009929", nombre:"CRISTIAN EDUARDO QUINTERO RAMOS", cargo:"AGENTE DE TRÁNSITO" },
    { id:8, cedula:"9288642", nombre:"JUAN MENDOZA DÍAZ", cargo:"AGENTE DE TRÁNSITO" },
    { id:9, cedula:"9287988", nombre:"FREDY ALBERTO PUELLO GARRIDO", cargo:"AGENTE DE TRÁNSITO" },
    { id:10, cedula:"1050953385", nombre:"JEAN JEYNER BALLESTAS PAJARO", cargo:"AGENTE DE TRÁNSITO" }
];

let funcionarioActual = null;

// Esperar a que el HTML esté listo para evitar errores de referencia
document.addEventListener("DOMContentLoaded", () => {
    iniciarCamara();
    iniciarReloj();
});

function iniciarReloj() {
    setInterval(() => {
        const ahora = new Date();
        document.getElementById("fecha").innerHTML = ahora.toLocaleDateString("es-CO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
        document.getElementById("hora").innerHTML = ahora.toLocaleTimeString("es-CO");
    }, 1000);
}

// CÁMARA (Con protección de errores)
async function iniciarCamara(){
    const video = document.getElementById("video");
    const estado = document.getElementById("estado");
    
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if(estado) estado.innerHTML = "🔴 TU NAVEGADOR NO SOPORTA CÁMARA";
        return;
    }
    
    try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if(video) video.srcObject = stream;
    } catch(error){
        console.warn("Cámara bloqueada o no encontrada", error);
        if(estado) estado.innerHTML = "⚠️ CÁMARA DESACTIVADA";
    }
}

// BÚSQUEDA
const txtCedula = document.getElementById("cedula");
if(txtCedula) {
    txtCedula.addEventListener("input", () => {
        const numero = txtCedula.value.replace(/\./g, "").trim();
        funcionarioActual = funcionarios.find(f => f.cedula === numero);
        const estado = document.getElementById("estado");
        
        if(funcionarioActual){
            document.getElementById("nombre").value = funcionarioActual.nombre;
            document.getElementById("cargo").value = funcionarioActual.cargo;
            if(estado) estado.innerHTML = "🟢 FUNCIONARIO IDENTIFICADO. Prepárate para el registro.";
        } else {
            funcionarioActual = null;
            document.getElementById("nombre").value = "";
            document.getElementById("cargo").value = "";
            if(estado) estado.innerHTML = "🔴 NO REGISTRADO";
        }
    });
}

// REGISTRO Y CAPTURA
const btnRegistrar = document.getElementById("registrar");
if(btnRegistrar) {
    btnRegistrar.addEventListener("click", () => {
        const tipo = document.querySelector('input[name="tipo"]:checked');
        const estado = document.getElementById("estado");

        if(!funcionarioActual || !tipo){
            if(estado) estado.innerHTML = "🔴 ERROR: FALTAN DATOS";
            return;
        }

        // CAPTURA FOTO
        let imagenBase64 = "";
        try {
            const video = document.getElementById("video");
            const canvas = document.getElementById("canvas");
            const context = canvas.getContext("2d");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            imagenBase64 = canvas.toDataURL("image/png");
        } catch(e) { console.error("Error al capturar foto", e); }

        // GUARDAR
        const nuevoRegistro = {
            cedula: funcionarioActual.cedula,
            nombre: funcionarioActual.nombre,
            tipo: tipo.value,
            fecha: new Date().toLocaleDateString("es-CO"),
            hora: new Date().toLocaleTimeString("es-CO"),
            foto: imagenBase64
        };

        try {
            let registros = JSON.parse(localStorage.getItem('registros_genesis') || '[]');
            registros.push(nuevoRegistro);
            localStorage.setItem('registros_genesis', JSON.stringify(registros));
            if(estado) estado.innerHTML = "✔ REGISTRO EXITOSO";
            
            // SONIDOS
            const audio = new Audio(`sonido/${tipo.value.toLowerCase()}.mp3`);
            audio.play().catch(e => console.warn("Audio bloqueado por navegador"));
        } catch(e) { console.error("Error al guardar", e); }
    });
}