module.exports = {
  PORT: process.env.PORT || 3001,
  BACK_MENSAJERIA: process.env.BACK_MENSAJERIA || 'http://localhost:39559',
  PUBLIC_KEY:process.env.PUBLIC_KEY_WEB_PUSH || "Llave Publica",   
  PRIVATE_KEY: process.env.PRIVATE_KEY_WEB_PUSH || "Llave Privada", 
  TOKEN_GENERICO: process.env.TOKEN_GENERICO || 'https://desasiatservicios.impuestos.gob.bo',
  URL_WEB_NOTIFICACION: process.env.URL_WEB_NOTIFICACION || 'http://localhost:4200',
  PULSAR_BROKERS: process.env.PULSAR_BROKERS || 'pulsar://10.1.17.35:6650,10.1.17.36:6650,10.1.17.37:6650',
  PULSAR_TENANT: process.env.PULSAR_TENANT || 'desarrollo'
}
