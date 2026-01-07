import express from 'express'
import { userController } from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js'

import { upload } from '../middleware/upload.js'

const router = express.Router()

router.get('/:userId?', authenticate, userController.getProfile)
router.put('/profile', authenticate, userController.updateProfile)
router.post('/upload/:type', authenticate, upload.single('image'), userController.uploadImage)
router.get('/:userId/stats', authenticate, userController.getStats)

export default router


