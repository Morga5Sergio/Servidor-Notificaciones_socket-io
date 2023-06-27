const controller = {}
const connection = require('../dbConnection/connection')
controller.index =  async (req, res)=>{
    try{
        res.send("La conexion ha sido correcta sdf sda")
        console.log("Connection OK")
        await connection()
    }catch(err){
        console.log(err);
    }

}

module.exports = controller

//Ejemplo Sencillo
/*controller.name = 'Gary'
controller.saludar = ()=>console.log('HOLA')
controller.saludar()*/
