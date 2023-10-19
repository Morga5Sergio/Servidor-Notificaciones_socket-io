require('dotenv').config()

const { Client } = require('pulsar-client')
const express = require('express')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const app = express()
const webpush = require('web-push')
const pulsar = require('pulsar-client')

const serviceUrl = 'pulsar://10.1.17.35:6650,10.1.17.36:6650,10.1.17.37:6650'
const tenant = 'desarrollo'
const namespace = 'sad_not'
const topicPulsarAvisos = 'aviso'
const topicPulsar = 'notificacion'
const namespacePulsarMensajeria = 'sad_men'
const topicPulsarMensajeria = 'mensajeria'
const namespacePulsarAvisos = ''

const vapidKeys = {
  publicKey: 'BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg',
  privateKey: '0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc'
}

webpush.setVapidDetails('mailto:example@yourdomain.org', vapidKeys.publicKey, vapidKeys.privateKey)

let mensajeNotificacionKafka = require('./models/mensaje_kafka')
let mensajeriaPulsar = require('./models/mensaje_pulsar')
let mensaje_pulsar_avisos = require('./models/mensaje_pulsar_avisos')
let avisosPulsar = require('./models/avisos')
let notificaciones_electronicas = require('./models/notificaciones_electronicas')
let responseToken = require('./models/token_model')
let listaDispositivos = require('./models/lista_dispositivos')
let modeloNoti = require('./models/modelos_noti')

let envioPhone = { idNotificacion: '', arrayImei: [], tipo: 'notificacion' }
let envioPhoneAvisos = { idAvisos: '', arrayImei: [], tipo: 'avisos' }

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.static(path.join(__dirname, 'views')))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

let arrDispositivos = []

const _connect = require('./dbConnection/connection')
_connect()

var XMLHttpRequest = require('xhr2')
const xhr = new XMLHttpRequest()

io.on('connection', socket => {
  console.log('Clientes conectados: ', io.engine.clientsCount, ' id ' + socket.id)

  socket.on('disconnect', () => {
    console.log('Cliente desconectado.')
    console.log('El cliente ' + socket.id + ' se ha desconectado ')
  })
})

// ? ***************************** Metodo consumeMessages Notificaciones *****************
async function consumeMessages() {
  const clientPulsar = new pulsar.Client({
    serviceUrl,
    operationTimeoutSeconds: 30
  })

  const consumer = await clientPulsar.subscribe({
    topic: `persistent://${tenant}/${namespace}/${topicPulsar}`,
    subscription: 'suscripcion_3',
    subscriptionType: 'Exclusive'
  })

  if (topicPulsar === 'notificacion') {
    try {
      while (true) {
        const message = await consumer.receive()
        const messageText = message.getData().toString()
        const startIndex = messageText.indexOf('NotificacionesPush')
        const jsonString = messageText.substring(startIndex + 'NotificacionesPush'.length)
        mensajeNotificacionKafka = JSON.parse(jsonString)
        notificaciones_electronicas = mensajeNotificacionKafka.notificacionesElectronicas
        let objEnvioNotificacion = {
          idNotificacion: mensajeNotificacionKafka.idNotificacion,
          actoadministrativo: notificaciones_electronicas.actoAdministrativo,
          archivoAduntoId: notificaciones_electronicas.archivoAdjuntoActuadoId,
          estadoId: mensajeNotificacionKafka.estadoNotificacion
        }

        const API_URL_Lista_Usuario = 'http://localhost:39559/api/dispositivo/buscarXNit/' + mensajeNotificacionKafka.nit
        const API_URL_TOKEN = 'https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000'

        try {
          const responseTokenD = await getToken(API_URL_TOKEN)
          responseToken = JSON.parse(responseTokenD)
          const tokenRespuesta = responseToken.token
          arrDispositivos = []

          try {
            const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)        
            console.log('Respuesta: FINAL', response)

            listaDispositivos = JSON.parse(response)
            console.log('  ---------------------- Array Dispositivos ------------------------------ ')
            console.log(listaDispositivos)
            console.log(' Dato')
            arrDispositivos = listaDispositivos.dispositivos            
            console.log('Longitud Array Dispositivos ===>  ' + arrDispositivos.length)
            console.log(' Array Dispositivos ===>  ', arrDispositivos)

            if (arrDispositivos.length > 0) {
              envioPhone.arrayImei = []
              arrDispositivos.forEach(element => {
                modeloNoti = element
                if (modeloNoti.imei != '' && modeloNoti.tokenPush === 'ACTIVO') {
                  envioPhone.arrayImei.push(modeloNoti.imei)
                }
              })

              console.log(' GaryMorgaNotificacion ==> ', envioPhone)
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
                      mensajeNotificacionKafka.cabecera,
                      mensajeNotificacionKafka.cuerpo,
                      'Ir a ver la notificación',
                      objEnvioNotificacion,
                      'notificacion'
                    )
                  }
                } else {
                  console.log('ENVIANDO NOTIFICACION PARA MOVIL_ tamaño=> ', arrDispositivos.length)
                  if (modeloNoti.imei != '' && modeloNoti.tokenPush === 'ACTIVO') {
                    console.log(
                      'Entra a IMEI ==> ' +
                        modeloNoti.imei +
                        ' ============> para enviar notificaciones <================'
                    )
                    envioPhone.idNotificacion = mensajeNotificacionKafka.idNotificacion
                    console.log(' nit ', mensajeNotificacionKafka.nit, ' ===> ')
                    console.log('Envia Movil ===> ' + mensajeNotificacionKafka.nit)
                    const strNitImei = mensajeNotificacionKafka.nit + '-' + modeloNoti.imei
                    enviarMensajeNotificacionSocket(strNitImei, envioPhone)
                  }
                }
              })
            } else {
              console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
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
      console.error(error)
      clientPulsar.close()
    }
  }
}

