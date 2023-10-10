const express = require('express');           // Framework de nodeJs Express
const path = require("path");                 // path 
const { createServer } = require("http");     // Creacion de servidor
const { Server } = require("socket.io");      // Importacion de socket.io 
const app = express(); // Se tiene guardado express con su propiedades y sus metodos
const webpush = require('web-push'); // TODO Importaciones de WEB Push_ para WEB 

//  Importacion  PULSAR consumidor 
const pulsar = require('pulsar-client');
const serviceUrl = 'pulsar://10.1.17.35:6650,10.1.17.36:6650,10.1.17.37:6650';
const tenant = 'desarrollo';
// Topic_Pulsar Notificaciones
const namespace = 'sad_not';
const topicPulsarAvisos = 'aviso';  
const topicPulsar = 'notificacion';
// Topic_Pulsar Mensajeria  
const namespacePulsarMensajeria = 'sad_men';
const topicPulsarMensajeria = 'mensajeria';

// Topic_Avisos de avisos
const namespacePulsarAvisos = '';

const vapidKeys = {  // Llaves publicas y privadas 
    "publicKey":"BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg",
    "privateKey":"0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc"
}

webpush.setVapidDetails(
    'mailto:example@yourdomain.org',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// Modelos para los DTOS de notificaciones y avisos
let mensajeNotificacionKafka = require('./models/mensaje_kafka');
let mensajeriaPulsar = require('./models/mensaje_pulsar');
let mensaje_pulsar_avisos = require('./models/mensaje_pulsar_avisos');
let avisosPulsar = require('./models/avisos');
let notificaciones_electronicas = require('./models/notificaciones_electronicas');
let responseToken = require('./models/token_model');
let listaDispositivos = require('./models/lista_dispositivos');
let modeloNoti = require('./models/modelos_noti');
let envioPhone = {"idNotificacion":"", "arrayImei":[], "tipo":"notificacion"};
let envioPhoneAvisos = {"idAvisos":"", "arrayImei":[], "tipo": "avisos"};

const httpServer = createServer(app);         // Le http es el que inicia el servidor, Now can use the app as if you were http.
require('dotenv').config();                   // Para las variables de entorno, con las pruebas de seguridad. 
const io = new Server(httpServer, {cors: { origin: '*'} });            // Constante io para el servidor Socket.io

app.use(express.static(path.join(__dirname, "views"))); // Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.get("/", (req, res)=> {res.sendFile(__dirname + "/views/index.html");});

let usuarioTokenDtos = [];  // Datos de los Usuarios para enviar notificaciones 


const _connect = require('./dbConnection/connection');    // Llama al archivo para la conexion de la base de datos en MONGO 
_connect(); // Realiza la conexion de la base de datos en MONGO.

var XMLHttpRequest = require("xhr2");
const xhr = new XMLHttpRequest();

/** 
 * @author Gary morga
 * @description Implementación de socket para enviar datos 
*/

io.on("connection", socket => {
    console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
    //io.emit("registroBD", "Send_register_base_datos");  // TODO Solo el uso 
        
    socket.on('disconnect', () => {
        console.log('Cliente desconectado.');
        console.log("El cliente " + socket.id + " se ha desconectado ");
    });                                                                                                                                                                         
});

function enviarMensajeNotificacionSocket(datosNit, envioPhone){
    console.log("Envia Socket ==>===> " +  mensajeNotificacionKafka.nit + " fasfsda" + datosNit);
    io.emit(datosNit, envioPhone);                                                                             
}
// Mensajes de notificaciones:
async function consumeMessages() {
    const clientPulsar = new pulsar.Client({
      serviceUrl,
      operationTimeoutSeconds: 30,
    });
    const consumer = await clientPulsar.subscribe({
        topic: `persistent://${tenant}/${namespace}/${topicPulsar}`,
        subscription: 'suscripcion_3', 
        subscriptionType: "Exclusive",
      });    
        // console.log('Consumidor conectado.');
        console.log(" Entra en pulsar notificaciones ==> Gary " + topicPulsar);
        if(topicPulsar === 'notificacion'){            
                try {
                    console.log("Entra en pulsar ==> Gary try ==> " );
                    while (true) {
                        const  message = await consumer.receive();  // AvisosPush{"avisoPushId":
                        console.log(" Datos del mensaje PULSARRR ==>   "   + message.getData())
                        const messageText = message.getData().toString();        
                        console.log(" El mensaje de datos de mensajeriaSER Notificacion Original ===>  " , messageText );        
        
                        const startIndex = messageText.indexOf('NotificacionesPush');
                        
                        console.log(" Notificacion original ==>     " + startIndex );
                        const jsonString = messageText.substring(startIndex + 'NotificacionesPush'.length);
                        console.log(" Prfasd  =>  " + jsonString);
                        mensajeNotificacionKafka = JSON.parse(jsonString);
                        console.log(" GaryDatos ==>  ", mensajeNotificacionKafka);
                        console.log(" Prfasd AAAAA =>  ", mensajeNotificacionKafka.nit);
                        notificaciones_electronicas = mensajeNotificacionKafka.notificacionesElectronicas;
                        
                        let objEnvioNotificacion = {"idNotificacion": mensajeNotificacionKafka.idNotificacion,"actoadministrativo": notificaciones_electronicas.actoAdministrativo, "archivoAduntoId": notificaciones_electronicas.archivoAdjuntoActuadoId, "estadoId": mensajeNotificacionKafka.estadoNotificacion }
                            
                    
                        const API_URL_Lista_Usuario = "http://localhost:39559/api/dispositivo/buscarXNit/"+mensajeNotificacionKafka.nit;
                        console.log(" URL Lista De Usuario entrando al CONSUMER ==>  ");
                        console.log(API_URL_Lista_Usuario);
        
                        // De aqui obtengo el NIT Correspondiente para las notificaciones.
                
                        const API_URL_TOKEN = "https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000";
                        getToken(API_URL_TOKEN)
                            .then((responseTokenD) => {                        
                                responseToken = JSON.parse(responseTokenD)            
                                const tokenRespuesta = responseToken.token;
                                usuarioTokenDtos = [];  
                            getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
                                .then((response) => {
                                console.log("Respuesta Final ")
                                console.log("Respuesta:", response);
                                listaDispositivos = JSON.parse(response);
                                console.log("  ---------------------- Prueba de respuesta FINAL ------------------------------ "); 
                                console.log(listaDispositivos)
                                console.log(" Dato");
                                usuarioTokenDtos = listaDispositivos.dispositivos;
                                console.log(usuarioTokenDtos);
                                console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Longitud----- "  + usuarioTokenDtos.length );
                                console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Datos----- " ,  usuarioTokenDtos );
                                
                                //console.log("Tamaño del array ==> " + usuarioTokenDtos.length: + "  Datos_ Nombre del Dispositivo ==> " + usuarioTokenDtos[0].nombreDispositivo );
                                
                                if(usuarioTokenDtos.length > 0){                            
                                    envioPhone.arrayImei = [];
                                    usuarioTokenDtos.forEach(element => {
                                        modeloNoti = element;
                                        if(modeloNoti.imei != "" ){
                                            if(modeloNoti.tokenPush == "ACTIVO"){
                                                envioPhone.arrayImei.push(modeloNoti.imei);
                                            }
                                            
                                        }
                                    });
        
                                    console.log(" GaryMorgaNotificacion ==> ", envioPhone );
                                    usuarioTokenDtos.forEach(element => { // El  usuarioTokenDtos es la lista de dispositivos // Serian una 6 veces pero va a mandar 
                                        modeloNoti = element;                                
                                        console.log(modeloNoti);
                                        console.log("--- Noitiicasd --- ");
                                        console.log(modeloNoti.tokenPush);
                                        if(modeloNoti.webId != ""){
                                            //envioNotificacion(element.endPointWeb, element.keyWeb, element.authWeb);
                                            if(modeloNoti.descripcionEstado  == "ACTIVO"){
                                                console.log("ENVIANDO NOTIFICAION PARA WEB");                                
                                                // Enviar mensaje idNOtificacion , mensajeNotificacionKafka.idNotificacion
                                                // mensajeNotificacionKafka.
                                                envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensajeNotificacionKafka.cabecera, mensajeNotificacionKafka.cuerpo, "Ir a ver la notificación",  objEnvioNotificacion, "notificacion");
                                                //envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensajeNotificacionKafka.cabecera, mensajeNotificacionKafka.cuerpo, "Ir a ver la notificación", "https://desasiat.impuestos.gob.bo/notificaciones/con/notificaciones", objEnvioNotificacion);
                                            }                    
                                        }else{
                                            console.log("ENVIANDO NOTIFICACION PARA MOVIL_ tamaño=> ", usuarioTokenDtos.length); // 2063982011     
                                            // TODO Pruebas                        
                                            if(modeloNoti.imei != ""){
                                                console.log("Entra a IMEI ==> " + modeloNoti.imei + " ============> para enviar notificaciones <================")
                                                if(modeloNoti.tokenPush == "ACTIVO"){                        
                                                    envioPhone.idNotificacion = mensajeNotificacionKafka.idNotificacion;   
                                                    // console.log(" GaryMorgaNotificacion Other ====> ", envioPhone.length + " Datos ==>  ", envioPhone );                                                     
                                                    console.log(" nit ", mensajeNotificacionKafka.nit  , " ===> ");
                                                    console.log("Envia Movil ===> " +  mensajeNotificacionKafka.nit);
                                                    const strNitImei = mensajeNotificacionKafka.nit + "-" + modeloNoti.imei;
                                                    enviarMensajeNotificacionSocket(strNitImei, envioPhone)
                                                }
                                            }                                                                                                          
                                        }
                                    });
                                }else {                            
                                    console.log(" No se han encontrado una lista de dispositivos en el NIT Correspondiente ");
                                }
                            }).catch((error) => {
                                console.error("Error Final :", error.message);
                            });
                        })
                            .catch((error) => {
                            console.error("Error Obtener Token==>:", error.message);
                        });          
                    consumer.acknowledge(message);
                    }
            } catch (error) {
            console.error(error);
            clientPulsar.close();
            }        
        }        
  }
  /*Función que obtiene los datos del pulsar consumidor */
  consumeMessages().catch((error) => {
    console.error('Error en el consumidor:', error);
  });

