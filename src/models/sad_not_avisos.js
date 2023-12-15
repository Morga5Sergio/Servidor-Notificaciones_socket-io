const mongoose = require('mongoose')


const { Schema } = mongoose
 
const SadNotAvisosSchema = new Schema(
  {
    _id: Object,
    nit: Number,
    administracion: String,
    descripcion_dpto_genera: String,
    asunto: String,
    fecha_envio_aviso: Date,
    archivo_pdf: String,
    razon_social: String,
    fecha_lectura: Date,
    cantidad_lectura: Number,
    estado_aviso: Number,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_avisos'
  }
)

const SadNotAvisosModel = mongoose.model('sad_not_avisos', SadNotAvisosSchema)

module.exports = SadNotAvisosModel;

