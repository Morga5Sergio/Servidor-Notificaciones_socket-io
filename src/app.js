const express = require('express');           // Framework de nodeJs Express
const path = require("path");                 // path 
const { createServer } = require("http");     // Creacion de servidor
const { Server } = require("socket.io");      // Importacion de socket.io
const { Console } = require("console");       // Importacion para mostrar mensajes en consola 
const cors = require('cors')                  // Cors para permitir el acceso a clientes , Que es el Intercambio de recursos de origen Cruzado, es un mecanismo 
                                              // Es un mecanismo basado en las cabeceras HTTP que permite a un servidor indicar que cualquier dominio esquema o puerto

    //  Importacion de KAFKA Y el consumidor 
const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: '10.1.34.29:9092' });
const topic = 'contri-not';
const consumer = new Consumer(client, [{ topic }], { autoCommit: false });
    //  END Importacion de KAFKA Y el consumidor

const app = express(); // Se tiene guardado express con su propiedades y sus metodos

const webpush = require('web-push'); // TODO Importaciones de WEB Push 
const bodyParser = require('body-parser') 
// const socket = io(); // Socket Cliente 


const vapidKeys = {
    "publicKey":"BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg",
    "privateKey":"0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc"
}

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Modelo para Obtener las notificaciones
let notificacionesModel = require('./models/notificaciones');        


const enviarNotificacion = (req, res) => {
    const pushSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/f9Z3JRJ9bm0:APA91bEsqJQS_QSf_J4RYA4aB1FukA7Pzok4YDdL3JVAzre4kDSs9PZyNhTtHSva1wTsh_j__ZlwzFxuEzFQJdRo34eYOr1mAxDY2QZnDdc3hJoOGrTnCZPhI1ck1H9CK9hG85zeihjf', "expirationTime": null,
        keys: {
            auth: '2XtqkaejYO84Znh9TI89Jw', 
            p256dh: 'BLjuKStk5Pu9LmvD2xqpbZY0vT0a8iBACPw1nt49qeHkOFc8MLPPU5xJ5Wf1RYmkXR1iF_TrDxEYDNuiTJuZkw8'
        }
    };

    const payload = {
        "notification": {
            "title": "Notificacion",
            "body": "Notificacion Administrativa",
            "vibrate": [100, 50, 100],
            "actions": [
                {
                    "action": "reply",
                    "title": "Ver PDF",
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
                        // http://localhost:4200/notificacionespdf;notificacionElectronicaId=64d6b285781f096caa6edc18;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64d6b285781f096caa6edc16;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-11T18:13:25.257;estadoNotificacionElectronicaId=1461
                        "url": "http://localhost:4200/notificacionespdf;notificacionElectronicaId=64d6b285781f096caa6edc18;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64d6b285781f096caa6edc16;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-11T18:13:25.257;estadoNotificacionElectronicaId=1461"
                    }
                }
            },
        }
    }

    webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload))
        .then(res => {
            console.log('Enviado !!');
        }).catch(err => {
            console.log("Error", err);
        })
}

app.route('/api/enviar').post(enviarNotificacion);

const httpServer = createServer(app);         // Le http es el que inicia el servidor, Now can use the app as if you were http.
require('dotenv').config();                   // Para las variables de entorno, con las pruebas de seguridad. 
const io = new Server(httpServer, {cors: { origin: '*'} });            // Constante io para el servidor Socket.io

app.use(express.static(path.join(__dirname, "views"))); // Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.get("/", (req, res)=> {
        res.sendFile(__dirname + "/views/index.html");
});

let data= [];  // Datos del servicio de la notificación 

  
consumer.on('error', function (err) {
    console.error('Error with Kafka consumer', err);
});



const _connect = require('./dbConnection/connection');                      // Llama al archivo para la conexion de la base de datos en MONGO 

const usuario = [];


var usuarioMensajesEnEspera = [];                       // Se va almacenar en el array y se va  preguntar si se envio o no se envio (Por el momento esto es opcional)

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



// ------------------------------- Coneccion ----------------------------------
_connect();                     // Realiza la conexion de la base de datos en MONGO.

app.use((req,res,next) => {
    res.status(404).sendFile(__dirname + "/public/404.html");    // Redireccion De una pagian en HTML que indica, que no debe f
})



io.on("connection", socket => {

    consumer.on('message', function (message) {
        console.log('Received message _ Servidor :', message.value);
        //notificacionesModel = message.value;
        
        console.log("Mensaje Guardado y Recibido");
        console.log("______________________________________________________________________________________________________");  
        respuestaServicio();
        console.log("------------------------------------------------------------------------------------------------------------------------");
        console.log("--------------------------------------------------------  DATOS DEL CAMPO ----------------------------------------------------------");
        console.log(data);
        io.emit('msgServer', data);   // El socket emite la notificacion a los clientes Movil        
        enviarNotificacion();  // Funcion que envia la notificacion a los clientes WEB
        /*if(NIT){
            enviarNotificacion();  // WEB
            
        }*/    
        
        // console.log(notificacionesModel);
        //validacion 
        
        // `http://localhost:4200/notificacionespdf;notificacionElectronicaId=${notificacionesModel.notificacionElectronicaId};nroActoAdministrativo=${notificacionesModel.nroActoAdministrativo};actoAdministrativo=${notificacionesModel.actoAdministrativo};fechaActoAdministrativo=${notificacionesModel.fechaActoAdministrativo};archivoAdjuntoActuadoId=${notificacionesModel.archivoAdjuntoActuado};cantidadLecturas=${notificacionesModel.cantidadLecturas};fechaEnvioNotificacion=${notificacionesModel.fechaEnvioNotificacion};estadoNotificacionElectronicaId=${notificacionesModel.estadoNotificacionElectronicaId}`
        
        // io.addListener
    });

   console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
   io.emit("registroBD", "Send_register_base_datos"); 

   socket.on("disconnect", () => {
       console.log("El cliente " + socket.id + " se ha desconectado ");
   });

   // Envia el Mensaje del Servidor Hacia el cliente Predeterminado

   socket.on('emisionMensaje', msg => {       
       console.log("Mensaje_Notificación", " ====> " , data );
       enviarNotificacion();
       io.emit('msgServer', data);            
   });

   // Esta Sección solo se encarga de reenviar los mensajes
   io.emit("MensajesEspera", usuarioMensajesEnEspera); 
});

httpServer.listen(process.env.PORT , ()=> {
    console.log('Servidor a la espera de conexion ', process.env.PORT);
})

