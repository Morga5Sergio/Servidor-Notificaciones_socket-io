import { Console, log } from 'console'
import indexRoutes from './routes/test.routes'
import uniqueRandomNumberWithText from './util/uuid.util'
import { DefaultDeserializer } from 'v8'
require('dotenv').config()
console.log('uniqueRandomNumberWithText =============>', uniqueRandomNumberWithText)

const { Client } = require('pulsar-client')
const express = require('express')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const app = express()
const webpush = require('web-push')
const pulsar = require('pulsar-client')
const config = require('../src/config')
const serviceUrl = config.PULSAR_BROKERS;
const tenant = 'local';
const namespace = 'sad_not'
const topicPulsarAvisos = 'aviso'
const topicPulsar = 'notificacion'
const namespacePulsarMensajeria = 'sad_men'
const topicPulsarMensajeria = 'mensajeria'
const os = require('os');
const cors = require('cors');
const vapidKeys = {
  publicKey: config.PUBLIC_KEY,
  privateKey: config.PRIVATE_KEY
}

webpush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey)

let mensajeNotificacionPulsar = require('./models/mensaje_notificacion_pulsar')
let mensajeriaPulsar = require('./models/mensaje_pulsar')
let mensaje_pulsar_avisos = require('./models/mensaje_pulsar_avisos')
let avisosPulsar = require('./models/avisos')
let notificaciones_electronicas = require('./models/notificaciones_electronicas')
let responseToken = require('./models/token_model')
let listaDispositivos = require('./models/lista_dispositivos')
let modeloNoti = require('./models/modelos_noti')

let envioPhoneNotificacion = { 'idNotificacion': '', 'tipo': 'notificacion' }
let envioPhoneAvisos = { 'idNotificacion': '', 'tipo': 'avisos' }
let envioPhoneMensajeria = { 'idNotificacion': '', 'tipo': 'mensajeria' }

app.use(cors({
  origin: 'https://desasiatservicios.impuestos.gob.bo/sad-socket-test', // Reemplaza con tu dominio permitido
  methods: ['GET', 'POST']
}));
const httpServer = createServer(app)

let arrDispositivos = []

  const io = new Server(httpServer, { 
    cors: { origin: ['*']}
  })
  app.use(express.static(path.join(__dirname, 'views')))
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  })

const _connect = require('./dbConnection/connection')
_connect()
var XMLHttpRequest = require('xhr2')
const xhr = new XMLHttpRequest()

console.log(" Variables de configuración en environment ==> ",  config);
io.on('connection', socket => {
  console.log('Clientes conectados: ', io.engine.clientsCount, ' id ' + socket.id)

  socket.on('disconnect', () => {
    console.log('Cliente desconectado.')
    console.log('El cliente ' + socket.id + ' se ha desconectado ')
  })

  socket.on('error', err => {
    console.log("Error de conexión ", err.message);
  });

  socket.on("pulsar",  msaPulsar => {
    console.log(" Mensaje entrante==>  ", msaPulsar );
  })
})  
 // * Funcion que reenvia los msj de notificaciones al celular 
function enviarMensajeNotificacionSocket(datosNit, envioPhone) {
  console.log('Enviar al cel: nit + imael=> ' + datosNit + " Datos envio Socket  " + envioPhone);
  try {
    io.emit(datosNit, envioPhone)  
  } catch (error) {
    console.log( "erro => io emit ", error );
  }
}

