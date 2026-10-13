# prompts-per-day

A Claude Code mod that shows a GitHub-style heatmap of how many prompts you sent each day of the year.

Type `/ppd` to open or close the panel. It appears right above the prompt box.

## What it shows

- One square per day of the year, darker the more prompts you sent that day.
- The year's total and how many prompts you have sent today.
- Your busiest day of the year.

In the terminal the panel is a text grid. On surfaces that can draw graphics (such as the desktop app) it is an SVG with a tooltip on each day.

## Install

Inside Claude Code, run:

```
/plugin marketplace add Brrgg/ppd
/plugin install prompts-per-day@arthur-mods
```

Then restart the session. The `/ppd` command is now available.

## Usage

| Command | What it does |
| --- | --- |
| `/ppd` | Opens the panel; run it again to close it |

## Your data

The counts stay on your computer, in Claude Code's configuration folder (`~/.claude/plugins/store`). The mod only counts how many prompts you send each day. It does not store the text of your prompts and sends nothing anywhere.

## Uninstall

```
/plugin uninstall prompts-per-day@arthur-mods
```

## Development

The code lives in `hooks/`: `register.tsx` registers the command and draws the panel, and `heatmap.ts` builds the grid. To validate the mod:

```
claude plugin validate .
```
