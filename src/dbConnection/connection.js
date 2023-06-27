/*
    * @authos GaryMorga
    * @description  Configuración y conexion a la base de datos en Mongo
*/
const mongoose = require('mongoose')

const password ="dsin";
const dbname = "dsin";
          // mongodb://myUser:userPW@SG-staging-111.servers.mongodirector.com:27017,SG-staging-43334.servers.mongodirector.com:27017/stagingDB?replicaSet=RS-staging-0&ssl=true&authSource=stagingDB
const uri = `mongodb://dsin:${password}@dcbdmongo.impuestos.gob.bo:27017/?authMechanism=DEFAULT&authSource=${dbname}`;   

/*const connection = ()=>{
    mongoose.connect(uri, {userNewUrlParser:true, useUnifiedTopology:true});
}
// module.exports = connection
*/

module.exports = ()=>  mongoose.connect(uri, {maxPoolSize: 50, wtimeoutMS: 2500});