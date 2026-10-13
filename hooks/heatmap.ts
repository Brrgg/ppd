import type { DayCounts } from '../types'

export const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

/** Monday first, matching the rows of the grid. */
export const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/** Rows that carry a day name (Seg, Qua, Sex, Dom); the others stay blank so the labels are not cramped. */
export const isLabeledRow = (row: number) => row % 2 === 0

export const LEVEL_COLORS = ['#30363d', '#0e4429', '#006d32', '#26a641', '#39d353']

/** `inYear` is false for the padding days before 1 Jan and after 31 Dec in the first and last week. */
export type Cell = { key: string; count: number; level: number; inYear: boolean }

export type MonthLabel = { label: string; weeks: number }

export type Heatmap = {
  year: number
  weeks: Cell[][]
  months: MonthLabel[]
  total: number
  today: number
  best: number
  /** `YYYY-MM-DD` of the busiest day (the latest on a tie); null while the year has no prompts. */
  bestDay: string | null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** `2026-10-12` to `12/10`. */
export const shortDate = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`

export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const levelFor = (count: number, best: number) =>
  count <= 0 || best <= 0 ? 0 : Math.min(4, Math.ceil((count / best) * 4))

/** The whole calendar year of `now`, Jan to Dec: columns are weeks (Monday first), rows Mon..Sun. */
export const buildHeatmap = (days: DayCounts, now: Date): Heatmap => {
  const year = now.getFullYear()
  const jan1 = new Date(year, 0, 1)
  const dec31 = new Date(year, 11, 31)
  const lead = (jan1.getDay() + 6) % 7
  const dayCount = Math.round((dec31.getTime() - jan1.getTime()) / 86_400_000) + 1
  const weekCount = Math.ceil((lead + dayCount) / 7)

  let best = 0
  let bestDay: string | null = null
  let total = 0
  const weeks: Cell[][] = []

  for (let w = 0; w < weekCount; w++) {
    const week: Cell[] = []

    for (let d = 0; d < 7; d++) {
      const date = new Date(year, 0, 1 - lead + w * 7 + d)
      const key = dayKey(date)
      const inYear = date.getFullYear() === year
      const count = inYear ? (days[key] ?? 0) : 0
      if (count > 0 && count >= best) {
        best = count
        bestDay = key
      }

      total += count
      week.push({ key, count, level: 0, inYear })
    }

    weeks.push(week)
  }

  for (const week of weeks) {
    for (const cell of week) {
      cell.level = levelFor(cell.count, best)
    }
  }

  // A month's label sits over the week holding its 1st and spans to the next month's.
  const firstWeeks = MONTHS.map((_, m) => {
    const dayOfYear = Math.round((new Date(year, m, 1).getTime() - jan1.getTime()) / 86_400_000)

    return Math.floor((lead + dayOfYear) / 7)
  })
  const months: MonthLabel[] = MONTHS.map((label, m) => ({
    label,
    weeks: (firstWeeks[m + 1] ?? weekCount) - (firstWeeks[m] as number),
  }))

  return { year, weeks, months, total, today: days[dayKey(now)] ?? 0, best, bestDay }
}

const CELL = 10
const GAP = 3
const PITCH = CELL + GAP
const LABEL_X = 32
const MONTH_Y = 11
const GRID_Y = 16

const plural = (n: number) => `${n} ${n === 1 ? 'prompt' : 'prompts'}`

/**
 * The year as one SVG: real squares, a `<title>` tooltip on each day, and a viewBox so it
 * scales with the width it is given. Day labels and months use a mid grey that reads on
 * dark and light backgrounds alike.
 */
export const buildSvg = (map: Heatmap): string => {
  const width = LABEL_X + map.weeks.length * PITCH
  const height = GRID_Y + 7 * PITCH - GAP
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" font-family="system-ui, sans-serif" font-size="12">`,
    '<style>rect.d:hover{stroke:#8b949e;stroke-width:1.5}</style>',
  ]

  let col = 0

  for (const month of map.months) {
    parts.push(`<text x="${LABEL_X + col * PITCH}" y="${MONTH_Y}" fill="#8b949e">${month.label}</text>`)
    col += month.weeks
  }

  WEEKDAYS.forEach((label, row) => {
    if (!isLabeledRow(row)) {
      return
    }

    parts.push(`<text x="0" y="${GRID_Y + row * PITCH + CELL}" fill="#8b949e">${label}</text>`)
  })

  map.weeks.forEach((week, w) => {
    week.forEach((cell, row) => {
      if (!cell.inYear) {
        return
      }

      const x = LABEL_X + w * PITCH
      const y = GRID_Y + row * PITCH
      parts.push(
        `<rect class="d" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${LEVEL_COLORS[cell.level]}"><title>${shortDate(cell.key)} · ${plural(cell.count)}</title></rect>`,
      )
    })
  })

  parts.push('</svg>')

  return parts.join('')
}
