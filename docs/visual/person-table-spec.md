---
title: "Person Table — Visual Template"
created: 2026-03-06
issue: ""
---

## Overview

O sistema atual usa um modelo `Patient` com uma tabela basica (Nome, Atualizado). O PRD define uma ferramenta de monitoramento de contatos profissionais com deteccao de mudanca de cargo.

Esta spec cobre duas entregas:
1. **Modelo de dados** — substituir `Patient` por `Person` + `JobChange`
2. **Template visual** — tabela estilo spreadsheet com dados mockados, exibindo os dois estados de linha (com e sem badge de mudanca)

## Context / Background

O projeto tem auth funcional (better-auth) e uma tabela CRUD de `Patient` usando TanStack Table + shadcn/ui. O modelo `Patient` nao tem relacao com o dominio do PRD e sera completamente substituido. O banco nao tem dados reais.

Stack: Next.js 16, React 19, Tailwind CSS 4, Radix UI, shadcn/ui, TanStack Table, Prisma, PostgreSQL, Bun.

## Goals

- Modelo de dados alinhado com o PRD: `Person` (contato profissional) e `JobChange` (historico de mudancas de cargo)
- Template visual com dados mockados que permita validar o design antes de implementar o monitoramento
- Dois estados visiveis: linha normal e linha com badge de mudanca de cargo

## Non-Goals

- **Monitoramento/scraping de LinkedIn** — sera tratado em spec separada. O campo `lastCheckedAt` existe no modelo mas fica `null` por enquanto.
- **Acoes na tabela** (editar, excluir, dispensar alerta) — serao adicionadas depois. Sem dropdown, sem context menu, sem interacao ao clicar.
- **Colunas adicionais no frontend** (Cargo Atual, Ultimo Check) — existem no banco mas nao aparecem na tabela por enquanto.
- **Row numbers e letras de coluna** — visual de sheets mas sem esses elementos decorativos.

## Proposed Solution

### Data Model Changes

Substituir `Patient` por dois modelos:

**Person**
```
model Person {
  id             String      @id @default(cuid(2))
  name           String
  linkedinUrl    String
  currentRole    String?        // desnormalizado do ultimo JobChange
  currentCompany String?        // desnormalizado do ultimo JobChange
  lastCheckedAt  DateTime?      // preenchido pelo monitoramento futuro
  userId         String
  user           User        @relation(...)
  jobChanges     JobChange[]
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}
```

**JobChange**
```
model JobChange {
  id              String    @id @default(cuid(2))
  personId        String
  person          Person    @relation(...)
  previousRole    String?
  newRole         String
  previousCompany String?
  newCompany      String?
  detectedAt      DateTime  @default(now())
  dismissedAt     DateTime?   // null = alerta ativo (badge visivel)
}
```

**Por que desnormalizar `currentRole`/`currentCompany` no `Person`?**
A tabela principal precisa exibir o cargo atual (futuramente). Derivar do ultimo `JobChange` exige join em toda query de listagem. Com desnormalizacao, a query e um simples `SELECT` no `Person`. O monitoramento atualiza os dois atomicamente (cria `JobChange` + atualiza `Person`).

**Por que `dismissedAt` em vez de flag booleana?**
`dismissedAt` guarda quando o usuario dispensou o alerta, util para auditoria e para regras futuras (ex: re-alertar se houve outra mudanca apos o dismiss). Uma flag `dismissed: Boolean` perde essa informacao temporal.

### Visual — Tabela

**Estetica:** Spreadsheet utilitario. Referencia visual: Google Sheets / Equals. Flat, grid visivel, sem sombras, sem bordas arredondadas no container. Tipografia limpa e monocromatica. Densidade de informacao alta.

**Layout:**

```
+----------------------------------+------------------------------------------------+
| Nome                             | LinkedIn                                       |
+----------------------------------+------------------------------------------------+
| [!] Joao Silva                   | https://linkedin.com/in/joaosilva              |
+----------------------------------+------------------------------------------------+
| Maria Costa                      | https://linkedin.com/in/mariacosta             |
+----------------------------------+------------------------------------------------+
| [!] Pedro Santos                 | https://linkedin.com/in/pedrosantos            |
+----------------------------------+------------------------------------------------+
| Ana Lima                         | https://linkedin.com/in/analima                |
+----------------------------------+------------------------------------------------+
```

**Colunas:**

| Coluna | Conteudo | Comportamento |
|--------|----------|---------------|
| Nome | Nome da pessoa + badge opcional | Texto simples. Badge no canto superior esquerdo da celula quando tem `JobChange` nao dispensado. |
| LinkedIn | URL completa do perfil | Link clicavel, abre em nova aba (`target="_blank"`). Texto exibe a URL inteira. |

**Badge de mudanca de cargo:**

