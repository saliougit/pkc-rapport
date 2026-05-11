import { useState } from 'react'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup,
  CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'

export function ComboboxMulti({ options, selected, onChange, placeholder, emptyMessage }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (value) => {
    const newSelected = selected.includes(value)
      ? selected.filter(s => s !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const remove = (value) => {
    onChange(selected.filter(s => s !== value))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 text-sm font-normal text-gris-700"
          >
            <span className="truncate">
              {selected.length > 0
                ? `${selected.length} sélectionné(s)`
                : (placeholder || 'Sélectionner…')}
            </span>
            <ChevronsUpDown size={14} className="ml-2 flex-shrink-0 text-gris-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput
              placeholder="Rechercher…"
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>{emptyMessage || 'Aucun résultat'}</CommandEmpty>
              <CommandGroup>
                {filtered.map(option => {
                  const isSelected = selected.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggle(option.value)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? 'bg-vert-700 border-vert-700' : 'border-gris-300'
                      }`}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gris-900 truncate">{option.label}</p>
                        {option.subtitle && (
                          <p className="text-[11px] text-gris-500 truncate">{option.subtitle}</p>
                        )}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map(value => {
            const opt = options.find(o => o.value === value)
            if (!opt) return null
            return (
              <Badge key={value} variant="secondary" className="gap-1 px-2 py-0.5 text-xs font-normal">
                {opt.label}
                <button onClick={() => remove(value)} className="ml-0.5 hover:text-gris-900 transition-colors">
                  <X size={11} />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
