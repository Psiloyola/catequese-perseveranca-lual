# Missões da Semana — teste e funcionamento

## Funcionamento em produção

- Antes de 8 de agosto de 2026, às 22h (horário de Brasília), a seção informa que as missões ainda não foram liberadas.
- Do sábado do Lual até a sexta-feira, aparece somente a missão do dia e as missões anteriores.
- As missões futuras não são inseridas no HTML.
- No sábado seguinte, 15 de agosto, aparece o desafio final e as sete missões já vividas.
- O progresso fica salvo apenas no navegador do participante.

## Simular datas no Live Server

A simulação só funciona em `localhost` ou `127.0.0.1`.

- Após o Lual: `?missaoData=2026-08-08T23:00:00-03:00`
- Quarta-feira: `?missaoData=2026-08-12`
- Sexta-feira: `?missaoData=2026-08-14`
- Encontro final: `?missaoData=2026-08-15`

Exemplo:

```text
http://127.0.0.1:5500/?missaoData=2026-08-12
```
