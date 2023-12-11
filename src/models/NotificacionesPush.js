const mongoose = require('mongoose')

const { Schema } = mongoose

const NotificacionesPushSchema = new Schema(
  {
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    cabecera: String,
    cuerpo: String,
    enlace: String,
    imagen: String,
    origen: String,
    id_notificacion: String,
    cantidad_lectura: Number,
    nit: String,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String,
    envio_socket: Boolean 
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_notificaciones_push'
  }
)

const NotificacionesPush = mongoose.model('NotificacionesPush', NotificacionesPushSchema)

module.exports = NotificacionesPush
