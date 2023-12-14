let sadNotificacionesModeloMongo = {
    _id: "",
    usuario_registro_id: 0,
    usuario_ultima_modificacion_id: 0,
    nro_acto_administrativo: '',
    cadena_cite_actuado: '',
    tipo_acto_administrativo: 0,
    acto_administrativo: '',
    fecha_acto_administrativo: "",
    ci_usuario: '',
    lugar_expedicion_usuario: '',
    usuario_notificador: '',
    usuario_notificador_id: 0,
    codigo_admin_genera: 0,
    codigo_dpto_genera: 0,
    descripcion_depto_genera: '0',
    numero_fojas: 0,
    nit: 0,
    persona_contribuyente_id: 0,
    razon_social: '',
    archivo_adjunto_actuado_id: '',
    autoridad_competente: '',
    cargo_autoridad: '',
    gerencia_emisora: '',
    tipo_contribuyente: 0,
    ci_contribuyente: "",
    lugar_expedicion_contribuyente: 0,
    tipo_documento_contribuyente: "",
    fecha_envio_notificacion: "",
    fecha_vencimiento: "",
    fecha_visualizacion: "",
    admin_notifica: "",
    fecha_lectura: "",
    cantidad_lecturas: 0,
    fecha_prenotificacion: "",
    fecha_notificacion: "",
    archivo_adjunto_constancia_id: "",
    representante_lista: "",
    estado_notificacion_electronica_id: 0,
    fecha_registro: "",
    fecha_ultima_modificacion: "",
    estado_id: ''
}

// Crear un array con el modelo
let arrayNotificacion = [sadNotificacionesModeloMongo];

module.exports = arrayNotificacion;

