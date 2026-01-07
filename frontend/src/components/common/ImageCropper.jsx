import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check } from 'lucide-react'
import Button from '../common/Button'
import { cn } from '../../utils/cn'

/**
 * ImageCropper Component
 * Renders a modal with crop functionality using react-easy-crop
 * 
 * @param {string} imageSrc - The source URL/DataURI of the image to crop
 * @param {Function} onCropComplete - Callback (blob) => void, called with the final cropped blob
 * @param {Function} onCancel - Callback to close the modal
 * @param {number} aspect - Aspect ratio (1 for square avatar, 16/9 for banner)
 */
const ImageCropper = ({ imageSrc, onCropComplete, onCancel, aspect = 1 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

    const onCropChange = useCallback((crop) => {
        setCrop(crop)
    }, [])

    const onZoomChange = useCallback((zoom) => {
        setZoom(zoom)
    }, [])

    const onCropCompleteHandler = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous') // needed to avoid CORS issues for cross-origin images
            image.src = url
        })

    const getCroppedImg = async (imageSrc, pixelCrop) => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            return null
        }

        // set canvas size to match the bounded box
        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        // draw image
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        // As Base64 string (optional) or Blob
        // return canvas.toDataURL('image/jpeg');

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                blob.name = 'cropped.jpeg'
                resolve(blob)
            }, 'image/jpeg', 0.95)
        })
    }

    const handleSave = async () => {
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedBlob)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className={cn("fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-sm pt-4 sm:pt-8 md:pt-12 overflow-y-auto")}>
            <div className={cn("bg-zinc-900 overflow-hidden border border-white/10 w-full max-w-xl mx-4 flex flex-col h-[80vh] max-h-[90vh]")}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <h3 className="text-white font-bold">Crop Image</h3>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Cropper Area */}
                <div className="relative flex-1 bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        classes={{
                            containerClassName: 'crop-container',
                            mediaClassName: 'crop-media',
                            cropAreaClassName: 'crop-area'
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="p-6 bg-zinc-900 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-zinc-400 font-bold uppercase">Zoom</span>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(e.target.value)}
                            className="w-full h-1 bg-zinc-700 appearance-none cursor-pointer accent-primary"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button onClick={handleSave} className="bg-primary text-black hover:bg-primary/90 gap-2">
                            <Check className="h-4 w-4" /> Apply Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageCropper
