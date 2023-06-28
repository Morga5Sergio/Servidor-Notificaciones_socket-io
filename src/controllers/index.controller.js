const controller = {}
const connection = require('../dbConnection/connection')
const NotificacionesPushModel = require('../models/notificacion_push')

controller.index =  async (req, res)=>{
    try{
        res.send("La conexion ha sido correcta")
        console.log("Connection OK como DEV");
        await connection();
        console.log("Conexionde base de Datos");

        const allNotificacionesPush = await NotificacionesPushModel.find();

        console.log(allNotificacionesPush);
    }catch(err){
        console.log(err);
    }

}

module.exports = controller

//Ejemplo Sencillo
/*controller.name = 'Gary'
controller.saludar = ()=>console.log('HOLA')
controller.saludar()*/
