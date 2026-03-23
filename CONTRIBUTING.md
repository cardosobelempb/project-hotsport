# 🤝 Guia de Contribuição

> **Para agentes e automações:** regras canônicas em `AGENTS.md`.
> Este arquivo é a referência humana.

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Setup Local](#setup-local)
- [Fluxo de Trabalho Git](#fluxo-de-trabalho-git)
- [Conventional Commits](#conventional-commits)
- [Hooks e Validação Local](#hooks-e-validação-local)
- [Checklist de Pull Request](#checklist-de-pull-request)

---

## Pré-requisitos

| Ferramenta | Versão mínima | Verificar com    |
| ---------- | ------------- | ---------------- |
| Node.js    | `>= 20`       | `node -v`        |
| npm        | `>= 10`       | `npm -v`         |
| PostgreSQL | `>= 15`       | `psql --version` |
| Git        | `>= 2.40`     | `git --version`  |

---

## Setup Local

```bash
# 1. Clonar e instalar
git clone <url-do-repositorio>
cd <projeto>
npm install

# 2. Configurar ambiente
cp .env.example .env
# Edite .env com suas credenciais locais

# 3. Banco de dados
npm run prisma:migrate
npm run prisma:generate

# 4. Iniciar
npm run dev       # API — porta 4949
```

---

## Scripts disponíveis

```bash
npm run dev               # inicia servidor em modo watch
npm run build             # compila com tsup
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
npm run prisma:generate   # gera Prisma Client
npm run prisma:migrate    # migrations em desenvolvimento
npm run prisma:deploy     # migrations em produção
npm run prisma:studio     # GUI de dados
```

---

## Fluxo de Trabalho Git

```
main  → branch estável, sempre deployável
 ├── feat/...       nova funcionalidade
 ├── fix/...        correção de bug
 ├── refactor/...   sem mudança de comportamento
 ├── docs/...       apenas documentação
 └── chore/...      deps, config, build
```

```bash
# 1. Partir da main atualizada
git checkout main && git pull origin main

# 2. Criar branch descritiva
git checkout -b feat/start-workout-session

# 3. Commits atômicos

# 4. Atualizar com main antes do PR
git fetch origin && git rebase origin/main

# 5. Abrir Pull Request
```

---

## Conventional Commits

```
<type>(<scope>): <subject>
```

| Tipo       | Uso                          | Semver  |
| ---------- | ---------------------------- | ------- |
| `feat`     | Nova funcionalidade          | `MINOR` |
| `fix`      | Correção de bug              | `PATCH` |
| `refactor` | Sem mudança de comportamento | —       |
| `perf`     | Performance                  | `PATCH` |
| `test`     | Testes                       | —       |
| `docs`     | Documentação                 | —       |
| `style`    | Formatação sem lógica        | —       |
| `chore`    | Deps, config, manutenção     | —       |
| `build`    | Build, scripts               | —       |
| `ci`       | Pipelines, GitHub Actions    | —       |
| `revert`   | Reverter commit              | —       |

```bash
# ✅ Corretos
feat(usecases): add StartWorkoutSession use case
fix(auth): handle expired JWT token
chore: update prisma to v7.4.0

# ❌ Errados
"ajustes" | "WIP" | "fix bug" | "alterações"
```

---

## Hooks e Validação Local

```bash
npm install -D husky @commitlint/cli @commitlint/config-conventional
npx husky init
```

```js
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'test',
        'docs',
        'style',
        'chore',
        'build',
        'ci',
        'revert'
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 72],
    'subject-full-stop': [2, 'never', '.']
  }
};
```

```bash
# .husky/commit-msg
echo "npx --no -- commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg

# .husky/pre-commit
echo "npm run lint && npm run typecheck" > .husky/pre-commit
chmod +x .husky/pre-commit
```

---

## Checklist de Pull Request

```
[ ] npm run typecheck — zero erros TypeScript
[ ] npm run lint — zero erros ESLint
[ ] Zero any, zero console.log de debug
[ ] Segue CONVENTIONS.md e typescript.instructions.md
[ ] npm run prisma:generate se schema.prisma foi alterado
[ ] .env.example atualizado se novas vars foram adicionadas
[ ] Título do PR: feat(scope): descrição
[ ] Issue referenciada: Closes #XX
[ ] Branch atualizada via rebase com main
```
