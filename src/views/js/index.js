const socket = io();
//require('dotenv').config();       

const emitToServer = document.querySelector("#emit-to-server");
const emitDesconectar = document.querySelector("#disconnect");
const emitReconectar = document.querySelector("#reconectar");
const consultaDatosKAFKA = document.querySelector('#consultDatosServer');

const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"
// const API_URL = "http://jsonplaceholder.typicode.com";


// KAFKA 

/*const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: '10.1.34.19:9092' });
const topic = 'contri-not';
const consumer = new Consumer(client, [{ topic }], { autoCommit: false });*/ 


/*const HTMLResponse = document.querySelector('#app');

const ul = document.createDocumentFragment('ul');

fetch(`${API_URL}/users`)
    .then((response) => response.json())
    .then((users) => {
        users.forEach(user => {
            let elem = document.createElement('li') ;
            elem.appendChild(
                document.createTextNode(`${user.name} ${user.email}`)
            );
            ul.appendChild(elem);
        });

        HTMLResponse.appendChild(ul);
    });*/

/*Primera forma de consumir servicios*/



// Envia Notificación fasd
emitToServer.addEventListener("click", ()=> {
    console.log("Emision mensaje Prueba de control");
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

consultaDatosKAFKA.addEventListener("click", ()=> {
    socket.emit("kafka", "hola");
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