// ? ***************************** Metodo consumeMessages Notificaciones *****************
async function consumeMessages() {
  const clientPulsar = new pulsar.Client({
    serviceUrl,
    operationTimeoutSeconds: 30
  })

  console.log(" clientPulsar notificaciones ==> " , clientPulsar );

  const consumer = await clientPulsar.subscribe({
    topic: `persistent://${tenant}/${namespace}/${topicPulsar}`,
    subscription: `${uniqueRandomNumberWithText}`,
    subscriptionType: 'Shared'
  })
  console.log(" Consumidor pulsar  " , consumer ); 
  if (topicPulsar === 'notificacion') {
    try {
      while (true) {
        const message = await consumer.receive()
        const messageText = message.getData().toString()
        const startIndex = messageText.indexOf('NotificacionesPush')
        const jsonString = messageText.substring(startIndex + 'NotificacionesPush'.length)

        // Despues de procesar el mensaje, confirmar que se ha procesado correctamente
        await consumer.acknowledge(message); 
        mensajeNotificacionPulsar = JSON.parse(jsonString)
        console.log('mensajeNotificacionPulsar ==>', mensajeNotificacionPulsar)
        notificaciones_electronicas = mensajeNotificacionPulsar.notificacionesElectronicas
        console.log(' Datos notificaciones_electronicas ==>', mensajeNotificacionPulsar)
        let objEnvioNotificacion = {
          idNotificacion: mensajeNotificacionPulsar.idNotificacion,
          actoadministrativo: notificaciones_electronicas.actoAdministrativo,
          archivoAduntoId: notificaciones_electronicas.archivoAdjuntoActuadoId,
          estadoId: mensajeNotificacionPulsar.estadoNotificacion
        }

        const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/` + mensajeNotificacionPulsar.nit
        const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
        
        console.log("API TOKEN Generico ==> " + API_URL_TOKEN );
        try {
          const responseTokenD = await getToken(API_URL_TOKEN)
          responseToken = JSON.parse(responseTokenD)
          const tokenRespuesta = responseToken.token
          arrDispositivos = []

          try {
            const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)

            listaDispositivos = JSON.parse(response)
         
            console.log('Repuesta del consumo del listado de dispositivos: ' + listaDispositivos)
            arrDispositivos = listaDispositivos.dispositivos
            console.log('  ---------------------- Array Dispositivos ------------------------------ ')
            console.log('Longitud Array Dispositivos ===>  ' + arrDispositivos.length)
            console.log(' Array Dispositivos ===>  ', arrDispositivos)

            if (arrDispositivos.length > 0) {                    
              arrDispositivos.forEach(element => {
                modeloNoti = element
                console.log(modeloNoti)
                console.log('--- Noitiicasd --- ')
                console.log(modeloNoti.tokenPush)
                if (modeloNoti.webId != null) {
                  if (modeloNoti.descripcionEstado === 'ACTIVO') {
                    console.log('ENVIANDO NOTIFICACION PARA WEB')
                    envioNotificacion(
                      modeloNoti.endPointWeb,
                      modeloNoti.keyWeb,
                      modeloNoti.authWeb,
                      mensajeNotificacionPulsar.cabecera,
                      mensajeNotificacionPulsar.cuerpo,
                      'Ir a ver la notificación',
                      objEnvioNotificacion,
                      'notificacion'
                    )
                  }
                } else {                  
                  if (modeloNoti.imei != '' && modeloNoti.descripcionEstado === 'ACTIVO') {
                    console.log('ENVIANDO NOTIFICACION PARA MOVIL_ IMEI=> ', modeloNoti.imei , " Nombre del dispositivos==> " , modeloNoti.nombreDispositivo  );                    
                    envioPhoneNotificacion.idNotificacion = mensajeNotificacionPulsar.idNotificacion                    
                    const strNitImei = mensajeNotificacionPulsar.nit + '-' + modeloNoti.imei
                    console.log(' NIT-IMEI ===> ' + mensajeNotificacionPulsar.nit)
                    console.log(" Envio_Socket_datos =>  ",  envioPhoneNotificacion);
                    enviarMensajeNotificacionSocket(strNitImei, envioPhoneNotificacion)
                  }
                }
              })
            } else {
              console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente==> ' + mensajeNotificacionPulsar.nit);
            }
          } catch (error) {
            console.error('Error Final :', error.message)
          }
        } catch (error) {
          console.error('Error Obtener Token==>:', error.message)
        }
        consumer.acknowledge(message)
      }
    } catch (error) {
      console.error( "Error al ",  error  + " Error cliente pulsar ");
      consumer.negativeAcknowledge(message)
      clientPulsar.close()
    }
  }
}

// 
consumeMessages().catch(error => {
  console.error('Error en el consumidor:', error)
})

// ? ***************************** Metodo consumeMessagesPulsarAvisos *****************
async function consumeMessagesPulsarAvisos() {
  const clientPulsar = new pulsar.Client({
    serviceUrl,
    operationTimeoutSeconds: 30
  })

  const consumer = await clientPulsar.subscribe({
    topic: `persistent://${tenant}/${namespace}/${topicPulsarAvisos}`,
    subscription: `${uniqueRandomNumberWithText}`,
    subscriptionType: 'Shared'
  })

  try {
    while (true) {
      const message = await consumer.receive()
      const messageText = message.getData().toString()
      await consumer.acknowledge(message);
      const startIndex = messageText.indexOf('AvisosPush')
      const jsonString = messageText.substring(startIndex + 'AvisosPush'.length)
      mensaje_pulsar_avisos = JSON.parse(jsonString)
      console.log('Mensaje pulsar avisos ==>  '+ mensaje_pulsar_avisos)
      avisosPulsar = mensaje_pulsar_avisos.avisos
      console.log('Datos avisosPulsar  => ', avisosPulsar)

      let objAvisos = { idAviso: mensaje_pulsar_avisos.idAviso, archivoPdf: avisosPulsar.archivoPdf }

      const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/` + mensaje_pulsar_avisos.nit
      console.log(' URL Lista De Usuario entrando al CONSUMER ==>  ', API_URL_Lista_Usuario)

      const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
      const responseTokenD = await getToken(API_URL_TOKEN)
      const responseToken = JSON.parse(responseTokenD)
      const tokenRespuesta = responseToken.token
      arrDispositivos = []

      const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
      console.log('Dispositivos Avisos =>  ', response)

      listaDispositivos = JSON.parse(response)
      console.log("  dispositivo- transaccion " + listaDispositivos.transaccion + "  dispositivo- mensaje " + listaDispositivos.mensaje)
      
      arrDispositivos = listaDispositivos.dispositivos
      console.log(arrDispositivos)
      console.log('  AVISOS arrDispositivos  Longitud----- ' + arrDispositivos.length)
      console.log('  AVISOS arrDispositivos  Datos----- ', arrDispositivos)

      if (arrDispositivos.length > 0) {            
        arrDispositivos.forEach(element => {
          modeloNoti = element
          console.log(" Elemento AVISO => " + modeloNoti)
          
          console.log(" Elemento AVISO  modeloNoti.webId => " + modeloNoti + "  modeloNoti.descripcionEstado " + modeloNoti.descripcionEstado);
          if (modeloNoti.webId != null) {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              console.log('ENVIANDO NOTIFICAION PARA WEB')
              envioNotificacion(
                modeloNoti.endPointWeb,
                modeloNoti.keyWeb,
                modeloNoti.authWeb,
                mensaje_pulsar_avisos.cabecera,
                mensaje_pulsar_avisos.cuerpo,
                'Ir a ver el Aviso',
                objAvisos,
                'avisos'
              )
            }
          } else {
            if (modeloNoti.imei != '') {
              console.log( '  avisos - IMEI ==> ' + modeloNoti.imei );
              if (modeloNoti.descripcionEstado == 'ACTIVO') {
                envioPhoneAvisos.idNotificacion = mensaje_pulsar_avisos.idAviso // Id Avisos
                console.log(' avisos mensaje notificacion Datos ==>  ',envioPhoneAvisos)
                console.log(' avisos nit ', mensaje_pulsar_avisos.nit, ' ===> ')
                console.log(' mensaje_pulsar_avisos.nit ' + mensaje_pulsar_avisos.nit)
                const strNitImei = mensaje_pulsar_avisos.nit + '-' + modeloNoti.imei
                enviarMensajeNotificacionSocket(strNitImei, envioPhoneAvisos)
              }
            }
          }
        })
      } else {
        console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
      }
      consumer.acknowledge(message)
    }
  } catch (error) {
    console.error(error)
    consumer.negativeAcknowledge(message)
    clientPulsar.close()
  }
}
// ! Funcion principal 2 llamada
consumeMessagesPulsarAvisos().catch(error => {
  console.error('Error en el consumidor mensajeria _ pulsar:', error)
})

// Notificaciones de mensajeria push
async function consumeMessagesMensajeria() {
  const clientPulsar = new Client({
    serviceUrl,
    operationTimeoutSeconds: 30
  })

  const consumer = await clientPulsar.subscribe({
    topic: `persistent://${tenant}/${namespacePulsarMensajeria}/${topicPulsarMensajeria}`,
    subscription: `${uniqueRandomNumberWithText}`,
    subscriptionType: 'Shared'
  })

  try {
    while (true) {
      const message = await consumer.receive()
      const messageText = message.getData().toString()

      const startIndex = messageText.indexOf('MensajeriaPush')
      const jsonString = messageText.substring(startIndex + 'MensajeriaPush'.length)
      // Despues de procesar el mensaje, confirmar que se ha procesado correctamente
      await consumer.acknowledge(message);
      mensajeriaPulsar = JSON.parse(jsonString)
      console.log("Mensajeria Pulsar", " ==>  " ,  mensajeriaPulsar);
      const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/${mensajeriaPulsar.nit}`

      const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
      const responseTokenD = await getToken(API_URL_TOKEN)
      const responseToken = JSON.parse(responseTokenD)
      const tokenRespuesta = responseToken.token
      arrDispositivos = []

      const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)

      listaDispositivos = JSON.parse(response)
      console.log(" listaDispositivos.transaccion " + listaDispositivos.transaccion + "  listaDispositivos.mensaje " +  listaDispositivos.mensaje );
      arrDispositivos = listaDispositivos.dispositivos
      console.log(" mensajeria arrDispositivos.length => "+ arrDispositivos.length);
      console.log(" mensajeria push arrDispositivos => " + arrDispositivos );
      if (arrDispositivos.length > 0) {      
        arrDispositivos.forEach(element => {
          modeloNoti = element
          if (modeloNoti.webId != null) {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              envioNotificacion(modeloNoti.endPointWeb,modeloNoti.keyWeb,modeloNoti.authWeb,mensajeriaPulsar.cabecera,mensajeriaPulsar.cuerpo,'Ir a mensajeria',{},'mensajeria')
            }
          } else {
            if (modeloNoti.imei != '') {
              if (modeloNoti.descripcionEstado == 'ACTIVO') {
                envioPhoneMensajeria.idNotificacion = mensajeriaPulsar.idMensaje
                console.log(' MensajeriaPush mensaje notificacion Datos ==>  ',envioPhoneMensajeria)                
                console.log(' mensaje_pulsar_mensajeria.nit ' + mensajeriaPulsar.nit)
                const strNitImei = mensajeriaPulsar.nit + '-' + modeloNoti.imei
                console.log("Envio mensajeria push => ", envioPhoneMensajeria , " Mensajeria Push ==> " , strNitImei );
                enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
              }
            }
          }
        })
      } else {
        console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
      }
      consumer.acknowledge(message)
    }
  } catch (error) {
    console.error(error)
    consumer.negativeAcknowledge(message)
    clientPulsar.close()
  }
}
//  ***************************** Metodo consumeMessagesMensajeria *****************
consumeMessagesMensajeria().catch(error => {
  console.error('Error en el consumidor mensajeria:', error)
})

//  ***************************** Muestra las IPS de RED *****************
const networkInterfaces = os.networkInterfaces();
console.log( " NetworkInterfaces ==> " , networkInterfaces)

httpServer.listen(process.env.PORT, () => {
  console.log('Servidor a la espera de conexion ', config.PORT)
  
})



// * MEJORADO ------------> util
function envioNotificacion(
  endPointWeb,
  keyWeb,
  authWeb,
  cabecera,
  cuerpo,
  mensajeVerAvisos,
  objEnvioNotificacion,
  tipo
) {
  let urlPDF = ''

  if (tipo === 'notificacion') {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/notificaciones/${objEnvioNotificacion.idNotificacion}/${objEnvioNotificacion.archivoAduntoId}/${objEnvioNotificacion.estadoId}/${objEnvioNotificacion.actoadministrativo}`
    //urlPDF = `https://desasiat.impuestos.gob.bo/notificaciones/con/notificaciones/${objEnvioNotificacion.idNotificacion}/${objEnvioNotificacion.archivoAduntoId}/${objEnvioNotificacion.estadoId}/${objEnvioNotificacion.actoadministrativo}`
    console.log('Url_PDF notificaciones =>  ', urlPDF)
  } else if (tipo === 'avisos') {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/listaAvisos/${objEnvioNotificacion.idAviso}/${objEnvioNotificacion.archivoPdf}`
    // urlPDF = `https://desasiat.impuestos.gob.bo/notificaciones/con/listaAvisos/${objEnvioNotificacion.idAviso}/${objEnvioNotificacion.archivoPdf}`    
    console.log('Url_PDF Avisos =>  ', urlPDF)
  } else {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/mensajeria`
    // urlPDF = 'https://desasiat.impuestos.gob.bo/notificaciones/con/mensajeria'
    console.log("Ruta ==> " , urlPDF);
  }

  const pushSubscription = {
    endpoint: endPointWeb,
    expirationTime: null,
    keys: {
      auth: authWeb,
      p256dh: keyWeb
    }
  }

  const payload = {
    notification: {
      title: cabecera,
      body: cuerpo,
      vibrate: [100, 50, 100],
      actions: [
        {
          action: 'reply',
          title: mensajeVerAvisos,
          type: 'text'
        }
      ],
      data: {
        onActionClick: {
          reply: {
            operation: 'navigateLastFocusedOrOpen',
            url: urlPDF
          }
        }
      }
    }
  }

  webpush.sendNotification(pushSubscription, JSON.stringify(payload))
    .then(res => {
      console.log('Enviado Mensaje !!')
    })
    .catch(err => {
      console.log('Error envio ==> ', err)
    })
}

// * MEJORANDO funciones getToken y getListaDeUsuarioDispositivos
function makeHttpRequest(method, url, token) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    if (token) {
      xhr.setRequestHeader('Authorization', 'Token ' + token)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText)
      } else {
        reject(new Error(`Error en la solicitud: ${xhr.statusText}`))
      }
    }
    xhr.onerror = () => {
      reject(new Error('Error en la solicitud'))
    }
    xhr.send()
  })
}

function getListaDeUsuarioDispositivos(token, pUrlRespuestaUsuario) {
  console.log('Entrando al makeHttpRequest ==> ' + pUrlRespuestaUsuario)
  return makeHttpRequest('GET', pUrlRespuestaUsuario, token)
}

function getToken(pApiUrlToken) {
  return makeHttpRequest('GET', pApiUrlToken)
}



// const indexRoutes = require('./routes/test.routes')
// routes
app.use(indexRoutes)
