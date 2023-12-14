import NotificacionesPush from '../src/models/NotificacionesPush'
import SadNotNotificacionesModel from '../src/models/sad_not_notificaciones'  
import SadNotNotificacionesPushModel from '../src/models/sad_not_notificaciones_push'
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
const os = require('os')
const cors = require('cors')
const { ObjectId } = require('mongodb');

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
let envioPhoneMensajeria = { idNotificacion: '', tipo: '', cabezera: '', cuerpo: '', archivoAdjuntoActuadoId: '', estadoNotificacionElectronicoId: '', archivoPdf: '' }

/**
 * @author GaryMorga
 * @description DTOS para notificación
 */
let mensajeNotificacionPulsar = require('./models/mensaje_notificacion_pulsar')
let notificaciones_electronicas = require('./models/notificaciones_electronicas')
let responseToken = require('./models/token_model')

let notificacionEnvio = require('./models/sad_notificaciones')
let notificacionElectronica = require('./models/notificaciones_electronicas_modelo')

let arrayNotificacionMongo = require('./models/sad_notificaciones_modelo_mongo_array')
let notificacionMongo = require('./models/sad_notificaciones_modelo_mongo')
let arrayNotificacionPushMongo = require('./models/sad_notificaciones_push_mongo_array')
let notificacionPushMongo = require('./models/sad_notificaciones_push_mongo_array')
// 

/**
 * @author GaryMorga
 * @description DTOS para AVISOS
 */
let mensaje_pulsar_avisos = require('./models/mensaje_pulsar_avisos')
let avisosPulsar = require('./models/avisos')

// Modelo lista dispositivos.
let listaDispositivos = require('./models/lista_dispositivos')
let modeloNoti = require('./models/modelos_noti')

// * Conextion a la DB
import './util/mongoose'

app.use(
  cors({
    origin: 'https://desasiatservicios.impuestos.gob.bo/sad-socket-test', // Reemplaza con tu dominio permitido
    methods: ['GET', 'POST']
  })
)

const httpServer = createServer(app)

let arrDispositivos = []

const io = new Server(httpServer, {
  cors: { origin: ['*'] }
})
app.use(express.static(path.join(__dirname, 'views')))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

// const _connect = require('./dbConnection/connection')
// _connect()
var XMLHttpRequest = require('xhr2')
const xhr = new XMLHttpRequest()

console.log(' Variables de configuración en environment ==> ', config)
io.on('connection', socket => {
  console.log('Clientes conectados: ', io.engine.clientsCount, ' id ' + socket.id)

  socket.on('disconnect', () => {
    console.log('Cliente desconectado.')
    console.log('El cliente ' + socket.id + ' se ha desconectado ')
  })

  socket.on('error', err => {
    console.log('Error de conexión ', JSON.stringify(err.message))
  })

  socket.on('pulsar', msaPulsar => {
    console.log(' Mensaje entrante==>  ', JSON.stringify(msaPulsar))
  })

  socket.on('reenviar', async nroDocumentoNit => {
    // console.log(' Mensaje entrante==>  ', JSON.stringify(nroDocumentoNit))
    console.log(' Mensaje entrante  ' + nroDocumentoNit)
    await consultarNotificacionesPush (nroDocumentoNit)
  })

})

