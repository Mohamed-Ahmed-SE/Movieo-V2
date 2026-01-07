import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { Grid, List, LayoutGrid } from 'lucide-react'
import { memo } from 'react'
import { cn } from '../../utils/cn'

const ViewToggle = ({ 
  viewMode = 'grid', 
  onViewChange,
  gridSize = 4,
  onGridSizeChange,
  showGridSize = true
}) => {
  const gridSizes = [2, 3, 4, 5, 6]

  return (
    <div className="flex items-center gap-2">
      {/* View Mode Toggle Group */}
      <ToggleGroup.Root
        type="single"
        value={viewMode}
        onValueChange={(value) => {
          if (value) onViewChange(value)
        }}
        className="flex items-center gap-2"
      >
        <ToggleGroup.Item
          value="grid"
          aria-label="Grid View"
          className={cn(
            "p-2 transition-all rounded",
            "data-[state=on]:bg-primary data-[state=on]:text-white",
            "data-[state=off]:bg-zinc-800 data-[state=off]:text-zinc-400",
            "hover:bg-zinc-700 hover:text-white"
          )}
        >
          <Grid className="h-5 w-5" />
        </ToggleGroup.Item>

        <ToggleGroup.Item
          value="list"
          aria-label="List View"
          className={cn(
            "p-2 transition-all rounded",
            "data-[state=on]:bg-primary data-[state=on]:text-white",
            "data-[state=off]:bg-zinc-800 data-[state=off]:text-zinc-400",
            "hover:bg-zinc-700 hover:text-white"
          )}
        >
          <List className="h-5 w-5" />
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      {/* Grid Size Selector */}
      {viewMode === 'grid' && showGridSize && (
        <ToggleGroup.Root
          type="single"
          value={String(gridSize)}
          onValueChange={(value) => {
            if (value) onGridSizeChange(Number(value))
          }}
          className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10"
        >
          <LayoutGrid className="h-4 w-4 text-zinc-400 mr-1" />
          {gridSizes.map((size) => (
            <ToggleGroup.Item
              key={size}
              value={String(size)}
              aria-label={`${size} columns`}
              className={cn(
                "px-2 py-1 text-xs font-semibold transition-all rounded",
                "data-[state=on]:bg-primary data-[state=on]:text-white",
                "data-[state=off]:bg-zinc-800 data-[state=off]:text-zinc-400",
                "hover:bg-zinc-700 hover:text-white"
              )}
            >
              {size}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      )}
    </div>
  )
}

export default memo(ViewToggle)

