
// Se utiliza en vez de http
// Framekork de express
// Es interactuar con nuestro modulo http
// Installacion con npm para express
// Se utiliza express cuando el cliente interactue con nuestro servidor. por eso es una dependencia de produccion y no de desarrollo 
const express = require('express');
// Se tiene guardado express con sus propiedades y sus metodos 
// Ahora se puede utlizar app como si fuera el http
const app = express();
const port = 3000;
// ROUTES
/*const routes = require('./routes/index.routes')
app.use(routes)*/

// Motor de plantillas  // Se instalo npm i ejs
// app.use('view engine', 'ejs');
console.log(" direccion de la pagina " +  __dirname+"/public");

//app.use(express.static(__dirname + "/public"));
app.use(require('./routes/index.routes')) // Se puede poner un nombre de la ruta:
app.use((req,res,next) => {
    res.status(404).sendFile(__dirname + "/public/404.html");
})




app.listen(port, ()=> {
    console.log('Servidor a la espera de conexion '+ port)
})


