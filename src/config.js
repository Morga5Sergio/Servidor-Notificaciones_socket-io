module.exports = {
  PORT: process.env.PORT_SOCKET || 39568,
  BACK_MENSAJERIA: process.env.BACK_MENSAJERIA || 'http://10.1.34.29:39559', // https://desasiatservicios.impuestos.gob.bo/sad-men-rest/
  PUBLIC_KEY: process.env.PUBLIC_KEY_WEB_PUSH || 'BKbDv1DiuvXSl4Tz6jYTklivIxYjRRaJUgVjWaP4lAm8XSiZe8UjWBxxF-dMjZIl04svkre6Hina-nNNlryBvKg',
  PRIVATE_KEY: process.env.PRIVATE_KEY_WEB_PUSH || '0giCCcZw9RhRoqoeO1Ejy2SsIFb6n4460Shf4oWk2Bc',
  TOKEN_GENERICO: process.env.TOKEN_GENERICO || 'https://desasiatservicios.impuestos.gob.bo/str-cau-caut-rest',
  URL_WEB_NOTIFICACION: process.env.URL_WEB_NOTIFICACION || 'http://localhost:4200',
  PULSAR_BROKERS: process.env.PULSAR_BROKERS || 'pulsar://10.1.17.35:6650,10.1.17.36:6650,10.1.17.37:6650',
  PULSAR_TENANT: process.env.PULSAR_TENANT || 'desarrollo',

  // * Config DB
  MON_SAD_USR: process.env.MON_SAD_USR || 'pool_sad_not_notificaciones',
  MON_SAD_PASS: process.env.MON_SAD_PASS || '!123abc',
  MON_SAD_URL: process.env.MON_SAD_URL || '10.1.38.204:27017,10.1.38.205:27017,10.1.38.206:27017/sad_notificaciones'

  // MON_SAD_USR: 'pool_sad_not_notificaciones',
  // MON_SAD_PASS: '!123abc',
  // MON_SAD_URL: '10.1.38.204:27017,10.1.38.205:27017,10.1.38.206:27017/sad_notificaciones'
}
