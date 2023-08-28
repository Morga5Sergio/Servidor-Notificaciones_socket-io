const express = require('express');           // Framework de nodeJs Express
const path = require("path");                 // path 
const { createServer } = require("http");     // Creacion de servidor
const { Server } = require("socket.io");      // Importacion de socket.io
const { Console, log } = require("console");       // Importacion para mostrar mensajes en consola 
const cors = require('cors')                  // Cors para permitir el acceso a clientes , Que es el Intercambio de recursos de origen Cruzado, es un mecanismo 
                                              // Es un mecanismo basado en las cabeceras HTTP que permite a un servidor indicar que cualquier dominio esquema o puerto
    //  Importacion  KAFKA consumidor 
const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: '10.1.34.29:9092' });
const topic = 'contri-not';
const consumer = new Consumer(client, [{ topic }], { autoCommit: false });
    //  END Importacion de KAFKA Y el consumidor

const app = express(); // Se tiene guardado express con su propiedades y sus metodos

const webpush = require('web-push'); // TODO Importaciones de WEB Push_ para WEB 
const vapidKeys = {  // Llaves publicas y privadas 
    "publicKey":"BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg",
    "privateKey":"0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc"
}
webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Modelo para Obtener las notificaciones
let mensajeNotificacionKafka = require('./models/mensaje_kafka');
let responseToken = require('./models/token_model');
let listaDispositivos = require('./models/lista_dispositivos');

const httpServer = createServer(app);         // Le http es el que inicia el servidor, Now can use the app as if you were http.
require('dotenv').config();                   // Para las variables de entorno, con las pruebas de seguridad. 
const io = new Server(httpServer, {cors: { origin: '*'} });            // Constante io para el servidor Socket.io

app.use(express.static(path.join(__dirname, "views"))); // Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.get("/", (req, res)=> {res.sendFile(__dirname + "/views/index.html");});

let usuarioTokenDtos = [];  // Datos de los Usuarios para enviar notificaciones 

consumer.on('error', function (err) {
    console.error('Error with Kafka consumer', err);
});

const _connect = require('./dbConnection/connection');    // Llama al archivo para la conexion de la base de datos en MONGO 
_connect(); // Realiza la conexion de la base de datos en MONGO.



var XMLHttpRequest = require("xhr2");
const xhr = new XMLHttpRequest();

io.on("connection", socket => {
    // TODO Envio de Notificacion Tanto para dispositivos WEB y MOBILE
    consumer.on('message', function (message) {
        console.log('Received message _ without value :', JSON.parse(message.value));    
        mensajeNotificacionKafka = JSON.parse(message.value);    
        
        console.log("-----------------------------------------------  Notificaciones KAFKA ---------------------------------------------"); 
        console.log(mensajeNotificacionKafka + " NIT =>  " + mensajeNotificacionKafka.nit);
    
        const API_URL_Lista_Usuario = "http://localhost:39476/api/listadoUsuarios/"+mensajeNotificacionKafka.nit;
        console.log(" URL Lista De Usuario entrando al CONSUMER ==>  ");
        console.log(API_URL_Lista_Usuario);
        // De aqui obtengo el NIT Correspondiente para las notificaciones.

        const API_URL_TOKEN = "https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000";
        getToken(API_URL_TOKEN)
            .then((responseTokenD) => {
                console.log("Respusta de Notificacion")
                // console.log("Respuesta:", response);
                // responseToken = JSON.parse(response);
                responseToken = JSON.parse(responseTokenD)
                console.log("Dato del Token Obtenido",  responseToken);                
                //token = response.token; 
                const tokenRespuesta = responseToken.token;
                console.log(responseToken.token); 
                // Nombre del Dispositivo
                // Ahora se realiza la respues de los otros datos 
            makeHttpRequest(tokenRespuesta, API_URL_Lista_Usuario)
                .then((response) => {
                console.log("Respuesta Final ")
                console.log("Respuesta:", response);
                listaDispositivos = JSON.parse(response);
                console.log("  ---------------------- Prueba de respuesta FINAL ------------------------------ "); 
                console.log(listaDispositivos)
                console.log(" Dato");
                usuarioTokenDtos = listaDispositivos.usuarioTokenDtos;
                console.log("  ----- usuarioTokenDtos usuarioTokenDtos usuarioTokenDtos  ----- ");
                console.log("Tamaño del array ==> " + usuarioTokenDtos.length + "  Datos_ Nombre del Dispositivo ==> " + usuarioTokenDtos[0].nombreDispositivo );

                if(usuarioTokenDtos.length > 0){
                    usuarioTokenDtos.forEach(element => {
                        if(element.webId != ""){
                            console.log("ENVIANDO NOTIFICAION PARA WEB");
                            enviarNotificacion();           // NOtificacion ENVIADO PARA WEB
                        }else{
                            console.log("ENVIANDO Notificacion para movil")
                            // io.emit('msgServer', data);     // Notificacion Enviadad para movil       
                        }
                    });
                }else {
                    console.log(" No se han encontrado una lista de dispositivos en el NIT Correspondiente ");
                }
            })
                .catch((error) => {
                console.error("Error Final :", error.message);
            });
        })
            .catch((error) => {
            console.error("Error Obtener Token==>:", error.message);
        });
    
    });

   console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
   io.emit("registroBD", "Send_register_base_datos");  // TODO Solo el uso es para fasd

   socket.on("disconnect", () => {
       console.log("El cliente " + socket.id + " se ha desconectado ");
   });
});

// INICIO DEL SERVIDOR
httpServer.listen(process.env.PORT , ()=> {
    console.log('Servidor a la espera de conexion ', process.env.PORT);
})



// Mensaje para enviar las notificaciones Push 
const enviarNotificacion = (req, res) => {
    const pushSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/cfn71EzU01M:APA91bHQilDlT83Ckj1hOeshK2hJGwlUIOMW3pUZQsm8pikekA-LaFJGhpdoaiieFAfPI9kK3bARFuJGnNelUj-9cqczn-WZo5wpvNNSv90zNNv7P4gHsEgk_xmABDzMf4B2lymFff1x', "expirationTime": null,
        keys: {
            auth: 'PYMg_YRTlL24xDR8ZkNj-g',
            p256dh: 'BMpaPokq6OJmGLwouIY2bneiECywHNkWumEH-jfpxFiRnfSuEiaynBWyeAROkEN88OE8Cv-b-qVN3lO28nfoOCc'
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

//app.route('/api/enviar').post(enviarNotificacion);  // Servicio Para enviar la notificacion

// FUNCIONES PARA OBTENER LOS SERVECIOS

function getToken(pApiUrlToken){
    return new Promise((resolve, reject) => {
        const xhrToken = new XMLHttpRequest();
        xhr.open('GET', `${pApiUrlToken}`);
        xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
        } else {
            reject(new Error(`Error en la solicitud: ${xhr.statusText}`));
        }
        };    
        xhr.onerror = () => {
        reject(new Error("Error en la solicitud"));
        };
        xhr.send();        
    });    
}

function makeHttpRequest(token, pUrlRespuestaUsuario) {    
    console.log("Entrando al MakeHttpRequest ==> " +  pUrlRespuestaUsuario);
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${pUrlRespuestaUsuario}`);
        xhr.setRequestHeader('Authorization', 'Token ' + token);
        xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
        } else {
            reject(new Error(`Error en la solicitud: ${xhr.statusText}`));
        }
        };    
        xhr.onerror = () => {
        reject(new Error("Error en la solicitud"));
        };
        xhr.send();
    });
}