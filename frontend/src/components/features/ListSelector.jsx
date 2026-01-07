import * as Label from '@radix-ui/react-label'
import { LIST_TYPES, LIST_TYPE_LABELS } from '../../utils/constants'
import { cn } from '../../utils/cn'

const ListSelector = ({ value, onChange }) => {
  return (
    <div>
      <Label.Root className="text-sm font-medium mb-2 block text-foreground">Add to List</Label.Root>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.values(LIST_TYPES).map((listType) => (
          <button
            key={listType}
            onClick={() => onChange(listType)}
            className={cn(
              "p-3 rounded-md border transition-all",
              value === listType
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border hover:border-primary/50'
            )}
          >
            {LIST_TYPE_LABELS[listType]}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ListSelector


