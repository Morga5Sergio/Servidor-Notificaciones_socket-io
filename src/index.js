import indexRoutes from './routes/test.routes'
require('dotenv').config()
const { Client } = require('pulsar-client')
const express = require('express')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const app = express()
const webpush = require('web-push')
const config = require('../src/config')
const os = require('os');
const cors = require('cors');

const vapidKeys = {
  publicKey: config.PUBLIC_KEY,
  privateKey: config.PRIVATE_KEY
}

webpush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey)

/**
  * @author GaryMorga
  * @description DTOS para mensajeria
  */
let mensajeriaPulsar = require('./models/mensaje_pulsar')
let listaDispositivos = require('./models/lista_dispositivos')
let modeloNoti = require('./models/modelos_noti')
let envioPhoneMensajeria = { 'idNotificacion': '', 'tipo': 'mensajeria', 'cabezera':'', 'cuerpo':''}

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
    console.log("Error de conexión ", JSON.stringify(err.message));
  });

  socket.on("pulsar",  msaPulsar => {
    console.log(" Mensaje entrante==>  ", JSON.stringify(msaPulsar) );
  })
})  
 /**
  * @author GaryMorga
  * @description Funcion que reenvia los msj de notificaciones al celular 
  * @datos datosNit = nit-imei , envioPhone =  {'idNotificacion': '', 'tipo': 'notificacion','cabezera':'', 'cuerpo':''}
  */
function enviarMensajeNotificacionSocket(datosNit, envioPhone) {
  console.log('Enviar al cel: nit + imael=> ' + JSON.stringify(datosNit) + " Datos envio Socket  " + JSON.stringify(envioPhone));
  try {
    io.emit(datosNit, envioPhone)  
  } catch (error) {
    console.log( "erro => io emit ", error );
  }
}


async function mensajeriaEnvioPush(objMensajeria){
  mensajeriaPulsar = objMensajeria;
  console.log("Mensajeria Pulsar", " ==>  " +  JSON.stringify(mensajeriaPulsar));
  const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/${mensajeriaPulsar.nit}`

  const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
  const responseTokenD = await getToken(API_URL_TOKEN)
  const responseToken = JSON.parse(responseTokenD)
  console.log("Response Token ======> " + JSON.stringify(responseToken))
  const tokenRespuesta = responseToken.token
  arrDispositivos = []

  const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)

  listaDispositivos = JSON.parse(response)
  if(listaDispositivos?.mensajes[0]?.codigo === 1){
    console.log(" listaDispositivos.transaccion " + listaDispositivos.transaccion + "  listaDispositivos.mensaje " +  JSON.stringify(listaDispositivos.mensajes) );
    arrDispositivos = listaDispositivos.dispositivos
    console.log(" mensajeria arrDispositivos.length => "+ arrDispositivos.length);
    console.log(" mensajeria push arrDispositivos => " + JSON.stringify(arrDispositivos) );
    if (arrDispositivos.length > 0) {      
      arrDispositivos.forEach(element => {
        modeloNoti = element
        if (modeloNoti.webId != null) {
          if (modeloNoti.descripcionEstado == 'ACTIVO') {
            envioNotificacion(modeloNoti.endPointWeb,modeloNoti.keyWeb,modeloNoti.authWeb,mensajeriaPulsar.cabecera,mensajeriaPulsar.cuerpo,'Ir a mensajeria')                      
          }
        } else {
          if (modeloNoti.imei != '') {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              envioPhoneMensajeria.idNotificacion = mensajeriaPulsar.idMensaje
              console.log(' MensajeriaPush mensaje notificacion Datos ==>  '+ JSON.stringify(envioPhoneMensajeria))                
              console.log(' mensaje_pulsar_mensajeria.nit ' + mensajeriaPulsar.nit + " Nombre del dispositivos " + modeloNoti.nombreDispositivo);
              const strNitImei = mensajeriaPulsar.nit + '-' + modeloNoti.imei
              console.log("Envio mensajeria push => "+ JSON.stringify(envioPhoneMensajeria) , " Mensajeria Push ==> " + strNitImei );
              console.log("Mensaje Mensajeria => Cabezera ==> " + mensajeriaPulsar.cabecera + " Mensaje - Cuerpo  ==> " + mensajeriaPulsar.cuerpo);
              envioPhoneMensajeria.cabezera = mensajeriaPulsar.cabecera;
              envioPhoneMensajeria.cuerpo = mensajeriaPulsar.cuerpo;
              console.log(" envioPhoneMensajeria ==> " + JSON.stringify(envioPhoneMensajeria));
              enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
            }
          }
        }
      })
    } else {
      console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
    }  
  }else {
    console.log(' Error del servicio ListDispositivos ' + listaDispositivos?.mensajes[0]?.descripcion); 
  }


}

//  ***************************** Muestra las IPS de RED *****************
const networkInterfaces = os.networkInterfaces();
console.log( " NetworkInterfaces ==> " , JSON.stringify(networkInterfaces))

httpServer.listen(process.env.PORT, () => {
  console.log('Servidor a la espera de conexion ', config.PORT)
  
})



// * MEJORADO ------------> util
function envioNotificacion(endPointWeb,keyWeb,authWeb,cabecera,cuerpo,mensajeNotificacion) {
  let urlPDF = ''
  urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/mensajeria/true`
  // urlPDF = 'https://desasiat.impuestos.gob.bo/notificaciones/con/mensajeria'
  console.log("Ruta ==> " , urlPDF);

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
          title: mensajeNotificacion,
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

// * Notificaciones de respuesta
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
  console.log('Servicio Lista Dispositivos ==> ' + pUrlRespuestaUsuario)
  return makeHttpRequest('GET', pUrlRespuestaUsuario, token)
}

function getToken(pApiUrlToken) {
  return makeHttpRequest('GET', pApiUrlToken)
}

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

//* Ruta que usa async/await para el envio de informacion MENSAJERIA
app.post('/envio/mensajeria', async (req, res) => {
  try {
    console.log("Datos de mensajer")
    console.log(req.body)
    mensajeriaEnvioPush(req.body)
    res.status(200).json({
      transaccion: true,
      mensajes: [
        {
          codigo: 1,
          descripcion: 'Se envio de forma correcta el mensaje.'
        }
      ]
    }) 
  } catch (error) {
    res.status(200).json({
      transaccion: false,
      mensajes: [
        {
          codigo: -1,
          descripcion: 'Error envio mensajeria.'
        }
      ]
    }) 
  }
});

// const indexRoutes = require('./routes/test.routes')
app.use(indexRoutes)
