const express = require('express');           // Framework de nodeJs Express
const path = require("path");                 // path 
const { createServer } = require("http");     // Creacion de servidor
const { Server } = require("socket.io");      // Importacion de socket.io
const { Console } = require("console");       // Importacion para mostrar mensajes en consola 
const cors = require('cors')                  // Cors para permitir el acceso a clientes , Que es el Intercambio de recursos de origen Cruzado, es un mecanismo 
                                              // Es un mecanismo basado en las cabeceras HTTP que permite a un servidor indicar que cualquier dominio esquema o puerto

const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
//const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const client = new kafka.KafkaClient({ kafkaHost: '10.1.36.38:9092' });
const topic = 'test';
const consumer = new Consumer(client, [{ topic }], { autoCommit: false });
const app = express();                        // Se tiene guardado express con su propiedades y sus metodos
// TODO Importaciones de WEB Push 
const webpush = require('web-push');
//const cors = require('cors');
const bodyParser = require('body-parser') 

const vapidKeys = {
    "publicKey":"BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg",
    "privateKey":"0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc"
}

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const variableId = "1461";

// Modelo para Obtener las notificaciones
let notificacionesModel = require('./models/notificaciones');        


consumer.on('message', function (message) {
    console.log('Received message:', message.value);
    notificacionesModel = message.value;
    console.log("Mensaje Guardado y Recibido");
    console.log("______________________________________________________________________________________________________");
    console.log(notificacionesModel);

    //`http://localhost:4200/notificacionespdf;notificacionElectronicaId=${notificacionesModel.notificacionElectronicaId};nroActoAdministrativo=${notificacionesModel.nroActoAdministrativo};actoAdministrativo=${notificacionesModel.actoAdministrativo};fechaActoAdministrativo=${notificacionesModel.fechaActoAdministrativo};archivoAdjuntoActuadoId=${notificacionesModel.archivoAdjuntoActuado};cantidadLecturas=${notificacionesModel.cantidadLecturas};fechaEnvioNotificacion=${notificacionesModel.fechaEnvioNotificacion};estadoNotificacionElectronicaId=${notificacionesModel.estadoNotificacionElectronicaId}`

});
  
consumer.on('error', function (err) {
console.error('Error with Kafka consumer', err);
});

