import express from 'express'
import { listsController } from '../controllers/listsController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

router.get('/', listsController.getUserLists)
router.post('/', listsController.addToList)
router.put('/:id', listsController.updateListItem)
router.delete('/:id', listsController.removeFromList)
router.post('/progress', listsController.updateProgress)

export default router


