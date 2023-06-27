const mongoose = require('mongoose')
const { Schema } = mongoose

// Modelo de base de datos Prueba Mongo 
const NotificacionesPushSchema = new Schema({
    ci: String,
    mac: String
})

const NotificacionesPushModel = mongoose.model('sad_not_notificaciones_push_pruebas', NotificacionesPushSchema);

module.exports = NotificacionesPushModel;