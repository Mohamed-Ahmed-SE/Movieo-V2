import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from '../../utils/cn'

const Modal = ({ open, onOpenChange, title, children, className = '' }) => {
  const contentRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      const ctx = gsap.context(() => {
        gsap.from(overlayRef.current, {
          opacity: 0,
          duration: 0.2,
        })
        gsap.from(contentRef.current, {
          scale: 0.95,
          opacity: 0,
          duration: 0.2,
          ease: 'back.out(1.7)',
        })
      })
      return () => ctx.revert()
    }
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <Dialog.Content
          ref={contentRef}
          className={cn(
            // Mobile: Full screen
            "fixed inset-0 sm:inset-auto z-50",
            // Desktop: Centered modal
            "sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
            // Size and layout
            "w-full sm:w-[90vw] md:w-full sm:max-w-lg lg:max-w-2xl",
            "h-full sm:h-auto sm:max-h-[90vh]",
            // Modern glassmorphism design
            "bg-zinc-900/95 backdrop-blur-xl",
            "border border-white/10 sm:border-white/20",
            "rounded-none sm:rounded-2xl",
            "shadow-2xl shadow-black/50",
            // Spacing
            "p-4 sm:p-5 md:p-6",
            "gap-3 sm:gap-4",
            // Scrolling
            "overflow-y-auto",
            // Animations
            "duration-300",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%]",
            "sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
            className
          )}
        >
          {title && (
            <Dialog.Title className="text-lg sm:text-xl md:text-2xl font-bold leading-tight tracking-tight text-white mb-2 sm:mb-3 pr-8 sm:pr-10">
              {title}
            </Dialog.Title>
          )}
          <Dialog.Description className="sr-only">
            {title ? `Modal content for ${title}` : 'Dialog content'}
          </Dialog.Description>
          <div className="text-sm sm:text-base text-zinc-300">
            {children}
          </div>
          <Dialog.Close
            className={cn(
              "absolute right-3 top-3 sm:right-4 sm:top-4",
              "z-10",
              "rounded-full",
              "bg-white/10 hover:bg-white/20",
              "backdrop-blur-sm",
              "border border-white/20",
              "p-2 sm:p-2.5",
              "transition-all duration-200",
              "opacity-80 hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-zinc-900",
              "disabled:pointer-events-none",
              "group"
            )}
          >
            <X className="h-5 w-5 sm:h-5 sm:w-5 text-white group-hover:rotate-90 transition-transform duration-200" />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal


