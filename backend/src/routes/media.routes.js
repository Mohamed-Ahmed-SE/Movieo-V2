import express from 'express'
import { mediaController } from '../controllers/mediaController.js'

const router = express.Router()

// Order matters - specific routes before dynamic ones
router.get('/trending/:type?', mediaController.getTrending)
router.get('/search', mediaController.search)
router.get('/person/:id', mediaController.getPerson)
router.get('/:type/:id/episodes', mediaController.getEpisodes)
router.get('/:type/:id/characters', mediaController.getCharacters)
router.get('/:type/:id/images', mediaController.getImages)
router.get('/:type/:id', mediaController.getDetails)

export default router
