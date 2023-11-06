const socket = io();
/* const emitToServer = document.querySelector("#emit-to-server");
const emitDesconectar = document.querySelector("#disconnect");
const emitReconectar = document.querySelector("#reconectar"); */
const consultaDatosKAFKA = document.querySelector('#consultDatosServer');

const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"

/* emitToServer.addEventListener("click", ()=> {
    console.log("Emision mensaje Prueba de control");
    
    socket.emit("emisionMensaje",[{"id":"8321008", "mensaje":"Dato1", "estado":"ninguno"},{"id":"55", "mensaje":"Dato2", "estado":"ninguno"}]
    ) 
});

emitDesconectar.addEventListener("click", ()=> {
    socket.disconnect();
});

emitReconectar.addEventListener("click", ()=> {
    socket.connect();
}); */

consultaDatosKAFKA.addEventListener("click", ()=> {
    socket.emit("pulsar", "Se envio un mensaje desde pulsar");
})

// TODO Escuchar el evento de la conección
socket.on('msgServer', msg => {
    console.log("cnr Mensajes " , " ==>  ", msg );
    // var arrMensajSocketResponse = new Array(msg[0].id, msg[0].mensaje);
    var socketMensaje = {"id":"8321008", "estado":"ok"} 
    console.log("Datos recibidos", " ===> ", socketMensaje ) 

    // Operaciones correspondientes para realizar la notificación

    socket.emit("verificar", socketMensaje);
});


socket.on("registroBD", message => {
    // console.log("Entra_a_registrarBS", " ==> ", message);

    var usuario_p
    socket.emit("registroBase", "8321008");  // Dato quemado - Manda al servidor del registro de datos. 
});




//





//socket.on("Welcome ")