const enviarNotificacion = (req, res) => {
    const pushSubscription = {
        // https://fcm.googleapis.com/fcm/send/fq6ObFmYAcU:APA91bHNzU5kyaemiw1OJQVvCAkjIYWbz6X7h9PLwyTJmKJW0eAlutAUM-6wpr3c6-sCIxTaXJhdzfAk-It6QmnSxlqvaVSm9LByXtaTEew4KdDDsGCcd5xXVCJQ-mZv0EfvY0qmGYU9
        // https://fcm.googleapis.com/fcm/send/eG7HlG_xRqc:APA91bEaxnvLp-dE4VqyRd4bisXqXEc-gaLZN4S5J76mLohXepZdrqDmokLreoiuJ3bMRqRhKyO3PKuQp6qVMjTej7e7xJeObvVZQhitY1E8XXvEm48nDxk0nbaJwz-OiPEzjJAhrnj4
        endpoint: 'https://fcm.googleapis.com/fcm/send/eG7HlG_xRqc:APA91bEaxnvLp-dE4VqyRd4bisXqXEc-gaLZN4S5J76mLohXepZdrqDmokLreoiuJ3bMRqRhKyO3PKuQp6qVMjTej7e7xJeObvVZQhitY1E8XXvEm48nDxk0nbaJwz-OiPEzjJAhrnj4', "expirationTime": null, 
        keys: {
            auth: 'XH5XMcmWAi_VxzCvUOPiuA', 
            p256dh: 'BMj5IWg3c2w_bMe1pFUOBrgytjGXTt17p6ehiJWZm1L-6lr20mbZ2AP4qnbHcjUnThUSUHSrH2ig-rxQny02WPk'
        }
    };

    const payload = {
        "notification": {
            "title": "Notificacion Administrativa",
            "body": notificacionesModel.actoAdministrativo,
            "vibrate": [100, 50, 100],
            "actions": [
                {
                    "action": "reply",
                    "title": "Responder",
                    "type": "text"
                }
            ],
            "data": {
                "onActionClick": {
                    "default": {
                        "operation": "navigateLastFocusedOrOpen",
                        "url": "http://localhost:4200/notificacionespdf;notificacionElectronicaId=64cbcf913da34646e030b115;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64cbcf913da34646e030b113;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-03T12:02:25.836;estadoNotificacionElectronicaId=1461"
                    },
                    "reply": {
                        "operation": "navigateLastFocusedOrOpen",
                        "url": `http://localhost:4200/notificacionespdf;notificacionElectronicaId=${notificacionesModel.notificacionElectronicaId};nroActoAdministrativo=${notificacionesModel.nroActoAdministrativo};actoAdministrativo=${notificacionesModel.actoAdministrativo};fechaActoAdministrativo=${notificacionesModel.fechaActoAdministrativo};archivoAdjuntoActuadoId=${notificacionesModel.archivoAdjuntoActuado};cantidadLecturas=${notificacionesModel.cantidadLecturas};fechaEnvioNotificacion=${notificacionesModel.fechaEnvioNotificacion};estadoNotificacionElectronicaId=${notificacionesModel.estadoNotificacionElectronicaId}`
                    }
                    
                    // Bienn 
                    // "http://localhost:4200/notificacionespdf;notificacionElectronicaId=64cd5aea7c2ed93cde80813d;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64cd5aea7c2ed93cde80813b;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-04T16:09:14.830;estadoNotificacionElectronicaId=1461"
                    // Bien con un parametro 
                    //  "url": `http://localhost:4200/notificacionespdf;notificacionElectronicaId=64cd5aea7c2ed93cde80813d;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64cd5aea7c2ed93cde80813b;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-04T16:09:14.830;estadoNotificacionElectronicaId=${variableId}`

                    //http://localhost:39476/api/notificaciones/constancia/64cd5ac1b11bf71e81db6c5f"
                    // http://localhost:4200/notificacionespdf;notificacionElectronicaId=64cd5aea7c2ed93cde80813d;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64cd5aea7c2ed93cde80813b;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-04T16:09:14.830;estadoNotificacionElectronicaId=1461
                    // http://10.1.36.38:39476/api/notificaciones/constancia/64cd5ac1b11bf71e81db6c5f
                    // http://localhost:4200/notificacionespdf;notificacionElectronicaId=64cd5aec7c2ed93cde808140;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64cd5aec7c2ed93cde80813e;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-04T16:09:16.548;estadoNotificacionElectronicaId=1461"
                }
            },
        }
    }
    /*

    "actions": [{
                "action": "explore",
                "title": "Ver el PDF"
            }]

    */

    webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload))
        .then(res => {
            console.log('Enviado !!');
        }).catch(err => {
            console.log('Error', err);
        })
   //  res.send({ data: 'Se envio subscribete!!' })
}

app.route('/api/enviar').post(enviarNotificacion);

const httpServer = createServer(app);         // Le http es el que inicia el servidor, Now can use the app as if you were http.
require('dotenv').config();                   // Para las variables de entorno, con las pruebas de seguridad. 
const io = new Server(httpServer, {cors: { origin: '*'} });            // Constante io para el servidor Socket.io

app.use(express.static(path.join(__dirname, "views"))); // Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.get("/", (req, res)=> {
        res.sendFile(__dirname + "/views/index.html");
});
let data= [];



const _connect = require('./dbConnection/connection');                      // Llama al archivo para la conexion de la base de datos en MONGO 
// const obtenerDatos = require('./controllers/index.controller')              // Llama al archivo para el  proceso de la obtención de los datos en MONGO
// const obtenerDatosNotificacion = require('./controllers/index.controller');

const usuario = [];

let usuarioPrueba = {"usuario_registro":"","usuarioId":"","numeroDocumento":"","tipoDocumentoId":"","nombreDispositivo":"","imei":"","fechaRegisto":"","fechaModificacion":"","estadoId":""};
var usuarioMensajesEnEspera = [];                       // Se va almacenar en el array y se va  preguntar si se envio o no se envio (Por el momento esto es opcional)

/*const routes = require('./routes/index.routes')       // Rutas que se le puede adicionar a la APP otra direcciones -- OPCIONAL si lo requiere el servidor
app.use(routes)*/

