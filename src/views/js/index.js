const socket = io();
const consultaDatosKAFKA = document.querySelector('#consultDatosServer');

const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"

consultaDatosKAFKA.addEventListener("click", ()=> {
    socket.emit("pulsar", "Se envio un mensaje desde pulsar");
})

socket.on('msgServer', msg => {
    console.log("msgServer " , " ==>  ", msg );
    var socketMensaje = {"id":"8321008", "estado":"ok"} 
    console.log("Datos recibidos", " ===> ", socketMensaje ) 
    socket.emit("verificar", socketMensaje);
});


socket.on("registroBD", message => {
    socket.emit("registroBase", "Dato Prueba");  
});