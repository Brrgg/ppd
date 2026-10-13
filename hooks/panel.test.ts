import { expect, mock, test } from 'claude-code/testing'

test('/ppd opens a band that validates on the terminal and the desktop', async ($, on) => {
  mock.clock(on, { now: new Date(2026, 9, 14, 12).getTime() })
  mock.store(on)

  const ran = await $.command.run({
    command: 'ppd',
    args: '',
    origin: { kind: 'composer' },
    presentation: { isFullscreen: true, columns: 120 },
  })
  expect(ran.text).toBe('Painel de prompts aberto.')

  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({
      plugin: 'prompts-per-day',
      surface,
      component: 'AbovePrompt',
      props: {
        hasSurvey: false,
        isWorking: false,
        maxRows: 20,
        bodyColumns: 120,
        scroll: { offset: 0, bodyRows: 20 },
        view: {},
      },
    })

    expect(await ui.find({ type: 'Text', text: /prompts em/ })).toBeDefined()
    expect(await ui.find({ type: 'Svg' }) !== undefined).toBe(surface === 'desktop')
    await ui.unmount()
  }
})
