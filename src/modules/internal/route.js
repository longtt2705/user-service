import { Router } from 'express'
import controller from './controller'

const router = Router()

router.get('/:id', controller.getUser)

export default router
