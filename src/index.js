const express = require("express");
const path = require("path"); 

const { createServer } = require("http");
const { Server } = require("socket.io");
const { Console } = require("console");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

// Añadiendo archivos estaticos , path es un modulo de nodeJs que se puede usar para unir rutas  
app.use(express.static(path.join(__dirname, "views")));
app.get("/", (req, res)=> {
        res.sendFile(__dirname + "/views/index.html");
});
var count = 0;
// Se va almacenar en la base de datos preguntar si se envio o no se envio
// const usuario = new Array(String);
const usuario = [];
var usuarioMensajesEnEspera = [];   
var jsLibraries = ['react', 'redux', 'vue', 'D3', 'Chart']
// Cada vez que se ejecute un nuevo cliente  se va a ejecutar la función del socket  
io.on("connection", socket => {
    // console.log("Clientes conectados: ", io.engine.clientsCount , " id " + socket.id);
    // socket.broadcast.emit("registroBD", "Hola");     
    io.emit("registroBD", "Hola"); 

    socket.on("disconnect", () => {
        // console.log("El cliente " + socket.id + " se ha desconectado ");
    });
    
    // Registra los datos de los clientes en al 
    socket.on('registroBase', messageB => {
        // usuario =  Almacena los datos que se conectan al servidor
        if(usuario.length == 0){
            usuario.push({"id":messageB,"estado":"ninguno"});
        }
        // Encuentra si el usuario se encuentra almacenado fa
        var index = usuario.map(element => element.id).indexOf(messageB);
        // console.log("Indice Encontrado " + " ==> " + index); 

        // El -1 indica que no se a encontra el usuario por tanto se debe registrar
        // Cuando se encuentra un indice mayor a cero significa que se a encontrado el elemento y este no debe registrarse
        if(index == -1){
            usuario.push({"id":messageB,"estado":"ninguno"});
        }
        // console.log("Usuarios registrados", " ==> " + usuario.length );
        // console.log("Usuarios registrados", " ==> " + usuario);
    });
    // Recibe el mensaje del servidor => Este corresponde a un array con los datos JSON 
    socket.on('emisionMensaje', msg => {
        
        io.emit('msgServer', msg);            
    });

    // Esta emisión en notifica los mensajes en espera

    io.emit("MensajesEspera", usuarioMensajesEnEspera); 

    // Datos de objMensajeSocket => Estos datos son los siguientes 
    socket.on("verificar", objMensajeSocket => {
        console.log("objMensajeSocket " , "     ===========================================================================    ");
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

        // FIN 

        // TODO Prueba_de_datos => prueba
        /* 
            usuario.forEach((element, index) => {
            console.log("Datos=>  " , " ==> " , element , " index => " + index );
                if(element.id == objMensajeSocket.id) {
                
                    console.log("ArrayDeDatos a verificar", " ==> " , usuarioMensajesEnEspera);
                
                    usuario[index].estado = "ok"; 
                    console.log("arrayUsuario", " ==>  id " + usuario[index].id + " ==>  estado " + usuario[index].estado );
                    console.log("arrEspera", " ==>  " + usuarioMensajesEnEspera.length);
                    console.log("arrEspera", " ==>  %o", usuarioMensajesEnEspera);
                        
                    console.log("arrEsperaFinal", " Datpos del identificador ==>  ", objMensajeSocket.id);
                    usuarioMensajesEnEspera = usuarioMensajesEnEspera.filter(element => element.id  !== objMensajeSocket.id);
                
                    console.log("arrEsperaFinal", " ==>  ", usuarioMensajesEnEspera);

                
                }else {

                    console.log("========> AAA ", "  ===> " , usuarioMensajesEnEspera);
                    usuarioMensajesEnEspera.push(element);
                }
            });
        */    
    });
});

httpServer.listen(4449);    
// La libreria nodemon = cada vez que se ejecute un cambio en el codigo mata el servidor y lo vuelve a levantar 