# Plan de Acción Inmediato — Corrección de Interfaz Wellhouse
### Hileras minimalistas, consistencia Home↔Dashboard, títulos obligatorios, responsividad e iconografía profesional
**Para: equipo de desarrollo (Antigravity) · Julio 2026 · Sprint correctivo, ejecutar en el orden de los módulos**

> **Base de comparación:** Imagen 1 = estado actual (`wellhouse-mvp.vercel.app`, home pública). Imagen 2 = objetivo de referencia (Airbnb). Este plan corrige la brecha entre ambas, manteniendo el sistema de diseño ya definido en el anexo de UI/UX (Módulo 1: colores, tipografía, tokens — **no se toca, se sigue usando tal cual**).

---

## Diagnóstico directo (lo que se ve al comparar las dos imágenes)

| En Airbnb (objetivo) | En Wellhouse hoy (a corregir) |
|---|---|
| ~6 cards completas + una card final de "Ver todo" visibles en una pantalla ancha | Solo ~4 cards visibles, cada una ocupando mucho más espacio del necesario |
| Card compacta: la foto ocupa casi todo el espacio, texto mínimo debajo | Card con mucho espacio vacío alrededor del ícono "Sin fotos aún" y el anillo WP, se siente inflada |
| Iconos vectoriales propios y consistentes (globo, casa, avatar) | Emojis nativos del sistema operativo (🌿 🌊 🏙️ ⛰️ ✨ y las banderas/íconos de festivos) — se ven distinto según el dispositivo y no tienen identidad de marca |
| Misma estructura de hileras en cualquier parte de la plataforma | Aún no confirmado si el dashboard post-registro usa el mismo componente — se define en este plan como requisito obligatorio |

Este plan tiene 5 módulos, uno por cada punto que diste, en el orden en que deben ejecutarse.

---

## Módulo A — Hilera Minimalista de Alta Densidad

**Objetivo:** que en pantallas anchas se vean ~6-7 cards por hilera como en la referencia, no 4.

### A.1 Qué está pasando técnicamente

La card actual reserva demasiado espacio vertical y horizontal para el estado "Sin fotos aún" (ícono grande centrado + texto + padding amplio) y el ancho de card no está calibrado contra la densidad real de Airbnb. Se corrige así:

```
Ancho de card — recalibrado contra la densidad real de la Imagen 2
  mobile   (0–639px)     ~78% del viewport visible + peek del 15%
                          (ligero ajuste: antes 85%, se reduce para
                          que se note más claramente que hay más al lado)
  tablet   (640–1023px)  ~220px fijos  → 2.8–3.2 cards visibles
  desktop  (1024–1439px) ~200px fijos  → 4.8–5.2 cards visibles
  wide     (1440px+)     ~190px fijos  → 6.5–7 cards visibles

Regla: a partir de tablet, el ancho de card es un valor FIJO en px
(no porcentaje), para que agregar más espacio de pantalla (monitor
ultrawide, por ejemplo) sume más cards visibles en vez de agrandar
las cards existentes — así se ve exactamente igual de denso que
Airbnb sin importar el tamaño del monitor.
```

### A.2 Rediseño del contenido de la card (reduce el espacio vacío)

```
ANTES (actual):                       DESPUÉS (minimalista):
┌───────────────────┐                ┌──────────────┐
│  Verificado        │                │ Verificado    │
│                     │                │   [foto/      │
│      🖼️ (grande)    │                │   estado      │
│   Sin fotos aún     │                │   compacto]   │
│                     │      →         │           ⬤170│
│              ⬤170   │                ├──────────────┤
├───────────────────┤                │ Finca cafetera│
│ Finca cafetera...   │                │ Salento, Qui..│
│ 📍 Finca · Salento   │                │ ★4.9 · 3h·2b·6p│
│ ★ 4.9 (42)          │                └──────────────┘
│ 3 hab · 2 baños ...  │
└───────────────────┘

□ El estado "Sin fotos aún" reduce su ícono e incorpora el nombre de
  la categoría como marca de agua sutil en vez de texto+ícono grandes
  (usa `surface-mist` con el ícono de categoría del Módulo E, al 15%
  de opacidad, ocupando el fondo completo del área de foto)
□ Ubicación, tipo y capacidad se combinan en una sola línea compacta
  con separador " · ", en vez de 2-3 líneas apiladas
□ El anillo WellScore reduce su tamaño ~30% respecto al actual y se
  posiciona siempre en la esquina inferior derecha de la FOTO (no
  flotando fuera de ella)
```

### A.3 Toque de originalidad (no copiar la card "Ver todo" de Airbnb literalmente)

En vez de la card final con fotos apiladas de Airbnb, Wellhouse cierra cada hilera con una **card de marca**: fondo `ink-teal-900`, ícono de WellPoints en `wellpoint-gold`, texto "+N viviendas · Ver todas". Es funcionalmente igual (lleva al grid completo de esa categoría, Módulo 2 del anexo anterior) pero refuerza la identidad de marca en vez de imitar el patrón visual exacto de la competencia.

