import * as Accordion from '@radix-ui/react-accordion'
import { useState, useEffect, useRef } from 'react'
import { X, Filter, ChevronDown } from 'lucide-react'
import { gsap } from 'gsap'
import GenreChip from './GenreChip'
import FilterChip from './FilterChip'
import { cn } from '../../utils/cn'

const FiltersSidebar = ({
  isOpen = true,
  onToggle,
  genres = [],
  selectedGenres = [],
  onGenreToggle,
  yearRange = [1900, new Date().getFullYear()],
  onYearRangeChange,
  ratingRange = [0, 10],
  onRatingRangeChange,
  mediaType = 'all',
  onMediaTypeChange,
  onClearFilters,
  isMobile = false
}) => {
  const sidebarRef = useRef(null)

  // Animation for mobile bottom sheet
  useEffect(() => {
    if (isMobile && sidebarRef.current) {
      if (isOpen) {
        gsap.to(sidebarRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out'
        })
      } else {
        gsap.to(sidebarRef.current, {
          y: '100%',
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        })
      }
    }
  }, [isOpen, isMobile])

  const activeFiltersCount = selectedGenres.length + 
    (yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear() ? 1 : 0) +
    (ratingRange[0] !== 0 || ratingRange[1] !== 10 ? 1 : 0) +
    (mediaType !== 'all' ? 1 : 0)

  const sidebarContent = (
    <div className="h-full overflow-y-auto scrollbar-hide max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-white">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onToggle}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <Accordion.Root type="multiple" defaultValue={['genres', 'year', 'rating', 'type']} className="p-3 space-y-4">
        {/* Media Type */}
        <Accordion.Item value="type" className="border-b border-white/10">
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full mb-2 text-xs text-white font-semibold hover:no-underline group">
              <span>Type</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-1.5 pt-2">
              {['all', 'movie', 'tv', 'anime'].map((type) => (
                <button
                  key={type}
                  onClick={() => onMediaTypeChange(type)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs rounded transition-all",
                    mediaType === type
                      ? 'bg-primary text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Genres */}
        <Accordion.Item value="genres" className="border-b border-white/10">
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full mb-2 text-xs text-white font-semibold hover:no-underline group">
              <span>Genres</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-hide pt-2">
              {genres.map((genre) => (
                <GenreChip
                  key={genre}
                  genre={genre}
                  isActive={selectedGenres.includes(genre)}
                  onClick={() => onGenreToggle(genre)}
                  className="text-xs px-2 py-1"
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Year Range */}
        <Accordion.Item value="year" className="border-b border-white/10">
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full mb-2 text-xs text-white font-semibold hover:no-underline group">
              <span>Year</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{yearRange[0]}</span>
                <span>{yearRange[1]}</span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={yearRange[0]}
                  onChange={(e) => onYearRangeChange([parseInt(e.target.value), yearRange[1]])}
                  className="w-full h-1.5"
                />
                <input
                  type="range"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={yearRange[1]}
                  onChange={(e) => onYearRangeChange([yearRange[0], parseInt(e.target.value)])}
                  className="w-full h-1.5"
                />
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>

        {/* Rating Range */}
        <Accordion.Item value="rating" className="border-b border-white/10">
          <Accordion.Header>
            <Accordion.Trigger className="flex items-center justify-between w-full mb-2 text-xs text-white font-semibold hover:no-underline group">
              <span>Rating</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{ratingRange[0]}</span>
                <span>{ratingRange[1]}</span>
              </div>
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={ratingRange[0]}
                  onChange={(e) => onRatingRangeChange([parseFloat(e.target.value), ratingRange[1]])}
                  className="w-full h-1.5"
                />
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={ratingRange[1]}
                  onChange={(e) => onRatingRangeChange([ratingRange[0], parseFloat(e.target.value)])}
                  className="w-full h-1.5"
                />
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={onClearFilters}
            className="w-full px-3 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
        {/* Mobile Bottom Sheet */}
        <div
          ref={sidebarRef}
          className="fixed bottom-0 left-0 right-0 h-[80vh] bg-zinc-900 border-t border-white/10 z-50 rounded-t-2xl"
          style={{ transform: 'translateY(100%)' }}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  return (
    <div className="w-56 bg-zinc-900 border border-white/10 h-full">
      {sidebarContent}
    </div>
  )
}

export default FiltersSidebar

