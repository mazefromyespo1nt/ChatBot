$(document).ready(function () {
    console.log("Documento listo.");

    //  conexión WebSocket
    const ws = new WebSocket('ws://localhost:8022/ws'); 

    ws.onopen = function() {
        console.log('Conexión WebSocket abierta');
        
        const token = localStorage.getItem("whatsham_user");
        if (token) {
            ws.send(JSON.stringify({ action: 'authenticate', token: token }));
        } else {
            console.error("Token no encontrado en localStorage para WebSocket.");
        }
    };

    ws.onmessage = function(event) {
        console.log('Mensaje recibido:', event.data);
        // Aquí puedes agregar tu lógica para procesar el token recibido del WebSocket
    };

    // Intervalo para verificar si hay instancias disponibles cada 1 segundo
    const intervalID = setInterval(intervalInst, 1000);

    // Función para verificar y obtener instancias
    function intervalInst() {
        console.log("Verificando si hay instancias disponibles...");

        // Validamos la URL antes de realizar la solicitud
        if (location.href.indexOf('page') == -1 && location.href.indexOf('user') != -1) {
            const token = localStorage.getItem("whatsham_user");
            console.log("Token recuperado para verificar instancias:", token); // Log del token
            if (!token) {
                console.error("Token no encontrado en localStorage.");
                return; // Salimos si no hay token
            }

            $.ajax({
                url: 'http://localhost:8022/api/session/get_instances_with_status',  // Endpoint para obtener instancias
                type: 'GET',
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + token);
                },
                success: function (data) {
                    console.log("Instancias obtenidas:", data);

                    // Si hay instancias activas, no mostramos el QR
                    if (data.data && data.data.length > 0) {
                        console.log("Instancia activa encontrada, no es necesario mostrar QR.");
                        clearInterval(intervalID);  // Detenemos la verificación si hay una instancia activa
                    } else {
                        // Si no hay instancias activas, creamos una nueva y mostramos el QR
                        console.log("No hay instancias activas, creando nueva instancia.");
                        crearInstancia();
                    }
                },
                error: function (error) {
                    console.log("Error al obtener las instancias.", error);
                }
            });
        }
    }

    // Función para crear una nueva instancia automáticamente

function crearInstancia() {
    console.log("Creando una nueva instancia para vinculación a WhatsApp...");
    const token = localStorage.getItem("whatsham_user");

    if (!token) {
        console.error("Token no encontrado en localStorage.");
        return; // Salimos si no hay token
    }

    $.ajax({
        url: 'http://localhost:8022/api/session/create_instance',  
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        success: function (response) {
            console.log("Respuesta recibida del servidor:", response);
            
            // Validar que se reciba un token de vinculación válido
            if (response && response.qrCode) {
                console.log("QR recibido desde el backend:", response.qrCode);
                generarQR(response.qrCode);  // Generar el QR con el token de autenticación
            } else {
                console.error("No se recibió un token de vinculación válido:", response);
            }
        },
        error: function (xhr, status, error) {
            console.error("Error al crear la instancia:", status, error);
            console.error("Respuesta del servidor:", xhr.responseText);  // mostra rspuesta
        }
    });
}
    
    // Función para generar el QR en el frontend
    function generarQR(qrCodeData) {
        const qrContainer = document.getElementById("qrCode");

        console.log("Contenedor de QR encontrado:", qrContainer);

        if (!qrContainer) {
            console.log("El contenedor para el QR no está disponible.");
            return;
        }

        // Limpiar el contenido del contenedor
        $('#qrCode').empty();

        // Verificar que el token de vinculación sea válido
        if (!qrCodeData) {
            console.error("Token de vinculación no válido o no proporcionado:", qrCodeData);
            return;
        }

        console.log("Generando QR para vinculación a WhatsApp...");

        try {
            // Generar el QR con el token de vinculación de WhatsApp
            new QRCode(qrContainer, {
                text: qrCodeData,  // El token de vinculación proporcionado por el backend
                width: 256,
                height: 256
            });

            console.log("QR generado exitosamente.");
        } catch (error) {
            console.error("Error al generar el código QR:", error);
        }
    }
});