// * MEJORADO
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
    subscription: 'suscripcion_3',
    subscriptionType: 'Exclusive'
  })

  try {
    while (true) {
      const message = await consumer.receive()
      console.log(' Datos del mensaje de avisos ==>   ' + message.getData())
      const messageText = message.getData().toString()
      console.log(' El mensaje de datos de mensajeriaSER Avisos Pulsar ', messageText)

      const startIndex = messageText.indexOf('AvisosPush')
      const jsonString = messageText.substring(startIndex + 'AvisosPush'.length)
      console.log(' Prfasd  =>  ' + jsonString)
      mensaje_pulsar_avisos = JSON.parse(jsonString)
      console.log(' GaryDatos ==>  ', mensaje_pulsar_avisos)
      console.log(' Prfasd AAAAA =>  ', mensaje_pulsar_avisos.nit)
      avisosPulsar = mensaje_pulsar_avisos.avisos
      console.log('Datos_prueba_control_solo_pulsar  => ', avisosPulsar)

      let objAvisos = { idAviso: mensaje_pulsar_avisos.idAviso, archivoPdf: avisosPulsar.archivoPdf }

      const API_URL_Lista_Usuario = 'http://localhost:39559/api/dispositivo/buscarXNit/' + mensaje_pulsar_avisos.nit
      console.log(' URL Lista De Usuario entrando al CONSUMER ==>  ')
      console.log(API_URL_Lista_Usuario)

      const API_URL_TOKEN = 'https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000'
      const responseTokenD = await getToken(API_URL_TOKEN)
      const responseToken = JSON.parse(responseTokenD)
      const tokenRespuesta = responseToken.token
      arrDispositivos = []

      const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
      console.log('Respuesta Final ')
      console.log('Respuesta:', response)

      listaDispositivos = JSON.parse(response)
      console.log('  ---------------------- Prueba de respuesta FINAL ------------------------------ ')
      console.log(listaDispositivos)
      console.log(' Dato')
      arrDispositivos = listaDispositivos.dispositivos
      console.log(arrDispositivos)
      console.log(
        '  ----- usuarioTºokenDtos arrDispositivos arrDispositivos  Longitud----- ' + arrDispositivos.length
      )
      console.log('  ----- usuarioTºokenDtos arrDispositivos arrDispositivos  Datos----- ', arrDispositivos)

      if (arrDispositivos.length > 0) {
        envioPhoneAvisos.arrayImei = []
        arrDispositivos.forEach(element => {
          modeloNoti = element
          if (modeloNoti.imei != '') {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              envioPhoneAvisos.arrayImei.push(modeloNoti.imei)
            }
          }
        })

        console.log(' GaryMorgaNotificacion ==> ', envioPhoneAvisos)
        arrDispositivos.forEach(element => {
          modeloNoti = element
          console.log(modeloNoti)
          console.log('--- Noitiicasd --- ')
          console.log(modeloNoti.descripcionEstado)
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
              console.log(
                'Entra a IMEI ==> ' + modeloNoti.imei + ' ============> para enviar notificaciones <================'
              )
              if (modeloNoti.descripcionEstado == 'ACTIVO') {
                envioPhoneAvisos.idAvisos = mensaje_pulsar_avisos.idAviso
                console.log(
                  ' GaryMorgaNotificacion Other ====> ',
                  envioPhoneAvisos.length + ' Datos ==>  ',
                  envioPhoneAvisos
                )
                console.log(' nit ', mensaje_pulsar_avisos.nit, ' ===> ')
                console.log('Envia Movil ===> ' + mensaje_pulsar_avisos.nit)
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
    clientPulsar.close()
  }
}
// ! Funcion principal 2 llamada
consumeMessagesPulsarAvisos().catch(error => {
  console.error('Error en el consumidor mensajeria _ pulsar:', error)
})

// ! esta es la llamada al servidor
httpServer.listen(process.env.PORT, () => {
  console.log('Servidor a la espera de conexion ', process.env.PORT)
})

// ? ***************************** Metodo consumeMessagesMensajeria *****************

// * MEJORADO ------------> util
function enviarMensajeNotificacionSocket(datosNit, envioPhone) {
  console.log('Envia Socket ==>===> ' + mensajeNotificacionKafka.nit + ' fasfsda' + datosNit)
  io.emit(datosNit, envioPhone)
}

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
    urlPDF = `http://localhost:4200/con/notificaciones/${objEnvioNotificacion.idNotificacion}/${objEnvioNotificacion.archivoAduntoId}/${objEnvioNotificacion.estadoId}/${objEnvioNotificacion.actoadministrativo}`
    console.log('Url_PDF notificaciones =>  ', urlPDF)
  } else if (tipo === 'avisos') {
    urlPDF = `http://localhost:4200/con/listaAvisos/${objEnvioNotificacion.idAviso}/${objEnvioNotificacion.archivoPdf}`
    console.log('Url_PDF Avisos =>  ', urlPDF)
  } else {
    urlPDF = 'http://localhost:4200/con/mensajeria'
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

  webpush
    .sendNotification(pushSubscription, JSON.stringify(payload))
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

// * MEJORADO
async function consumeMessagesMensajeria() {
  const clientPulsar = new Client({
    serviceUrl,
    operationTimeoutSeconds: 30
  })

  const consumer = await clientPulsar.subscribe({
    topic: `persistent://${tenant}/${namespacePulsarMensajeria}/${topicPulsarMensajeria}`,
    subscription: 'suscripcion_3',
    subscriptionType: 'Exclusive'
  })

  try {
    while (true) {
      const message = await consumer.receive()
      const messageText = message.getData().toString()

      const startIndex = messageText.indexOf('MensajeriaPush')
      const jsonString = messageText.substring(startIndex + 'MensajeriaPush'.length)
      mensajeriaPulsar = JSON.parse(jsonString)

      const API_URL_Lista_Usuario = `http://localhost:39559/api/dispositivo/buscarXNit/${mensajeriaPulsar.nit}`

      const API_URL_TOKEN = 'https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest/token/getGenerico/1000'
      const responseTokenD = await getToken(API_URL_TOKEN)
      const responseToken = JSON.parse(responseTokenD)
      const tokenRespuesta = responseToken.token
      arrDispositivos = []

      const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)

      listaDispositivos = JSON.parse(response)
      arrDispositivos = listaDispositivos.dispositivos

      if (arrDispositivos.length > 0) {
        envioPhone.arrayImei = []
        arrDispositivos.forEach(element => {
          modeloNoti = element
          if (modeloNoti.imei != '') {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              envioPhone.arrayImei.push(modeloNoti.imei)
            }
          }
        })

        arrDispositivos.forEach(element => {
          modeloNoti = element
          if (modeloNoti.webId != null) {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              envioNotificacion(
                modeloNoti.endPointWeb,
                modeloNoti.keyWeb,
                modeloNoti.authWeb,
                mensajeriaPulsar.cabecera,
                mensajeriaPulsar.cuerpo,
                'Ir a mensajeria',
                {},
                'mensajeria'
              )
            }
          } else {
            if (modeloNoti.imei != '') {
              if (modeloNoti.tokenPush == 'ACTIVO') {
                envioPhone.idNotificacion = mensajeriaPulsar.idNotificacion
                const strNitImei = mensajeriaPulsar.nit + '-' + modeloNoti.imei
                enviarMensajeNotificacionSocket(strNitImei, envioPhone)
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
    clientPulsar.close()
  }
}

// ! Funcion principal 1 llamada
consumeMessagesMensajeria().catch(error => {
  console.error('Error en el consumidor mensajeria:', error)
})
