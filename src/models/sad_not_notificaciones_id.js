const mongoose = require('mongoose').Types.ObjectId;
const query = { campaign_id: new ObjectId(campaign._id) };
/*
    @author:  Gary_Morga
    @description:  Modelo de base datos sad_not_notificaciones, se realiza el modelaje de la coleccion 
    @date: 30/06/2023
*/
 
const SadNotNotificacionesSchema = new Schema({
    _id: Object,
    usuario_registro_id: Number,
    usuario_ultima_modificacion_id: Number,
    tipo_acto_administrativo: Number,
    acto_administrativo:String,
    numero_fojas: Number,
    fecha_acto_administrativo: Date,
    ci_usuario: String,
    cod_admin_genera: Number,
    cod_dpto_genera: Number,
    fecha_registro: Date,
    fecha_ultima_modificacion: Date,
    estado_id: String,
    cantidad_lecturas: Number,
    nro_acto_administrativo: String,
    fecha_envio_notificacion: Date,
    fecha_visualizacion: Date,
    fecha_notificacion: Date,
    fecha_prenotificacion: Date,
    persona_contribuyente_id: String,
    estado_notificacion_electronica_id: Number,
    gerencia_emisora: String,
    autoridad_competente: String,
    cargo_autoridad: String,
    ci_contribuyente: String,
    lugar_expedicion_contribuyente: String,
    lugar_expedicion_usuario: String,
    razon_social: String,
    fecha_lectura: Date,
    cadena_cite_actuado: String,
    nit: Number,
    usuario_notificador: String,
    usuario_notificador_id: Number,
    cod_admin_notifica: Number,
    archivo_adjunto_actuado_id: Object,
    archivo_adjunto_constancia_id:Object
});

const SadNotNotificacionesModel = mongoose.model('sad_not_notificaciones', SadNotNotificacionesSchema);
module.exports = SadNotNotificacionesModel;

