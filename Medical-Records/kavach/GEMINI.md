# GEMINI.md — Kavach (Antigravity Overrides)

> Antigravity-specific behaviour overrides only.
> `AGENTS.md` is the shared baseline. If a conflict exists in Antigravity, **this file takes precedence**.

---

## Baseline

Follow `AGENTS.md` for all universal project rules. This file only adds or overrides rules specific to the Antigravity environment.

---

## Antigravity-Specific Rules

### 1. Prefer modular workspace rules
Use `.agents/rules/` for focused, single-responsibility rule files. Prefer them over monolithic instruction blocks.

### 2. Use workflows for repeatable multi-step processes
Use workflows from `.agents/workflows/`: `/start-project`, `/build-feature`, `/add-user-flow`, `/validate-ai-pipeline`, `/test-feature`, `/ship-check`.

### 3. Use skills for specialised execution
Before domain-specific work, apply the relevant skill from `.agents/skills/`:
- Planning → `planning/SKILL.md`
- Architecture → `product-architecture/SKILL.md`
- Privacy/consent/erasure → `healthcare-compliance/SKILL.md`
- OCR/extraction pipeline → `ai-extraction/SKILL.md`
- Test strategy → `qa-validation/SKILL.md`
- Documentation → `docs-maintenance/SKILL.md`

### 4. Treat docs as persistent project memory
Before major work, read relevant docs. After meaningful work, update affected docs. Do not leave context only in chat.

### 5. Prefer updating existing markdown over creating new files
Extend or refresh current markdown files unless a truly new document is necessary.

### 6. Documentation is part of done
A task is not complete until `progress.md`, `tasks.md`, `handoff.md`, `changelog.md`, and `decisions.md` are updated where applicable.

### 7. Skill file format
Each skill uses YAML frontmatter with `name`, `description`, `use_when`, and `outputs` keys, followed by markdown instructions.

### 8. Workflow file format
Each workflow uses YAML frontmatter with `name`, `description`, `trigger`, and `steps` keys. Steps are numbered and actionable.
