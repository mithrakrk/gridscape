# GEMINI.md

## Antigravity-specific overrides
These instructions apply specifically to Antigravity and supplement the shared project rules in `AGENTS.md`.

1. **Treat `AGENTS.md` as the shared baseline**: Follow `AGENTS.md` for universal project rules. This file contains Antigravity-specific overrides only; if a conflict exists, `GEMINI.md` takes precedence in Antigravity.

2. **Prefer structured workspace rules**  
   Use `.agents/rules/` for modular workspace rules when a rule should be always-on, model-decided, manual, or file-glob based.

3. **Use workflows for repeatable processes**  
   For multi-step tasks, use workflows from `.agents/workflows/` through slash commands such as `/start-project`, `/build-feature`, and `/ship-check`.

4. **Use skills for specialized execution**  
   Apply the relevant skills from `.agents/skills/` based on the task domain, such as planning, implementation, QA, and documentation maintenance.

5. **Treat markdown docs as persistent project memory**  
   Before major work, read the relevant files in `docs/`. After meaningful work, update the affected docs instead of leaving important context only in chat.

6. **Prefer updating existing memory over creating new files**  
   Extend or refresh current markdown files unless a truly new document is necessary. Avoid memory fragmentation.

7. **Documentation is part of done**  
   A task is not complete until relevant docs such as `progress.md`, `tasks.md`, `handoff.md`, `changelog.md`, and `decisions.md` are updated where applicable.
