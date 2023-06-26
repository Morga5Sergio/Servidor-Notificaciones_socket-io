
// Se utiliza en vez de http
// Framekork de express
// Es interactuar con nuestro modulo http
// Installacion con npm para express
// Se utiliza express cuando el cliente interactue con nuestro servidor. por eso es una dependencia de produccion y no de desarrollo 
const express = require('express');
// se tiene guardado express con sus propiedades y sus metodos 
// Ahora se puede utlizar app como si fuera el http
const app = express()

app.get('/', (req, res)=>{
    res.send("La conexion ha sido correcta prueba dsf");
})

app.listen(3000, ()=> {
    console.log('Servidor a la espera de conexion')
})


