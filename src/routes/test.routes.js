import { Router } from 'express'
import { helloWorld } from '../controllers/test.controllers'
const router = Router()

router.post('/hello', helloWorld)

export default router