// Motor de plantillas  // Se instalo npm i ejs
// app.use('view engine', 'ejs');

console.log(" direccion de la pagina " +  __dirname+"/public");

// ------------------------------- Pruebas ------------------------------------------------------------
// http://10.1.36.79:39476/api/notificaciones/contribuyente/2063982011
const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"

var XMLHttpRequest = require("xhr2");
const UsuarioPushModel = require('./models/usuario_push');
const xhr = new XMLHttpRequest();

function onRequestHandler(){
    if(this.readyState == 4 && this.status == 200){
        data = JSON.parse(this.response); 
        //console.log("----------  Respuesta del servicio externo --------------");
        //console.log(data);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    } 
}

function respuestaServicio(){
    xhr.addEventListener('load', onRequestHandler);
    xhr.open('GET', `${API_URL}`);
    xhr.send();
}



// ------------------------------- Pruebas 2 ----------------------------------
_connect();                     // Realiza la conexion de la base de datos en MONGO.
//obtenerDatos();                 // Obtiene los datos de la coleccion => sad_not_notificaciones_push_prueba
//obtenerDatosNotificacion();     // Obtiene los datos de la coleccion => sad_not_notificaciones 

app.use((req,res,next) => {
    res.status(404).sendFile(__dirname + "/public/404.html");    // Redireccion De una pagian en HTML que indica, que no debe f
})
// TODO KAFKA 
/*
const consumer = new Consumer(client, [{ topic }], { autoCommit: false });
consumer.on('message', function (message) {
    console.log('Received message:', message.value);
  });
  
  consumer.on('error', function (err) {
    console.error('Error with Kafka consumer', err);
  });*/

io.on("connection", socket => {
   console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
   io.emit("registroBD", "Send_register_base_datos"); 

   socket.on("disconnect", () => {
       console.log("El cliente " + socket.id + " se ha desconectado ");
   });

   // Envia el Mensaje del Servidor Hacia el cliente Predeterminado
   socket.on('emisionMensaje', msg => {       
       console.log("_____________________________________________________________________");
       console.log("Mensaje_Notificación", " ====> " , data );
       respuestaServicio();
       enviarNotificacion();
       io.emit('msgServer', data);            
   });

   socket.on("kafka", msg => {
    console.log(msg);
    console.log("**********************************************************************************************");
    console.log(notificacionesModel);
    

   })

   // Esta Sección solo se encarga de reenviar los mensajes
   io.emit("MensajesEspera", usuarioMensajesEnEspera); 

   // Datos de objMensajeSocket => Estos datos son los siguientes
   // objMensajeSocket = {"id":"8321008", "estado":"ok"}  // Se verificara si existe o no existe   
   socket.on("verificar", objMensajeSocket => {
       console.log("objMensajeSocket " , "     ============================================================================== ");
       console.log("objMensajeSocket " , objMensajeSocket);    
       console.log("objMensajeSocket Usuario => " , usuario);    

       console.log("objMensajeSocket " , objMensajeSocket);
       var index = usuario.map(element => element.id).indexOf(objMensajeSocket.id);
   
       console.log("objMensajeSocket ",  " ==> Valor del indice encontrado   " , index);

       console.log("ArrayAntes  ", " ==>  " + usuarioMensajesEnEspera );
       if(index >= 0){
           if(usuario[index].estado == "ninguno" ){
               // Se almacenara los datos para reenviar la notificación nuevamente si este no se envio                
               usuarioMensajesEnEspera.push(usuario[index]);
               usuario[index].estado =  "ok"
           }else {                
               // Ya se encuentra registrado, tiene que eliminarse del array correspondiente.                                
               usuarioMensajesEnEspera = usuarioMensajesEnEspera.filter(notificacion => notificacion.id == objMensajeSocket.id) 
           }            
       }else {
           
           console.log("objMensajeSocket " , " No se encuentra registrado  el usuario correspondiente ==> ");
       }

       console.log("ArrayDespues  ", " ==>  " + usuarioMensajesEnEspera );
   });
});

httpServer.listen(process.env.PORT , ()=> {
    console.log('Servidor a la espera de conexion ', process.env.PORT);
})

