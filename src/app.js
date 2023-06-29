const express = require('express');           // Framework de nodeJs Express
const path = require("path");                 // path 
const { createServer } = require("http");     // Creacion de servidor
const { Server } = require("socket.io");      // Importacion de socket.io
const { Console } = require("console");       // Importacion para mostrar mensajes en consola 
const app = express();                        // Se tiene guardado express con su propiedades y sus metodos
const httpServer = createServer(app);         // Le http es el que inicia el servidor, Now can use the app as if you were http.
require('dotenv').config();                   // Para las variables de entorno, con las pruebas de seguridad. 
const io = new Server(httpServer);            // Constante io para el servidor Socket.io

app.use(express.static(path.join(__dirname, "views"))); // Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.get("/", (req, res)=> {
        res.sendFile(__dirname + "/views/index.html");
});

const _connect = require('./dbConnection/connection');                      // Llama al archivo para la conexion de la base de datos en MONGO 
const obtenerDatos = require('./controllers/index.controller')              // Llama al archivo para el  proceso de la obtención de los datos en MONGO

const usuario = [];
var usuarioMensajesEnEspera = [];                       // Se va almacenar en el array y se va  preguntar si se envio o no se envio (Por el momento esto es opcional)

/*const routes = require('./routes/index.routes')       // Rutas que se le puede adicionar a la APP otra direcciones -- OPCIONAL si lo requiere el servidor
app.use(routes)*/

// Motor de plantillas  // Se instalo npm i ejs
// app.use('view engine', 'ejs');

console.log(" direccion de la pagina " +  __dirname+"/public");

_connect();                                  // Realiza la conexion de la base de datos en MONGO.
obtenerDatos();                              // Obtiene los datos de la coleccion de la base de datos.

app.use((req,res,next) => {
    res.status(404).sendFile(__dirname + "/public/404.html");    // Redireccion De una pagian en HTML que indica, que no debe f
})

io.on("connection", socket => {
    console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
   io.emit("registroBD", "Send_register_base_datos"); 

   socket.on("disconnect", () => {
       // console.log("El cliente " + socket.id + " se ha desconectado ");
   });
   
   // Registra los datos de los clientes conectados 
   socket.on('registroBase', cedulaClient => {
       console.log("Datos ", " Datos de prueba ddddd " + cedulaClient);
       // usuario =  Almacena los datos que se conectan al servidor
       if(usuario.length == 0){
           usuario.push({"id":cedulaClient,"estado":"ninguno"});
       }
       // Encuentra si el usuario se encuentra almacenado fa
       var index = usuario.map(element => element.id).indexOf(cedulaClient);
       // console.log("Indice Encontrado " + " ==> " + index); 

       // El -1 indica que no se a encontra el usuario por tanto se debe registrar
       // Cuando se encuentra un indice mayor a cero significa que se a encontrado el elemento y este no debe registrarse
       if(index == -1){
           usuario.push({"id":cedulaClient,"estado":"ninguno"});
       }
       // console.log("Usuarios registrados", " ==> " + usuario.length );
   });
   // Recibe el mensaje del servidor => Este corresponde a un array con los datos JSON 
   socket.on('emisionMensaje', msg => {
       
       io.emit('msgServer', msg);            
   });

   // Esta emisión en notifica los mensajes en espera

   io.emit("MensajesEspera", usuarioMensajesEnEspera); 

   // Datos de objMensajeSocket => Estos datos son los siguientes
   // objMensajeSocket = {"id":"8321008", "estado":"ok"}  // Se verificara si existe o no existe   
   socket.on("verificar", objMensajeSocket => {
       console.log("objMensajeSocket " , "     ============================================================================== ");
       console.log("objMensajeSocket " , objMensajeSocket);    
       console.log("objMensajeSocket Usuario => " , usuario);    

       console.log("objMensajeSocket " , objMensajeSocket);
       var index = usuario.map(element => element.id).indexOf(objMensajeSocket.id);
   
       console.log("objMensajeSocket ",  " ==> Valor del indice encontrado   " , index);

       console.log("ArrayAntes  ", " ==>  " + usuarioMensajesEnEspera );
       if(index >= 0){
           if(usuario[index].estado == "ninguno" ){
               // Se almacenara los datos para reenviar la notificación nuevamente si este no se envio                
               usuarioMensajesEnEspera.push(usuario[index]);
               usuario[index].estado =  "ok"
           }else {                
               // Ya se encuentra registrado, tiene que eliminarse del array correspondiente.                                
               usuarioMensajesEnEspera = usuarioMensajesEnEspera.filter(notificacion => notificacion.id == objMensajeSocket.id) 
           }            
       }else {
           
           console.log("objMensajeSocket " , " No se encuentra registrado  el usuario correspondiente ==> ");
       }

       console.log("ArrayDespues  ", " ==>  " + usuarioMensajesEnEspera );
   });
});



httpServer.listen(process.env.PORT , ()=> {
    console.log('Servidor a la espera de conexion ', process.env.PORT);
})

