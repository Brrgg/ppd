# prompts-per-day

Mod do Claude Code que mostra um heatmap no estilo do GitHub com a quantidade de prompts que você enviou por dia, ao longo do ano.

Digite `/ppd` para abrir ou fechar o painel. Ele aparece logo acima da caixa de prompt.

## O que ele mostra

- Um quadrado por dia do ano, mais escuro quanto mais prompts naquele dia.
- O total de prompts do ano e quantos você já mandou hoje.
- O dia mais cheio do ano.

No terminal o painel é uma grade de texto. Em superfícies que desenham gráficos (como o app desktop), é um SVG com tooltip em cada dia.

## Instalação

Dentro do Claude Code, rode:

```
/plugin marketplace add Brrgg/ppd
/plugin install prompts-per-day@arthur-mods
```

Depois reinicie a sessão. O comando `/ppd` fica disponível.

## Uso

| Comando | O que faz |
| --- | --- |
| `/ppd` | Abre o painel; rodar de novo fecha |

## Seus dados

A contagem fica só no seu computador, na pasta de configuração do Claude Code (`~/.claude/plugins/store`). O mod conta apenas quantos prompts você enviou em cada dia. Ele não guarda o texto dos prompts e não envia nada para fora.

## Desinstalar

```
/plugin uninstall prompts-per-day@arthur-mods
```

## Desenvolvimento

O código fica em `hooks/`: `register.tsx` registra o comando e desenha o painel, e `heatmap.ts` calcula a grade. Para validar:

```
claude plugin validate .
```