// {nit:"1020703023", envio_socket:false}
async function consultarNotificacionesPush (nroDocumentoNit){
  
  
  console.log("DatosMorga", " ==> notificacionMongo ==>  " + notificacionMongo );

    // Caso Primero ==> Mongo para notificaciones_push
    arrayNotificacionPushMongo = await SadNotNotificacionesPushModel.find({nit:nroDocumentoNit, envio_socket:false})
    console.log("Notificaciones Push==> " + arrayNotificacionPushMongo.length )
    console.log("Notificaciones Push==> " + arrayNotificacionPushMongo )


    for (const notPush of arrayNotificacionPushMongo) {
      console.log("Entra Array " + notPush);
  
      const notificacionMongo = await SadNotNotificacionesModel.find({ _id: new ObjectId(notPush.id_notificacion) });
      //notificacionMongo = JSON.stringify(notificacionMongo); 
      console.log("GaryMorgaDatos", " ==>notificacionMongo  " , notificacionMongo );
      console.log("GaryMorgaDatos", " ==>notificacionMongo  " , notificacionMongo[0].acto_administrativo );
      notificaciones_electronicas.actoAdministrativo =  notificacionMongo[0].acto_administrativo;
      notificaciones_electronicas.archivoAdjuntoActuadoId = notificacionMongo[0].archivo_adjunto_actuado_id;
      notificaciones_electronicas.estadoNotificacionElectronicaId = notificacionMongo[0].estado_notificacion_electronica_id;
      notificaciones_electronicas.usuarioRegistroId = notificacionMongo[0].usuario_registro_id;
      notificaciones_electronicas.usuarioUltimaModificacionId = notificacionMongo[0].usuario_ultima_modificacion_id;
      notificaciones_electronicas.fechaRegistro = notificacionMongo[0].fecha_registro;
      notificaciones_electronicas.fechaUltimaModificacion = notificacionMongo[0].fecha_ultima_modificacion;

      // Armar la notificacion para el envio 
      notificacionEnvio.notificacionPushId = notPush._id;
      notificacionEnvio.idNotificacion = notPush.id_notificacion;
      notificacionEnvio.cabecera = notPush.cabecera;
      notificacionEnvio.cuerpo = notPush.cuerpo;
      notificacionEnvio.origen = notPush.origen;
      notificacionEnvio.cantidadLectura = notPush.cantidad_lectura;
      notificacionEnvio.nit  = notPush.nit;
      notificacionEnvio.notificacionesElectronicas =  notificaciones_electronicas;
      notificacionEnvio.envio_socket = notPush.envio_socket;
      notificacionEnvio.usuarioRegistroId =  notificacionMongo[0].usuario_registro_id;
      notificacionEnvio.usuarioUltimaModificacionId = notificacionMongo[0].usuario_ultima_modificacion_id;
      notificacionEnvio.fechaRegistro = notificacionMongo[0].fecha_registro;
      notificacionEnvio.fechaUltimaModificacion = notificacionMongo[0].fecha_ultima_modificacion;
  
      console.log("MorgaGarySergio", " ===> sdfds ", notificacionEnvio);
      await notificacionEnvioPush(notificacionEnvio);
    }

    /* arrayNotificacionPushMongo.forEach(async (notPush, index)=>  {
      console.log(" Entra Array " + index ) 
      // notificacionMongo = await SadNotNotificacionesModel.find({_id: new ObjectId('657a14069056d72bc8bbd357')})
      notificacionMongo = await SadNotNotificacionesModel.find({_id: new ObjectId(notPush.id_notificacion)})
      // Almacenar notificaciones Electronicas 
      notificacionMongo = JSON.stringify(notificacionMongo); 
      console.log("GaryMorgaDatos", " ==>notificacionMongo  " , notificacionMongo );
      console.log("GaryMorgaDatos", " ==>notificacionMongo  " , notificacionMongo.acto_administrativo );
      notificaciones_electronicas.actoAdministrativo =  notificacionMongo.acto_administrativo;
      notificaciones_electronicas.archivoAdjuntoActuadoId = notificacionMongo.archivo_adjunto_actuado_id;
      notificaciones_electronicas.estadoNotificacionElectronicaId = notificacionMongo.estado_notificacion_electronica_id;
      notificaciones_electronicas.usuarioRegistroId = notificacionMongo.usuario_registro_id;
      notificaciones_electronicas.usuarioUltimaModificacionId = notificacionMongo.usuario_ultima_modificacion_id;
      notificaciones_electronicas.fechaRegistro = notificacionMongo.fecha_registro;
      notificaciones_electronicas.fechaUltimaModificacion = notificacionMongo.fecha_ultima_modificacion;

      // Armar la notificacion para el envio 
      notificacionEnvio.notificacionPushId = notPush._id;
      notificacionEnvio.idNotificacion = notPush.id_notificacion;
      notificacionEnvio.cabecera = notPush.cabecera;
      notificacionEnvio.cuerpo = notPush.cuerpo;
      notificacionEnvio.origen = notPush.origen;
      notificacionEnvio.cantidadLectura = notPush.cantidad_lectura;
      notificacionEnvio.nit  = notPush.nit;
      notificacionEnvio.notificacionesElectronicas =  notificaciones_electronicas;
      notificacionEnvio.envio_socket = notPush.envio_socket;
      notificacionEnvio.usuarioRegistroId =  notificacionMongo.usuario_registro_id;
      notificacionEnvio.usuarioUltimaModificacionId = notificacionMongo.usuario_ultima_modificacion_id;
      notificacionEnvio.fechaRegistro = notificacionMongo.fecha_registro;
      notificacionEnvio.fechaUltimaModificacion = notificacionMongo.fecha_ultima_modificacion;

      console.log("MorgaGarySergio", " ===> sdfds " , notificacionEnvio);
      notificacionEnvioPush(notificacionEnvio);

    }) */
}

