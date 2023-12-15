const mongoose = require('mongoose')
const { Schema } = mongoose
 
const SadNotMensajeriaPushSchema = new Schema(
  {
    _id: Object,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    cabecera: String,
    cuerpo: String,
    enlace: String,
    imagen: String,
    origen: String,
    id_mensaje: String,
    cantidad_lectura: Number,
    nit: String,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_men_mensajes_push'
  }
)

const SadNotMensajeriaPushModel = mongoose.model('sad_men_mensajes_push', SadNotMensajeriaPushSchema)

module.exports = SadNotMensajeriaPushModel;

