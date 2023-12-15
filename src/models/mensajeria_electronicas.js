let avisos_dto = {
  archivoPdf: '',
  usuarioRegistroId: 0,
  usuarioUltimaModificacionId: 0,
  fechaRegistro: '',
  fechaUltimaModificacion: ''
}

let avisos_electronicas_dto = {
  avisoPushId: '',
  idAviso: '',
  cabecera: '',
  cuerpo: '',
  origen: '',
  cantidadLectura: 0,
  nit: '',
  usuarioRegistroId: 0,
  usuarioUltimaModificacionId: 0,
  fechaRegistro: '',
  fechaUltimaModificacion: '',
  estadoId: '',
  archivoPdf: '',
  avisos: {}
}

module.exports = { avisos_dto, avisos_electronicas_dto }
