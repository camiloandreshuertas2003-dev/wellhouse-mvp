# Plan de Diseño — Página "Cómo Funciona"
### Wizard educativo, imágenes generadas por IA y resolución de dudas
**Documento adicional | Julio 2026 | Usa el sistema de diseño actualizado (azul `accent-cobalt`, monograma "W", Space Grotesk)**

> **Por qué esta página es distinta a las demás:** todas las anteriores (búsqueda, detalle, dashboard) asumen que el usuario ya entiende el modelo. Esta es la única página cuyo trabajo es **explicarlo desde cero** — y Wellhouse tiene más que explicar que una plataforma de alquiler normal (WellPoints, WellScore™, dos caminos de entrada, verificación). Si esta página falla, todo lo demás se siente confuso aunque esté bien construido.

---

## Índice

1. [Módulo 1 — Qué Confunde Realmente al Usuario](#módulo-1--qué-confunde-realmente-al-usuario)
2. [Módulo 2 — Estructura del Wizard Educativo](#módulo-2--estructura-del-wizard-educativo)
3. [Módulo 3 — Diseño Visual del Wizard](#módulo-3--diseño-visual-del-wizard)
4. [Módulo 4 — Imágenes Generadas por IA](#módulo-4--imágenes-generadas-por-ia)
5. [Módulo 5 — Resolución de Dudas en el Momento](#módulo-5--resolución-de-dudas-en-el-momento)
6. [Módulo 6 — Responsividad Total](#módulo-6--responsividad-total)
7. [Módulo 7 — Plan de Acción Técnico](#módulo-7--plan-de-acción-técnico)
8. [Checklist de Implementación](#8-checklist-de-implementación)

---

## Módulo 1 — Qué Confunde Realmente al Usuario

Antes de diseñar el wizard, hay que nombrar exactamente qué es lo confuso — si no, el wizard termina explicando lo obvio y dejando sin resolver lo que de verdad genera dudas. A partir de todo lo ya definido en los anexos anteriores (WellPoints, registro, compra/membresías), estos son los puntos de fricción reales:

| Duda | Por qué confunde |
|---|---|
| "¿Qué es un WellPoint exactamente?" | No es dinero, no es una tarifa fija — es un concepto nuevo para alguien que solo conoce Airbnb o hoteles |
| "¿Tengo que tener una casa para usar esto?" | La respuesta es no (Camino B del anexo de WellPoints), pero si no se explica temprano, mucha gente asume que sí y abandona |
| "¿Por qué esta casa cuesta más WP que otra?" | Está ligado al WellScore™, un concepto que tampoco existe en otras plataformas |
| "¿Qué pasa si no tengo suficientes WP para la casa que quiero?" | Duda práctica que frena la decisión de registrarse si no se resuelve antes |
| "¿Es seguro? ¿Cómo sé que el anfitrión es real?" | Verificación e identidad — la duda de confianza más grande en cualquier modelo de intercambio entre desconocidos |
| "¿Qué diferencia hay entre ganar WP y comprarlos?" | Ya resuelto en la lógica de negocio, pero nunca explicado visualmente al usuario nuevo |

**Regla de diseño que se deriva de esto:** el wizard no se organiza por funcionalidad de la app (Buscar, Reservar, Pagar), se organiza **por la secuencia real de dudas de alguien que nunca ha usado Wellhouse** — eso es lo que hace que "resuelva sus dudas fácilmente" en vez de solo describir features.

---

## Módulo 2 — Estructura del Wizard Educativo

**No es el mismo wizard del registro de vivienda** (ese es operativo, este es explicativo) — pero comparte el mismo lenguaje visual de "pasos" para que el usuario ya esté familiarizado cuando llegue al de registro.

### 2.1 Los 6 pasos

```
Paso 1 — "¿Qué es Wellhouse?"
  Concepto central: comunidad de intercambio de vivienda basada en
  confianza, no una plataforma de alquiler tradicional.

Paso 2 — "Elige tu camino"
  Interactivo: el usuario elige entre dos tarjetas grandes,
  "Tengo una vivienda para intercambiar" / "Quiero viajar sin
  publicar vivienda" — el resto del wizard AJUSTA el orden y
  énfasis de los pasos siguientes según la elección (ver 2.3)

Paso 3 — "Así funcionan los WellPoints"
  Explica ganar (hospedando) vs. comprar (paquetes/membresía),
  con el diagrama visual de los "dos caminos" ya definido en el
  anexo de WellPoints

Paso 4 — "Así se decide cuánto cuesta cada vivienda"
  Introduce el WellScore™ de forma visual (el mismo anillo que ya
  ve en cada card), mostrando qué lo compone

Paso 5 — "Verificación y confianza"
  Explica badges, verificación de identidad, reseñas — resuelve
  la duda de seguridad de forma explícita, no implícita

Paso 6 — "Ya estás list@"
  Resumen de una sola pantalla + CTA final, distinto según el
  camino elegido en el Paso 2 (lleva al registro de vivienda o
  al catálogo de paquetes de WP)
```

### 2.2 Por qué 6 pasos y no una sola página larga

Un wizard con progreso visible reduce el abandono porque el usuario ve cuánto falta — la misma lógica que ya se aplicó al wizard de registro de vivienda (Módulo A). Una página larga de scroll con todo el contenido junto es más fácil de abandonar a la mitad sin darse cuenta de cuánto queda.

### 2.3 Personalización por camino elegido (Paso 2)

```
Si elige "Tengo vivienda":
  Paso 3 (WellPoints) enfatiza primero "cómo se gana hospedando"
  Paso 4 (WellScore) se presenta como "así se calcula el valor de
  TU vivienda" (segunda persona, orientado a anfitrión)
  Paso 6 CTA final → "Registrar mi vivienda"

Si elige "Quiero viajar sin publicar":
  Paso 3 (WellPoints) enfatiza primero "cómo comprar un paquete"
  Paso 4 (WellScore) se presenta como "así eliges en qué casa
  te alcanza para quedarte"
  Paso 6 CTA final → "Ver paquetes de WellPoints"
```

Esto evita el problema típico de las páginas "cómo funciona": explicar todo genérico a todo el mundo cuando en realidad hay dos audiencias con necesidades distintas (ya definidas como Camino A y Camino B en el anexo de WellPoints).

---

## Módulo 3 — Diseño Visual del Wizard

### 3.1 Layout de cada paso

```
┌──────────────────────────────────────────┐
│  ● ● ● ○ ○ ○     (progreso, paso 3 de 6)  │
│                                            │
│         [ILUSTRACIÓN GENERADA POR IA]      │
│         (Módulo 4 — específica del paso)   │
│                                            │
│  Título del paso (Space Grotesk 600)      │
│  Texto explicativo corto (Inter, body-lg) │
│  máximo 2-3 líneas, nunca un párrafo largo │
│                                            │
│  [¿Tienes dudas? Pregúntale a WellBot →]  │  ← Módulo 5
│                                            │
│  [‹ Atrás]              [Siguiente ›]     │
└──────────────────────────────────────────┘
```

```
□ Indicador de progreso: puntos simples, el activo en `accent-cobalt`,
  los completados en `ink-teal-700`, los pendientes en `surface-mist`
  — nunca el anillo de WellScore aquí, ese símbolo se reserva para
  vivienda/puntaje (mismo principio de uso exclusivo del Módulo 1)
□ Un solo CTA primario por pantalla (`accent-cobalt`), "Atrás" siempre
  en estilo secundario (texto, sin fondo)
□ Transición entre pasos: slide horizontal suave, nunca recarga de
  página completa
```

### 3.2 Tarjetas de selección de camino (Paso 2)

```
┌────────────────┐    ┌────────────────┐
│  [ilustración]  │    │  [ilustración]  │
│                 │    │                 │
│  Tengo vivienda │    │  Quiero viajar  │
│  para intercam- │    │  sin publicar   │
│  biar            │    │  vivienda        │
│                 │    │                 │
│  [Elegir →]     │    │  [Elegir →]     │
└────────────────┘    └────────────────┘
```

La tarjeta elegida queda resaltada con borde `accent-cobalt` y las siguientes pantallas del wizard ya lo reflejan (2.3) — nunca se le vuelve a preguntar lo mismo más adelante.

---

## Módulo 4 — Imágenes Generadas por IA

**Instrucción para el desarrollador/diseñador:** ninguna foto de stock ni ilustración genérica de banco de imágenes — todo el set visual de esta página se genera con IA (Gemini/Nano Banana o equivalente) siguiendo un **estilo único y consistente** para que las 6 ilustraciones se vean como un mismo set, no como imágenes sueltas de fuentes distintas.

### 4.1 Estilo base (usar en TODOS los prompts, sin excepción)

```
Estilo visual obligatorio para todo el set:
"Ilustración plana geométrica minimalista, formas simples con bordes
angulares (nunca orgánicos ni redondeados), paleta de exactamente
tres colores: verde azulado oscuro (#0F3D3E), azul cobalto (#2D6FE0)
y dorado (#E3A93B), sobre fondo blanco cálido (#FBFAF7). Sin
degradados, sin sombras realistas, sin texto ni letras dentro de la
imagen, composición centrada con espacio negativo generoso alrededor.
Estilo consistente con un sistema de diseño de marca moderno y
confiable, no ilustración infantil ni corporativa genérica."
```

Esto mantiene coherencia con el monograma "W" (geométrico, angular) y evita el problema típico de mezclar ilustraciones "bonitas" que no comparten identidad entre sí.

### 4.2 Prompt específico por paso (agregar siempre el estilo base de 4.1)

```
Paso 1 — Qué es Wellhouse
"Dos casas geométricas simples y estilizadas, una a cada lado de la
composición, conectadas por una línea curva punteada dorada que
sugiere intercambio entre ellas."

Paso 2 — Elige tu camino (dos ilustraciones, una por tarjeta)
  Tarjeta A: "Una casa geométrica simple con una llave estilizada
  flotando sobre el techo, en azul cobalto."
  Tarjeta B: "Una maleta de viaje geométrica simple con una pequeña
  moneda dorada flotando junto a ella, sin casa en la composición."

Paso 3 — Así funcionan los WellPoints
"Dos manos geométricas estilizadas (sin detalle realista de piel ni
rasgos) intercambiando una moneda dorada simple entre sí, formas
angulares y minimalistas."

Paso 4 — Así se decide cuánto cuesta cada vivienda
"Un anillo circular incompleto en azul cobalto, con segmentos de
distinto grosor, y una casa geométrica simple en el centro —
representa un medidor de puntaje sin usar números ni texto."

Paso 5 — Verificación y confianza
"Un escudo geométrico simple con una marca de verificación angular
en su interior, en verde azulado oscuro con el detalle de la marca
en azul cobalto."

Paso 6 — Ya estás list@
"Una casa geométrica simple con una pequeña bandera triangular
dorada en la puerta, composición limpia y centrada, sensación de
llegada/inicio."
```

### 4.3 Requerimientos técnicos de las imágenes

```
□ Generar cada ilustración en formato cuadrado o 4:3, exportar como
  PNG con fondo transparente cuando la herramienta lo permita (para
  poder colocarla sobre `base-paper` o `surface-mist` sin caja blanca
  visible)
□ Resolución mínima 1200x1200px, luego comprimir a WebP para producción
□ Guardar todas las variantes generadas antes de elegir — pedir al
  menos 3-4 generaciones por prompt y elegir la más consistente con
  las demás, no la primera que salga
□ Archivo de referencia: mantener las 6 imágenes finales en una misma
  carpeta de assets (`/public/images/como-funciona/`) versionada,
  para que si se regenera una en el futuro, se haga contra el mismo
  set como referencia de estilo
```

---

## Módulo 5 — Resolución de Dudas en el Momento

Esto es lo que evita que el usuario abandone el wizard con una duda sin resolver:

```
□ Botón "¿Tienes dudas? Pregúntale a WellBot" visible en cada paso
  (Módulo 6 del anexo de UI/UX) — al tocarlo, abre WellBot con el
  contexto exacto de ese paso precargado (ej. en el Paso 3, WellBot
  ya "sabe" que la pregunta probablemente es sobre WellPoints)
□ Al final del wizard (Paso 6), sección de "Preguntas frecuentes" en
  acordeón, con las dudas exactas del Módulo 1 de este documento
  como primeras preguntas — no genéricas, sino las que ya se
  identificaron como reales
□ Cada pregunta del acordeón, al expandirse, puede incluir un botón
  "Ver esto en el wizard" que salta de vuelta al paso correspondiente
  — conecta el FAQ estático con el wizard interactivo en vez de
  duplicar la explicación con otras palabras
```

---

## Módulo 6 — Responsividad Total

| Elemento | Mobile | Tablet / Desktop |
|---|---|---|
| Layout del paso | Todo en una columna, ilustración arriba, texto abajo, CTA fijo en la parte inferior de la pantalla | Ilustración a un lado, texto al otro (layout de dos columnas) |
| Tarjetas de selección (Paso 2) | Apiladas verticalmente, una debajo de otra | Lado a lado |
| Transición entre pasos | Swipe horizontal táctil además de los botones | Solo botones ‹ › (igual que las hileras del Módulo 3 del anexo de UI/UX, mismo patrón de interacción ya establecido) |
| WellBot contextual | Pantalla completa al abrir (regla ya definida) | Panel flotante |

```
□ Validar en la misma matriz de dispositivos ya aprobada
□ El CTA principal de cada paso nunca queda oculto bajo el teclado
  en mobile si hay algún campo de texto cerca (no debería haberlo
  en este wizard, pero se valida igual)
```

---

## Módulo 7 — Plan de Acción Técnico

```
Frontend:
  □ <HowItWorksWizard /> con estado de paso actual + camino elegido
    (Paso 2) guardado en el estado del componente, no en la URL
    (para que "Atrás" del navegador no rompa el flujo educativo)
  □ <WizardStep image={} title={} body={} /> reutilizable para los 6 pasos
  □ <PathSelectorCard /> para el Paso 2
  □ <FAQAccordion items={} /> para el cierre del wizard
  □ Contenido (títulos, textos, prompts de imagen ya generadas) vive
    en un archivo de configuración/CMS simple, no hardcodeado en el
    componente — así marketing puede ajustar el texto sin tocar código

Backend:
  □ No requiere endpoints nuevos — el contenido es estático/versionado,
    el único dato dinámico es hacia dónde manda el CTA final (según
    si el usuario ya está autenticado o no, y según el camino elegido)

Analítica (importante para saber si el wizard funciona):
  □ Trackear en qué paso abandona más gente — si el abandono se
    concentra en un paso específico, esa es la señal de que ese
    contenido necesita simplificarse aún más
  □ Trackear cuántas veces se abre WellBot desde cada paso — si un
    paso genera muchas aperturas de WellBot, significa que el texto
    de ese paso no está resolviendo la duda por sí solo
```

---

## 8. Checklist de Implementación

```
□ Confirmar el texto final de cada uno de los 6 pasos (a partir de
  las dudas reales del Módulo 1, no descripciones de features)
□ Generar el set completo de 6 ilustraciones con el estilo base del
  Módulo 4.1 — revisar consistencia visual entre las 6 antes de subirlas
□ Construir <HowItWorksWizard /> con personalización por camino (2.3)
□ Conectar el botón de WellBot contextual en cada paso
□ Construir el FAQ final con salto de vuelta al paso correspondiente
□ Configurar tracking de abandono por paso y apertura de WellBot
□ Validar responsividad en la matriz de dispositivos ya aprobada
```

---

*Este documento usa el sistema de diseño actualizado (azul `accent-cobalt`, Space Grotesk, monograma "W") y se conecta con el anexo de WellPoints (lógica de negocio), el registro de vivienda y WellBot — no redefine ninguno de esos, los explica de la forma más clara posible a alguien que los ve por primera vez.*
