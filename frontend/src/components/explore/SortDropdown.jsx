import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '../../utils/cn'

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'release_date', label: 'Release Date' },
  { value: 'title', label: 'Title' },
]

const SortDropdown = ({ 
  sortBy = 'popularity', 
  sortOrder = 'desc',
  onSortChange,
  onOrderChange 
}) => {
  const currentOption = SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0]

  const toggleOrder = () => {
    onOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="flex items-center gap-2">
      {/* Sort Order Toggle */}
      <button
        onClick={toggleOrder}
        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors rounded"
        title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        {sortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4" />
        ) : (
          <ArrowDown className="h-4 w-4" />
        )}
      </button>

      {/* Sort Dropdown */}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white transition-colors min-w-[160px] justify-between rounded"
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="text-sm font-semibold">{currentOption.label}</span>
            </div>
            <ChevronDown className="h-4 w-4 transition-transform" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={cn(
              "min-w-[200px] bg-zinc-900 border border-white/10 p-1 shadow-lg z-50",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            align="end"
            sideOffset={8}
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownMenu.Item
                key={option.value}
                onSelect={() => onSortChange(option.value)}
                className={cn(
                  "relative flex cursor-pointer select-none items-center px-4 py-2 text-sm outline-none transition-colors",
                  "focus:bg-accent focus:text-accent-foreground",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  sortBy === option.value && "bg-primary text-white"
                )}
              >
                {option.label}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  )
}

export default SortDropdown