```
┌──────────────┐
│              │
│   ⬤ (ícono   │   ← fondo ink-teal-900
│   WellPoints)│
│              │
│  +12         │   ← Fraunces 600, base-paper
│  viviendas   │
│  Ver todas → │   ← accent-mango
└──────────────┘
```

### A.4 Requerimientos técnicos

```
□ Ajustar <PropertyCard /> y <CategoryRow /> (ya existentes desde el
  anexo anterior) con los anchos fijos de A.1 — cambio de props/CSS,
  no de arquitectura
□ Nuevo subcomponente <RowEndCard count={n} categorySlug={x} />
  para el cierre de marca (A.3), reutilizable en toda hilera
□ Reducir altura de card en un ~25% total respecto a la actual,
  recalculando line-height y padding según los tokens del Módulo 1.3
  del anexo de diseño (no valores nuevos sueltos)
```

---

## Módulo B — Consistencia Home Pública ↔ Sección Post-Registro

**Objetivo:** que un usuario que se registra y entra al dashboard vea exactamente la misma estructura de hileras, no una versión distinta construida por separado.

### B.1 Regla de arquitectura obligatoria

```
□ <CategoryRow />, <PropertyCard /> y <RowEndCard /> son los MISMOS
  componentes, importados desde el mismo lugar, tanto en la ruta
  pública (/) como en la ruta autenticada (/dashboard o /explore)
□ Está PROHIBIDO crear una segunda versión de estos componentes para
  el dashboard "porque tiene más funciones" — si el dashboard necesita
  algo adicional (ej. una fila de "Recomendado para ti" personalizada),
  se agrega como una fila MÁS usando el mismo <CategoryRow />, nunca
  reemplazando el patrón visual completo
□ Única diferencia permitida entre las dos vistas: qué datos trae el
  backend (personalización, ranking por historial), nunca cómo se ve
  el componente
```

### B.2 Verificación antes de dar el módulo por cerrado

```
□ Captura de pantalla de la home pública y del dashboard, lado a lado,
  en los 4 breakpoints del Módulo 1.5 del anexo de diseño — deben
  verse estructuralmente idénticas (misma altura de card, mismo
  espaciado, mismo comportamiento de scroll)
□ Si en algún punto ya existe una versión distinta del dashboard
  construida antes de este plan, se reemplaza por completo — no se
  "parcha" para que se parezca, se migra al componente único
```

---

## Módulo C — Títulos Obligatorios (gobernanza, no solo diseño)

**Objetivo:** que sea técnicamente imposible publicar una hilera sin título, en cualquier parte de la app.

```
□ El prop `title` de <CategoryRow /> se define como obligatorio a
  nivel de tipo (TypeScript: title: string, sin valor por defecto ni
  optional ?) — si un desarrollador intenta usar el componente sin
  título, el proyecto no compila
□ El título usa siempre el token `display-lg` (Fraunces 600) definido
  en el Módulo 1.2 del anexo de diseño, y el subtítulo `body-sm` en
  `text-muted` — nunca estilos sueltos por pantalla
□ Esto aplica igual en home pública y en dashboard (ver Módulo B) —
  al ser el mismo componente, cumplir esta regla una sola vez ya la
  garantiza en ambos lugares
```

---

## Módulo D — Responsividad Total (validación final)

**Objetivo:** confirmar que la densidad del Módulo A y la consistencia del Módulo B se sostienen en todo el rango de dispositivos, no solo en desktop (que es donde se ven ambas imágenes de referencia).

```
□ Repetir la matriz de dispositivos ya definida en el Módulo 7 del
  anexo de diseño (móvil pequeño, móvil grande, tablet vertical/
  horizontal, desktop, desktop grande) para esta hilera rediseñada
□ En mobile: confirmar que con el nuevo ancho fijo de card (A.1) el
  "peek" del 15% de la siguiente card se sigue viendo — es la señal
  visual de que hay más contenido, no debe perderse al compactar
□ Swipe táctil con scroll-snap (ya definido en el anexo anterior)
  se re-prueba con las nuevas medidas de card, ya que un ancho de
  card distinto puede desalinear el snap si no se ajusta junto con A.1
□ Prueba obligatoria en dispositivo físico (no solo simulador) antes
  de cerrar este módulo, igual que exige el Módulo 7.3 del anexo base
```

---

## Módulo E — Reemplazo de Emojis por Iconografía Profesional

**Objetivo:** eliminar todo emoji nativo del sistema operativo (🌿 🌊 🏙️ ⛰️ ✨ 🎉 🇨🇴 💬, etc.) y reemplazarlo por un set de íconos vectoriales propios, consistentes con el sistema de diseño.

### E.1 Enfoque recomendado (híbrido, no todo por IA)

