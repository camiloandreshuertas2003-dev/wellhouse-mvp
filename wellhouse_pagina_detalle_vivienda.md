# Plan de Diseño — Página de Detalle de Vivienda
### Cómo se ve una vivienda al hacer clic, mapeada 1:1 con el registro
**Documento adicional | Julio 2026 | Complementa el Sistema de Diseño (Módulo 1) y el Módulo A de registro de vivienda ya definidos**

> **Cómo encaja este documento:** esta es, según investigación de la industria (Airbnb, PriceLabs, GuestReady — fuentes de 2026), **la página que más decide si alguien reserva o no** — más que el listado o la búsqueda. La regla de oro que confirma la evidencia reciente: el título y la foto de portada determinan si el huésped hace clic; la descripción y el resto de fotos determinan si sigue leyendo; y las amenidades determinan si aparece cuando alguien filtra por esas características. Además, las plataformas ya usan IA para leer las amenidades como datos estructurados, no como texto libre dentro de un párrafo — razón de más para que Wellhouse construya esta página con amenidades como campos reales desde el registro, no como texto suelto.

---

## Índice

1. [Principio Rector: Un Solo Dato, Dos Usos](#1-principio-rector-un-solo-dato-dos-usos)
2. [Mapa Registro → Página de Detalle](#2-mapa-registro--página-de-detalle)
3. [Layout de la Página](#3-layout-de-la-página)
4. [Galería de Imágenes — Diseño Original](#4-galería-de-imágenes--diseño-original)
5. [Amenidades — Iconografía (no emojis)](#5-amenidades--iconografía-no-emojis)
6. [WellScore™ Transparente en la Página](#6-wellscore-transparente-en-la-página)
7. [Responsividad Total](#7-responsividad-total)
8. [Plan de Acción Técnico](#8-plan-de-acción-técnico)
9. [Checklist de Implementación](#9-checklist-de-implementación)

---

## 1. Principio Rector: Un Solo Dato, Dos Usos

El registro de vivienda (Módulo A del primer anexo de UI/UX) no es un formulario que se llena y se archiva — **es el contenido de esta página**. Cada campo que el anfitrión completa en el wizard de 6 pasos tiene un destino visual exacto aquí. Si un desarrollador agrega un campo nuevo al registro sin definir dónde aparece en el detalle, ese campo queda huérfano — por eso el mapa de la sección 2 es obligatorio de mantener actualizado.

Esto también evita el problema #1 que señala la investigación de 2026: las fotos de la ficha son lo que más determina el clic, y hay que pensar primero en cómo se ven en pantalla de celular — si el registro no captura las fotos en el orden y calidad correctos desde el inicio, la página de detalle hereda ese problema.

---

## 2. Mapa Registro → Página de Detalle

| Paso del registro (Módulo A) | Dónde aparece en el detalle |
|---|---|
| Paso 1 — Tipo de vivienda / categoría | Breadcrumb superior + ícono de categoría junto al título (Sección 3.2) |
| Paso 2 — Ubicación (mapa interactivo) | Mapa embebido al final de la página + texto de ubicación bajo el título (nunca la dirección exacta antes de reservar, solo zona/barrio) |
| Paso 3 — Capacidad / Amenities | Fila de datos rápidos (hab./baños/personas) bajo el título + grid completo de amenidades (Sección 5) |
| Paso 4 — Fotos | Galería hero (Sección 4) |
| Paso 5 — Título / descripción (con asistencia IA) | Título H1 de la página + descripción estructurada en 3 secciones: **El espacio**, **La zona**, **Cómo llegar** — replicando el patrón que confirma la evidencia de 2026 de que las descripciones bien escaneables convierten más que un bloque de texto plano |
| Paso 6 — Calendario | Selector de fechas en el panel de reserva (Sección 3.3) |
| *(dato calculado, no ingresado)* WellScore™ | Sección dedicada con desglose visual (Sección 6) |

---

## 3. Layout de la Página

### 3.1 Estructura general (desktop)

```
┌──────────────────────────────────────────────────────────┐
│  [Breadcrumb: Urbano › Bogotá]                            │
│  Casa con jardín en Barcelona            🤍 Guardar  ↗ Compartir│
│  ★ 4.9 (31) · Barcelona, España · Verificado               │
├───────────────────────────────────┬────────────────────────┤
│                                     │  ┌──────────────────┐ │
│         GALERÍA HERO                │  │  170 WP / noche   │ │
│         (Sección 4)                 │  │  [Fechas]         │ │
│                                     │  │  [Huéspedes]       │ │
├───────────────────────────────────┤  │  [Solicitar        │ │
│  Anfitrión: Nombre + WellScore host │  │   intercambio]     │ │
│  3 hab · 2 baños · 6 pers.          │  │  🔁 Recíproco       │ │
├───────────────────────────────────┤  │  💳 WP comprados OK  │ │
│  El espacio                         │  └──────────────────┘ │
│  [texto estructurado]               │   ← panel STICKY       │
│  La zona                            │     (se mantiene fijo  │
│  [texto estructurado]               │     al hacer scroll)   │
│  Cómo llegar                        │                        │
│  [texto estructurado]               │                        │
├───────────────────────────────────┴────────────────────────┤
│  Qué ofrece este lugar (Amenidades — Sección 5)             │
│  [ícono] Wifi   [ícono] Cocina   [ícono] Parqueadero  ...   │
├──────────────────────────────────────────────────────────┤
│  Tu WellScore™ para esta vivienda (Sección 6)               │
│  [anillo grande + desglose de factores]                     │
├──────────────────────────────────────────────────────────┤
│  Dónde vas a estar   [mapa embebido, zona aproximada]        │
├──────────────────────────────────────────────────────────┤
│  Reseñas ★ 4.9 (31)                                          │
└──────────────────────────────────────────────────────────┘
        [💬 WellBot] ← con contexto de ESTA vivienda específica
```

### 3.2 Header de la página

```
□ Breadcrumb con ícono de categoría (del set del Módulo 5 de iconografía,
  nunca emoji) — Urbano › Bogotá
□ Título: token `display-md` (Fraunces) del sistema de diseño
□ Línea de metadatos: rating + ubicación + badge Verificado, todo en
  `body-sm`, `text-muted` excepto el rating que usa `ink-teal-900`
```

### 3.3 Panel de reserva (sticky)

```
□ Fijo en el viewport mientras el usuario hace scroll por la
  descripción (position: sticky, top offset = altura del nav)
□ Precio en WP/noche con tipografía `data-lg` (IBM Plex Mono) — el
  único lugar de toda la página donde el precio se ve en formato de
  "cifra de confianza", igual que en las cards
□ Chips de tipo de intercambio aceptado (🔁 Recíproco / 💳 WP comprados)
  usando la iconografía de la Sección 5, tomados directamente de
  properties.exchange_types (ya definido en el anexo de WellPoints)
□ CTA principal usa `accent-mango` — único botón de ese color visible
  en toda la página, para que no compita con nada más
```

### 3.4 Descripción estructurada (no texto libre)

Basado en la práctica que confirma mejor conversión, el formulario de registro (Paso 5, ya en el Módulo A) debe pedir estos tres campos por separado, no un solo textarea:

```
"El espacio"     → qué incluye la vivienda, en lenguaje concreto,
                    no adjetivos genéricos
"La zona"        → qué hay caminando/cerca, lugares con nombre propio
"Cómo llegar"    → transporte, parqueadero, accesos

□ Cada sección tiene su propio encabezado `label` (Inter 500) seguido
  de texto `body-md`, nunca un solo bloque de párrafo sin dividir
□ Límite sugerido: 150-200 caracteres por sección en la vista inicial,
  con "Leer más" — el patrón que confirma la evidencia de que los
  primeros caracteres son los que se leen en la vista previa móvil
```

---

## 4. Galería de Imágenes — Diseño Original

**No se copia el grid de Airbnb literalmente** (1 foto grande + 4 chicas en cuadrícula fija) — se propone una variante con identidad propia, manteniendo el mismo objetivo funcional: la foto de portada es la que más pesa en la decisión de clic, así que debe verse igual de protagonista en cualquier dispositivo.

### 4.1 Concepto: "Mosaico WellHouse"

```
Desktop / wide:
┌─────────────────────────┬───────────┐
│                         │  Foto 2    │
│                         ├───────────┤
│      FOTO PRINCIPAL     │  Foto 3    │
│      (60% del ancho)    ├───────────┤
│                         │  Foto 4    │
│                         │  [+8 fotos]│ ← overlay con contador,
└─────────────────────────┴───────────┘   no una 5ta foto cortada
```

- Diferencia con Airbnb: en vez de una cuadrícula 2x2 simétrica al lado de la foto principal, se usa una **columna vertical de 3 fotos** al lado de la foto principal — le da más protagonismo real a la foto de portada (ocupa más del ancho total) y es visualmente distinguible de la competencia a simple vista.
- La última miniatura siempre lleva un overlay semitransparente `ink-teal-900` al 70% con el conteo real de fotos restantes ("+8 fotos"), nunca solo "Ver todas" en texto plano — es más escaneable de un vistazo.
- Clic en cualquier foto (o en el overlay) abre el visor de galería completo en modal de pantalla completa.

### 4.2 Estado sin fotos suficientes

```
□ Si la vivienda tiene menos de 5 fotos (mínimo para el mosaico
  completo), el layout cae a una sola foto grande + mensaje sutil
  para el propio anfitrión (si es su vivienda) invitándolo a subir
  más — nunca se estira o repite la misma foto para rellenar espacios
```

### 4.3 Requerimientos técnicos

```
□ <PropertyGallery images={[]} /> como componente único, recibe el
  array de fotos ya ordenado (respeta el orden que el anfitrión definió
  en el registro — la investigación confirma que el orden de las fotos
  cambia significativamente la conversión, así que nunca se reordena
  automáticamente en el frontend)
□ Lazy loading de todas las fotos fuera del viewport inicial
□ Formato WebP con fallback, srcset para servir el tamaño correcto
  según dispositivo (nunca la imagen full-res en mobile)
□ Modal de galería completa con navegación por teclado (flechas) en
  desktop y swipe en mobile/tablet
```

---

## 5. Amenidades — Iconografía (no emojis)

Aplica exactamente el mismo criterio híbrido ya definido en el Módulo E del plan de acción inmediato: **Lucide para lo estándar, ícono generado por IA y vectorizado solo para lo específico de Wellhouse/Colombia.**

### 5.1 Por qué esto no es solo estético

Los sistemas de búsqueda con IA ya no leen la prosa de una ficha — leen los datos estructurados. Eso significa que cada amenidad debe existir como un campo real en la base de datos (no una palabra suelta dentro del texto de "El espacio"), con su propio ícono — esto además es lo que le permite a WellBot (Sección 6 del anexo de UI/UX) responder preguntas concretas como "¿tiene parqueadero?" con un dato real, no con una búsqueda de texto libre.

### 5.2 Mapa de amenidades comunes

| Amenidad | Fuente del ícono |
|---|---|
| Wifi | Lucide (`wifi`) |
| Cocina equipada | Lucide (`cooking-pot`) |
| Parqueadero | Lucide (`car`) |
| Piscina | Lucide (`waves`) |
| Aire acondicionado | Lucide (`wind`) |
| Zona de trabajo | Lucide (`laptop`) |
| Mascotas permitidas | Lucide (`paw-print`) |
| Chimenea | Lucide (`flame`) |
| Vista a montaña/finca | Ícono IA (no existe en Lucide con el carácter correcto) |
| Tour cafetero / actividad de finca | Ícono IA — concepto único de la categoría "Fincas y campo" |
| Acceso a playa privada | Ícono IA — variante distinta de la ola genérica de Lucide, para diferenciar "playa cercana" de "acceso privado" |

### 5.3 Requerimientos técnicos

```
□ Tabla amenities (catálogo maestro) con columnas: slug, label,
  icon_source ('lucide' | 'custom'), icon_ref
□ properties_amenities (tabla pivote) — relación real vivienda↔amenidad,
  nunca texto libre parseado
□ Componente <AmenityIcon slug={x} /> centralizado, igual patrón que
  <CategoryIcon /> del Módulo E — un solo punto de verdad
□ El formulario de registro (Paso 3, Módulo A) usa checkboxes con estos
  mismos íconos, no una lista de texto — así lo que el anfitrión marca
  en el registro es exactamente lo que se renderiza en el detalle, sin
  transformación intermedia
```

---

## 6. WellScore™ Transparente en la Página

Esta sección no tiene equivalente en Airbnb — es la pieza que, según se definió en el anexo de UI/UX original, es exclusiva de Wellhouse y debe sentirse como tal.

```
□ Anillo grande (versión ampliada del WellScoreRing de las cards)
  con el puntaje total en el centro
□ Debajo, desglose en barras horizontales cortas por factor:
  Fotos completas · Verificación · Calendario actualizado ·
  Reseñas recientes · Tiempo de respuesta
□ Cada barra usa `wellpoint-gold` para la porción lograda y
  `surface-mist` para el resto — refuerza que WP y WellScore
  comparten identidad visual en toda la app
□ Este desglose es público (lo ve cualquier huésped), lo que
  también sirve de incentivo indirecto para que otros anfitriones
  completen mejor su registro al ver qué mueve el puntaje
```

---

## 7. Responsividad Total

| Elemento | Mobile | Tablet | Desktop / Wide |
|---|---|---|---|
| Galería | Carrusel full-bleed, 1 foto a la vez, swipe + dots indicadores | Mosaico reducido (foto principal + 2 miniaturas) | Mosaico completo (Sección 4.1) |
| Panel de reserva | Se convierte en barra fija inferior ("170 WP/noche · Solicitar") que expande a modal de pantalla completa al tocar | Panel lateral no-sticky, se mueve con el scroll | Panel lateral sticky |
| Descripción | Secciones colapsadas por defecto con "Leer más" | Igual que mobile | Todo expandido, ya hay espacio |
| Amenidades | Grid de 2 columnas | Grid de 3 columnas | Grid de 4 columnas |
| WellBot | Pantalla completa al abrir (regla ya definida en el Módulo 6 del anexo de UI/UX) | Igual que mobile | Panel flotante |

```
□ Se valida en la misma matriz de dispositivos del Módulo 7 del
  anexo de UI/UX — esta página no tiene una matriz aparte, usa la
  misma ya aprobada
□ Objetivos táctiles mínimos de 44x44px se mantienen (botones de
  galería, chips de amenidades, controles del panel de reserva)
```

---

## 8. Plan de Acción Técnico

```
Frontend:
  □ <PropertyDetailPage /> compuesta por los subcomponentes ya listados:
    <PropertyGallery />, <BookingPanel />, <StructuredDescription />,
    <AmenitiesGrid />, <WellScoreBreakdown />, <PropertyMap />,
    reutilizando <WellBotBubble /> con contexto de vivienda específica
  □ Todos los componentes leen exclusivamente tokens del Módulo 1
    del anexo de diseño — misma regla de gobernanza ya establecida

Backend:
  GET /api/v1/properties/:id/detail
      → Retorna TODO lo que la página necesita en una sola llamada:
        { title, category, location_zone, host, gallery[],
          description: { space, area, directions },
          amenities[], wellscore: { total, breakdown[] },
          exchange_types[], availability_calendar, reviews[] }
      → Evita múltiples llamadas fragmentadas que retrasen el
        primer render (crítico porque esta es la página que más
        pesa en la decisión de reservar)

  GET /api/v1/amenities/catalog
      → Catálogo maestro de amenidades con su icon_source/icon_ref,
        usado tanto en el registro (Módulo A) como en esta página

Base de datos (nuevas tablas):
  □ amenities (catálogo maestro — sección 5.3)
  □ property_amenities (pivote vivienda↔amenidad)
  □ properties.description_space / description_area / description_directions
    (reemplaza cualquier campo único de "descripción" libre, si existía)
```

---

## 9. Checklist de Implementación

```
□ Migrar el campo de descripción libre (si existe) a los tres campos
  estructurados (space/area/directions) — incluye actualizar el
  Paso 5 del wizard de registro (Módulo A)
□ Catálogo de amenidades + tabla pivote + íconos (Lucide primero,
  IA para lo específico de Colombia después, sin bloquear el resto)
□ <PropertyGallery /> con el Mosaico WellHouse (Sección 4.1) + modal
  de galería completa
□ <BookingPanel /> sticky en desktop, barra fija + modal en mobile
□ <WellScoreBreakdown /> conectado al cálculo real del WellScore™
  (ya definido en el plan base de WellPoints), no un valor de ejemplo
□ Endpoint único GET /api/v1/properties/:id/detail
□ Validar toda la página en la matriz de dispositivos del Módulo 7
  del anexo de UI/UX antes de dar el módulo por cerrado
```

---

*Este documento se entrega como anexo independiente, enfocado en la página de detalle de vivienda. Usa y depende de los tokens de diseño (Módulo 1), el registro de vivienda (Módulo A) y la iconografía (Módulo E) ya definidos en los anexos anteriores — no redefine nada de eso, solo lo aplica a esta pantalla específica.*
