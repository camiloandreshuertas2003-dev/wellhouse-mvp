# Plan de Ejecución Wellhouse: Expansión "Cómo Funciona" y Estándares de Marca

Este documento constituye la hoja de ruta técnica y estratégica para la actualización de la plataforma Wellhouse.

---

## 1. Actualización de Nomenclatura y Modelo de Datos
**Objetivo:** Sustituir todo rastro de `WellScore™` por `WellRank™` para elevar la percepción de marca.

*   **Backend (NestJS/PostgreSQL):**
    *   Renombrar columna `well_score` a `well_rank` en la tabla `properties`.
    *   Actualizar lógica en el servicio de cálculo de puntaje para reflejar el nuevo nombre: `calculateWellRank()`.
*   **Frontend (Next.js):**
    *   Realizar refactorización global de variables y constantes de `WellScore` a `WellRank`.
    *   Actualizar textos en la UI (tooltips, labels, mensajes de error).

---

## 2. Paleta de Colores "Deep & Trust" (Implementación en Tailwind)
**Objetivo:** Establecer una jerarquía visual premium y profesional.

*   **Configuración en `tailwind.config.ts`:**
    *   `primary-cobalt`: `#2D6FE0`
    *   `secondary-ink`: `#0F3D3E`
    *   `accent-mango`: `#E3A93B`
    *   `base-paper`: `#FBFAF7`
    *   `surface-mist`: `#E8E6E2`
*   **Restricción de Diseño:** Se prohíben gradientes complejos y sombras genéricas. Se utilizarán formas angulares y planas para reforzar la identidad geométrica.

---

## 3. Estructura de la Página "Cómo Funciona" (Wizard Educativo)
**Objetivo:** Crear una experiencia de usuario altamente didáctica que resuelva la fricción del modelo de intercambio.

### Módulos del Wizard:
*   **Módulo 1: Filosofía (Wellhouse Manifesto):** Introducción centrada en la "confianza como moneda".
*   **Módulo 2: Ecosistema WellRank™:** Diagrama interactivo que desglosa el cálculo (Calidad visual, Amenities, Rapidez de respuesta, Reseñas).
*   **Módulo 3: Economía de WellPoints:** Diferenciación clara entre ganar (Hospedar) y adquirir (Packs para invitados).
*   **Módulo 4: SafeStay Protocols:** Explicación técnica de la verificación de identidad, seguros de intercambio y sistema de reseñas dobles.
*   **Módulo 5: Wizard de Experiencia Guiada:** Diagnóstico dinámico al final del flujo que sugiere mejoras al perfil del usuario según su rol (Anfitrión vs. Invitado).
*   **Módulo 6: Comunidad y Prueba Social:** Sección de perfiles de usuario ("Nómada digital", "Familia viajera") para generar confianza.

---

## 4. Estrategia de Activos Visuales (IA Generativa)
**Objetivo:** Mantener una identidad visual coherente sin recurrir a bancos de imágenes genéricos.

*   **Prompt Maestro:** "Ilustración plana geométrica minimalista, formas simples con bordes angulares, paleta: verde azulado (#0F3D3E), azul cobalto (#2D6FE0), dorado (#E3A93B), fondo blanco cálido (#FBFAF7). Sin degradados ni texto."
*   **Producción:** Generar 6 ilustraciones base (una por paso) siguiendo estrictamente el estilo maestro.
*   **Formato:** Exportar como PNG transparente para integración fluida sobre `surface-mist` o `base-paper`.

---

## 5. Checklist Técnico de Ejecución
- [ ] Ejecutar migraciones de base de datos para `well_rank`.
- [ ] Actualizar tokens de color en `tailwind.config.ts`.
- [ ] Implementar `<HowItWorksWizard />` con estado local y navegación fluida.
- [ ] Integrar el diagnóstico dinámico de perfil (Módulo 5 del Wizard).
- [ ] Configurar analítica para medir abandono por paso y disparos de WellBot.
- [ ] Validar responsividad en dispositivos móviles (layout de una columna vs. desktop).

---
*Documento preparado para el desarrollo en Antigravity.*
