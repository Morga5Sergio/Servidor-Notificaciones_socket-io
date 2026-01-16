const mongoose = require('mongoose')


const { Schema } = mongoose
 
const SadNotNotificacionesSchema = new Schema({
    _id: Object,
    estado_notificacion_electronica_id: Number,
    acto_administrativo:String,
    archivo_adjunto_actuado_id: Object,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
},
{
    timestamps: true,
    versionKey: false,
    collection: 'sad_not_notificaciones'
}
);

const SadNotNotificacionesModel = mongoose.model('sad_not_notificaciones', SadNotNotificacionesSchema);

module.exports = SadNotNotificacionesModel;

