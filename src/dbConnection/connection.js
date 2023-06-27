/*
    * @authos GaryMorga
    * @description  Configuración y conexion a la base de datos en Mongo
*/
const mongoose = require('mongoose')
const password ="dsin";
const dbname = "dsin";
const uri = `mongodb://dsin:${password}@dcbdmongo.impuestos.gob.bo:27017/${dbname}?authMechanism=DEFAULT&authSource=${dbname}retryWrites=true&w=majority`;   

module.exports = ()=>  mongoose.connect(uri, 
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
    
//const uri_2 = "mongodb://dcbdmongo.impuestos.gob.bo:27017/"
/*const connection = ()=>{
    mongoose.connect(uri, {userNewUrlParser:true, useUnifiedTopology:true});
}
// module.exports = connection
*/
// OPCION 2 Prueba de conexion de base de datos.
/*module.exports = ()=> mongoose.connect(uri_2, {
            // poolSize: 10,
            authSource: "dsin",
            user: "dsin",
            pass: "dsin", 
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authMechanism: "DEFAULT",
            //useCreateIndex: true,
            //useFindAndModify: false 
}).then(
    ()=> {
        console.log("coneccion de ready to use");
    },
    (err) => {
        console.log("connection error - ", err)
    }
)*/