import express from 'express'
import { customizationController } from '../controllers/customizationController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.use(authenticate)

// Get all customizations for the logged in user
router.get('/', customizationController.getAllCustomizations)

router.get('/:mediaId', customizationController.getCustomization)
router.put('/:mediaId', customizationController.updateCustomization)

export default router


