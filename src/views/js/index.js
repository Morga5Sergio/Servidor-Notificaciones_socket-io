const socket = io();

const emitToServer = document.querySelector("#emit-to-server");
const emitDesconectar = document.querySelector("#disconnect");
const emitReconectar = document.querySelector("#reconectar");


// Envia Notificación fasd
emitToServer.addEventListener("click", ()=> {
    // socket.emit("counter", "8321008") // JSON CI, Nombre
    socket.emit("emisionMensaje",[{"id":"8321008", "mensaje":"Dato1", "estado":"ninguno"},{"id":"55", "mensaje":"Dato2", "estado":"ninguno"}]
    ) // JSON CI, Nombre
});

emitDesconectar.addEventListener("click", ()=> {
    socket.disconnect();
});

emitReconectar.addEventListener("click", ()=> {
    socket.connect();
});

// TODO Escuchar el evento de la conección
socket.on('msgServer', msg => {
    console.log("cnr Mensajes " , " ==>  " + msg );
    var arrMensajSocketResponse = new Array(msg[0].id, msg[0].mensaje);
    var socketMensaje = {"id":"8321008", "estado":"ok"} 
    console.log("Datos recibidos", " ===> " + socketMensaje ) 

    // Operaciones correspondientes para realizar la notificación

    socket.emit("verificar", socketMensaje);
});


socket.on("registroBD", message => {
    // console.log("Entra_a_registrarBS", " ==> ", message);
    socket.emit("registroBase", "8321008");  // Dato quemado - Manda al servidor del registro de datos. 
});


//socket.on("Welcome ")