// CASO Segundo ==> Mongo para notificaciones
    /* arrayNotificacionMongo = await SadNotNotificacionesModel.find({nit :nroDocumentoNit})
    // arrayNotificacionMongo = await SadNotNotificacionesModel.find({nit :nroDocumentoNit}).limit(10)
    console.log('ArrayNotificaciones_length ==> ', arrayNotificacionMongo.length)
  
    arrayNotificacionMongo.forEach((element, index) => {
      console.log(' Indice ==> ', index)
    }) */





  /*   for (const modeloNoti of arrayNotificacionMongo) {
      // TODO Armar El modelo para reenviar la notificacion

    } */
    // mensajeNotificacionPulsar.cabecera 
    /* const notificacionesPush = await NotificacionesPush.find({nit:"1020703023", envio_socket:false}).limit(1)
    console.log('notificaciones ==================>', notificacionesPush) */

    /* const notificacionesElectronicas = await SadNotNotificacionesModel.find({}).limit(1)
    console.log('notificaciones ==================>', notificacionesElectronicas) */


/**
 * @author GaryMorga
 * @description Funcion que reenvia los msj de notificaciones al celular
 * @datos datosNit = nit-imei , envioPhone =  {'idNotificacion': '', 'tipo': 'notificacion','cabezera':'', 'cuerpo':''}
 */
async function enviarMensajeNotificacionSocket(datosNit, envioPhone) {
  console.log('Enviar al cel: nit + imael=> ' + JSON.stringify(datosNit) + ' Datos envio Socket  ' + JSON.stringify(envioPhone))
  try {
    io.emit(datosNit, envioPhone)
  } catch (error) {
    console.log('erro => io emit ', error)
  }
}

async function notificacionEnvioPush(ObjetoNotificaionPush) {
  try {

    console.log("garyMorga", " Envio de notificacion Reenvia  "  );
    const mensajeNotificacionPulsar = ObjetoNotificaionPush
    console.log('mensajeNotificacionRecivido ==>', JSON.stringify(mensajeNotificacionPulsar))
    const notificaciones_electronicas = mensajeNotificacionPulsar.notificacionesElectronicas
    console.log('Datos notificaciones_electronicas ==>', JSON.stringify(mensajeNotificacionPulsar))

    const objEnvioNotificacion = {
      idNotificacion: mensajeNotificacionPulsar.idNotificacion,
      actoadministrativo: notificaciones_electronicas.actoAdministrativo,
      archivoAduntoId: notificaciones_electronicas.archivoAdjuntoActuadoId,
      estadoId: mensajeNotificacionPulsar.estadoNotificacion
    }

    const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/` + mensajeNotificacionPulsar.nit
    const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`

    console.log('Notificacion - API TOKEN Generico ==> ' + API_URL_TOKEN)

    const responseTokenD = await getToken(API_URL_TOKEN)
    const responseToken = JSON.parse(responseTokenD)
    console.log('Notificacion Response Token ======> ' + JSON.stringify(responseToken))

    const tokenRespuesta = responseToken.token
    let arrDispositivos = []

    const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
    const listaDispositivos = JSON.parse(response)

    if (listaDispositivos?.mensajes[0]?.codigo === 1) {
      console.log('Notificacion Repuesta del consumo del listado de dispositivos: ' + JSON.stringify(listaDispositivos))
      arrDispositivos = listaDispositivos.dispositivos
      console.log('Notificacion-Longitud Array Dispositivos ===> ' + JSON.stringify(arrDispositivos.length))
      console.log('Notificacion-Array Dispositivos ===>  ', JSON.stringify(arrDispositivos))

      for (const modeloNoti of arrDispositivos) {
        console.log('Notificacion Modelo Datos del dispositivo', modeloNoti)
        if (modeloNoti.webId != null && modeloNoti.descripcionEstado === 'ACTIVO' && !mensajeNotificacionPulsar.envio_socket) {
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
        } else if (modeloNoti.imei !== '' && modeloNoti.descripcionEstado === 'ACTIVO' && !mensajeNotificacionPulsar.envio_socket) {
          console.log('ENVIANDO NOTIFICACION PARA MOVIL_ IMEI=> ', modeloNoti.imei, ' Nombre del dispositivos==> ', modeloNoti.nombreDispositivo)
          const strNitImei = mensajeNotificacionPulsar.nit + '-' + modeloNoti.imei
          const envioPhoneMensajeria = {
            idNotificacion: mensajeNotificacionPulsar.idNotificacion,
            tipo: 'notificacion',
            cabezera: mensajeNotificacionPulsar.cabecera,
            cuerpo: mensajeNotificacionPulsar.cuerpo,
            archivoAdjuntoActuadoId: objEnvioNotificacion.archivoAduntoId,
            estadoNotificacionElectronicoId: mensajeNotificacionPulsar.estadoNotificacion
          }
          console.log(' NIT-IMEI ===> ' + mensajeNotificacionPulsar.nit + ' nombre del dispositivo ' + modeloNoti.nombreDispositivo)
          console.log(' Envio_Socket_datos =>  ', JSON.stringify(envioPhoneMensajeria))
          console.log('Mensaje Mensajeria => Cabezera ==> ' + mensajeNotificacionPulsar.cabecera + ' Mensaje - Cuerpo  ==> ' + mensajeNotificacionPulsar.cuerpo)
          console.log(' envioPhoneNotificacion ==> ', JSON.stringify(envioPhoneMensajeria))

          // await delay(300)
          enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
        }
      }
    } else {
      console.log(' Error del servicio ListDispositivos ' + listaDispositivos?.mensajes[0]?.descripcion)
    }
  } catch (error) {
    console.error('Error Final :', error.message)
  }
}

