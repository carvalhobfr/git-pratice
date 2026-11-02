# Cidade Sem Lei — Solo (demo 0.1)

Jogo de estratégia criminal single-player inspirado na era clássica dos jogos de navegador (2005–2012). Projeto independente, com identidade original.

## Como jogar

Abra `index.html` num servidor local. Para a melhor compatibilidade com módulos ES:

```bash
python3 -m http.server 8000
```

Acesse `http://localhost:8000`. Não precisa instalar dependências nem criar conta.

## Regras implementadas

- Campanha de 60 dias ou modo infinito; é possível continuar após o término da temporada.
- Relógio híbrido: 1 hora real equivale a 4 horas de jogo; ações e descanso também avançam horas.
- Produção offline com capacidade limitada por negócio. A produção não vira dinheiro automaticamente: venda nas docas.
- Roubos probabilísticos com chances visíveis, recompensa, atributos, estamina, ferimentos, procurado e prisão.
- Treinamento, hospital, banco, eventos de mercado, 3 rivais simulados e ranking por respeito.
- Save automático no `localStorage`, com importação/exportação JSON.

## Rodando testes

```bash
node --test
```

## Escopo

Esta é uma demonstração de regras + interface para validar o loop solo. Não há conta, backend ou multiplayer real nesta versão. Os valores de economia e progressão são preliminares.

## Arquitetura

`engine.mjs` contém o estado e as regras independentes do DOM. `app.mjs` gerencia a UI; `style.css` define a aparência; `index.html` é o ponto de entrada.

O código está em JavaScript com módulos ES sem dependências para que a demo possa ser testada instantaneamente em hospedagem estática. A evolução para React + TypeScript pode ocorrer quando o loop estiver validado.