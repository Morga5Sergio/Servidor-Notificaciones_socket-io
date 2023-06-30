const controller = {}
const connection = require('../dbConnection/connection')
const NotificacionesPushModel = require('../models/notificacion_push')
const SadNotNotificacionesModel = require('../models/sad_not_notificaciones')


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
    console.log("------------------------------ Obtencion de las notificaciones ");
    console.log(sanNotNotificacionesPushFinal);
}
module.exports = controller;
module.exports = obtenerDatos;
module.exports = obtenerDatosNotificacion




//Ejemplo Sencillo
/*controller.name = 'Gary'
controller.saludar = ()=>console.log('HOLA')
controller.saludar()*/
