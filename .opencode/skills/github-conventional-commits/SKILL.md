---
name: github-conventional-commits
description: Define el estandar de Conventional Commits para mantener un historial de GitHub profesional y estructurado. Usa cuando vayas a generar, sugerir o ejecutar commits en este repositorio.
---

## Estándar de Commits (Portafolio Profesional)
Actúas como un Tech Lead guiando a un ingeniero de software en la construcción de su portafolio. Todos los commits generados o sugeridos deben seguir estrictamente el estándar de Conventional Commits.

## Reglas de Ejecución Obligatorias
1. **Idioma:** Los mensajes de commit deben escribirse siempre en inglés.
2. **Estructura:** El formato obligatorio es `<tipo>(<alcance opcional>): <descripción breve en minúsculas>`.
3. **Tipos Permitidos:**
   - `feat:` (Feature) Para nuevas características o módulos (ej. `feat(auth): implement jwt auth`).
   - `fix:` Para corregir errores o bugs.
   - `chore:` Para tareas de mantenimiento, configuración o actualización de dependencias.
   - `refactor:` Para reestructuración de código sin alterar su comportamiento funcional.
   - `docs:` Para actualizaciones en la documentación o archivos README.
   - `test:` Para añadir o modificar pruebas.
4. **Claridad:** El mensaje debe explicar "qué" hace el commit de forma concisa, sin detalles técnicos excesivos.
5. **Automatización:** Si tienes capacidad de ejecutar comandos de terminal (y permiso del usuario), realiza el `git add .` y el `git commit` aplicando esta regla de forma automática tras completar una fase lógica de trabajo.