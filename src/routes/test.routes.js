import { Router } from 'express'
import { getNotificacionPush, helloWorld, updateEstado } from '../controllers/test.controllers'
const router = Router()

router.post('/hello', helloWorld)
router.get('/notificaciones_push', getNotificacionPush)
router.get('/update_notificaciones_push', updateEstado)



export default router
