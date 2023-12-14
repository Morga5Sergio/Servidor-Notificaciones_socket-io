const mongoose = require('mongoose')
const { Schema } = mongoose
 
const SadNotNotificacionesPushSchema = new Schema({
    _id: Object,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id:Number,
    cabecera: String,
    cuerpo: String,
    enlace: String,
    imagen:String,
    origen: String,
    id_notificacion: String,
    cantidad_lectura: String,
    nit: String,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String,
    envio_socket: Boolean,
    updatedAt: Date
},
{
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_notificaciones_push'
}
);

const SadNotNotificacionesPushModel = mongoose.model('sad_not_notificaciones_push', SadNotNotificacionesPushSchema);

module.exports = SadNotNotificacionesPushModel;

