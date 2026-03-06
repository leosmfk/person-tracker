# PRD — Person Tracker

## Visao Geral

Sistema de monitoramento de contatos profissionais. Permite cadastrar pessoas com nome e LinkedIn, e monitora automaticamente mudancas de cargo. Quando uma mudanca e detectada, o sistema alerta o usuario para que ele possa tomar acao manual (enviar mensagem, por exemplo).

O objetivo principal e: **nunca perder o timing de uma mudanca de cargo de alguem da sua rede.**

---

## Problema

Acompanhar manualmente dezenas ou centenas de perfis no LinkedIn para identificar mudancas de cargo e impratico. Mudancas de cargo sao momentos ideais para reengajar contatos, mas sem monitoramento automatico, essas oportunidades passam despercebidas.

---

## Persona

Usuario unico (o proprio operador). Nao e um produto multi-tenant — e uma ferramenta pessoal de acompanhamento de rede profissional.

---

## Funcionalidades

### 1. Tabela de Pessoas

Interface principal em formato de planilha (linhas e colunas), inspirada no estilo visual do Notion e Equals:
- Design minimalista, tipografia limpa, sem decoracao desnecessaria
- Componentes raw, sem estilizacao excessiva
- Espacamento generoso, bordas sutis, foco na legibilidade

**Colunas iniciais:**

| Coluna       | Descricao                                                  |
|--------------|-------------------------------------------------------------|
| Status       | Indicador visual (bolinha) — verde = mudou de cargo recentemente |
| Nome         | Nome da pessoa                                              |
| LinkedIn     | URL do perfil no LinkedIn                                   |
| Cargo Atual  | Ultimo cargo detectado pelo monitoramento                   |
| Ultimo Check | Data/hora da ultima verificacao do perfil                   |

**Acoes:**
- Adicionar pessoa (inline ou via modal simples)
- Editar nome / LinkedIn
- Remover pessoa
- Marcar alerta como "visto" (dismiss do indicador de mudanca)

### 2. Monitoramento de LinkedIn

Sistema que verifica periodicamente os perfis cadastrados em busca de mudancas de cargo.

**Comportamento esperado:**
- Verificacao periodica (frequencia a definir — diaria, semanal, etc.)
- Ao detectar mudanca de cargo:
  - Ativa indicador visual (bolinha verde/destaque) na linha da pessoa
  - Move a pessoa para o topo da lista automaticamente
  - Registra o cargo anterior e o novo cargo
- O usuario pode "dispensar" o alerta apos tomar acao

**Questoes em aberto (a explorar):**
- Metodo de obtencao dos dados do LinkedIn (API oficial, scraping, servico terceiro como Proxycurl, PhantomBuster, etc.)
- Frequencia ideal de verificacao vs. limites de rate/custo
- Como lidar com perfis privados ou indisponiveis

### 3. Historico de Mudancas

Cada pessoa tem um historico de cargos detectados:
- Cargo anterior → Cargo novo
- Data da deteccao
- Empresa anterior → Empresa nova

Isso permite ao usuario ter contexto ao enviar uma mensagem.

---

## Fluxo Principal

```
1. Usuario abre a aplicacao
2. Ve a tabela com todas as pessoas cadastradas
3. Pessoas com mudanca de cargo recente aparecem no topo com indicador visual
4. Usuario clica na pessoa, ve o contexto da mudanca (cargo anterior → novo)
5. Usuario vai ao LinkedIn manualmente e envia mensagem
6. Usuario marca o alerta como "visto"
7. Pessoa volta para sua posicao normal na lista
```

---

## Design

**Principios:**
- Estilo Notion / Equals — flat, limpo, sem sombras pesadas
- Componentes nativos/raw sem camadas visuais extras
- Tipografia como elemento principal de hierarquia
- Espacamento como separador — sem linhas ou bordas desnecessarias onde possivel
- Densidade de informacao adequada (planilha, nao cards)
- Interacoes inline quando possivel (editar direto na celula)

**Referencia visual:** [Equals](https://equals.com/) — planilha moderna com estetica minimalista.

---

## Stack Existente

O projeto ja possui uma base funcional:

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4, Radix UI, shadcn/ui, TanStack Table
- **Backend:** Next.js API routes, Prisma ORM, PostgreSQL
- **Auth:** better-auth
- **Runtime:** Bun

---

## Fora de Escopo (por enquanto)

- Envio automatico de mensagens
- Integracao com CRM externo
- Multiplos usuarios / times
- Campos adicionais alem de nome e LinkedIn
- Notificacoes push / email
- App mobile
