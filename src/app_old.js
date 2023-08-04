// Se obtiene el modulo de http de node, guardado en la constante http.
const http = require('http')
// Es una funcion que resive como parametro otra función. 
// req = request->peticion del cliente 
// res = response -> respuesta del servio
const server = http.createServer((req,res)=>{
    console.log("Un cliente se ha conectado")
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write('La conexion ha sido correcta');
    res.end();
})

server.listen(3000, ()=>{
    console.log("Servidor a la espera de conexiones")
})

// Se utiliza en vez de http
// Framekork de express
