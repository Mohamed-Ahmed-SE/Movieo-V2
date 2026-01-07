import { Link } from 'react-router-dom'
import Button from './Button'
import { cn } from '../../utils/cn'

/**
 * Reusable empty state component
 * Used in: Explore, Search, Watchlist pages
 */
const EmptyState = ({ 
  icon: Icon, 
  title = 'No results found', 
  message = 'Try adjusting your search or filters',
  actionLabel,
  actionTo,
  actionOnClick 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="mb-6 text-zinc-600">
          <Icon className="h-16 w-16 mx-auto" />
        </div>
      )}
      <h3 className={cn("text-2xl font-bold text-white mb-2")}>{title}</h3>
      <p className={cn("text-zinc-400 mb-8 max-w-md")}>{message}</p>
      {(actionLabel && actionTo) && (
        <Button to={actionTo} className="bg-primary text-black hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
      {(actionLabel && actionOnClick) && (
        <Button onClick={actionOnClick} className="bg-primary text-black hover:bg-primary/90">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState

