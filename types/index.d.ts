export type DayCounts = Record<string, number>

declare module 'claude-code' {
  interface PluginState {
    'prompts-per-day': { days: DayCounts; isOpen: boolean }
  }
}
