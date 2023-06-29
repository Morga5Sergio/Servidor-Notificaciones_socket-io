const express = require('express')
// Se usa para crear un nuevo objeto de enrutador. Esta función se usa cuando desea crear un nuevo objeto de enrutador en su programa para manejar
// Solicitudes
const router = express.Router()
const controller = require('../controllers/index.controller')

//router.use("/pagina",express.static(__dirname + "/public"))

// router.use(express.static(__dirname + "/public"));
router.use(express.static(__dirname + "/public"));
router.get('/', controller.index)
// Mi respuesta desde servicios externos.
router.get('/servicios', (req, res) => {
    res.send('Mi respuesta desde Express');
})


/*router.get('/', (req, res)=>{
    res.send("La conexion ha sido correcta");
})*/

// Exportar las rutas
module.exports = router