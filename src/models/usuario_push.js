const mongoose = require('mongoose')
const { Schema } = mongoose

// Modelo de base de datos
const UsuarioPushSchema = new Schema({
    _id: Object,
    usuario_registro_id: String,
    usuario_id: String,
    numero_documento: Number,
    codigo_complemento: String,
    tipo_documento_identidad_id: String,
    nombre_dispositivo: String,
    imei: String,
    fecha_registro: String,
    fecha_ultima_modificacion: String,
    estado_id: String

});

const UsuarioPushModel = mongoose.model('sad_not_usuarios_push', UsuarioPushSchema);

module.exports = UsuarioPushModel;               