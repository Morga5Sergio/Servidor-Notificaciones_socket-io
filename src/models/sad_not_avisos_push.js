const mongoose = require('mongoose')
const { Schema } = mongoose
 
const SadNotAvisosPushSchema = new Schema(
  {
    _id: Object,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    cabecera: String,
    cuerpo: String,
    enlace: String,
    imagen: String,
    origen: String,
    id_aviso: String,
    cantidad_lectura: Number,
    nit: String,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String
  },
  {
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_avisos_push'
  }
)

const SadNotAvisosPushModel = mongoose.model('sad_not_avisos_push', SadNotAvisosPushSchema);

module.exports = SadNotAvisosPushModel;

