import { memo } from 'react'
import { cn } from '../../utils/cn'

/**
 * Glassmorphism card component for modern MacBook-style design
 */
const GlassCard = memo(({ 
  children, 
  className = '', 
  hover = true,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "bg-white/5 backdrop-blur-xl border border-white/10",
        "shadow-lg shadow-black/20 transition-all duration-300",
        hover && 'hover:bg-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-black/30',
        className
      )}
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      {...props}
    >
      {children}
    </div>
  )
})

GlassCard.displayName = 'GlassCard'

export default GlassCard

