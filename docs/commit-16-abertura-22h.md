# Commit 16 — Abertura automática às 22h

## Objetivo

Manter o site visualmente fechado durante o Lual e liberar todo o conteúdo
automaticamente às 22h de 8 de agosto de 2026, no horário de Brasília.

## O que foi implementado

- tela exclusiva em página inteira antes da abertura;
- mensagem para incentivar os jovens a viverem o encontro por inteiro;
- contagem regressiva em horas, minutos e segundos;
- identificação visual da Perseverança, brasão e fogueira animada;
- destaque especial nos cinco minutos finais;
- liberação automática quando o relógio chega às 22h;
- ocultação completa do menu e das seções enquanto o site está fechado;
- suporte aos parâmetros locais de simulação já usados pelo projeto;
- validação automática dos textos e das datas do bloqueio.

## Horário configurado

```text
2026-08-08T22:00:00-03:00
```

O deslocamento `-03:00` corresponde ao horário de Brasília na data do evento.

## Testes locais

Antes da abertura:

```text
?siteData=2026-08-08T21:59:50-03:00
```

No momento exato da abertura:

```text
?siteData=2026-08-08T22:00:00-03:00
```

Depois da abertura:

```text
?siteData=2026-08-08T22:30:00-03:00
```
