/*
    * @authos GaryMorga
    * @description  Configuración y conexion a la base de datos en Mongo
*/
const mongoose = require('mongoose')
const uri = `mongodb://dsin:${process.env.MONGO_PASSWORD}@dcbdmongo.impuestos.gob.bo:27017/${process.env.MONGO_DB}?authMechanism=DEFAULT&authSource=${process.env.MONGO_AUTHSOURCE}retryWrites=true&w=majority`;
    // Funcion para la exportación desde la base de datos 
    function _connect(){ 
        const uri = `mongodb://dsin:${process.env.MONGO_PASSWORD}@dcbdmongo.impuestos.gob.bo:27017/${process.env.MONGO_DB}?authMechanism=DEFAULT&authSource=${process.env.MONGO_AUTHSOURCE}retryWrites=true&w=majority`;
        mongoose.connect(uri, 
            {maxPoolSize: 50, 
             wtimeoutMS: 2500,
             authSource:"dsin",
             user:"dsin",
             pass:"dsin",
             useNewUrlParser:true
            }).then(
                ()=>{
                   console.log("La conexion de la base de datos se conecto correctamente")     
                },
                (err) => {
                    console.log("connection error", err);
                }
            )
    }
module.exports = _connect;