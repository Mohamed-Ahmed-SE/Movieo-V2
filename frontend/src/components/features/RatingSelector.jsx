import * as Label from '@radix-ui/react-label'
import { RATING_SCALE } from '../../utils/constants'
import { cn } from '../../utils/cn'

const RatingSelector = ({ value, onChange }) => {
  return (
    <div>
      <Label.Root className="text-sm font-medium mb-2 block text-foreground">Rating</Label.Root>
      <div className="flex items-center space-x-2">
        {Array.from({ length: RATING_SCALE.MAX }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            onClick={() => onChange(value === rating ? 0 : rating)}
            className={cn(
              "w-10 h-10 rounded-md border transition-all",
              value >= rating
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50'
            )}
          >
            {rating}
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            ({value}/{RATING_SCALE.MAX})
          </span>
        )}
      </div>
    </div>
  )
}

export default RatingSelector