// AVISOS  push 
// Mensajeria de aviso
async function consumeMessagesPulsarAvisos() {
    const clientPulsar = new pulsar.Client({
      serviceUrl,
      operationTimeoutSeconds: 30,
    });

    const consumer = await clientPulsar.subscribe({
        topic: `persistent://${tenant}/${namespace}/${topicPulsarAvisos}`,
        subscription: 'suscripcion_3', 
        subscriptionType: "Exclusive",
      });    
      console.log("Entra en pulsar ==> Gary ");

      try {
          console.log("Entra en pulsar ==> Gary try ==> " );
          while (true) {
              const  message = await consumer.receive();  // AvisosPush{"avisoPushId":
              console.log(" Datos del mensaje de avisos ==>   "   + message.getData())
              const messageText = message.getData().toString();        
              console.log(" El mensaje de datos de mensajeriaSER Avisos Pulsar " , messageText );
              
              const startIndex = messageText.indexOf('AvisosPush');
              const jsonString = messageText.substring(startIndex + 'AvisosPush'.length);
              console.log(" Prfasd  =>  " + jsonString);
              mensaje_pulsar_avisos = JSON.parse(jsonString);
              console.log(" GaryDatos ==>  ", mensaje_pulsar_avisos);
              console.log(" Prfasd AAAAA =>  ", mensaje_pulsar_avisos.nit);              
              avisosPulsar = mensaje_pulsar_avisos.avisos;
              console.log("Datos_prueba_control_solo_pulsar  => ",  avisosPulsar);

              let objAvisos = {"idAviso": mensaje_pulsar_avisos.idAviso, "archivoPdf": avisosPulsar.archivoPdf};
                      
              const API_URL_Lista_Usuario = "http://localhost:39559/api/dispositivo/buscarXNit/"+mensaje_pulsar_avisos.nit;
              console.log(" URL Lista De Usuario entrando al CONSUMER ==>  ");
              console.log(API_URL_Lista_Usuario);

              // De aqui obtengo el NIT Correspondiente para las notificaciones.
      
              const API_URL_TOKEN = "https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000";
              getToken(API_URL_TOKEN)
                  .then((responseTokenD) => {                        
                      responseToken = JSON.parse(responseTokenD)            
                      const tokenRespuesta = responseToken.token;
                      usuarioTokenDtos = [];  
                  getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
                      .then((response) => {
                      console.log("Respuesta Final ")
                      console.log("Respuesta:", response);
                      listaDispositivos = JSON.parse(response);
                      console.log("  ---------------------- Prueba de respuesta FINAL ------------------------------ "); 
                      console.log(listaDispositivos)
                      console.log(" Dato");
                      usuarioTokenDtos = listaDispositivos.usuarioTokenDtos
                      console.log(usuarioTokenDtos);
                      console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Longitud----- "  + usuarioTokenDtos.length );
                      console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Datos----- " ,  usuarioTokenDtos );
                      
                      //console.log("Tamaño del array ==> " + usuarioTokenDtos.length: + "  Datos_ Nombre del Dispositivo ==> " + usuarioTokenDtos[0].nombreDispositivo );
                      
                      if(usuarioTokenDtos.length > 0){                            
                          envioPhoneAvisos.arrayImei = [];
                          usuarioTokenDtos.forEach(element => {
                              modeloNoti = element;
                              if(modeloNoti.imei != "" ){
                                  if(modeloNoti.tokenPush == "ACTIVO"){
                                      envioPhoneAvisos.arrayImei.push(modeloNoti.imei);
                                  }
                                  
                              }
                          });

                          console.log(" GaryMorgaNotificacion ==> ", envioPhoneAvisos );
                          usuarioTokenDtos.forEach(element => { // El  usuarioTokenDtos es la lista de dispositivos // Serian una 6 veces pero va a mandar 
                              modeloNoti = element;                                
                              console.log(modeloNoti);
                              console.log("--- Noitiicasd --- ");
                              console.log(modeloNoti.tokenPush);
                              if(modeloNoti.webId != ""){
                                  //envioNotificacion(element.endPointWeb, element.keyWeb, element.authWeb);
                                  if(modeloNoti.tokenPush == "ACTIVO"){
                                      console.log("ENVIANDO NOTIFICAION PARA WEB");                                
                                      // Enviar mensaje idNOtificacion , mensaje_pulsar_avisos.idNotificacion
                                      // mensaje_pulsar_avisos.
                                      envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensaje_pulsar_avisos.cabecera, mensaje_pulsar_avisos.cuerpo, "Ir a ver la notificación", objAvisos, "avisos");
                                      //envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensaje_pulsar_avisos.cabecera, mensaje_pulsar_avisos.cuerpo, "Ir a ver la notificación", "https://desasiat.impuestos.gob.bo/notificaciones/con/notificaciones", objEnvioNotificacion);
                                  }                    
                              }else{
                                  // console.log("ENVIANDO NOTIFICACION PARA MOVIL_ tamaño=> ", usuarioTokenDtos.length); // 2063982011                                     
                                  if(modeloNoti.imei != ""){
                                      console.log("Entra a IMEI ==> " + modeloNoti.imei + " ============> para enviar notificaciones <================")
                                      if(modeloNoti.tokenPush == "ACTIVO"){                        
                                          envioPhoneAvisos.idAvisos = mensaje_pulsar_avisos.idAviso;   
                                          console.log(" GaryMorgaNotificacion Other ====> ", envioPhoneAvisos.length + " Datos ==>  ", envioPhoneAvisos );                                                     
                                          console.log(" nit ", mensaje_pulsar_avisos.nit  , " ===> ");
                                          console.log("Envia Movil ===> " +  mensaje_pulsar_avisos.nit);
                                          const strNitImei = mensaje_pulsar_avisos.nit + "-" + modeloNoti.imei;
                                          enviarMensajeNotificacionSocket(strNitImei, envioPhoneAvisos)
                                      }
                                  }                                                                                                          
                              }
                          });
                      }else {                            
                          console.log(" No se han encontrado una lista de dispositivos en el NIT Correspondiente ");
                      }
                  }).catch((error) => {
                      console.error("Error Final :", error.message);
                  });
              })
                  .catch((error) => {
                  console.error("Error Obtener Token==>:", error.message);
              });       

          consumer.acknowledge(message);
          }
        } catch (error) {
            console.error(error);
            clientPulsar.close();
        }
}

