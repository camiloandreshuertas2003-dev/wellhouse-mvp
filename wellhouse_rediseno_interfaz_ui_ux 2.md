# Plan de Rediseño de Interfaz — Wellhouse
### Sistema de Diseño, Módulos de Construcción y Plan Técnico para Lanzamiento en Colombia
**Documento adicional | Julio 2026 · Versión 2 | Complementa los anexos de WellPoints ya entregados**

> **Cómo encaja este documento:** Los anexos anteriores definieron la lógica de negocio (WellPoints, compra, registro de vivienda). Este documento define **cómo se ve y se siente la app**, organizado en **módulos secuenciales** para que el desarrollador los complete en orden, con un **sistema de diseño único y obligatorio** que rige toda la aplicación.

> **Corrección respecto a la v1 de este anexo:** en la versión anterior señalé las fotos grises del screenshot como un problema de diseño. Quedó claro que esas imágenes puntuales simplemente no habían cargado en ese momento y que el sistema de carga de imágenes ya funciona correctamente — no es un punto a corregir. Aun así, dejo en el Módulo 1 un estándar de "estado de carga" para cuando una imagen tarde en llegar (skeleton, no gris plano), como buena práctica general, no como corrección de un defecto existente.

---

## Índice

1. [Módulo 0 — Fundamentos: Diagnóstico y Orden de Trabajo](#módulo-0--fundamentos-diagnóstico-y-orden-de-trabajo)
2. [Módulo 1 — Sistema de Diseño Global (Fuente de Verdad)](#módulo-1--sistema-de-diseño-global-fuente-de-verdad)
3. [Módulo 2 — Grid de Resultados (Búsqueda Activa)](#módulo-2--grid-de-resultados-búsqueda-activa)
4. [Módulo 3 — Filas de Categoría con Scroll Horizontal](#módulo-3--filas-de-categoría-con-scroll-horizontal-vista-principal-de-explorar)
5. [Módulo 4 — Búsqueda Dinámica y Filtros](#módulo-4--búsqueda-dinámica-y-filtros)
6. [Módulo 5 — Clasificación y Cards de Vivienda](#módulo-5--clasificación-y-cards-de-vivienda)
7. [Módulo 6 — Asistente Conversacional (WellBot)](#módulo-6--asistente-conversacional-wellbot)
8. [Módulo 7 — Responsividad Multidispositivo](#módulo-7--responsividad-multidispositivo)
9. [Módulo 8 — Ajustes para el Piloto en Colombia](#módulo-8--ajustes-para-el-piloto-en-colombia)
10. [Plan de Trabajo Secuencial](#10-plan-de-trabajo-secuencial)

---

## Módulo 0 — Fundamentos: Diagnóstico y Orden de Trabajo

### 0.1 Qué está bien y qué se ajusta

- ✅ La carga de imágenes reales funciona — no se toca.
- ✅ La verificación de identidad ("Verificado") ya existe como badge — se mantiene, solo se rediseña visualmente.
- 🔧 Falta jerarquía visual, navegación por categorías, densidad de resultados en el grid, y una guía de diseño única que el equipo de desarrollo siga sin desviarse.

### 0.2 Por qué este documento va por módulos

Cada módulo de este documento es una unidad de trabajo **independiente y verificable**: tiene su propio criterio de aceptación y no depende de que el siguiente módulo esté listo para poder probarse. El **Módulo 1 es la única excepción**: es la base de la que dependen todos los demás, por eso va primero y es de cumplimiento obligatorio antes de tocar cualquier pantalla.

```
ORDEN DE EJECUCIÓN OBLIGATORIO:

  Módulo 1 (Sistema de Diseño)
        │
        ▼
  Módulo 5 (Cards de Vivienda)   ← se construye primero porque tanto
                                     las filas (Módulo 3) como el grid
                                     (Módulo 2) reutilizan la misma card
        │
        ▼
  Módulo 3 (Filas por Categoría) ──┐  Vista principal de "Explorar".
  Módulo 2 (Grid de Búsqueda)    ──┘  Pueden avanzar en paralelo una
                                        vez la card exista.
        │
        ▼
  Módulo 4 (Búsqueda Dinámica)   ← depende de que las cards (Módulo 5)
                                     y el grid (Módulo 2) ya existan
        │
        ▼
  Módulo 6 (WellBot)             ← se beneficia de tener búsqueda y
                                     categorías ya funcionando, para
                                     poder "accionar" sobre ellas
        │
        ▼
  Módulo 7 (Responsividad)       ← se valida de forma transversal en
                                     CADA módulo anterior, y se cierra
                                     aquí con la auditoría final
        │
        ▼
  Módulo 8 (Ajustes Colombia)    ← el último paso antes de lanzar el piloto
```

---

## Módulo 1 — Sistema de Diseño Global (Fuente de Verdad)

**Objetivo del módulo:** dejar un único archivo de tokens (CSS variables o config de Tailwind) del que **todo** componente de la app lea sus valores. Ningún componente futuro debe declarar un color, tamaño de fuente o espaciado "suelto" — todo sale de aquí. Este módulo se entrega, se revisa, y **se congela** antes de avanzar a los demás.

### 1.1 Paleta de color completa

| Token | Hex | Uso | Notas |
|---|---|---|---|
| `ink-teal-900` | `#0F3D3E` | Texto principal, navegación, headers | Color de máxima jerarquía. Nunca usar negro puro (`#000`) en texto. |
| `ink-teal-700` | `#1C5253` | Texto secundario, íconos activos | |
| `ink-teal-500` | `#3A7274` | Links, estados hover sobre elementos teal | |
| `base-paper` | `#FBFAF7` | Fondo principal de toda la app | Blanco cálido, nunca `#FFFFFF` puro |
| `surface-mist` | `#EFEFE9` | Fondo de cards, separadores, skeletons de carga | |
| `surface-mist-dark` | `#E2E1D9` | Bordes, divisores sutiles | |
| `accent-mango` | `#FF6A3D` | CTAs primarios, botones de acción, elementos que requieren clic | Único color "caliente" del sistema — se usa con moderación |
| `accent-mango-hover` | `#E65A30` | Estado hover/active de `accent-mango` | |
| `accent-mango-light` | `#FFE4D9` | Fondos suaves para resaltar sin gritar (ej. tooltips, hints) | |
| `signal-green` | `#1FAE6E` | Verificación, confirmaciones, mensajes de éxito | |
| `signal-red` | `#D64545` | Errores, penalizaciones, cancelaciones | |
| `wellpoint-gold` | `#E3A93B` | Exclusivo para iconografía y acentos de WellPoints (anillo de WellScore™, saldo, badges de puntos) | No se usa para nada que no sea WP — mantiene su significado único |
| `text-muted` | `#6B7370` | Texto terciario (metadatos, timestamps, texto de ayuda) | |

**Regla de uso obligatoria:** `accent-mango` se reserva para acciones (botones, CTAs, enlaces de acción). `wellpoint-gold` se reserva exclusivamente para todo lo relacionado a WellPoints. Si un desarrollador necesita "un color que llame la atención" para algo que no es ni una acción ni un WP, debe volver a este documento y proponer un nuevo token — nunca reutilizar `accent-mango` o `wellpoint-gold` fuera de su función definida, porque pierden su significado si se usan para todo.

### 1.2 Tipografía

| Rol | Fuente | Pesos a usar | Uso |
|---|---|---|---|
| Display / títulos | **Fraunces** (serif variable) | 400 (regular), 600 (semibold) para títulos grandes | Hero, nombres de sección editorial ("Fincas cerca de Medellín"), títulos de vivienda en la página de detalle |
| UI / cuerpo | **Inter** | 400 (texto), 500 (labels, botones), 600 (énfasis) | Todo el texto de interfaz: menús, descripciones, formularios |
| Datos / WellPoints | **IBM Plex Mono** | 500 | Cualquier cifra de WP (saldo, precio por noche, WellScore™) — nunca se usa Inter o Fraunces para números de WP |

**Escala tipográfica (base 16px):**

```
display-xl   40px / 48px line-height   (Fraunces 600)  → Hero de home
display-lg   32px / 40px               (Fraunces 600)  → Títulos de sección
display-md   24px / 32px               (Fraunces 400)  → Nombre de vivienda en detalle
body-lg      18px / 28px               (Inter 400)     → Descripciones largas
body-md      16px / 24px               (Inter 400)     → Texto estándar de UI
body-sm      14px / 20px               (Inter 400)     → Metadatos, ayuda
label        14px / 20px               (Inter 500)     → Labels de formulario, botones
data-md      16px / 20px               (Plex Mono 500) → WP/noche en cards
data-lg      24px / 28px               (Plex Mono 500) → Saldo total en dashboard
```

### 1.3 Espaciado, radios y sombras

```
Escala de espaciado (múltiplos de 4px): 4, 8, 12, 16, 24, 32, 48, 64, 96
Radio de bordes:
  radius-sm   6px   → inputs, botones pequeños, chips
  radius-md   12px  → cards de vivienda
  radius-lg   20px  → modales, paneles de filtro, burbuja de WellBot
  radius-full 999px → avatares, badges circulares, WellScore Ring

Sombras (usar solo estas tres, nunca sombras arbitrarias):
  shadow-sm   0 1px 3px rgba(15,61,62,0.08)   → cards en reposo
  shadow-md   0 4px 12px rgba(15,61,62,0.12)  → cards en hover, dropdowns
  shadow-lg   0 12px 32px rgba(15,61,62,0.18) → modales, panel de WellBot expandido
```

### 1.4 Iconografía y fotografía

```
□ Set de íconos: usar una sola librería en toda la app (ej. Lucide) —
  nunca mezclar estilos de ícono (algunos outline, otros filled)
□ Fotografía de vivienda: siempre relación de aspecto 4:3 en cards de
  grid, 16:9 en el header de la página de detalle — nunca recortes
  inconsistentes entre cards
□ Estado de carga de imagen (mientras la foto real llega desde el
  servidor): skeleton con shimmer sutil en `surface-mist`, nunca un
  gris plano estático ni un ícono roto
□ Estado sin foto (vivienda que aún no subió imágenes): usar una
  ilustración de línea simple en `ink-teal-500` sobre `surface-mist`,
  nunca un placeholder genérico de "imagen no disponible"
```

### 1.5 Breakpoints (fuente de verdad para el Módulo 7)

```
mobile     0 – 639px      1 columna
tablet     640 – 1023px   2–3 columnas
desktop    1024 – 1439px  4 columnas
wide       1440px+        5–6 columnas
```

### 1.6 Entregable del módulo

```
□ Archivo único de tokens (tailwind.config.js o variables.css) con
  TODOS los valores de 1.1 a 1.5
□ Página de referencia "Design System" dentro del proyecto (puede ser
  una ruta interna /dev/design-system) que renderice cada color,
  tipografía, espaciado y componente base, para que cualquier
  desarrollador nuevo la consulte sin tener que leer este documento
□ Ningún componente de los módulos siguientes se aprueba en revisión
  de código si usa un valor de color/espaciado/tipografía que no
  venga de este archivo de tokens
```

---

## Módulo 2 — Grid de Resultados (Búsqueda Activa)

**Corrección importante respecto a la v2:** viendo el screenshot que enviaste, quedó claro el problema real — la vista de "Todo" está metiendo **todas las categorías juntas en un único grid vertical de 2 columnas**, lo que hace que se vea como pocas casas mezcladas sin orden, exactamente como en tu imagen de referencia de Airbnb *no* se ve. Esto se corrige así:

- **Este Módulo 2 (grid denso)** deja de ser la vista por defecto. Se usa **únicamente** en dos casos: (1) el usuario ya escribió una búsqueda específica (ej. "Salento"), o (2) el usuario tocó "Ver todas" dentro de una categoría desde el home/Explorar.
- **La vista por defecto de "Explorar"** pasa a ser el Módulo 3 rediseñado: filas horizontales separadas por categoría, igual que la referencia de Airbnb que compartiste — no un grid mezclado bajo un tab "Todo".

**Objetivo del módulo:** que cuando sí se muestre un grid (búsqueda activa), comunique "hay muchas opciones", no una lista corta.

### 2.1 Qué cambia respecto al estado actual

| Ahora | Nuevo comportamiento |
|---|---|
| El tab "Todo" mezcla todas las categorías en un único grid de 2 columnas | El tab "Todo" ya no existe como grid — es reemplazado por las filas del Módulo 3. El grid de este módulo solo aparece tras una búsqueda activa o un "Ver todas" |
| Grid fijo de 2 columnas en cualquier pantalla, carga todas las viviendas de una vez | Grid responsivo (1 a 6 columnas según Módulo 1.5) + carga progresiva |
| "12 viviendas encontradas" como techo aparente | El buscador siempre trae un mínimo de resultados por página (ver 2.2) y deja claro cuándo son *todos* los resultados reales vs. cuándo hay más por cargar |
| Sin distinción entre "no hay más resultados" y "aún no cargó" | Estado explícito de fin de resultados vs. estado de carga |

### 2.2 Reglas de densidad y carga

```
□ Tamaño de página por consulta: 24 viviendas por carga (no 6)
□ Carga progresiva tipo "infinite scroll" con un botón de respaldo
  "Cargar más" para accesibilidad (no depender solo del scroll)
□ Si la búsqueda real tiene pocos resultados (ej. una ciudad piloto
  con poco inventario todavía), NUNCA mostrar un grid vacío a medias:
  se completa la fila con una sección "También te puede interesar"
  con viviendas cercanas o de categorías relacionadas, para que el
  grid nunca se vea escaso — igual que hace Airbnb cuando una zona
  tiene poco inventario
□ Skeletons de carga: al hacer una búsqueda nueva, se muestran
  inmediatamente 12 cards en estado skeleton (usando el estilo del
  Módulo 1.4) mientras llega la respuesta real, para que la
  percepción de velocidad y volumen sea alta desde el primer instante
```

### 2.3 Requerimientos técnicos

```
Frontend:
  □ <ResultsGrid /> con columnas responsivas según breakpoints del
    Módulo 1.5 (CSS grid con auto-fill, no un número de columnas
    hardcodeado por JS)
  □ Hook de scroll infinito con umbral de precarga (cargar la
    siguiente página cuando el usuario está a ~600px del final)
  □ Botón "Cargar más" visible siempre como respaldo del scroll infinito
  □ Sección de respaldo "También te puede interesar" cuando
    total_results < 12

Backend:
  GET /api/v1/search?...&page=1&page_size=24
      → Retorna: { results[], total_count, has_more, related_results[] }
      → related_results se puebla solo cuando total_count < 12,
        ampliando el radio de búsqueda o relajando el filtro de
        categoría automáticamente (documentar la regla exacta de
        relajación de filtros en el código, no dejarla implícita)
```

---

## Módulo 3 — Filas de Categoría con Scroll Horizontal (Vista Principal de Explorar)

**Este es el cambio central que pediste.** En vez de subir todas las categorías como tabs de filtro arriba y mostrar un solo grid abajo (como está hoy), cada categoría es su **propia fila horizontal deslizable**, igual que en la imagen de Airbnb que compartiste ("Alojamientos populares en Bogotá", "Hoteles increíbles para tu próximo viaje", etc.). El usuario desliza hacia la izquierda dentro de una fila para ver más casas de esa categoría, y baja con scroll vertical normal para pasar a la siguiente categoría.

### 3.1 Estructura de la pantalla Explorar (nueva vista por defecto)

```
┌──────────────────────────────────────────────────────────┐
│  Wellhouse        Explorar  Cómo funciona  Dashboard      │
├──────────────────────────────────────────────────────────┤
│   ¿Dónde quieres quedarte?  Eje, Costa, Llano...  [Filtros]│
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Fincas y campo                              Ver todas →  │
│  [Card] [Card] [Card] [Card] [Card▸ ...] ← desliza aquí   │
│                                                            │
│  Playa y costa                               Ver todas →  │
│  [Card] [Card] [Card] [Card] [Card▸ ...] ← desliza aquí   │
│                                                            │
│  Urbano                                      Ver todas →  │
│  [Card] [Card] [Card] [Card] [Card▸ ...] ← desliza aquí   │
│                                                            │
│  Montaña                                     Ver todas →  │
│  [Card] [Card] [Card] [Card] [Card▸ ...] ← desliza aquí   │
│                                                            │
│  Exclusivo                                   Ver todas →  │
│  [Card] [Card] [Card] [Card] [Card▸ ...] ← desliza aquí   │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

- Los chips que hoy están arriba ("Todo", "Fincas y campo", "Playa y costa"...) **se mantienen**, pero cambian de función: ya no filtran un grid mezclado — actúan como **ancla de scroll**, es decir, al tocar "Playa y costa" la pantalla se desplaza directo a esa fila, sin recargar nada. El chip "Todo" simplemente vuelve al inicio de la página con todas las filas visibles.
- Cada fila trae de fondo más viviendas de las que se ven en pantalla (mínimo 8, ver 3.3), por eso al deslizar aparecen más — esto es justo lo que resuelve la sensación de "pocas casas": nunca se ve el final de la fila de un vistazo.

### 3.2 Comportamiento de deslizamiento (scroll horizontal)

```
Desktop / wide:
  □ Flechas ‹ › visibles al hacer hover sobre la fila, a los costados
  □ Click en la flecha avanza el ancho visible de la fila (no card por
    card), con animación suave (scroll-behavior: smooth)
  □ Las flechas se ocultan si no hay más contenido en esa dirección

Tablet / mobile:
  □ Sin flechas — el deslizamiento es 100% táctil (swipe), como en la
    imagen de Airbnb que enviaste
  □ Scroll-snap activado (scroll-snap-type: x mandatory) para que cada
    swipe "enganche" la siguiente card en el borde, sin quedar a medias
  □ Física de scroll nativa del sistema operativo (no un slider hecho
    a mano con JS) para que se sienta tan fluido como Airbnb
```

### 3.3 Cuántas cards se ven según el dispositivo (usa breakpoints del Módulo 1.5)

| Breakpoint | Cards visibles en pantalla por fila | Ancho de card |
|---|---|---|
| mobile (0–639px) | 1.2 (la siguiente card se asoma parcialmente, señal visual de "hay más") | ~85% del viewport |
| tablet (640–1023px) | 2.4 | ~40% del viewport |
| desktop (1024–1439px) | 4.2 | ~23% del viewport |
| wide (1440px+) | 5.2 | ~19% del viewport |

**Regla clave:** en todos los breakpoints, la última card visible **siempre se muestra parcialmente cortada** (nunca exacta y completa al borde), para que el usuario entienda de forma visual e inmediata que hay más contenido deslizando hacia la izquierda — es la misma señal que usa Airbnb y evita tener que escribir "desliza para ver más" en texto.

### 3.4 Requerimientos técnicos

```
Frontend:
  □ <CategoryRow title="Fincas y campo" seeAllHref="/search?category=finca_campo" />
    — componente reutilizado para cada categoría, recibe sus propias
    viviendas vía prop, nunca recalcula ni comparte estado con las demás filas
  □ Contenedor con overflow-x: scroll + scroll-snap-type: x mandatory
    en mobile/tablet; overflow-x: hidden + flechas controladas por JS
    en desktop/wide
  □ Ancho de card fijo por breakpoint (tabla 3.3), nunca "auto" — así
    el corte parcial de la última card es predecible y no se ve
    accidental
  □ Chips de categoría (arriba) usan scrollIntoView({ behavior: 'smooth' })
    hacia el id de la fila correspondiente, no una navegación de página
  □ Botón "Ver todas" de cada fila navega a /search?category=X, que
    activa el Módulo 2 (grid denso)

Backend:
  GET /api/v1/home/sections
      → Retorna un array, uno por categoría:
        [{ category: 'finca_campo', title: 'Fincas y campo',
           subtitle: 'Populares esta semana', properties: [...] }, ...]
      → Cada categoría trae MÍNIMO 8 viviendas para alimentar el
        scroll horizontal completo, incluso en pantallas anchas (wide)
        donde se ven 5+ cards a la vez — si una categoría tiene menos
        de 8 viviendas reales en el piloto, se completa con viviendas
        de categorías relacionadas, marcadas internamente para no
        duplicar lógica con el "también te puede interesar" del
        Módulo 2
```

---

## Módulo 4 — Búsqueda Dinámica y Filtros

*(Contenido ya validado en la v1 de este anexo — se mantiene, con un ajuste: los resultados de la búsqueda dinámica usan las mismas reglas de densidad del Módulo 2.)*

```
□ Input de búsqueda con debounce (~300ms) + autocompletado de
  ciudades/regiones colombianas
□ Panel de filtros (drawer) aplicado en tiempo real, sin botón "Aplicar"
□ Toggle Lista / Mapa / Ambas
□ Todo resultado de búsqueda dinámica respeta el Módulo 2: 24 por
  página, skeletons, sección de respaldo si hay pocos resultados

Backend (sin cambios respecto a v1):
  GET /api/v1/search?q=&checkin=&checkout=&guests=&min_wp=&max_wp=
                      &type=&verified=&accepts_purchased_wp=&lat=&lng=&radius_km=
  GET /api/v1/search/autocomplete?q=
```

---

## Módulo 5 — Clasificación y Cards de Vivienda

### 5.1 Taxonomía (sin cambios respecto a v1)

| Categoría | Subtipos |
|---|---|
| Fincas y campo | Finca cafetera, finca ganadera, casa de campo |
| Playa y costa | Casa de playa, apartamento frente al mar, cabaña costera |
| Urbano | Apartamento, loft, casa de ciudad |
| Montaña | Cabaña de montaña, refugio |
| Exclusivo | Villa con piscina, casa con vista panorámica |

### 5.2 Anatomía de la card (usa exclusivamente tokens del Módulo 1)

```
┌─────────────────────────────┐
│  [🟢 Verificado]             │  ← badge, ink-teal-900 sobre surface-mist
│                               │
│         FOTO 4:3              │  ← skeleton shimmer si aún carga
│                               │
│                    ╭───────╮ │
│                    │ 110WP │ │  ← WellScore Ring, wellpoint-gold,
│                    ╰───────╯ │     tipografía Plex Mono
├─────────────────────────────┤
│ Casa con jardín en Barcelona │  ← Inter 500, ink-teal-900
│ Urbano · Barcelona, España   │  ← Inter 400, text-muted
│ ★ 4.9 (31)                   │  ← Inter 400
│ 3 hab · 2 baños · 6 pers.    │  ← Inter 400, text-muted
│ 🔁 Recíproco  💳 WP comprados │  ← chips pequeños, radius-sm
└─────────────────────────────┘
```

### 5.3 Requerimientos técnicos

```
□ <PropertyCard /> como componente único reutilizado en grid, carruseles
  de home y resultados de búsqueda — una sola definición, no versiones
  distintas por pantalla
□ <WellScoreRing value={score} wp={pricePerNight} /> como componente
  aparte, SVG con el anillo de progreso animado al montar (respeta
  "reduced motion" del sistema operativo del usuario)
□ Chips de tipo de intercambio derivados de properties.exchange_types
  (definido en el anexo de WellPoints, Módulo B)
```

---

## Módulo 6 — Asistente Conversacional (WellBot)

*(Contenido ya validado en la v1 de este anexo, se mantiene completo — ver detalle de arquitectura, tool use y límites en la sección original. Se resume aquí el criterio de entrada al módulo.)*

```
□ Requiere que el Módulo 4 (búsqueda) y el Módulo 2 (grid) ya existan,
  porque WellBot debe poder "accionar" búsquedas reales, no solo
  responder texto
□ Burbuja flotante persistente en todas las pantallas, con mensaje de
  bienvenida contextual según la ruta activa
□ POST /api/v1/assistant/message con tool use hacia los endpoints ya
  definidos (búsqueda, wellscore, transacciones) — nunca inventa datos
  transaccionales
```

---

## Módulo 7 — Responsividad Multidispositivo

**Objetivo del módulo:** que cada módulo anterior funcione correctamente en el rango completo de dispositivos, no solo en el viewport de escritorio donde probablemente se está desarrollando hoy.

### 7.1 Matriz de dispositivos a validar

| Categoría | Ejemplo de referencia | Breakpoint (Módulo 1.5) |
|---|---|---|
| Móvil pequeño | iPhone SE / Android gama media (360–390px) | mobile |
| Móvil grande | iPhone 15/16, Android grande (400–430px) | mobile |
| Tablet vertical | iPad Mini/Air (768–834px) | tablet |
| Tablet horizontal / laptop pequeño | iPad landscape, laptop 11" (1024–1180px) | desktop |
| Desktop estándar | Monitor 1366–1440px | desktop / wide |
| Desktop grande | Monitor 1920px+ | wide |

### 7.2 Reglas de comportamiento responsivo por módulo

```
Módulo 2 (Grid):     1 col en mobile → 2-3 en tablet → 4 en desktop → 5-6 en wide
                      (solo aplica en búsqueda activa / "Ver todas", no en
                      la vista principal de Explorar — ver Módulo 3)
Módulo 3 (Filas):    scroll horizontal 100% táctil en mobile/tablet (con
                      scroll-snap y la última card siempre cortada, ver
                      Módulo 3.2–3.3), flechas ‹ › al hover en desktop/wide
Módulo 4 (Búsqueda):  en mobile, Dónde/Cuándo/Quién colapsan en un solo
                       botón que abre un modal de pantalla completa
                       (patrón ya usado por Airbnb en su app móvil)
Módulo 5 (Cards):     el mismo componente <PropertyCard /> cambia de ancho
                       según el contexto que lo renderiza, no según su
                       propio breakpoint: dentro de una fila (Módulo 3)
                       usa el ancho fijo de la tabla 3.3 (~85% en mobile,
                       con corte parcial); dentro del grid (Módulo 2)
                       ocupa el 100% de su columna, con foto 16:9 en mobile
                       y 4:3 en tablet/desktop/wide
Módulo 6 (WellBot):   en mobile, el panel de chat se abre en pantalla
                       completa (no un panel flotante pequeño), con
                       botón de cierre siempre visible
```

### 7.3 Requerimientos técnicos

```
□ Todo layout se construye mobile-first (CSS base para mobile,
  media queries hacia arriba) — no al revés
□ Objetivos táctiles (botones, chips, íconos clicables) de mínimo
  44x44px en mobile/tablet, sin excepción
□ Tipografía usa unidades relativas (rem), nunca px fijos, para
  respetar configuraciones de accesibilidad del usuario
□ Pruebas obligatorias antes de cerrar cualquier módulo: Chrome
  DevTools device toolbar en los 6 tamaños de la matriz 7.1, más
  al menos una prueba en dispositivo físico real (Android y iOS)
  antes de marcar el módulo como terminado
□ Navegación principal cambia a bottom tab bar en mobile (Explorar,
  Buscar, WellPoints, Mensajes, Perfil) en vez del menú horizontal
  superior usado en desktop
```

---

## Módulo 8 — Ajustes para el Piloto en Colombia

*(Sin cambios respecto a v1 de este anexo.)*

```
□ Comparador de ahorro en COP, no USD
□ Categorías reflejan geografía real del país (fincas cafeteras,
  Caribe, Pacífico, sabana, Boyacá)
□ Fechas festivas colombianas como filtros rápidos sugeridos
□ WellBot reconoce modismos regionales ("el Eje", "la Costa", "el Llano")
□ Verificación con cédula de ciudadanía como primera opción
```

---

## 10. Plan de Trabajo Secuencial

```
SEMANA 1     Módulo 1 — Sistema de Diseño (congelar tokens y componentes base)
SEMANAS 2-3  Módulo 2 + Módulo 3 + Módulo 5 en paralelo (grid, categorías, cards)
SEMANA 4     Módulo 4 — Búsqueda dinámica sobre lo ya construido
SEMANA 5     Módulo 6 — WellBot
SEMANA 6     Módulo 7 — Auditoría de responsividad transversal a todo lo anterior
             (no es una semana aislada: cada módulo previo ya debió probarse
             en la matriz de dispositivos sobre la marcha; esta semana es el
             cierre y la validación final antes del piloto)
SEMANA 7     Módulo 8 — Ajustes finales Colombia + revisión de copy en
             español neutro colombiano
```

**Regla de avance:** ningún módulo se marca como "terminado" si no cumple, además de su propio checklist, la regla del Módulo 1.6 (solo tokens del sistema de diseño) y la regla del Módulo 7.3 (probado en la matriz de dispositivos). Esto evita que el equipo llegue a la semana 6 y descubra que hay que rehacer trabajo de semanas anteriores por no haber sido responsivo desde el inicio.

---

*Este documento reemplaza completamente la v1 del anexo de interfaz. Se mantiene independiente de los anexos de WellPoints (lógica de negocio) y registro de vivienda / compra de WP (lógica transaccional).*