- Circulo pequeno (~16px), vermelho pastel, com `!` dentro em branco
- Posicionado no canto superior esquerdo da celula Nome
- Implementacao: celula com `position: relative`, badge com `position: absolute`, `top: -4px`, `left: -4px` (ajustar conforme necessario)
- Cor de referencia: `#E8A0A0` ou similar — vermelho suave, nao agressivo
- O `!` deve ser centralizado dentro do circulo, fonte pequena (~10px), bold

**Estilo da tabela:**

- Bordas: `1px solid` cinza claro entre todas as celulas (horizontal e vertical), como uma planilha real
- Header: fundo cinza muito claro (`#F8F8F8` ou similar), texto em cinza escuro, font-weight medium
- Rows: fundo branco, sem hover effect, sem zebra striping
- Tipografia: fonte sem serifa, tamanho ~13-14px para o corpo. Nada decorativo.
- Padding: generoso nas celulas (~12px vertical, ~16px horizontal)
- Links: cor azul padrao de link, underline on hover

**Dados mockados (6 pessoas, 2 com badge):**

```ts
const mockPeople = [
  { id: "1", name: "Joao Silva", linkedinUrl: "https://linkedin.com/in/joaosilva", hasAlert: true },
  { id: "2", name: "Maria Costa", linkedinUrl: "https://linkedin.com/in/mariacosta", hasAlert: false },
  { id: "3", name: "Pedro Santos", linkedinUrl: "https://linkedin.com/in/pedrosantos", hasAlert: true },
  { id: "4", name: "Ana Lima", linkedinUrl: "https://linkedin.com/in/analima", hasAlert: false },
  { id: "5", name: "Carlos Oliveira", linkedinUrl: "https://linkedin.com/in/carlosoliveira", hasAlert: false },
  { id: "6", name: "Lucia Ferreira", linkedinUrl: "https://linkedin.com/in/luciaferreira", hasAlert: false },
]
```

`hasAlert` e derivado de: existe `JobChange` com `dismissedAt == null` para essa pessoa.

### Arquivos afetados

- `frontend/prisma/schema.prisma` — remover `Patient`, adicionar `Person` + `JobChange`, atualizar relacao com `User`
- `frontend/app/(protected)/home/_components/columns.tsx` — redefinir colunas (Nome com badge, LinkedIn com link)
- `frontend/app/(protected)/home/_components/data-table.tsx` — ajustar estilo para visual de sheets
- `frontend/app/(protected)/home/_components/patient-table.tsx` — renomear para `person-table.tsx`, usar dados mockados
- `frontend/app/(protected)/home/_components/patient-dialog.tsx` — remover (sem acoes por enquanto)
- `frontend/app/(protected)/home/_lib/actions.ts` — remover actions de Patient
- `frontend/app/(protected)/home/page.tsx` — atualizar imports

## Alternatives Considered

### Status como coluna separada

Coluna dedicada com a bolinha antes do Nome. Rejeitado porque ocupa espaco horizontal desnecessario para um indicador binario. O badge inline no canto da celula e mais discreto e economiza uma coluna inteira.

### LinkedIn como icone clicavel

Em vez da URL completa, mostrar apenas um icone do LinkedIn. Rejeitado por decisao do usuario — quer ver a URL inteira para identificar rapidamente o perfil.

### Flag booleana para status de mudanca

`hasJobChange: Boolean` no `Person` em vez de tabela `JobChange`. Rejeitado porque o PRD exige historico de mudancas (cargo anterior, novo cargo, data, empresa). A flag perde toda essa informacao.

### `dismissedAt` no `Person` em vez de `JobChange`

Ter `jobChangedAt` e `jobChangeDismissedAt` diretamente no `Person`. Rejeitado porque acopla o dismiss a pessoa e nao a mudanca especifica. Se a pessoa mudar de cargo duas vezes, o dismiss da primeira sobrescreve o da segunda.

## Cross-Cutting Concerns

- **Migracao**: `Patient` sera removido. Como o banco nao tem dados, a migracao e destrutiva sem impacto.
- **Auth**: `Person` pertence a um `User` via `userId`. Queries devem sempre filtrar por usuario autenticado.

## Rollout Plan

1. Criar migracao Prisma (drop `Patient`, create `Person` + `JobChange`)
2. Implementar template visual com dados mockados hardcoded
3. Validar visual com usuario
4. Em spec futura: substituir mock por dados reais + CRUD + monitoramento

## Rollback Plan

Migracao inversa do Prisma restaura o modelo `Patient`. Como nao ha dados, rollback e trivial.

## Open Questions

- Tipografia exata: usar a fonte ja configurada no projeto ou trocar? (verificar o que esta no `globals.css` / Tailwind config)
- Cor exata do vermelho pastel do badge — `#E8A0A0` e ponto de partida, ajustar apos ver no browser
