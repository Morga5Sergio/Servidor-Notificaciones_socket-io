let sadAvisosModeloMongoPush = {
  _id: '',
  usuario_registro_id: 0,
  usuario_ultima_modificacion_id: 0,
  cabecera: '',
  cuerpo: '',
  enlace: null,
  imagen: null,
  origen: '',
  id_aviso: '',
  cantidad_lectura: 0,
  nit: '',
  fecha_registro: '',
  fecha_ultima_modificacion: '',
  estado_id: 'AC',
  envio_socket: false
}

// Crear un array con el modelo
let arrayAvisosPush = [sadAvisosModeloMongoPush];

module.exports = arrayAvisosPush;

