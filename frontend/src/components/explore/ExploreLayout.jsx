import { memo } from 'react'

/**
 * Main layout wrapper for explore pages
 * MacBook-style clean layout with glassmorphism
 */
const ExploreLayout = memo(({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-black ${className}`}>
      <div className="relative">
        {children}
      </div>
    </div>
  )
})

ExploreLayout.displayName = 'ExploreLayout'

export default ExploreLayout

