# Plan de Diseño — Búsqueda con Mapa Interactivo
### Vista de puntos geográficos + selección de zona a mano en móvil
**Para: equipo de desarrollo · Julio 2026 · Documento estructurado en módulos, ejecutar en orden**
**Extiende el Módulo 4 (Búsqueda Dinámica) del anexo de UI/UX — no lo reemplaza**

> **Punto de partida:** el anexo de UI/UX ya definió un toggle "Lista / Mapa / Ambas" como función de segunda prioridad (Módulo 4.1, marcada como "puede ir después si hay presión de tiempo"). Este documento es exactamente esa función, ahora detallada a fondo porque la marcaste como prioridad — con el mapa de puntos tipo tu imagen de referencia, y el gesto de "dibujar una zona con el dedo" en móvil, que es la parte nueva que no estaba especificada antes.

---

## Índice

1. [Módulo 1 — Qué Resuelve Este Mapa (y qué no)](#módulo-1--qué-resuelve-este-mapa-y-qué-no)
2. [Módulo 2 — Vista de Puntos (Pins de Vivienda)](#módulo-2--vista-de-puntos-pins-de-vivienda)
3. [Módulo 3 — Agrupación de Puntos (Clustering)](#módulo-3--agrupación-de-puntos-clustering)
4. [Módulo 4 — Layout Desktop/Tablet: Vista Dividida](#módulo-4--layout-desktoptablet-vista-dividida)
5. [Módulo 5 — Layout Mobile: Selección de Zona a Mano](#módulo-5--layout-mobile-selección-de-zona-a-mano)
6. [Módulo 6 — Sincronización Mapa ↔ Lista](#módulo-6--sincronización-mapa--lista)
7. [Módulo 7 — Diseño Visual](#módulo-7--diseño-visual)
8. [Módulo 8 — Plan de Acción Técnico](#módulo-8--plan-de-acción-técnico)
9. [Checklist de Implementación](#9-checklist-de-implementación)

---

## Módulo 1 — Qué Resuelve Este Mapa (y qué no)

```
✅ Resuelve:
   - Entender DÓNDE están las viviendas disponibles de un vistazo,
     no solo leer nombres de ciudad en una lista
   - Detectar zonas con mucha oferta vs. poca, útil en un país donde
     "cerca" puede significar horas de carretera (ya señalado en el
     anexo de UI/UX, Módulo 7 — Ajustes Colombia)
   - Permitir búsquedas por área dibujada a mano, no solo por nombre
     de ciudad escrito (esto es lo nuevo que pides)

❌ No reemplaza:
   - La búsqueda por texto con autocompletado ya definida (Módulo 4
     del anexo de UI/UX) — el mapa es un modo adicional, no el único
   - El grid denso de resultados (Módulo 2 del anexo de UI/UX) — la
     lista de resultados sigue existiendo junto al mapa, nunca el
     mapa solo sin lista (ver Módulo 4 de este documento)
```

**Aclaración sobre tu referencia visual:** en tu captura los pines negros/azules parecen distinguir algo (posiblemente distintos tipos de perfil o estado). En Wellhouse, el color de cada pin debe comunicar algo real y ya definido en el sistema — no un color arbitrario. Ver Módulo 2.2.

---

## Módulo 2 — Vista de Puntos (Pins de Vivienda)

### 2.1 Qué representa cada pin

```
□ Un pin = una vivienda disponible que cumple los filtros de
  búsqueda activos (mismos filtros ya definidos en el Módulo 4 del
  anexo de UI/UX: fechas, WP, categoría, verificado, tipo de
  intercambio)
□ Los pines se posicionan con la ubicación APROXIMADA de la vivienda
  (zona/barrio), nunca la dirección exacta — mismo principio de
  revelación progresiva ya establecido en el anexo de detalle de
  vivienda (la dirección exacta solo se revela tras confirmar un
  intercambio)
```

### 2.2 Color y contenido del pin (usa el sistema de diseño, no colores libres)

```
□ Pin estándar: gota con el precio en WP/noche dentro (ej. "170"),
  fondo `base-paper`, borde `ink-teal-900`, texto en Plex Mono
  (mismo tratamiento tipográfico que el WellRank Ring en las cards)
□ Pin en hover/selección: fondo `accent-cobalt`, texto `base-paper`
  — se resalta el pin correspondiente a la card que el usuario está
  viendo en la lista (Módulo 6)
□ Pin de vivienda favorita del usuario (si aplica): pequeño ícono de
  corazón relleno en la esquina del pin, mismo ícono ya usado en
  Favoritos (anexo de dashboard)
□ NUNCA se usan colores para distinguir "tipos de anfitrión" ni
  nada relacionado a las personas — el mapa muestra viviendas, no
  perfiles; esto es una diferencia intencional frente a apps de
  otro tipo que sí codifican personas por color en el mapa
```

### 2.3 Interacción con un pin

```
□ Tap/click en un pin → abre una tarjeta flotante compacta encima
  del mapa (mini-preview: foto, nombre, WP/noche, rating) sin
  navegar fuera de la búsqueda
□ Tap/click en la tarjeta flotante → navega a la página de detalle
  completa (anexo correspondiente)
□ Tap fuera del pin → cierra la tarjeta flotante, vuelve a la vista
  general del mapa
```

---

## Módulo 3 — Agrupación de Puntos (Clustering)

Cuando hay muchas viviendas cercanas entre sí (zoom alejado), mostrar cada pin individual satura el mapa y se vuelve ilegible — se agrupan en un clúster numerado.

```
┌─────┐
│ 12  │   ← círculo con el número de viviendas en esa zona,
└─────┘      fondo `accent-cobalt`, tamaño proporcional a la
             cantidad (más viviendas = círculo ligeramente mayor,
             dentro de un rango controlado para no saturar)

□ Tap/click en un clúster → hace zoom automático hacia esa zona
  hasta que el clúster se abre en pines individuales
□ El umbral de a partir de cuántos pines se agrupan y a qué nivel
  de zoom se desagrupan se ajusta según densidad real de datos del
  piloto (empezar con clustering a partir de 2+ pines que se
  solaparían visualmente, afinar con datos reales después)
```

---

## Módulo 4 — Layout Desktop/Tablet: Vista Dividida

### 4.1 Estructura

```
┌────────────────────┬──────────────────────────┐
│  Lista (scroll      │                          │
│  vertical, 40% del  │      MAPA                │
│  ancho)             │      (60% del ancho,     │
│                      │      fijo, no hace       │
│  [PropertyCard]      │      scroll con la       │
│  [PropertyCard]      │      lista)              │
│  [PropertyCard]      │                          │
│  [PropertyCard] ...  │      [pines/clusters]    │
│                      │                          │
└────────────────────┴──────────────────────────┘
```

```
□ El mapa es sticky (position: sticky) mientras la lista hace scroll
  — mismo patrón ya usado en el panel de reserva del anexo de
  detalle de vivienda, consistente con el resto del sistema
□ Al mover/hacer zoom en el mapa, la lista se actualiza para mostrar
  SOLO las viviendas visibles en el área actual del mapa (Módulo 6)
□ Botón "Buscar en esta zona" aparece cuando el usuario mueve el
  mapa manualmente, en vez de recargar automáticamente en cada
  movimiento — evita resultados parpadeando constantemente mientras
  el usuario todavía está explorando el mapa
```

### 4.2 Toggle de modo (ya definido en el anexo de UI/UX, se mantiene)

```
[Lista]  [Mapa]  [Ambas]   ← "Ambas" usa el layout de 4.1 por defecto
                              en desktop/tablet
```

---

## Módulo 5 — Layout Mobile: Selección de Zona a Mano

**Esta es la parte central de tu pedido — el gesto de dibujar una zona con el dedo no existe todavía en ningún anexo anterior.**

### 5.1 Por qué el layout dividido no funciona en mobile

En una pantalla angosta, dividir mapa y lista en dos mitades deja ambas demasiado pequeñas para ser útiles. En mobile, el mapa y la lista se turnan en pantalla completa, no se dividen.

### 5.2 Estructura de la interacción

```
┌──────────────────────────┐
│  ¿Dónde quieres quedarte? │  ← barra de búsqueda (Módulo 4 anexo UI/UX)
├──────────────────────────┤
│  [Lista]  [🗺️ Mapa]        │  ← toggle simple, un botón flotante
│                            │    tipo pill, siempre visible
│                            │
│      MAPA A PANTALLA       │
│      COMPLETA               │
│                            │
│      [pines/clusters]      │
│                            │
│  ✏️ Mantén presionado y      │  ← instrucción visible la PRIMERA vez
│  dibuja el área que te      │    que el usuario abre el mapa (se
│  interesa                   │    puede cerrar y no vuelve a aparecer)
│                            │
├──────────────────────────┤
│  [🔍 Buscar en esta zona]   │  ← aparece SOLO cuando el usuario ya
│                            │    dibujó un área, botón flotante fijo
│                            │    abajo, `accent-cobalt`
└──────────────────────────┘
```

### 5.3 Cómo funciona el gesto de dibujo

```
□ El usuario mantiene presionado sobre el mapa (long-press, no un
  simple tap, para no confundirse con mover el mapa) y arrastra el
  dedo — se dibuja un trazo libre (polígono) que sigue el dedo en
  tiempo real, con relleno semitransparente `accent-cobalt-light` y
  borde `accent-cobalt`
□ Al soltar el dedo, el polígono se cierra automáticamente
  (conectando el punto final con el inicial) y aparece el botón
  flotante "Buscar en esta zona" (5.2)
□ Si el usuario quiere rehacer la selección, un botón pequeño "✕
  Borrar zona" junto al botón de buscar limpia el polígono dibujado
□ Alternativa más simple para quien prefiere no dibujar a mano
  libre: long-press simple (sin arrastrar) crea un círculo de radio
  ajustable con los dedos (pellizcar para agrandar/achicar) — se
  ofrecen AMBAS interacciones, dibujo libre y círculo ajustable,
  porque dibujar un polígono preciso con el dedo es más difícil de
  lo que parece y un usuario apurado prefiere el círculo
```

### 5.4 Al tocar "Buscar en esta zona"

```
□ El polígono o círculo dibujado se convierte en coordenadas
  geográficas (lat/lng de cada vértice, o centro + radio si fue un
  círculo) y se envía al backend (Módulo 8.2)
□ Transición automática del mapa a la vista de Lista, ya filtrada
  con los resultados de esa zona — el usuario dibujó para encontrar
  casas, así que el resultado natural es verlas listadas, no
  quedarse mirando el mapa vacío de nuevo
□ Chip visible arriba de la lista: "Zona seleccionada ✕" — permite
  quitar el filtro de zona dibujada y volver a la búsqueda general
  con un toque, sin tener que volver al mapa a borrar el dibujo
```

---

## Módulo 6 — Sincronización Mapa ↔ Lista

```
□ Hover (desktop) o tap (mobile en modo "Ambas"/dividido si existe
  en tablet) sobre una card de la lista → resalta el pin
  correspondiente en el mapa (color de "seleccionado", Módulo 2.2)
□ Tap en un pin → resalta y hace scroll automático hasta la card
  correspondiente en la lista
□ Mover/zoom el mapa (desktop) o dibujar una zona (mobile) → la
  lista se actualiza para mostrar solo lo que está dentro del área
  visible/dibujada — nunca dos fuentes de datos desincronizadas
  entre lo que se ve en el mapa y lo que aparece en la lista (mismo
  principio de fuente única de verdad ya aplicado entre Mensajes e
  Intercambios en el anexo correspondiente)
```

---

## Módulo 7 — Diseño Visual

```
□ Mapa en escala de grises/tonos suaves de fondo (no el estilo de
  colores vivos por defecto de Google Maps) para que los pines
  `accent-cobalt`/`base-paper` resalten con contraste — la mayoría
  de plataformas de este tipo personalizan el estilo del mapa por
  esta misma razón
□ Iconografía de controles del mapa (zoom +/-, ubicación actual)
  del mismo set ya definido (Lucide), nunca los íconos por defecto
  del proveedor de mapas sin adaptar
□ Todo el módulo usa exclusivamente los tokens ya definidos —
  ninguna paleta nueva para el mapa
```

---

## Módulo 8 — Plan de Acción Técnico

### 8.1 Frontend

```
□ <SearchMapView /> — componente de mapa, usando una librería de
  mapas con soporte de clustering nativo o vía plugin (ej. Mapbox
  GL o Google Maps JS API con MarkerClusterer — decisión técnica
  del equipo según el proveedor de mapas ya elegido para el resto
  de la app, coherencia con lo ya usado en el panel de detalle de
  vivienda del anexo correspondiente)
□ <MapPin price={} isSelected={} isFavorite={} /> (Módulo 2.2)
□ <ClusterBadge count={} /> (Módulo 3)
□ <PropertyPreviewCard /> — la tarjeta flotante compacta al tocar
  un pin (Módulo 2.3), reutiliza estilos de <PropertyCard /> pero
  en versión reducida
□ <DrawZoneOverlay /> — maneja el gesto de long-press + arrastre
  (Módulo 5.3), calcula el polígono/círculo resultante
□ <SplitMapListView /> para desktop/tablet (Módulo 4)
□ <MobileMapToggle /> para mobile (Módulo 5.2)
```

### 8.2 Backend

```
GET /api/v1/search?...(filtros ya existentes)...
                    &bounds=lat1,lng1,lat2,lng2      (para desktop:
                       viewport rectangular del mapa actual)
                    &polygon=lat1,lng1;lat2,lng2;...  (para mobile:
                       zona dibujada a mano libre)
                    &center=lat,lng&radius_km=n       (para mobile:
                       círculo ajustable)
    → Retorna resultados filtrados espacialmente, además de los
      filtros ya existentes (fecha, WP, categoría, etc.)
    → Requiere consulta geoespacial eficiente: usar PostGIS
      (extensión de PostgreSQL) con índice espacial (GiST) sobre
      properties.location — evita recorrer todas las viviendas y
      calcular distancia una por una en cada búsqueda

GET /api/v1/search/pins?...(mismos filtros)...
    → Endpoint SEPARADO y más liviano que el de resultados completos:
      retorna solo { id, lat, lng, price_wp, is_verified } por
      vivienda, sin toda la data de <PropertyCard /> — el mapa no
      necesita foto/descripción/amenidades para pintar un pin, pedir
      todo eso de más ralentiza la carga del mapa innecesariamente
```

### 8.3 Base de datos

```
□ properties.location tipo GEOGRAPHY(POINT) (PostGIS) en vez de
  columnas separadas de lat/lng sueltas, si no está ya así definido
  — permite consultas espaciales nativas (ST_Within, ST_DWithin)
□ Índice espacial: CREATE INDEX idx_properties_location ON
  properties USING GIST(location)
```

---

## 9. Checklist de Implementación

```
FASE 1 — MAPA BASE
  □ <SearchMapView /> con pines individuales (Módulo 2)
  □ Endpoint GET /api/v1/search/pins (liviano, 8.2)
  □ Estilo de mapa personalizado (Módulo 7)

FASE 2 — CLUSTERING
  □ Agrupación de pines por zoom (Módulo 3)
  □ Zoom automático al tocar un clúster

FASE 3 — DESKTOP/TABLET
  □ <SplitMapListView /> con mapa sticky (Módulo 4.1)
  □ Botón "Buscar en esta zona" al mover el mapa manualmente
  □ Sincronización hover/scroll entre lista y mapa (Módulo 6)

FASE 4 — MOBILE (lo más nuevo de este plan)
  □ Toggle Lista/Mapa a pantalla completa (Módulo 5.2)
  □ Gesto de dibujo libre con long-press + arrastre (Módulo 5.3)
  □ Alternativa de círculo ajustable con pellizco
  □ Botón flotante "Buscar en esta zona" + transición a lista
    filtrada (Módulo 5.4)
  □ Chip de "Zona seleccionada ✕" en la lista resultante

FASE 5 — BACKEND GEOESPACIAL
  □ PostGIS + índice espacial sobre properties.location (8.3)
  □ Parámetros bounds/polygon/radius en el endpoint de búsqueda

FASE 6 — VALIDACIÓN
  □ Probar el gesto de dibujo específicamente en dispositivo físico
    táctil real (no solo simulador de mouse) — este gesto es el
    más fácil de implementar mal si solo se prueba con clics de
    mouse en desarrollo
  □ Validar en la matriz de dispositivos ya aprobada
```

---

*Este documento extiende el Módulo 4 (Búsqueda Dinámica) del anexo de UI/UX, reutiliza <PropertyCard />, el sistema de diseño y el patrón de "fuente única de verdad" ya aplicado entre Mensajes e Intercambios. No redefine el buscador por texto ya existente — le agrega el modo de mapa con selección de zona a mano como una forma adicional y paralela de buscar.*
