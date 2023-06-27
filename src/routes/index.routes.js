const express = require('express')
const router = express.Router()
const controller = require('../controllers/index.controller')

router.get('/', controller.index)

/*router.get('/', (req, res)=>{
    res.send("La conexion ha sido correcta");
})*/

module.exports = router