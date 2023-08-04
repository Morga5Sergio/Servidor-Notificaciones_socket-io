//const list =[];

const { Model } = require('mongoose');
const _connect = require('./dbConnection/connection');                      // Llama al archivo para la conexion de la base de datos en MONGO 
_connect(); 

function addUsuario(message){
    //list.push(message);
    const myUsuario= new Model(message);
    myUsuario.s
}

function getUsuario(){
    return list;

}


module.exports={
    add: addUsuario,
    list:getUsuario
}