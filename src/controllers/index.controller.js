const controller = {}
const connection = require('../dbConnection/connection')
const NotificacionesPushModel = require('../models/notificacion_push')
const SadNotNotificacionesModel = require('../models/sad_not_notificaciones')

//static const arreglo12 = [];
controller.index =  async (req, res)=>{
    try{
        res.send("La conexion ha sido correcta")
        console.log("Connection OK como DEV");
        await connection();
        console.log("Conexionde base de Datos");

        const allNotificacionesPush = await NotificacionesPushModel.find();
        const sanNotNotificacionesPushFinal = await SadNotNotificacionesModel.find();
        console.log(allNotificacionesPush);
        console.log("--------------- Obtencionde las notificaciones --------");
        console.log(sanNotNotificacionesPushFinal);
    }catch(err){
        console.log(err);
    }
}

/**
    @author gary_morga
    @description Metodo para la obtencion de los datos de la colección de datos sad_notificaciones_push_prueba
    @date 30/06/2023
**/

async function obtenerDatos(){
    const allNotificacionesPush = await NotificacionesPushModel.find();
    console.log(allNotificacionesPush);
}

/**
 * @author gary_morga
 * @description 
 */

async function obtenerDatosNotificacion(){
    const sanNotNotificacionesPushFinal = await SadNotNotificacionesModel.find();
    //const sanNotNotificacionesPushFinal = await SadNotNotificacionesModel.findOne({'_id':ObjectId('6492123d89bb6a7df6f50d85')});
   // arreglo12 = sanNotNotificacionesPushFinal;
    console.log("------------------------------ Obtencion de las notificaciones  -------------------- ");
    console.log(sanNotNotificacionesPushFinal);
    return sanNotNotificacionesPushFinal;
    
}

// consumo de servicios externos. 
const API_URL = "https://desasiatservicios.impuestos.gob.bo/sad-not-rest/api/notificaciones/contribuyente/2063982011"
var XMLHttpRequest = require("xhr2");
const xhr = new XMLHttpRequest();

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

function respuestaServicio(){
    xhr.addEventListener('load', onRequestHandler);
    xhr.open('GET', `${API_URL}`);
    xhr.send();
}

// Fin de servcios servicios externos. 

module.exports = controller;
module.exports = obtenerDatos;
module.exports = obtenerDatosNotificacion;


//Ejemplo Sencillo
/*controller.name = 'Gary'
controller.saludar = ()=>console.log('HOLA')
controller.saludar()*/