// FUNCIÓN PARA ENVIAR NOTIFICACIONES PUSH
// async function notificacionEnvioPush(ObjetoNotificaionPush){
//   mensajeNotificacionPulsar = ObjetoNotificaionPush
//   console.log('mensajeNotificacionRecivido ==>', JSON.stringify(mensajeNotificacionPulsar))
//   notificaciones_electronicas = mensajeNotificacionPulsar.notificacionesElectronicas
//   console.log('Datos notificaciones_electronicas ==>', JSON.stringify(mensajeNotificacionPulsar))
//   let objEnvioNotificacion = {idNotificacion: mensajeNotificacionPulsar.idNotificacion,actoadministrativo: notificaciones_electronicas.actoAdministrativo,archivoAduntoId: notificaciones_electronicas.archivoAdjuntoActuadoId,estadoId: mensajeNotificacionPulsar.estadoNotificacion}

//   const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/` + mensajeNotificacionPulsar.nit
//   const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`

//   console.log("Notificacion - API TOKEN Generico ==> " + API_URL_TOKEN );
//   try {
//     const responseTokenD = await getToken(API_URL_TOKEN)
//     responseToken = JSON.parse(responseTokenD)
//     console.log("Notificacion Response Token ======> " + JSON.stringify(responseToken))

//     const tokenRespuesta = responseToken.token
//     arrDispositivos = []

//     try {
//       const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
//       // await delay(30000)

//       listaDispositivos = JSON.parse(response)

//       if (listaDispositivos?.mensajes[0]?.codigo === 1) {
//         console.log('Notificacion Repuesta del consumo del listado de dispositivos: ' + JSON.stringify(listaDispositivos))
//         arrDispositivos = listaDispositivos.dispositivos
//         console.log('Notificacion-Longitud Array Dispositivos ===> ' + JSON.stringify(arrDispositivos.length))
//         console.log('Notificacion-Array Dispositivos ===>  ', JSON.stringify(arrDispositivos))

