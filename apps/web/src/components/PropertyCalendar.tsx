'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { type DateRange } from 'react-day-picker'

interface PropertyCalendarProps {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
  disabledBefore?: Date
  disabledAfter?: Date
}

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isBefore(a: Date, b: Date) {
  return a.getTime() < b.getTime()
}

function isAfter(a: Date, b: Date) {
  return a.getTime() > b.getTime()
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function addMonths(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(1)
  d.setMonth(d.getMonth() + n)
  return d
}

interface MonthGridProps {
  year: number
  month: number
  selected: DateRange | undefined
  hovered: Date | null
  disabledBefore: Date | null
  disabledAfter: Date | null
  today: Date
  onDayClick: (day: Date) => void
  onDayHover: (day: Date | null) => void
}

function MonthGrid({
  year, month, selected, hovered,
  disabledBefore, disabledAfter,
  today, onDayClick, onDayHover
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)
  const cells: (Date | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))
  ]
  // Pad to complete last week row
  while (cells.length % 7 !== 0) cells.push(null)

  const effectiveTo = selected?.to ?? (hovered && selected?.from && isSameDay(hovered, selected.from) ? null : hovered)

  return (
    <div className="w-full">
      {/* Month name */}
      <p className="text-center font-fraunces font-bold text-sm text-ink-teal-900 mb-2">
        {MONTHS_ES[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_OF_WEEK.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-text-muted-custom uppercase tracking-wide py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} />
          }

          const todayMark = isSameDay(day, today)
          const isStart = selected?.from && isSameDay(day, selected.from)
          const isEnd = selected?.to && isSameDay(day, selected.to)

          // Determine if in range
          const from = selected?.from
          const to = effectiveTo
          const inRange = from && to
            ? (isSameDay(day, from) || isSameDay(day, to) || (isAfter(day, from) && isBefore(day, to)))
            : false

          const isDisabled =
            (disabledBefore && isBefore(startOfDay(day), startOfDay(disabledBefore))) ||
            (disabledAfter && isAfter(startOfDay(day), startOfDay(disabledAfter)))

          let cellBg = ''
          if (!isDisabled && inRange && !isStart && !isEnd) {
            cellBg = 'bg-[#0f766e]/10'
          }
          if (from && to && isSameDay(day, from) && !isSameDay(from, to)) {
            cellBg = 'bg-[#0f766e]/10 rounded-l-full'
          }
          if (from && to && isSameDay(day, to) && !isSameDay(from, to)) {
            cellBg = 'bg-[#0f766e]/10 rounded-r-full'
          }

          let dayBg = ''
          let dayText = 'text-ink-teal-900'
          if (isStart || isEnd) {
            dayBg = 'bg-[#0f766e] text-white font-bold rounded-full'
            dayText = 'text-white'
          } else if (todayMark && !inRange) {
            dayText = 'text-accent-mango font-bold'
          }

          return (
            <div key={idx} className={`${cellBg} flex items-center justify-center`}
              onMouseEnter={() => !isDisabled && onDayHover(day)}
              onMouseLeave={() => onDayHover(null)}
            >
              <button
                type="button"
                disabled={!!isDisabled}
                onClick={() => !isDisabled && onDayClick(day)}
                className={`
                  w-8 h-8 flex items-center justify-center text-xs font-inter
                  transition-colors rounded-full
                  ${isDisabled ? 'opacity-25 cursor-not-allowed text-gray-400' : 'hover:bg-[#0f766e]/20 cursor-pointer'}
                  ${dayBg} ${!(isStart || isEnd) ? dayText : ''}
                `}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PropertyCalendar({
  selected, onSelect, disabledBefore, disabledAfter
}: PropertyCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), [])

  // Start showing from current month or from available_from if later
  const initialMonth = useMemo(() => {
    if (disabledBefore && isAfter(disabledBefore, today)) {
      return new Date(disabledBefore.getFullYear(), disabledBefore.getMonth(), 1)
    }
    return new Date(today.getFullYear(), today.getMonth(), 1)
  }, [disabledBefore, today])

  const [baseMonth, setBaseMonth] = useState(initialMonth)
  const [hovered, setHovered] = useState<Date | null>(null)

  // Compute second month
  const secondMonth = addMonths(baseMonth, 1)

  const handlePrev = () => setBaseMonth(prev => addMonths(prev, -1))
  const handleNext = () => setBaseMonth(prev => addMonths(prev, 1))

  const handleDayClick = (day: Date) => {
    if (!selected?.from || (selected.from && selected.to)) {
      // Start new range
      onSelect({ from: day, to: undefined })
    } else {
      // Complete the range
      const from = selected.from
      if (isBefore(day, from)) {
        onSelect({ from: day, to: from })
      } else if (isSameDay(day, from)) {
        onSelect(undefined)
      } else {
        onSelect({ from, to: day })
      }
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Unified navigation header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={handlePrev}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-surface-mist transition-colors text-ink-teal-900"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-fraunces font-semibold text-xs text-text-muted-custom uppercase tracking-wide">
          Selecciona las fechas de estadía
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-neutral-200 hover:bg-surface-mist transition-colors text-ink-teal-900"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Months grid: 1 col on mobile, 2 cols on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-3 pb-4 md:px-4">
        <MonthGrid
          year={baseMonth.getFullYear()}
          month={baseMonth.getMonth()}
          selected={selected}
          hovered={hovered}
          disabledBefore={disabledBefore ?? null}
          disabledAfter={disabledAfter ?? null}
          today={today}
          onDayClick={handleDayClick}
          onDayHover={setHovered}
        />
        {/* Divider on desktop */}
        <div className="hidden md:block border-l border-neutral-100 pl-4 md:pl-0">
          <MonthGrid
            year={secondMonth.getFullYear()}
            month={secondMonth.getMonth()}
            selected={selected}
            hovered={hovered}
            disabledBefore={disabledBefore ?? null}
            disabledAfter={disabledAfter ?? null}
            today={today}
            onDayClick={handleDayClick}
            onDayHover={setHovered}
          />
        </div>
      </div>

      {/* Selection summary */}
      {(selected?.from || selected?.to) && (
        <div className="border-t border-neutral-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex gap-4 text-xs font-inter">
            <span>
              <span className="text-text-muted-custom">Check-in: </span>
              <span className="font-bold text-ink-teal-900">
                {selected.from ? selected.from.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
              </span>
            </span>
            <span>
              <span className="text-text-muted-custom">Check-out: </span>
              <span className="font-bold text-ink-teal-900">
                {selected.to ? selected.to.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className="text-[10px] font-bold text-[#0f766e] hover:underline"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  )
}
