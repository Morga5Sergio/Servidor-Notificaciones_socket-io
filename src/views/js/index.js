const socket = io();
//require('dotenv').config();       

const emitToServer = document.querySelector("#emit-to-server");
const emitDesconectar = document.querySelector("#disconnect");
const emitReconectar = document.querySelector("#reconectar");

const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"
// const API_URL = "http://jsonplaceholder.typicode.com";


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

/*const xhr = new XMLHttpRequest();
function onRequestHandler(){
    if(this.readyState == 4 && this.status == 200){
        // 0 = UNSET, no se ha llamado al metodo open
        // 1 = OPENED, se ha llamado al meotodo open
        // 2 = HEADERS_RECEIVED, se esta llamando al metodo send()
        // 3 = LOADING, se esta cargando, es decir, esta recibiendo la respuesta 
        // 4 = DONE, se ha completado la operación.
        console.log(this.response)
        const data = JSON.parse(this.response); 
        console.log(data);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
        const HTMLResponse = document.querySelector('#app');
        const tpl = data.map((user) => `<li>${user.name} ${user.email}</li>`);
        HTMLResponse.innerHTML = `<ul>${tpl}</ul>`;
    } 
}
xhr.addEventListener('load', onRequestHandler);
xhr.open('GET', `${API_URL}`);
xhr.send();*/


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
    console.log("cnr Mensajes " , " ==>  ", msg );
    // var arrMensajSocketResponse = new Array(msg[0].id, msg[0].mensaje);
    var socketMensaje = {"id":"8321008", "estado":"ok"} 
    console.log("Datos recibidos", " ===> ", socketMensaje ) 

    // Operaciones correspondientes para realizar la notificación

    socket.emit("verificar", socketMensaje);
});


socket.on("registroBD", message => {
    // console.log("Entra_a_registrarBS", " ==> ", message);
    socket.emit("registroBase", "8321008");  // Dato quemado - Manda al servidor del registro de datos. 
});

//





//socket.on("Welcome ")
