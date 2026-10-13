import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { DayCounts } from '../types'
import { LEVEL_COLORS, WEEKDAYS, buildHeatmap, buildSvg, dayKey, isLabeledRow, shortDate } from './heatmap'

const STORE_KEY = 'days'
const LABEL_WIDTH = 4

const days = atom({ plugin: 'prompts-per-day', key: 'days' } as const, {})
const isOpen = atom({ plugin: 'prompts-per-day', key: 'isOpen' } as const, false)

const isDayCounts = (value: unknown): value is DayCounts =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const PPD = { name: 'ppd', description: 'Abre ou fecha o painel de prompts por dia' }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register(PPD)

    const saved = await $.store.get(STORE_KEY)

    if (isDayCounts(saved)) {
      await update($, days, () => saved)
    }

    return next(e)
  })

  // Declaring a name again replaces it, so the command is put back after a hot reload,
  // which does not always raise session.start.
  on('turn.complete', async ($, e, next) => {
    await $.command.register(PPD)

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await $.command.register(PPD)

    if (e.text.trim() !== '') {
      const key = dayKey(new Date(await $.clock.now()))
      const updated = await update($, days, counts => ({ ...counts, [key]: (counts[key] ?? 0) + 1 }))
      await $.store.set(STORE_KEY, updated)
    }

    return next(e)
  })

  on('command.run', { command: 'ppd' }, async $ => {
    const open = await update($, isOpen, value => !value)

    return { text: open ? 'Painel de prompts aberto.' : 'Painel de prompts fechado.' }
  })

  // The heatmap is a band directly above the prompt box, not a docked pane.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isOpen))) {
      return next(e)
    }

    const ui = $.ui.resolve(e)
    const { Box, Text } = ui
    const counts = await read($, days)
    const map = buildHeatmap(counts, new Date(await $.clock.now()))

    // Surfaces that draw vectors get the year as one SVG with a tooltip on each day;
    // the terminal gets a text grid whose weeks and months share the row's width.
    const grid =
      'Svg' in ui ? (
        <ui.Svg
          source={buildSvg(map)}
          alt={`${map.total} prompts em ${map.year}, um quadrado por dia`}
          isInteractive
        />
      ) : (
        <Box flexDirection="column">
          <Box>
            <Box width={LABEL_WIDTH} />
            <Box flexGrow={1}>
              {map.months.map(month => (
                <Box width={0} flexGrow={month.weeks}>
                  <Text dimColor wrap="truncate-end">
                    {month.label}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
          {WEEKDAYS.map((label, row) => (
            <Box>
              <Box width={LABEL_WIDTH}>
                <Text dimColor>{isLabeledRow(row) ? label : ""}</Text>
              </Box>
              <Box flexGrow={1}>
                {map.weeks.map(week => {
                  const cell = week[row]

                  return (
                    <Box width={0} flexGrow={1}>
                      {cell !== undefined && cell.inYear && <Text color={LEVEL_COLORS[cell.level]}>■</Text>}
                    </Box>
                  )
                })}
              </Box>
            </Box>
          ))}
        </Box>
      )

    return (
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text bold>
            {map.total} prompts em {map.year} · {map.today} hoje
          </Text>
          <Text>
            <Text dimColor>Menos </Text>
            {LEVEL_COLORS.map(color => (
              <Text color={color}>■ </Text>
            ))}
            <Text dimColor>
              Mais · dia mais cheio:{' '}
              {map.bestDay === null ? '—' : `${shortDate(map.bestDay)} (${map.best})`}
            </Text>
          </Text>
        </Box>
        {grid}
      </Box>
    )
  })
}