//         if (arrDispositivos.length > 0) {
//           arrDispositivos.forEach(element => {
//             console.log('Notificacion Modelo Datos del dispositivo')
//             modeloNoti = element
//             console.log(modeloNoti)
//             if (modeloNoti.webId != null) {
//               if (modeloNoti.descripcionEstado === 'ACTIVO') {
//                 if (!mensajeNotificacionPulsar.envio_socket) {
//                   console.log('ENVIANDO NOTIFICACION PARA WEB')
//                   envioNotificacion(modeloNoti.endPointWeb,modeloNoti.keyWeb,modeloNoti.authWeb,mensajeNotificacionPulsar.cabecera,mensajeNotificacionPulsar.cuerpo,'Ir a ver la notificación',objEnvioNotificacion,'notificacion')
//                 }
//               }
//             } else {
//               if (modeloNoti.imei != '' && modeloNoti.descripcionEstado === 'ACTIVO') {
//                 if (!mensajeNotificacionPulsar.envio_socket) {
//                   console.log('ENVIANDO NOTIFICACION PARA MOVIL_ IMEI=> ', modeloNoti.imei, ' Nombre del dispositivos==> ', modeloNoti.nombreDispositivo)
//                   envioPhoneMensajeria.idNotificacion = mensajeNotificacionPulsar.idNotificacion
//                   envioPhoneMensajeria.tipo = "notificacion";
//                   const strNitImei = mensajeNotificacionPulsar.nit + '-' + modeloNoti.imei
//                   console.log(' NIT-IMEI ===> ' + mensajeNotificacionPulsar.nit + ' nombre del dispositivo ' + modeloNoti.nombreDispositivo)
//                   console.log(' Envio_Socket_datos =>  ', JSON.stringify(envioPhoneMensajeria))
//                   console.log('Mensaje Mensajeria => Cabezera ==> ' + mensajeNotificacionPulsar.cabecera + ' Mensaje - Cuerpo  ==> ' + mensajeNotificacionPulsar.cuerpo)
//                   envioPhoneMensajeria.cabezera = mensajeNotificacionPulsar.cabecera;
//                   envioPhoneMensajeria.cuerpo = mensajeNotificacionPulsar.cuerpo;
//                   envioPhoneMensajeria.archivoAdjuntoActuadoId = objEnvioNotificacion.archivoAduntoId;
//                   envioPhoneMensajeria.estadoNotificacionElectronicoId = mensajeNotificacionPulsar.estadoNotificacion;
//                   console.log(' envioPhoneNotificacion ==> ', JSON.stringify(envioPhoneMensajeria))

//                   enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
//                 }
//               }else {

//               }
//             }
//           })
//         } else {
//           console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente==> ' + mensajeNotificacionPulsar.nit)
//         }
//       } else {
//         console.log(' Error del servicio ListDispositivos ' + listaDispositivos?.mensajes[0]?.descripcion)
//       }
//     } catch (error) {
//       console.error('Error Final :', error.message)
//     }
//   } catch (error) {
//     console.error('Error Obtener Token==>:', error.message)
//   }
// }

// FUNCION PARA ENVIAR AVISOS PUSH