consumeMessagesPulsarAvisos().catch((error) => {
    console.error('Error en el consumidor mensajeria _ pulsar:', error);
  });


// Funcion para recibir mensajes de pulsar 
async function consumeMessagesMensajeria() {
    const clientPulsar = new pulsar.Client({
      serviceUrl,
      operationTimeoutSeconds: 30,
    });
    const consumer = await clientPulsar.subscribe({
        topic: `persistent://${tenant}/${namespacePulsarMensajeria}/${topicPulsarMensajeria}`,
        subscription: 'suscripcion_3', 
        subscriptionType: "Exclusive",
      });    
        // console.log('Consumidor conectado.');
        console.log("Entra en pulsar ==> Gary ");
        try {
            console.log("Entra en pulsar ==> Gary try ==> " );
            while (true) {
                const  message = await consumer.receive();  // AvisosPush{"avisoPushId":
                console.log(" Datos del mensaje PULSARRR ==>   "   + message.getData())
                const messageText = message.getData().toString();        

                console.log(" El mensaje de datos de mensajeria " , messageText );

                const startIndex = messageText.indexOf('MensajeriaPush');
                const jsonString = messageText.substring(startIndex + 'MensajeriaPush'.length);
                console.log(" Prfasd  =>  " + jsonString);
                mensajeriaPulsar = JSON.parse(jsonString);
                console.log(" GaryDatos ==>  ", mensajeriaPulsar);                
                console.log(" Mensajeria_de_control =>  ", mensajeriaPulsar.nit);
                                            
                const API_URL_Lista_Usuario = "http://localhost:39559/api/dispositivo/buscarXNit/"+mensajeriaPulsar.nit;
                console.log(" URL Lista De Usuario entrando al CONSUMER ==>  ");
                console.log(API_URL_Lista_Usuario);
                        
                const API_URL_TOKEN = "https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000";
                getToken(API_URL_TOKEN)
                    .then((responseTokenD) => {                        
                        responseToken = JSON.parse(responseTokenD)            
                        const tokenRespuesta = responseToken.token;
                        usuarioTokenDtos = [];  
                    getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
                        .then((response) => {
                        console.log("Respuesta Final ")
                        console.log("Respuesta:", response);
                        listaDispositivos = JSON.parse(response);
                        console.log("  ---------------------- Prueba de respuesta FINAL ------------------------------ "); 
                        console.log(listaDispositivos)
                        console.log(" Dato");
                        usuarioTokenDtos = listaDispositivos.usuarioTokenDtos
                        console.log(usuarioTokenDtos);
                        console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Longitud----- "  + usuarioTokenDtos.length );
                        console.log("  ----- usuarioTºokenDtos usuarioTokenDtos usuarioTokenDtos  Datos----- " ,  usuarioTokenDtos );
                        
                        //console.log("Tamaño del array ==> " + usuarioTokenDtos.length: + "  Datos_ Nombre del Dispositivo ==> " + usuarioTokenDtos[0].nombreDispositivo );
                        
                        if(usuarioTokenDtos.length > 0){                            
                            envioPhone.arrayImei = [];
                            usuarioTokenDtos.forEach(element => {
                                modeloNoti = element;
                                if(modeloNoti.imei != "" ){
                                    if(modeloNoti.tokenPush == "ACTIVO"){
                                        envioPhone.arrayImei.push(modeloNoti.imei);
                                    }
                                    
                                }
                            });

                            console.log(" GaryMorgaNotificacion ==> ", envioPhone );
                            usuarioTokenDtos.forEach(element => { // El  usuarioTokenDtos es la lista de dispositivos // Serian una 6 veces pero va a mandar 
                                modeloNoti = element;                                
                                console.log(modeloNoti);
                                console.log("--- Noitiicasd --- ");
                                console.log(modeloNoti.tokenPush);
                                if(modeloNoti.webId != ""){
                                    //envioNotificacion(element.endPointWeb, element.keyWeb, element.authWeb);
                                    if(modeloNoti.tokenPush == "ACTIVO"){
                                        console.log("ENVIANDO NOTIFICAION PARA WEB");                                
                                        // Enviar mensaje idNOtificacion , mensajeriaPulsar.idNotificacion
                                        // mensajeriaPulsar.
                                        envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensajeriaPulsar.cabecera, mensajeriaPulsar.cuerpo, "Ir a ver la notificación",  {} , "mensajeria");
                                        //envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb,modeloNoti.authWeb, mensajeriaPulsar.cabecera, mensajeriaPulsar.cuerpo, "Ir a ver la notificación", "https://desasiat.impuestos.gob.bo/notificaciones/con/notificaciones", objEnvioNotificacion);
                                    }                    
                                }else{
                                    console.log("ENVIANDO NOTIFICACION PARA MOVIL_ tamaño=> ", usuarioTokenDtos.length); // 2063982011     
                                    // TODO Pruebas                        
                                    if(modeloNoti.imei != ""){
                                        console.log("Entra a IMEI ==> " + modeloNoti.imei + " ============> para enviar notificaciones <================")
                                        if(modeloNoti.tokenPush == "ACTIVO"){                        
                                            envioPhone.idNotificacion = mensajeriaPulsar.idNotificacion;   
                                            console.log(" GaryMorgaNotificacion Other ====> ", envioPhone.length + " Datos ==>  ", envioPhone );                                                     
                                            console.log(" nit ", mensajeriaPulsar.nit  , " ===> ");
                                            console.log("Envia Movil ===> " +  mensajeriaPulsar.nit);
                                            const strNitImei = mensajeriaPulsar.nit + "-" + modeloNoti.imei;
                                            enviarMensajeNotificacionSocket(strNitImei, envioPhone)
                                        }
                                    }                                                                                                          
                                }
                            });
                        }else {                            
                            console.log(" No se han encontrado una lista de dispositivos en el NIT Correspondiente ");
                        }
                    }).catch((error) => {
                        console.error("Error Final :", error.message);
                    });
                })
                    .catch((error) => {
                    console.error("Error Obtener Token==>:", error.message);
                });    
            consumer.acknowledge(message);
            }
    } catch (error) {
      console.error(error);
      clientPulsar.close();
    }
  }

  consumeMessagesMensajeria().catch((error) => {
    console.error('Error en el consumidor mensajeria:', error);
  });


