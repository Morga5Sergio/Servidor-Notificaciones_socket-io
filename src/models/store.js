const db = require('mongoose');
const Model = require('./model');

const list = [];

_connect(); 

function addMessage(message) {
    const myMessage= new Model(message);
    myMessage.save();
}

function getMessages(){
    return list;
}

module.exports={
    add:addMessage,
    list: getMessages,
    
}

//conexion a la base de datos


