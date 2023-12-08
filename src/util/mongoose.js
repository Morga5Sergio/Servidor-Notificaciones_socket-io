import mongoose from 'mongoose'
import config from '../config'

const { MON_SAD_USR, MON_SAD_PASS, MON_SAD_URL } = config

// * Fuction para eliminar prefijo mongo
function quitarPrefijoMongoDB(url) {
  const regex = /^mongodb:\/\// // Expresión regular para buscar 'mongodb://'
  return url.replace(regex, '') // Reemplaza la coincidencia con una cadena vacía ''
}

// connection to db
;(async () => {
  try {
    if (!MON_SAD_USR || !MON_SAD_PASS || !MON_SAD_URL) {
      console.error('Faltan variables de configuración de la base de datos.')
      process.exit(1)
    }

    const uri = `mongodb://${MON_SAD_USR}:${encodeURIComponent(MON_SAD_PASS)}@${quitarPrefijoMongoDB(MON_SAD_URL)}?authMechanism=DEFAULT`

    await mongoose.connect(uri, {
      maxPoolSize: 50,
      wtimeoutMS: 2500
      // Otras opciones de configuración si es necesario
    })
    console.log('==================================Db connectect to========================================:', mongoose.connection.name)
  } catch (error) {
    console.error('==================================Error de conexión========================================:', error.message)
  }
})()
