# Tasks — Módulo `poc`

> **Caminho:** `src/modulos/poc/`
> **Propósito:** recurso de prova de conceito (PoC) — avaliar se deve ser mantido em produção.

---

## 1. Presentation — Controllers

- [ ] Revisar `get-poc-resource.controller.ts` — avaliar se este módulo deve permanecer
- [ ] **Decisão:** mover para branch separada ou remover antes do release

## 2. Application — Use Cases

- [ ] Revisar `GetPocResource.ts` — sem `try/catch`, retornar `Either<Error, OutputDto>`

## 3. Arquitetura

- [ ] Avaliar remoção completa do módulo em ambiente de produção
- [ ] Garantir que a rota de PoC não está exposta publicamente em staging/prod