async function mensajeriaEnvioAvisos(objAvisosEnvio) {
  mensaje_pulsar_avisos = objAvisosEnvio
  console.log('Mensaje pulsar avisos ==>  ' + JSON.stringify(mensaje_pulsar_avisos))
  avisosPulsar = mensaje_pulsar_avisos.avisos
  console.log('Datos avisosPulsar  => ' + JSON.stringify(avisosPulsar))

  let objAvisos = { idAviso: mensaje_pulsar_avisos.idAviso, archivoPdf: avisosPulsar.archivoPdf }

  const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/` + mensaje_pulsar_avisos.nit
  console.log(' URL Lista De Usuario entrando al CONSUMER ==>  ', API_URL_Lista_Usuario)

  const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
  const responseTokenD = await getToken(API_URL_TOKEN)
  const responseToken = JSON.parse(responseTokenD)
  console.log('Response Token ======> ' + JSON.stringify(responseToken))
  const tokenRespuesta = responseToken.token
  arrDispositivos = []

  const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)
  console.log('Dispositivos Avisos =>  ' + JSON.stringify(response))

  listaDispositivos = JSON.parse(response)
  console.log('  dispositivo- transaccion ' + JSON.stringify(listaDispositivos.transaccion) + '  dispositivo- mensaje ' + listaDispositivos.mensaje)
  if (listaDispositivos?.mensajes[0]?.codigo === 1) {
    arrDispositivos = listaDispositivos.dispositivos
    console.log(arrDispositivos)
    console.log('  AVISOS arrDispositivos  Longitud----- ' + arrDispositivos.length)
    console.log('  AVISOS arrDispositivos  Datos----- ' + JSON.stringify(arrDispositivos))

    if (arrDispositivos.length > 0) {
      arrDispositivos.forEach(element => {
        modeloNoti = element
        console.log(' Elemento AVISO => ' + JSON.stringify(modeloNoti))

        console.log(' Elemento AVISO  modeloNoti.webId => ' + modeloNoti.webId + '  modeloNoti.descripcionEstado ' + modeloNoti.descripcionEstado)
        if (modeloNoti.webId != null) {
          if (modeloNoti.descripcionEstado == 'ACTIVO') {
            if (!mensajeNotificacionPulsar.envio_socket) {
              console.log('ENVIANDO NOTIFICAION PARA WEB')
              envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb, modeloNoti.authWeb, mensaje_pulsar_avisos.cabecera, mensaje_pulsar_avisos.cuerpo, 'Ir a ver el Aviso', objAvisos, 'avisos')
            }
          }
        } else {
          if (modeloNoti.imei != '') {
            console.log('  avisos - IMEI ==> ' + modeloNoti.imei)
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              if (!mensajeNotificacionPulsar.envio_socket) {
                envioPhoneMensajeria.idNotificacion = mensaje_pulsar_avisos.idAviso // Id Avisos
                envioPhoneMensajeria.tipo = 'avisos'
                console.log(' Mensaje_AVISOS_Datos ==>  ' + JSON.stringify(envioPhoneMensajeria))
                console.log(' avisos_nit ' + mensaje_pulsar_avisos.nit + ' ===> ' + ' Nombre del dispositivo ' + modeloNoti.nombreDispositivo)
                const strNitImei = mensaje_pulsar_avisos.nit + '-' + modeloNoti.imei
                console.log('Mensaje Mensajeria => Cabezera ==> ' + mensaje_pulsar_avisos.cabecera + ' Mensaje - Cuerpo  ==> ' + mensaje_pulsar_avisos.cuerpo)
                envioPhoneMensajeria.cabezera = mensaje_pulsar_avisos.cabecera
                envioPhoneMensajeria.cuerpo = mensaje_pulsar_avisos.cuerpo
                envioPhoneMensajeria.archivoPdf = objAvisos.archivoPdf
                console.log(' envioPhoneMensajeria ==> ' + JSON.stringify(envioPhoneMensajeria))
                enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
              }
            }
          }
        }
      })
    } else {
      console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
    }
  } else {
    console.log(' Error del servicio ListDispositivos ' + listaDispositivos?.mensajes[0]?.descripcion)
  }
}

// FUNCION PARA ENVIAR MENSAJERIA PUSH
async function mensajeriaEnvioPush(objMensajeria) {
  mensajeriaPulsar = objMensajeria
  console.log('Mensajeria Pulsar', ' ==>  ' + JSON.stringify(mensajeriaPulsar))
  const API_URL_Lista_Usuario = `${config.BACK_MENSAJERIA}/api/dispositivo/buscarXNit/${mensajeriaPulsar.nit}`

  const API_URL_TOKEN = `${config.TOKEN_GENERICO}/token/getGenerico/1000`
  const responseTokenD = await getToken(API_URL_TOKEN)
  const responseToken = JSON.parse(responseTokenD)
  console.log('Response Token ======> ' + JSON.stringify(responseToken))
  const tokenRespuesta = responseToken.token
  arrDispositivos = []

  const response = await getListaDeUsuarioDispositivos(tokenRespuesta, API_URL_Lista_Usuario)

  listaDispositivos = JSON.parse(response)
  if (listaDispositivos?.mensajes[0]?.codigo === 1) {
    console.log(' listaDispositivos.transaccion ' + listaDispositivos.transaccion + '  listaDispositivos.mensaje ' + JSON.stringify(listaDispositivos.mensajes))
    arrDispositivos = listaDispositivos.dispositivos
    console.log(' mensajeria arrDispositivos.length => ' + arrDispositivos.length)
    console.log(' mensajeria push arrDispositivos => ' + JSON.stringify(arrDispositivos))
    if (arrDispositivos.length > 0) {
      arrDispositivos.forEach(element => {
        modeloNoti = element
        if (modeloNoti.webId != null) {
          if (modeloNoti.descripcionEstado == 'ACTIVO') {
            if (!mensajeNotificacionPulsar.envio_socket) {
              envioNotificacion(modeloNoti.endPointWeb, modeloNoti.keyWeb, modeloNoti.authWeb, mensajeriaPulsar.cabecera, mensajeriaPulsar.cuerpo, 'Ir a mensajeria')
            }
          }
        } else {
          if (modeloNoti.imei != '') {
            if (modeloNoti.descripcionEstado == 'ACTIVO') {
              if (!mensajeNotificacionPulsar.envio_socket) {
                envioPhoneMensajeria.idNotificacion = mensajeriaPulsar.idMensaje
                envioPhoneMensajeria.tipo = 'mensajeria'
                console.log(' MensajeriaPush mensaje notificacion Datos ==>  ' + JSON.stringify(envioPhoneMensajeria))
                console.log(' mensajeria.nit ' + mensajeriaPulsar.nit + ' Nombre del dispositivo ' + modeloNoti.nombreDispositivo)
                const strNitImei = mensajeriaPulsar.nit + '-' + modeloNoti.imei
                console.log('Envio mensajeria push => ' + JSON.stringify(envioPhoneMensajeria), ' String_IMEI-NIT ==> ' + strNitImei)
                console.log('Mensaje Mensajeria => Cabezera ==> ' + mensajeriaPulsar.cabecera + ' Mensaje - Cuerpo  ==> ' + mensajeriaPulsar.cuerpo)
                envioPhoneMensajeria.cabezera = mensajeriaPulsar.cabecera
                envioPhoneMensajeria.cuerpo = mensajeriaPulsar.cuerpo
                console.log(' envioPhoneMensajeria ==> ' + JSON.stringify(envioPhoneMensajeria))
                enviarMensajeNotificacionSocket(strNitImei, envioPhoneMensajeria)
              }
            }
          }
        }
      })
    } else {
      console.log(' No se han encontrado una lista de dispositivos en el NIT Correspondiente ')
    }
  } else {
    console.log(' Error del servicio ListDispositivos ' + listaDispositivos?.mensajes[0]?.descripcion)
  }
}

//  ***************************** Muestra las IPS de RED *****************
const networkInterfaces = os.networkInterfaces()
console.log(' NetworkInterfaces ==> ', JSON.stringify(networkInterfaces))

httpServer.listen(process.env.PORT, () => {
  console.log('Servidor a la espera de conexion ', config.PORT)
})

/**
 * @author GaryMorga
 * @description DTOS Función para enviar la notificación
 */
async function envioNotificacion(endPointWeb, keyWeb, authWeb, cabecera, cuerpo, mensajeNotificacionTitulo, objEnvioNotificacion, tipo) {
  let urlPDF = ''
  var varNotificacion = true
  urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/mensajeria/true`
  if (tipo === 'notificacion') {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/notificaciones/${objEnvioNotificacion.idNotificacion}/${objEnvioNotificacion.archivoAduntoId}/${objEnvioNotificacion.estadoId}/${objEnvioNotificacion.actoadministrativo}/${varNotificacion}`
    console.log('Url_PDF notificaciones =>  ', urlPDF)
  } else if (tipo === 'avisos') {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/listaAvisos/${objEnvioNotificacion.idAviso}/${objEnvioNotificacion.archivoPdf}/${varNotificacion}`
    console.log('Url_PDF Avisos =>  ', urlPDF)
  } else {
    urlPDF = `${config.URL_WEB_NOTIFICACION}/notificaciones/con/mensajeria`
    console.log('Ruta_Mensajeria ', urlPDF)
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
          title: mensajeNotificacionTitulo,
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
    console.log('Datos de mensajeria')
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
})

app.post('/envio/notificacion', async (req, res) => {
  try {
    console.log('Datos de Notificacion Datos nuevos')
    console.log(req.body)
    await notificacionEnvioPush(req.body)
    res.status(200).json({
      transaccion: true,
      mensajes: [
        {
          codigo: 1,
          descripcion: 'Se envio de forma correcta la notificacion.'
        }
      ]
    })
  } catch (error) {
    res.status(200).json({
      transaccion: false,
      mensajes: [
        {
          codigo: -1,
          descripcion: 'Error envio notificacion.'
        }
      ]
    })
  }
})

app.post('/envio/avisos', async (req, res) => {
  try {
    console.log('Datos de avisos')
    console.log(req.body)
    mensajeriaEnvioAvisos(req.body)
    res.status(200).json({
      transaccion: true,
      mensajes: [
        {
          codigo: 1,
          descripcion: 'Se envio de forma correcta el aviso.'
        }
      ]
    })
  } catch (error) {
    res.status(200).json({
      transaccion: false,
      mensajes: [
        {
          codigo: -1,
          descripcion: 'Error envio aviso.'
        }
      ]
    })
  }
})
// const indexRoutes = require('./routes/test.routes')
app.use(indexRoutes)

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
