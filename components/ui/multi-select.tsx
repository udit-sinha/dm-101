"use client"

import * as React from "react"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./command"

interface MultiSelectProps {
  values: string[]
  options: string[]
  placeholder?: string
  onChange: (values: string[]) => void
}

export function MultiSelect({ values, options, placeholder, onChange }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value]
    onChange(newValues)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {values.length === 0
              ? placeholder
              : values.length === 1
              ? values[0]
              : `${values.length} selected`}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder?.toLowerCase() || 'options'}...`} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-[200px] overflow-auto">
            {options.map((option) => (
              <CommandItem
                key={option}
                onSelect={() => handleSelect(option)}
                className="flex items-center gap-2"
              >
                <Checkbox checked={values.includes(option)} />
                <span>{option}</span>
                {values.includes(option) && (
                  <Check className="ml-auto h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
