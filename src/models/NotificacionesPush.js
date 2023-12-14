const mongoose = require('mongoose')

const { Schema } = mongoose

const NotificacionesPushSchema = new Schema(
  {
    _id: Object,
    cabecera: String,
    cuerpo: String,
    origen: String,
    cantidad_lectura: Number,
    nit: String,
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_notificaciones_push'
  }
)

const NotificacionesPush = mongoose.model('NotificacionesPush', NotificacionesPushSchema)

module.exports = NotificacionesPush