No todo ícono necesita generarse con IA — mezclar dos fuentes da mejor resultado que forzar todo a un solo método:

```
① Conceptos estándar de UI (chat, verificado, ubicación, flechas,
   filtros) → usar la librería de íconos ya definida en el Módulo 1.4
   del anexo de diseño (Lucide), en `ink-teal-500`, 24x24, trazo 2px.
   Esto ya es "profesional" por defecto y no requiere generación —
   usar IA aquí sería más lento y menos consistente.

② Conceptos únicos de Wellhouse/Colombia sin equivalente estándar
   (finca cafetera, llano, festivo colombiano) → estos SÍ se generan
   con asistencia de IA como ilustración base, y luego se vectorizan
   a línea simple (trazo 2px, un solo color `ink-teal-500`, sin relleno
   ni degradados) para que combinen con el resto del set de Lucide y
   no se vean como un sticker aparte.
```

### E.2 Reemplazos específicos requeridos

| Uso actual (emoji) | Reemplazo |
|---|---|
| 🌿 Fincas y campo | Ícono de línea "hoja/planta de café" (generado con IA, vectorizado) |
| 🌊 / 🏖️ Playa y costa | `waves` de Lucide (estándar, no requiere IA) |
| 🏙️ Urbano | `building-2` de Lucide (estándar) |
| ⛰️ Montaña | `mountain` de Lucide (estándar) |
| ✨ Exclusivo | Ícono de línea "diamante/estrella refinada" (IA, vectorizado — Lucide no tiene una versión con el carácter premium que busca esta categoría) |
| 🎉 🗓️ 🇨🇴 (festivos) | Ícono de línea "bandera de Colombia estilizada" + "calendario" (IA solo para la bandera estilizada; el calendario es `calendar` de Lucide) |
| 💬 (burbuja de chat flotante) | `message-circle` de Lucide en `accent-mango` sobre fondo `base-paper`, mismo tamaño táctil de 44x44px del Módulo 7.3 |
| 🏠 (ícono del tab "Todo") | `home` de Lucide |

### E.3 Set inicial de íconos de línea (punto de partida para el generado por IA)

Para no frenar el desarrollo esperando el proceso de generación con IA, aquí va una primera versión funcional en SVG (trazo 2px, `ink-teal-500`, 24x24) que el equipo puede usar de inmediato y refinar después con las versiones generadas por IA:

```html
<!-- Finca cafetera (placeholder funcional, reemplazar por versión IA) -->
<svg viewBox="0 0 24 24" fill="none" stroke="#0F3D3E" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2c-2 3-2 5 0 7s2 4 0 7"/>
  <path d="M8 9c-1.5 1.5-1.5 3 0 4.5"/>
  <path d="M16 9c1.5 1.5 1.5 3 0 4.5"/>
  <circle cx="12" cy="19" r="2"/>
</svg>

<!-- Exclusivo (diamante refinado, placeholder funcional) -->
<svg viewBox="0 0 24 24" fill="none" stroke="#0F3D3E" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 9l6-6 6 6-6 12z"/>
  <path d="M6 9h12"/>
  <path d="M10 9l2 12 2-12"/>
</svg>

<!-- Bandera de Colombia estilizada (franjas, sin escudo) -->
<svg viewBox="0 0 24 24" fill="none" stroke="#0F3D3E" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 3v18"/>
  <path d="M4 4h16v3.5H4z"/>
  <path d="M4 7.5h16v2H4z"/>
  <path d="M4 9.5h16v2H4z"/>
</svg>
```

### E.4 Requerimientos técnicos

```
□ Todos los íconos se exportan como SVG (nunca PNG ni emoji Unicode),
  componentizados (ej. <IconFincaCafetera />) para heredar color por
  CSS y escalar sin perder nitidez
□ Un solo componente <CategoryIcon category={slug} /> centraliza qué
  ícono corresponde a cada categoría — evita que quede un emoji suelto
  olvidado en algún componente que no se revisó
□ Auditoría final: buscar en todo el código fuente cualquier carácter
  emoji Unicode restante (regex de rango Unicode de emojis) antes de
  cerrar este módulo, para no depender solo de revisión visual manual
```

---

## Orden de ejecución de este sprint

```
1. Módulo A (hilera minimalista)         — base visual, todo lo demás depende de esto
2. Módulo E (íconos)                     — puede ir en paralelo al Módulo A, no depende de él
3. Módulo C (títulos obligatorios)       — se valida junto con A, es una regla de código, no una tarea visual aparte
4. Módulo B (consistencia home↔dashboard)— una vez A esté aprobado, se replica/migra al dashboard
5. Módulo D (responsividad)              — cierre y validación final de todo lo anterior en la matriz de dispositivos
```

---

*Este plan corrige puntualmente la interfaz ya construida a partir de los anexos de UI/UX previos. Los tokens de color, tipografía y breakpoints no cambian — se siguen usando los definidos en el Módulo 1 del anexo de diseño.*
