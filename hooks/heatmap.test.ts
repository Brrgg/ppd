import { expect, test } from 'claude-code/testing'

import { MONTHS, buildHeatmap, dayKey, levelFor, shortDate } from './heatmap'

// Wednesday, 14 Oct 2026; 1 Jan 2026 is a Thursday
const NOW = new Date(2026, 9, 14)

test('levelFor scales against the busiest day', () => {
  expect(levelFor(0, 10)).toBe(0)
  expect(levelFor(1, 10)).toBe(1)
  expect(levelFor(10, 10)).toBe(4)
  expect(levelFor(5, 0)).toBe(0)
})

test('the grid is the whole year, Monday first, with padding outside it', () => {
  const map = buildHeatmap({ [dayKey(NOW)]: 3, '2026-10-12': 6, '2026-12-31': 1 }, NOW)
  const first = map.weeks[0]
  const last = map.weeks[map.weeks.length - 1]

  expect(map.year).toBe(2026)
  expect(map.weeks.length).toBe(53)
  expect(first?.map(c => c.inYear)).toEqual([false, false, false, true, true, true, true])
  expect(first?.[3]?.key).toBe('2026-01-01')
  expect(last?.[3]?.key).toBe('2026-12-31')
  expect(last?.[4]?.inYear).toBe(false)
  expect(map.total).toBe(10)
  expect(map.today).toBe(3)
  expect(map.best).toBe(6)
  expect(map.bestDay).toBe('2026-10-12')
  expect(shortDate('2026-10-12')).toBe('12/10')
  expect(buildHeatmap({}, NOW).bestDay).toBe(null)
})

test('months run Jan to Dec and cover every week once', () => {
  const map = buildHeatmap({}, NOW)

  expect(map.months.map(m => m.label)).toEqual(MONTHS)
  expect(map.months.reduce((sum, m) => sum + m.weeks, 0)).toBe(map.weeks.length)
  expect(map.months.every(m => m.weeks >= 4)).toBe(true)
})
