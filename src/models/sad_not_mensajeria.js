const mongoose = require('mongoose')


const { Schema } = mongoose
 
const SadNotMensajeriaSchema = new Schema(
  {
    _id: Object,
    nit: Number,
    administracion: String,
    descripcion_dpto_genera: String,
    asunto: String,
    fecha_envio_mensaje: Date,
    fecha_lectura: Date,
    cantidad_lectura: Number,
    estado_mensaje: Number,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    origen: String,
    estado_id: String
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_men_mensajeria'
  }
)

const SadNotMensajeriaModel = mongoose.model('sad_men_mensajeria', SadNotMensajeriaSchema)

module.exports = SadNotMensajeriaModel;