httpServer.listen(process.env.PORT , ()=> {
    console.log('Servidor a la espera de conexion ', process.env.PORT);
})


/**
 * @author GaryMorga
 * @description Esta funcion envia la notificación con los datos de WEBPUSH de compra  
 */
function envioNotificacion(endPointWeb, keyWeb, authWeb, cabecera, cuerpo, mensajeVerAvisos, objEnvioNotificacion, tipo ){
    console.log("EndPointWeb  ==>  " + endPointWeb );
    console.log("keyWeb ==> " + keyWeb );
    console.log("authWeb ==> " + authWeb );
    console.log("objEnvioNotificacion ====> " ,  objEnvioNotificacion);
    console.log("tipo envio de notificacion ==>  " + tipo ) 
    
    // http://localhost:4200/con/notificaciones/651a3ea13fcea25424bfd31c/651a3ea13fcea25424bfd31a/undefined/AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL
    // http://localhost:4200/con/notificaciones/651a43743fcea25424bfd321/651a43743fcea25424bfd31f/undefined/AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL
    // const ruta = `con/notificaciones/${pIdNotificacion}/${idArchivo}/${estado}/${actoAdminstrativo}`;
    //let objEnvioNotificacion = { "archivoAduntoId": notificaciones_electronicas.archivoAdjuntoActuadoId, "estadoId": mensajeNotificacionKafka.estadoId }
    let urlPDF =""
    if(tipo === "notificacion"){
        urlPDF = `http://localhost:4200/con/notificaciones/${objEnvioNotificacion.idNotificacion}/${objEnvioNotificacion.archivoAduntoId}/${objEnvioNotificacion.estadoId}/${objEnvioNotificacion.actoadministrativo}`; 
        console.log("Url_PDF notificaciones =>  ", urlPDF )
    }else {
        if(tipo === "avisos"){        
            urlPDF = `http://localhost:4200/con/listaAvisos/${objEnvioNotificacion.idAviso}/${objEnvioNotificacion.archivoPdf}`
            console.log("Url_PDF Avisos =>  ", urlPDF )
        }else {
            urlPDF = "Url que solo redirecciona al listado de mensajes "
        }
    }
    
    const pushSubscription = {
        endpoint: endPointWeb, "expirationTime": null,
        keys: {
            auth: authWeb,
            p256dh: keyWeb
        }
    };
    const payload = {
        "notification": {
            "title": cabecera,
            "body": cuerpo,
            "vibrate": [100, 50, 100],
            "actions": [
                {
                    "action": "reply",
                    "title": mensajeVerAvisos,
                    "type": "text"
                },
            ],
            "data": {                
                "onActionClick": {                    
                    "reply": {
                        "operation": "navigateLastFocusedOrOpen",
                        "url": urlPDF                   
                    }
                }                       
            },
            
        }
    }
    // "dato": objEnvioNotificacion,

    /*    
    "data": {
                "dato": objEnvioNotificacion,
                         
            },
    */

    /* "onActionClick": {                    
        "reply": {
            "operation": "navigateLastFocusedOrOpen",
            "url": "https://desasiat.impuestos.gob.bo/notificaciones/con/notificaciones"                   
        }
    } */

    /* "data": {
        dato: idNotificacion          
    }, */

   /*  "data": {
                "onActionClick": {                    
                    "reply": {
                        "operation": "navigateLastFocusedOrOpen",
                        "url": urlAvisosNotificaciones
                        // http://localhost:4200/notificacionespdf;notificacionElectronicaId=64d6b285781f096caa6edc18;nroActoAdministrativo=312300000054;actoAdministrativo=AUTO%20INICIAL%20DE%20SUMARIO%20CONTRAVENCIONAL;fechaActoAdministrativo=2023-08-01T11:27:05.209;archivoAdjuntoActuadoId=64d6b285781f096caa6edc16;cantidadLecturas=0;fechaEnvioNotificacion=2023-08-11T18:13:25.257;estadoNotificacionElectronicaId=1461
                        //"url": "http://localhost:4200/con/notificaciones/"
                    }
                }
    }, */
    webpush.sendNotification(
        pushSubscription,
        JSON.stringify(payload))
        .then(res => {
            console.log('Enviado Mensaje !!');
        }).catch(err => {
            console.log("Error envio ==> ", err);
        })
}

/**
 * @author GaryMorga
 * @description Esta funcion obtiene el Token del servicio
 */
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

/**
 * @author GaryMorga
 * @description Esta funcion obtiene el listado de usuarios del servicio
 */
function getListaDeUsuarioDispositivos(token, pUrlRespuestaUsuario) {    
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