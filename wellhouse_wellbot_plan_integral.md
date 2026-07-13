# Plan Integral — WellBot
### Arquitectura, memoria, aprendizaje de negocio y panel de inteligencia para el dueño
**Documento adicional | Julio 2026 | El anexo más extenso hasta ahora — WellBot conecta con TODOS los módulos anteriores**

> **Aclaración importante antes de empezar, para que no haya expectativas equivocadas:** cuando dices que WellBot "vaya aprendiendo", hay dos cosas distintas que suenan parecido pero son técnicamente muy diferentes, y este plan las separa con cuidado:
> 1. **Lo que WellBot NO va a hacer:** entrenarse o modificarse a sí mismo automáticamente con cada conversación. Los modelos de lenguaje como el que usa WellBot no "aprenden" de las conversaciones en tiempo real — cada conversación nueva empieza desde el mismo punto de partida (el system prompt y las herramientas que le configuraste).
> 2. **Lo que SÍ vas a tener, y es lo que realmente te sirve como dueño:** una **capa de inteligencia de negocio** que lee todas las conversaciones, extrae patrones (preguntas frecuentes, quejas, dudas sin resolver, señales de qué falta en la app) y te los presenta en un panel — y un proceso donde tu equipo usa esa información para *mejorar* lo que WellBot sabe responder. Ese es el "aprendizaje" real: no es automático ni mágico, es un ciclo entre datos + revisión humana + actualización del asistente. Este documento diseña ese ciclo completo (Módulos 4 y 5).

---

## Índice

