import NotificacionesPush from '../models/NotificacionesPush'

export const helloWorld = async (req, res) => {
  try {
    const clientIp = req.ip; // Obtiene la dirección IP del cliente
    return res.send('Tu dirección IP es: ' + clientIp);
  } catch (error) {
    console.log({ error })
    return res.render('error', { errorMessage: error.message })
  }
}

export const getNotificacionPush = async (req, res) => {
  try {
    // * Todas las notificaciones push:
    // const notificaciones = await NotificacionesPush.find({})

    // * Obtener los primeros 10 registros de notificaciones push
    const notificaciones = await NotificacionesPush.find({}).limit(10)
    
    // * Obtener el registro por el campo _id
    // const idBuscado = '6570fec52a18ba34f9915657'
    // const notificacion = await NotificacionesPush.findById(idBuscado)

    return res.json({ data: notificaciones })
  } catch (error) {
    console.log({ error })
    return res.render('error', { errorMessage: error.message })
  }
}

export const updateEstado = async (req, res) => {
  try {
    const idNotificacion = '6570fec52a18ba34f991564f' // ID de la notificación que quieres actualizar
    const nuevoEstado = true // El nuevo estado que deseas asignar

    // Actualizar el estado de la notificación por su ID
    const resultado = await NotificacionesPush.updateOne({ _id: idNotificacion }, { $set: { envio_socket: nuevoEstado } })

    // Verificar si se realizó la actualización
    if (resultado.nModified === 0) {
      return res.status(404).json({ message: 'No se pudo actualizar la notificación' })
    }

    return res.json({ message: 'Estado actualizado exitosamente' })
  } catch (error) {
    console.log({ error })
    return res.status(500).json({ error: 'Error al actualizar el estado' })
  }
}