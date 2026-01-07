import { X } from 'lucide-react'
import { memo } from 'react'
import { cn } from '../../utils/cn'

const FilterChip = ({ label, value, onRemove, className = '' }) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded",
        "bg-primary/20 border border-primary/50 text-primary",
        "font-semibold text-sm",
        className
      )}
    >
      <span>{label}: {value}</span>
      <button
        onClick={onRemove}
        className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}

export default memo(FilterChip)