1. [Módulo 1 — Arquitectura General](#módulo-1--arquitectura-general)
2. [Módulo 2 — Contexto por Página](#módulo-2--contexto-por-página)
3. [Módulo 3 — Catálogo Completo de Herramientas (Tool Use)](#módulo-3--catálogo-completo-de-herramientas-tool-use)
4. [Módulo 4 — Memoria y "Aprendizaje" Real](#módulo-4--memoria-y-aprendizaje-real)
5. [Módulo 5 — Panel de Inteligencia para el Dueño](#módulo-5--panel-de-inteligencia-para-el-dueño)
6. [Módulo 6 — Seguridad, Privacidad y Límites](#módulo-6--seguridad-privacidad-y-límites)
7. [Módulo 7 — Calidad y Mejora Continua](#módulo-7--calidad-y-mejora-continua)
8. [Módulo 8 — Diseño Visual y Responsividad](#módulo-8--diseño-visual-y-responsividad)
9. [Módulo 9 — Plan de Acción Técnico Completo](#módulo-9--plan-de-acción-técnico-completo)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## Módulo 1 — Arquitectura General

### 1.1 Los tres tipos de conocimiento de WellBot

Para que WellBot "entienda toda la página" de verdad (no solo dé respuestas genéricas), necesita combinar tres fuentes distintas — mezclarlas mal es la causa más común de que un asistente invente información o suene desactualizado:

```
① CONOCIMIENTO EN VIVO (tool use hacia endpoints reales)
   → saldo de WP, disponibilidad de una vivienda, estado del
     registro del usuario, historial de transacciones
   → SIEMPRE se consulta en el momento, nunca se asume ni se
     guarda como texto fijo

② CONOCIMIENTO ESTÁTICO (system prompt + contenido del wizard
   "Cómo funciona")
   → qué es un WellPoint, cómo funciona el WellScore™, políticas
     generales — cosas que no cambian por usuario ni por momento
   → Se actualiza cuando el negocio cambia una regla (ver Módulo 7),
     no en cada conversación

③ CONOCIMIENTO CONVERSACIONAL (memoria de la sesión actual +,
   opcionalmente, memoria persistente del usuario — Módulo 4)
   → lo que el usuario ya dijo en esta conversación, y si se activa
     memoria persistente, sus preferencias de conversaciones pasadas
```

### 1.2 Diagrama de arquitectura

```
┌─────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  Burbuja de │───▶│  Backend:         │───▶│  Claude (API,       │
│  WellBot    │    │  /api/v1/         │    │  Sonnet) con        │
│  (frontend, │    │  assistant/       │    │  tool use           │
│  cualquier  │    │  message          │    │  configurado        │
│  página)    │    │                   │    │                     │
└─────────────┘    │  Arma el contexto:│    └─────────┬───────────┘
                    │  - page_context   │              │
                    │  - user_id (si    │              ▼ llama herramientas
                    │    autenticado)   │    ┌────────────────────┐
                    │  - historial de   │◀───│  Endpoints internos │
                    │    la conversación│    │  (Módulo 3)         │
                    └─────────┬─────────┘    └────────────────────┘
                              │
                              ▼ (async, no bloquea la respuesta)
                    ┌──────────────────┐
                    │  Pipeline de      │
                    │  extracción de    │
                    │  insights         │
                    │  (Módulo 4.3)     │
                    └─────────┬─────────┘
                              ▼
                    ┌──────────────────┐
                    │  Panel de         │
                    │  Inteligencia     │
                    │  (Módulo 5)       │
                    └──────────────────┘
```

### 1.3 Principio rector

**WellBot nunca "sabe" algo que no pueda demostrar de dónde lo sacó.** Si la respuesta depende de un dato real (saldo, precio, disponibilidad), pasa por una herramienta (Módulo 3). Si depende de una regla de negocio, viene del system prompt versionado (Módulo 7), nunca de lo que el modelo "cree recordar" de su entrenamiento general.

---

## Módulo 2 — Contexto por Página

Cada página de la app le pasa a WellBot un `page_context` distinto, para que la primera respuesta ya esté orientada sin que el usuario tenga que explicar dónde está o qué necesita.

| Página | `page_context` enviado | Comportamiento de WellBot |
|---|---|---|
| Home / Explorar | `{ page: 'explore', visible_categories: [...] }` | Sugiere explorar por categoría, puede ejecutar búsquedas en lenguaje natural |
| Resultados de búsqueda | `{ page: 'search', current_filters: {...}, result_count: n }` | Puede ajustar filtros por conversación ("muéstrame solo las que aceptan WP comprados") |
| Detalle de vivienda | `{ page: 'property_detail', property_id: x }` | Responde con datos reales de ESA vivienda (amenidades, WellScore, disponibilidad) — este es el contexto más consultado, ver 2.1 |
| Wizard "Cómo funciona" | `{ page: 'how_it_works', step: n, path_chosen: 'host'|'traveler'|null }` | Ya definido en el anexo anterior — resuelve dudas del paso actual específicamente |
| Registro de vivienda (wizard) | `{ page: 'property_registration', step: n, draft_id: x }` | Ayuda a completar el paso actual, puede explicar cómo sube el WellScore™ Preview |
| Dashboard — Resumen | `{ page: 'dashboard_summary', user_state: {...} }` | Explica los KPIs que el usuario tiene enfrente en ESE momento |
| Dashboard — WellPoints | `{ page: 'dashboard_wellpoints' }` | Puede explicar una transacción específica del historial si el usuario pregunta por ella |
| Checkout de compra de WP | `{ page: 'wellpoints_checkout', package_id: x }` | Solo explica, nunca ejecuta el pago (Módulo 6) |

### 2.1 Ejemplo de por qué el contexto de página importa tanto

```
Usuario en /property/casa-jardin-barcelona pregunta: "¿por qué es tan cara?"

SIN contexto de página → WellBot no sabe de qué vivienda se habla,
tendría que preguntar cuál, generando fricción.

CON contexto de página (property_id ya incluido) → WellBot llama a
GET /api/v1/properties/:id/detail, lee el wellscore.breakdown real
de ESA vivienda, y responde citando los factores reales:
"Esta vivienda tiene 170 WP/noche principalmente porque su
WellScore™ es alto: fotos completas, verificación al día y reseñas
recientes muy positivas. Si quieres, te muestro viviendas similares
con un costo menor."
```

---

## Módulo 3 — Catálogo Completo de Herramientas (Tool Use)

Esta es la lista completa de endpoints que WellBot puede invocar, consolidando todos los anexos anteriores. Ningún endpoint nuevo se crea aquí — todos ya están definidos en otro documento; este módulo es el mapa de cuáles se le exponen a WellBot y con qué restricciones.

| Herramienta | Endpoint | Cuándo la usa WellBot | Restricción |
|---|---|---|---|
| `search_properties` | `GET /api/v1/search` | Búsquedas en lenguaje natural ("finca cerca de Medellín para el puente") | Solo lectura |
| `get_property_detail` | `GET /api/v1/properties/:id/detail` | Preguntas sobre una vivienda específica | Solo lectura |
| `get_home_sections` | `GET /api/v1/home/sections` | Recomendaciones generales por categoría | Solo lectura |
| `get_wellpoints_balance` | (parte de `dashboard/summary` o ledger) | "¿Cuántos WP tengo?" | Solo lectura, requiere usuario autenticado |
| `get_wellpoints_history` | Historial del ledger (anexo de WellPoints) | "¿Por qué se me descontaron 100 WP?" | Solo lectura, solo del propio usuario — nunca de otro |
| `get_wellpoints_packages` | `GET /api/v1/wellpoints/packages` | "¿Cómo compro más WP?" | Solo lectura — **la compra la ejecuta el usuario en el checkout real, WellBot solo informa y dirige** |
| `get_membership_status` | `user_memberships` (anexo de WellPoints) | "¿Tengo una membresía activa?" | Solo lectura |
| `get_dashboard_summary` | `GET /api/v1/dashboard/summary` | Preguntas sobre el estado general de la cuenta | Solo lectura, requiere autenticación |
| `get_favorites` | `GET /api/v1/favorites` | "¿Qué tengo guardado?" | Solo lectura |
| `get_exchanges` | `GET /api/v1/exchanges` | "¿Cómo va mi solicitud a la finca en Salento?" | Solo lectura |
| `get_amenities_catalog` | `GET /api/v1/amenities/catalog` | Explicar qué significa una amenidad | Solo lectura |
| `get_wellscore_preview` | `GET /api/v1/properties/:id/wellscore-preview` | Durante el registro, "¿qué me falta para subir mi puntaje?" | Solo lectura, solo sobre el draft del propio usuario |
| `get_faq_content` | Contenido estático versionado (Módulo 7) | Preguntas conceptuales generales | Fuente de verdad para reglas de negocio, no inventa |

### 3.1 Lo que WellBot tiene explícitamente prohibido hacer

```
❌ Ejecutar una compra de WellPoints o suscripción de membresía
❌ Cancelar una membresía
❌ Publicar, editar o despublicar una vivienda
❌ Confirmar o rechazar una solicitud de intercambio
❌ Modificar el saldo de WP de cualquier forma
❌ Acceder a datos de otro usuario que no sea quien está conversando
```

Todas estas acciones existen como flujos de UI normales (definidos en anexos anteriores) que requieren la confirmación explícita del usuario haciendo clic — **WellBot puede guiar hacia ellas ("te llevo al checkout") pero nunca las ejecuta en nombre del usuario.** Esto no es una limitación técnica, es una decisión de producto: cualquier movimiento de dinero o de datos importantes debe pasar por una pantalla que el usuario ve y confirma.

---

## Módulo 4 — Memoria y "Aprendizaje" Real

### 4.1 Memoria de sesión (dentro de una conversación)

```
□ Cada mensaje nuevo se envía junto con el historial completo de la
  conversación actual (patrón estándar de la API, ya definido en el
  anexo de UI/UX, Módulo 6)
□ Se resetea al cerrar la burbuja de chat o después de un período de
  inactividad configurable (ej. 30 minutos), para no arrastrar
  contexto viejo a una necesidad nueva
```

### 4.2 Memoria persistente por usuario (opcional, con consentimiento)

```
□ Tabla `user_assistant_memory` — guarda preferencias EXPLÍCITAS que
  el usuario compartió y que tienen sentido recordar entre sesiones:
  ej. "prefiere fincas", "viaja normalmente en pareja", "ya preguntó
  cómo funciona el WellScore™ (no repetir la explicación básica)"
□ Este tipo de memoria SOLO se activa si el usuario lo permite
  explícitamente (toggle en Configuración: "Permitir que WellBot
  recuerde mis preferencias") — nunca por defecto
□ El usuario puede ver y borrar esta memoria en cualquier momento
  desde Configuración — total transparencia, nada oculto
□ Esto mejora la experiencia del usuario (personalización), pero
  OJO: no es lo mismo que el "aprendizaje de negocio" del punto 4.3
  — esta memoria es privada de cada usuario, no se usa para el
  panel del dueño
```

### 4.3 La capa de aprendizaje de negocio (lo que de verdad quieres como dueño)

Este es el corazón de tu pedido. Funciona en tres etapas:

```
ETAPA 1 — CAPTURA (automática, en cada conversación)
  Se guarda cada conversación completa en `assistant_conversations`
  y `assistant_messages` (con el user_id si está autenticado, o
  anónimo si no lo está)

ETAPA 2 — EXTRACCIÓN DE INSIGHTS (automática, asíncrona, no bloquea
  la respuesta al usuario)
  Un proceso en segundo plano (puede ser el mismo modelo, en una
  llamada separada y barata, o un job programado que procesa
  conversaciones cerradas) analiza cada conversación y extrae:
    - Categoría de la pregunta (WellPoints, registro, confianza/
      seguridad, precio, disponibilidad, queja, otro)
    - ¿Se resolvió la duda o el usuario se fue insatisfecho?
    - Sentimiento general (positivo / neutro / negativo)
    - ¿Hay una solicitud de función implícita? ("ojalá pudiera
      filtrar por número de camas") → se marca como feature_request
    - ¿Hay una queja explícita? → se marca como complaint, con
      prioridad alta
    - ¿WellBot no supo responder algo? → se marca como
      unanswered_question, con el texto exacto de la pregunta
  Todo esto se guarda estructurado en `assistant_insights`, NO como
  texto libre — así se puede filtrar y contar en el panel (Módulo 5)

ETAPA 3 — CURACIÓN HUMANA (semanal, tu equipo)
  Tu equipo revisa el panel de insights, decide qué preguntas sin
  resolver merecen agregarse al conocimiento estático de WellBot
  (Módulo 1.1, tipo ②), actualiza el system prompt o el contenido
  del wizard "Cómo funciona" en consecuencia, y así, la PRÓXIMA vez
  que alguien pregunte lo mismo, WellBot ya sabe responder.
```

**Esto es "aprendizaje" en el sentido real y útil: no es el modelo cambiando solo, es tu negocio mejorando el asistente con evidencia real de lo que la gente pregunta — más rápido y más certero que adivinar qué agregar al FAQ.**

---

## Módulo 5 — Panel de Inteligencia para el Dueño

**Nota de ubicación:** dijiste que el Panel Admin se toca más adelante — este panel de inteligencia de WellBot puede vivir ahí cuando lo diseñemos, o como una sección independiente mientras tanto. Lo diseño aquí de forma autónoma para que no dependa de esa decisión pendiente.

### 5.1 Qué debe mostrar

```
□ Volumen de conversaciones — por día, por página de origen
  (¿dónde se activa más WellBot? útil para saber qué pantallas
  generan más dudas)

□ Top preguntas frecuentes — agrupadas por categoría (4.3), con
  conteo, ordenadas de más a menos frecuentes

□ Cola de preguntas sin resolver — lista priorizable, cada una con
  el texto exacto de la pregunta, cuántas veces se repitió, y un
  botón "Marcar como resuelta" cuando el equipo ya actualizó el
  conocimiento de WellBot para cubrirla

□ Quejas y solicitudes de función detectadas — separadas en dos
  columnas, cada una con la conversación completa enlazada por si
  el equipo quiere leer el contexto completo

□ Sentimiento general — tendencia en el tiempo (línea simple:
  % positivo / neutro / negativo por semana), no un puntaje inventado
  sin evidencia detrás

□ Relación entre uso de WellBot y conversión — porcentaje de
  usuarios que interactuaron con WellBot y luego completaron una
  acción clave (registro de vivienda, compra de WP), comparado con
  quienes no interactuaron — se presenta como CORRELACIÓN, con una
  nota clara de que no implica causalidad directa, para no llevarte
  a conclusiones equivocadas sobre "cuánto vende" el bot
```

### 5.2 Diseño visual

```
□ Sigue el sistema de diseño ya definido (tokens del Módulo 1 del
  anexo de UI/UX, azul `accent-cobalt`, Space Grotesk)
□ Gráficas simples (barras, línea de tendencia) — nunca dashboards
  sobrecargados de widgets; prioriza 4-5 métricas realmente
  accionables sobre 15 métricas de vanidad
□ Cada insight es clicable hacia la conversación original completa,
  para que nunca sea un número sin contexto detrás
```

### 5.3 Requerimientos técnicos

```
Backend:
  GET /api/v1/admin/wellbot/summary?range=7d|30d
      → { conversation_volume: [...], top_questions: [...],
          sentiment_trend: [...], conversion_correlation: {...} }

  GET /api/v1/admin/wellbot/unresolved-queue?status=pending|resolved
      → Lista paginada de preguntas sin resolver

  PATCH /api/v1/admin/wellbot/unresolved-queue/:id
      → Body: { status: 'resolved', resolution_note: '' }

  GET /api/v1/admin/wellbot/conversations/:id
      → Conversación completa, para leer contexto

Base de datos:
  TABLE assistant_conversations (id, user_id NULLABLE, page_origin,
    started_at, ended_at)
  TABLE assistant_messages (id, conversation_id, role, content,
    created_at)
  TABLE assistant_insights (id, conversation_id, category,
    resolved BOOLEAN, sentiment, is_complaint BOOLEAN,
    is_feature_request BOOLEAN, unanswered_question TEXT NULLABLE,
    reviewed_by_team BOOLEAN DEFAULT FALSE)
  TABLE user_assistant_memory (id, user_id, memory_text, created_at)
    -- Solo si el usuario activó memoria persistente (4.2)
```

---

## Módulo 6 — Seguridad, Privacidad y Límites

### 6.1 Datos personales (relevante para el piloto en Colombia)

```
□ Las conversaciones de usuarios autenticados contienen datos
  personales (nombre, a veces detalles de viaje) — deben tratarse
  conforme a la Ley 1581 de 2012 de Colombia (protección de datos
  personales / Habeas Data): informar al usuario que sus
  conversaciones con WellBot pueden usarse de forma agregada y
  anonimizada para mejorar el producto, y permitirle no aceptarlo
□ El panel de inteligencia (Módulo 5) trabaja preferentemente con
  datos AGREGADOS (conteos, categorías) — cuando se necesite ver
  una conversación completa por contexto, debe quedar registrado
  quién del equipo la consultó y cuándo (auditoría interna simple)
□ Retención: definir un período máximo de retención de conversaciones
  crudas (ej. 12 meses) — después de eso, solo quedan los insights
  agregados, no el texto original palabra por palabra
```

### 6.2 Reforzando los límites ya definidos (anexo de UI/UX, Módulo 6)

```
□ WellBot nunca inventa disponibilidad, precios ni datos de otro
  usuario — todo pasa por las herramientas del Módulo 3
□ Si una pregunta no puede responderse con las herramientas
  disponibles, WellBot lo dice explícitamente ("no tengo esa
  información, pero la marco para que el equipo la revise") en vez
  de inventar una respuesta plausible — esto además es lo que
  alimenta la cola de preguntas sin resolver (Módulo 4.3 y 5.1)
```

### 6.3 Escalación a soporte humano

```
□ Si el usuario pide hablar con una persona, o si el sistema de
  extracción de insights detecta una queja de alta severidad
  (ej. problema de seguridad, disputa de pago), WellBot ofrece
  de inmediato un camino directo a soporte humano (formulario o
  correo ya existente de la plataforma) en vez de seguir intentando
  resolverlo solo
```

### 6.4 Límites de uso y costos

```
□ Rate limiting por usuario (evitar abuso/spam del asistente)
□ Cacheo de respuestas a preguntas frecuentes NO personalizadas
  (ya definido en el anexo de UI/UX) — reduce costo de llamadas al
  modelo para las preguntas más repetidas del Top de la sección 5.1
```

---

## Módulo 7 — Calidad y Mejora Continua

### 7.1 Versionado del system prompt

```
□ El system prompt de WellBot (reglas, tono, límites, conocimiento
  estático tipo ②) vive en un archivo versionado (control de
  versiones normal, como el resto del código), NUNCA editado
  directamente en producción sin registro de cambios
□ Cada versión nueva incluye una nota de qué se agregó y por qué
  (ej. "v1.4 — se agregó respuesta sobre política de cancelación de
  membresía, detectado como pregunta sin resolver 14 veces esta
  semana")
```

### 7.2 Set de pruebas (eval set)

```
□ Antes de publicar una versión nueva del system prompt, correr un
  set fijo de ~30-50 preguntas reales (tomadas de conversaciones
  pasadas, incluyendo las del Módulo 1 del anexo "Cómo funciona")
  contra la nueva versión, y comparar respuestas contra la versión
  anterior — evita que una mejora en un tema rompa una respuesta
  que ya funcionaba bien en otro
```

### 7.3 Cadencia de revisión

```
□ Semanal: revisión de la cola de preguntas sin resolver + quejas
  de alta prioridad
□ Mensual: revisión de tendencia de sentimiento + top preguntas,
  para detectar patrones más lentos (ej. una categoría de duda que
  viene creciendo mes a mes)
```

---

## Módulo 8 — Diseño Visual y Responsividad

*(Ya definido en el anexo de UI/UX, Módulo 6, y reforzado en el anexo "Cómo funciona", Módulo 5 — este módulo no repite esas reglas, solo confirma que aplican en todas las páginas nuevas de este plan.)*

```
□ Burbuja flotante persistente con mensaje contextual por página
  (Módulo 2 de este documento)
□ Panel completo en mobile, panel flotante en desktop — ya definido
□ El Panel de Inteligencia (Módulo 5) es una vista de escritorio
  primero (es una herramienta de trabajo del equipo, no de un
  huésped), pero debe ser al menos legible en tablet para revisión
  rápida desde cualquier lugar
```

---

## Módulo 9 — Plan de Acción Técnico Completo

### 9.1 Estructura del system prompt (esqueleto)

```
[IDENTIDAD]
Eres WellBot, el asistente de Wellhouse. Tu tono es cercano,
claro y colombiano sin ser informal en exceso.

[LÍMITES — ver Módulo 3.1 y Módulo 6]
Nunca ejecutas compras, cancelaciones, publicaciones ni
confirmaciones de intercambio. Nunca inventas datos: todo dato
transaccional viene de una herramienta.

[CONOCIMIENTO ESTÁTICO — versionado, ver Módulo 7.1]
[... reglas de negocio de WellPoints, WellScore™, políticas ...]

[CONTEXTO DE LA CONVERSACIÓN ACTUAL]
page_context: {{page_context}}
user_authenticated: {{bool}}
user_memory (si aplica, Módulo 4.2): {{memoria_opcional}}
```

### 9.2 Definición de herramientas (ejemplo, formato tool use de la API de Claude)

```json
{
  "name": "get_property_detail",
  "description": "Obtiene los datos reales de una vivienda específica: amenidades, WellScore, disponibilidad, tipo de intercambio aceptado. Úsala siempre que el usuario pregunte algo específico de una vivienda que se está viendo o mencionando.",
  "input_schema": {
    "type": "object",
    "properties": {
      "property_id": { "type": "string" }
    },
    "required": ["property_id"]
  }
}
```

*(Se define una herramienta equivalente por cada fila del Módulo 3 — mismo patrón, cambia el endpoint y los parámetros.)*

### 9.3 Endpoint principal (extiende el ya definido en el anexo de UI/UX)

```
POST /api/v1/assistant/message
  Body: {
    conversation_id: string | null,   // null = nueva conversación
    message: string,
    page_context: { page: string, ...datos específicos de página },
  }
  → El backend agrega automáticamente: user_id (de la sesión),
    historial de la conversación, y memoria persistente si el
    usuario la activó
  → Respuesta: streaming de texto (para que se sienta instantáneo)
    + al finalizar, dispara de forma asíncrona el pipeline de
    extracción de insights (Módulo 4.3, Etapa 2) — esto NUNCA
    retrasa la respuesta visible al usuario
```

### 9.4 Pipeline de extracción de insights (detalle técnico)

```
□ Job asíncrono (cola de trabajos, ej. procesado cada vez que una
  conversación se marca como inactiva por >30 min, o al cerrarse
  la burbuja)
□ Llamada separada y económica al modelo, con un prompt específico
  de clasificación (no el mismo prompt conversacional de WellBot):
    "Clasifica esta conversación en categoría, sentimiento, si se
    resolvió, si hay queja o solicitud de función, y si hubo alguna
    pregunta sin responder. Responde solo en JSON."
□ El resultado se guarda en `assistant_insights` (esquema del
  Módulo 5.3)
□ Este job puede reutilizar el mismo patrón de manejo de errores/
  parseo de JSON ya definido en la guía de integración de la API
  (fences de markdown, try/catch) — no requiere infraestructura
  nueva de ML propia
```

---

## 10. Checklist de Implementación

```
FASE 1 — FUNDAMENTOS
  □ System prompt versionado (9.1) con identidad, límites y
    conocimiento estático inicial
  □ Endpoint POST /api/v1/assistant/message con streaming
  □ Herramientas del Módulo 3 conectadas una por una (empezar por
    búsqueda y detalle de vivienda, que son las más consultadas)

FASE 2 — CONTEXTO POR PÁGINA
  □ page_context implementado en las páginas principales (Módulo 2)
  □ Burbuja de WellBot presente y contextual en toda la app

FASE 3 — CAPTURA E INSIGHTS
  □ Tablas assistant_conversations / assistant_messages /
    assistant_insights
  □ Pipeline asíncrono de extracción de insights (9.4)
  □ Aviso de privacidad sobre uso de conversaciones (6.1)

FASE 4 — PANEL DE INTELIGENCIA
  □ Endpoints de admin (5.3)
  □ Vista del panel con las 6 secciones de 5.1
  □ Flujo de "marcar como resuelta" una pregunta de la cola

FASE 5 — MEMORIA PERSISTENTE (opcional, puede ir después)
  □ Toggle de consentimiento en Configuración
  □ Tabla user_assistant_memory + lectura/borrado por el usuario

FASE 6 — CICLO DE MEJORA CONTINUA
  □ Eval set inicial (~30-50 preguntas)
  □ Cadencia semanal/mensual de revisión (7.3) documentada y
    asignada a alguien del equipo — sin un responsable claro, este
    ciclo no se sostiene solo
```

---

*Este documento conecta y depende de TODOS los anexos anteriores: sistema de diseño, WellPoints, registro de vivienda, página de detalle, dashboard y "Cómo funciona". No redefine ninguno — les da la capa conversacional que los une, y le agrega a Wellhouse la capacidad de mejorar con evidencia real de lo que sus usuarios preguntan.*
