# Plan de Diseño — Módulo de Intercambios
### El ciclo de vida completo: desde que se pide hasta que se cierra el trato
**Para: equipo de desarrollo · Julio 2026 · Documento estructurado en módulos, ejecutar en orden**
**Fuente única de verdad compartida con el módulo de Mensajes**

> **Regla que gobierna todo este documento, léela antes de lo demás:** Intercambios y Mensajes **no son dos sistemas — son dos vistas del mismo dato.** Un intercambio no "vive" en Mensajes y tampoco "vive" en Intercambios por separado; vive en una sola tabla (`exchanges`, Módulo 9) que ambas pantallas leen y escriben. Si el anfitrión acepta una propuesta desde el chat (anexo de Mensajería), la card en Intercambios cambia de estado al instante. Si alguien cancela desde Intercambios, el chat lo refleja de inmediato con un mensaje de sistema. **Ningún cambio de estado ocurre en un solo lugar** — este documento define esa lógica compartida y luego se enfoca, como pediste, en el módulo de Intercambios específicamente: la lista y, sobre todo, qué pasa al hacer clic en un intercambio.

---

## Índice

1. [Módulo 1 — Diagnóstico de la Vista Actual](#módulo-1--diagnóstico-de-la-vista-actual)
2. [Módulo 2 — Fuente Única de Verdad (Sync Intercambios ↔ Mensajes)](#módulo-2--fuente-única-de-verdad-sync-intercambios--mensajes)
3. [Módulo 3 — Ciclo de Vida Completo de un Intercambio](#módulo-3--ciclo-de-vida-completo-de-un-intercambio)
   - [3.4 Bloqueo automático de calendario al confirmar](#34-bloqueo-automático-de-calendario-al-confirmar-crítico--leer-con-atención)
4. [Módulo 4 — Lista de Intercambios (corrección)](#módulo-4--lista-de-intercambios-corrección)
5. [Módulo 5 — Vista de Detalle: Huésped](#módulo-5--vista-de-detalle-huésped)
6. [Módulo 6 — Vista de Detalle: Anfitrión](#módulo-6--vista-de-detalle-anfitrión)
7. [Módulo 7 — Ejecución del Intercambio (durante la estadía)](#módulo-7--ejecución-del-intercambio-durante-la-estadía)
8. [Módulo 8 — Cierre del Trato: Liberación de WellPoints](#módulo-8--cierre-del-trato-liberación-de-wellpoints)
9. [Módulo 9 — Plan de Acción Técnico](#módulo-9--plan-de-acción-técnico)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## Módulo 1 — Diagnóstico de la Vista Actual

A partir de tus dos capturas:

| Problema observado | Por qué importa |
|---|---|
| Las cards no son clicables hacia ningún detalle — toda la información que hay es la que se ve en la lista | No hay dónde ver instrucciones de check-in, la propuesta completa, o el historial de la negociación |
| Solo se ve el rol "Eres huésped" — no hay evidencia de cómo se ve un intercambio cuando TÚ eres el anfitrión que debe decidir | El anfitrión necesita ver algo distinto: el Índice de Confianza del solicitante de forma prominente, y botones de Aceptar/Rechazar, no un botón de Cancelar genérico |
| El botón "Cancelar" aparece incluso en un intercambio con fecha 14/7→15/7 cuando hoy ya es 16/7 (la estadía ya debería haber pasado) | Un intercambio que ya ocurrió no debería ofrecer "Cancelar" — debería ofrecer "Marcar como completado" o "Dejar reseña" según el Módulo 3 |
| El chat de la Imagen 2 es texto libre plano ("como estas", "listo de una") sin la Propuesta Estructurada ya definida en el anexo de Mensajería | Confirma que ese módulo aún no está conectado — la negociación de fechas/WP no está quedando registrada como dato, solo como conversación suelta |
| El estado "Pendiente"/"Confirmado" solo tiene dos valores | El ciclo de vida real necesita más estados (Módulo 3) para que cada parte sepa exactamente en qué momento está el trato |

---

## Módulo 2 — Fuente Única de Verdad (Sync Intercambios ↔ Mensajes)

```
□ Existe UNA sola tabla `exchanges` (Módulo 9) — ni Mensajes ni
  Intercambios tienen su propia copia del estado
□ La tarjeta de Propuesta dentro del chat (anexo de Mensajería,
  Módulo 3) y la card de la lista de Intercambios leen el MISMO
  registro vía el mismo endpoint — nunca dos fuentes de datos
  paralelas que puedan desincronizarse
□ Cualquier acción que cambie el estado (aceptar, contraofertar,
  cancelar, marcar completado) puede iniciarse DESDE CUALQUIERA
  de los dos lugares — el chat o la lista de Intercambios — y el
  resultado es idéntico
□ Actualización en tiempo real: al cambiar el estado desde un
  lugar, el otro se actualiza sin que el usuario tenga que
  recargar la página (WebSocket o polling corto, Módulo 9.3)
□ El chat vinculado a un intercambio siempre muestra un mensaje de
  sistema cuando el estado cambia desde Intercambios (ej. "Camilo
  canceló este intercambio" aparece como mensaje de sistema en el
  hilo, no solo como un cambio silencioso de badge)
```

---

## Módulo 3 — Ciclo de Vida Completo de un Intercambio

### 3.1 Los estados (más completos que el "Pendiente/Confirmado" actual)

```
1. SOLICITADO       → el huésped envió una Propuesta (anexo de
                       Mensajería), esperando respuesta del anfitrión
2. CONTRAOFERTADO    → cualquiera de las dos partes ajustó fechas/WP
3. CONFIRMADO        → el anfitrión aceptó; WP del huésped quedan
                       RETENIDOS (no transferidos aún, Módulo 8),
                       calendario de la vivienda bloqueado
4. EN CURSO          → la fecha de check-in ya llegó, el intercambio
                       está sucediendo activamente
5. COMPLETADO         → pasó la fecha de check-out; ventana de
                       reseñas abierta (14 días, ya definida en el
                       anexo de Perfil de Confianza)
6. CERRADO           → reseñas publicadas (o pasaron los 14 días),
                       WP liberados al anfitrión, intercambio archivado
7. CANCELADO         → por cualquiera de las dos partes, con reglas
                       distintas según el estado en que se cancele
                       (3.2)
8. EN DISPUTA         → alguna de las partes reportó un problema
                       (anexo de Mensajería, Módulo 5.3) — pausa la
                       liberación de WP hasta que soporte lo resuelva
```

### 3.2 Reglas de cancelación por estado

```
□ SOLICITADO / CONTRAOFERTADO → cualquiera cancela libremente, sin
  penalización (aún no hubo compromiso real)
□ CONFIRMADO (antes de la fecha de check-in) → cancelar libera los
  WP retenidos de vuelta al huésped; se registra en el perfil
  interno de quien cancela (frecuencia de cancelaciones tardías
  puede afectar el Índice de Confianza a futuro — política exacta
  a definir con el equipo, se deja marcada aquí como pendiente de
  decisión de negocio, no de diseño)
□ EN CURSO / COMPLETADO → ya no se "cancela", se usa el flujo de
  Reportar un problema (Módulo 5.3 del anexo de Mensajería) en su
  lugar — este es exactamente el bug detectado en el Módulo 1
```

### 3.4 Bloqueo automático de calendario al confirmar (crítico — leer con atención)

**Instrucción explícita para el desarrollador:** en el momento exacto en que un intercambio pasa a estado `CONFIRMADO`, el sistema debe **bloquear automáticamente esas fechas en el calendario de la vivienda**, sin que nadie tenga que hacerlo manualmente. Esto no es opcional ni una mejora futura — es lo que evita que una misma vivienda quede comprometida con dos intercambios distintos en fechas que se cruzan.

```
□ Modelo actual (el único que se implementa AHORA): una vivienda
  solo puede tener UN intercambio confirmado a la vez por rango de
  fechas — se aloja a una sola persona/grupo, no varios en simultáneo,
  independientemente de cuántas habitaciones tenga la casa

□ Al pasar a CONFIRMADO:
    1. Se marcan como "no disponibles" todas las fechas entre
       check_in_date y check_out_date en el calendario de esa
       properties.id (mismo calendario ya definido en el registro
       de vivienda, Módulo A del primer anexo de UI/UX)
    2. Cualquier otra solicitud (de otro usuario) que intente
       solapar esas fechas debe rechazarse automáticamente ANTES de
       llegar a estado SOLICITADO — el buscador y la página de
       detalle ya no deben mostrar esas fechas como disponibles
       (esto conecta directo con GET /api/v1/search y el selector
       de fechas del panel de reserva del anexo de detalle de
       vivienda — ambos deben leer el calendario actualizado)

□ Si el intercambio se CANCELA (antes de completarse) o se RECHAZA
  antes de confirmar → las fechas correspondientes vuelven a quedar
  disponibles de inmediato en el calendario

□ ⚠️ FUERA DE ALCANCE POR AHORA: soporte para viviendas con múltiples
  habitaciones que puedan alojar a más de un grupo distinto en fechas
  superpuestas (ej. una finca con 3 habitaciones independientes que
  se intercambian por separado). Esa lógica requeriría un modelo de
  disponibilidad por habitación en vez de por vivienda completa, y
  como bien dices, ESE plan todavía no se ejecuta — este documento
  solo cubre el modelo de "una vivienda = un intercambio a la vez".
  Cuando ese plan se diseñe, este módulo tendrá que revisarse para
  pasar de un calendario por vivienda a un calendario por unidad
  dentro de la vivienda.
```

### 3.5 Diagrama del ciclo completo

```
Solicitado ──┬──▶ Contraofertado ──▶ Confirmado ──▶ En curso ──▶ Completado ──▶ Cerrado
             │                           │                                        ▲
             │                           │                                        │
             ▼                           ▼                                  (reseñas mutuas,
          Cancelado                  Cancelado                               anexo de Perfil
                                                                               de Confianza)
                              (En cualquier punto desde Confirmado en
                               adelante, puede entrar a "En disputa")
```

---

## Módulo 4 — Lista de Intercambios (corrección)

### 4.1 Cada card ahora distingue rol y usa los estados reales

```
┌──────────────────────────────────────────────┐
│ 🔁 Eres anfitrión        [Solicitado]          │  ← nuevo: rol anfitrión
│ 20/8/2026 → 25/8/2026 · 5 noches               │
│ WellRank: 170 WP/noche = 850 WP totales         │
│                                                 │
│ Solicitante: Camilo G. · Índice ●●●○○           │  ← visible YA en la
│                                                 │    lista, no hay que
│ [Ver solicitud →]                              │    entrar a decidir
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 🔁 Eres huésped          [Confirmado]          │
│ 14/8/2026 → 16/8/2026 · 2 noches               │
│ WellRank: 70 WP/noche = 140 WP totales          │
│                                                 │
│ [Ver detalle →]                                │  ← ya no dice
└──────────────────────────────────────────────┘     "Cancelar" directo
```

```
□ El botón de acción de cada card ya NO es siempre "Cancelar" — es
  "Ver detalle →" / "Ver solicitud →" siempre, y las acciones reales
  (cancelar, aceptar, dejar reseña) viven DENTRO del detalle
  (Módulos 5 y 6) — esto evita el bug del Módulo 1 de tener un botón
  de acción incorrecto para el estado actual
□ Toda la card es clicable (no solo el link de texto), lleva a la
  vista de detalle correspondiente
□ Filtro simple arriba de la lista: Todos / Como anfitrión / Como
  huésped / Necesitan tu respuesta (este último prioriza lo urgente:
  solicitudes pendientes donde el usuario debe actuar)
```

---

## Módulo 5 — Vista de Detalle: Huésped

*(Lo que ve la persona que PIDIÓ el intercambio)*

```
┌──────────────────────────────────────────────┐
│  ● ─── ● ─── ● ─── ○ ─── ○     (stepper del    │
│  Solicitado Confirmado En curso Completado Cerrado│  ciclo, Módulo 3)
├──────────────────────────────────────────────┤
│  [PropertyCard] Casa con jardín en Barcelona   │
│  20–25 ago 2026 · 5 noches · 850 WP totales     │
├──────────────────────────────────────────────┤
│  Anfitrión: Camilo G. · Índice ●●●○○            │
│  [Ver perfil completo →]                        │
├──────────────────────────────────────────────┤
│  Estado: Confirmado — WP retenidos hasta el     │
│  cierre del intercambio (Módulo 8)              │
├──────────────────────────────────────────────┤
│  📋 Resumen del Acuerdo (anexo de Mensajería)    │
│  [Ver documento] [Descargar PDF]                │
├──────────────────────────────────────────────┤
│  💬 Ir a la conversación completa →              │
├──────────────────────────────────────────────┤
│  Acciones disponibles según el estado:          │
│  Si CONFIRMADO (antes de check-in):             │
│    [Cancelar solicitud]                         │
│  Si EN CURSO / próximo a check-in:              │
│    [Ver instrucciones de check-in]              │
│  Si COMPLETADO:                                 │
│    [Dejar reseña] [Reportar un problema]        │
└──────────────────────────────────────────────┘
```

```
□ El stepper (barra de progreso horizontal) es lo primero que se ve
  — responde de inmediato "¿en qué va esto?" sin leer nada más
□ "Instrucciones de check-in" solo se habilita cuando el estado es
  CONFIRMADO y faltan 48h o menos para la fecha (coherente con la
  revelación progresiva de la dirección exacta ya definida en el
  anexo de detalle de vivienda)
```

---

## Módulo 6 — Vista de Detalle: Anfitrión

*(Lo que ve la persona que RECIBE la solicitud sobre su propia vivienda — esta vista no existe hoy en tu app y es la que falta construir primero)*

```
┌──────────────────────────────────────────────┐
│  ● ─── ○ ─── ○ ─── ○ ─── ○     (mismo stepper)  │
├──────────────────────────────────────────────┤
│  [PropertyCard] Hermosa vivienda en Cali        │
│  20–25 ago 2026 · 5 noches · 850 WP totales     │
├──────────────────────────────────────────────┤
│  Solicitante: Ana M. · Índice ●●●●○             │  ← lo más importante
│  Miembro desde ene. 2026 · 12 reseñas           │    de esta vista: el
│  ✓ Identidad verificada                         │    anfitrión decide
│  [Ver perfil completo →]                        │    confiando en ESTO
├──────────────────────────────────────────────┤
│  Si SOLICITADO (esperando tu decisión):         │
│    [Aceptar]  [Contraofertar]  [Rechazar]       │
├──────────────────────────────────────────────┤
│  📋 Resumen del Acuerdo (una vez aceptado)       │
│  💬 Ir a la conversación completa →              │
├──────────────────────────────────────────────┤
│  Si CONFIRMADO / EN CURSO:                      │
│    [Editar instrucciones para el huésped]       │
│  Si COMPLETADO:                                 │
│    [Dejar reseña] [Reportar un problema]        │
└──────────────────────────────────────────────┘
```

```
□ La diferencia central con la vista de huésped: el Índice de
  Confianza del solicitante aparece ARRIBA de todo, antes que
  cualquier botón — el anfitrión está a punto de dejar entrar a un
  desconocido a su casa, esa decisión merece la información más
  importante primero, no al final
□ Los botones Aceptar/Contraofertar/Rechazar son exactamente las
  mismas acciones ya definidas en el anexo de Mensajería (Módulo
  3.2) — se pueden ejecutar desde aquí O desde el chat, mismo
  resultado (Módulo 2 de este documento)
```

---

## Módulo 7 — Ejecución del Intercambio (durante la estadía)

Esta parte no existe todavía en ningún anexo anterior — es el tramo entre "Confirmado" y "Completado" que hay que diseñar explícitamente.

```
□ 48 horas antes del check-in: notificación automática a ambas
  partes con el recordatorio + instrucciones de check-in (dirección
  exacta ya revelada, según el anexo de detalle de vivienda)
□ El día del check-in, el estado pasa automáticamente de CONFIRMADO
  a EN CURSO (job programado, no requiere acción manual de nadie)
□ Botón opcional "Confirmar llegada" para el huésped — no obligatorio,
  pero si lo usa, se suma como una señal más de que el intercambio
  se está desarrollando con normalidad (visible para soporte si
  luego hay una disputa)
□ El día después del check-out, el estado pasa automáticamente de
  EN CURSO a COMPLETADO, y se dispara:
    - La ventana de reseñas de 14 días (anexo de Perfil de Confianza)
    - Un mensaje de WellBot preguntando "¿Cómo estuvo tu intercambio
      con Casa con jardín en Barcelona?" con acceso directo a dejar
      la reseña sin tener que buscarla
```

---

## Módulo 8 — Cierre del Trato: Liberación de WellPoints

**Decisión de diseño central de este documento:** los WP no se transfieren al anfitrión en el momento de la confirmación — quedan **retenidos por la plataforma** (mismo espíritu que la Garantía Wellhouse, anexo de Perfil de Confianza) y se liberan cuando el intercambio efectivamente se completa sin disputa. Esto protege a ambas partes: al huésped, porque si el anfitrión no cumple, sus WP no se perdieron de una vez; al anfitrión, porque una vez confirmado, el huésped ya no puede simplemente desaparecer sin que haya WP comprometidos de por medio.

```
Línea de tiempo de los WP:

CONFIRMADO   → WP del huésped pasan de "disponibles" a "retenidos"
               (ledger: type = 'held_in_escrow', ya coherente con
               el patrón append-only del anexo de WellPoints)

COMPLETADO   → comienza la ventana de 14 días (reseñas), los WP
               siguen retenidos

CERRADO      → (reseñas publicadas O pasaron 14 días, lo que ocurra
               primero) → los WP se liberan al anfitrión
               (ledger: type = 'released_to_host')

EN DISPUTA   → la liberación se PAUSA hasta que soporte resuelva el
               caso (usando el contexto automático adjunto del
               anexo de Mensajería, Módulo 5.3) — nunca se libera
               ni se devuelve automáticamente mientras hay una
               disputa abierta
```

### 8.1 Requerimientos técnicos

```
□ Nuevos tipos de transacción en `wellpoint_transactions` (extiende
  el enum ya definido en el anexo de WellPoints):
    'held_in_escrow', 'released_to_host', 'refunded_to_guest'
□ Job programado diario que revisa exchanges en estado COMPLETADO
  con más de 14 días → dispara la liberación automática
□ La liberación también puede dispararse antes de los 14 días si
  ambas reseñas ya se publicaron (mismo trigger ya definido en el
  anexo de Perfil de Confianza, Módulo 7.1)
```

---

## Módulo 9 — Plan de Acción Técnico

### 9.1 Tabla central (unifica lo que Mensajería llamaba `proposals` con el ciclo de vida completo)

```sql
TABLE exchanges (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES conversations(id),
  property_id       UUID NOT NULL REFERENCES properties(id),
  guest_id          UUID NOT NULL REFERENCES users(id),
  host_id           UUID NOT NULL REFERENCES users(id),
  status            VARCHAR(20) NOT NULL DEFAULT 'requested',
  -- 'requested','countered','confirmed','in_progress','completed',
  -- 'closed','cancelled','disputed'
  check_in_date     DATE NOT NULL,
  check_out_date    DATE NOT NULL,
  wp_per_night      INTEGER NOT NULL,
  wp_total          INTEGER NOT NULL,
  exchange_type     VARCHAR(20) NOT NULL, -- 'reciprocal' | 'purchased_wp'
  cancelled_by      UUID REFERENCES users(id) NULLABLE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at      TIMESTAMPTZ NULLABLE,
  completed_at      TIMESTAMPTZ NULLABLE,
  closed_at         TIMESTAMPTZ NULLABLE
);

TABLE exchange_status_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exchange_id   UUID NOT NULL REFERENCES exchanges(id),
  from_status   VARCHAR(20),
  to_status     VARCHAR(20) NOT NULL,
  triggered_by  UUID REFERENCES users(id) NULLABLE, -- NULL = sistema/job
  triggered_from VARCHAR(20) NOT NULL, -- 'messages' | 'exchanges' | 'system'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

`exchange_status_events` es lo que garantiza el Módulo 2: cada cambio queda registrado con desde dónde se disparó, para poder auditar que la sincronización funcionó correctamente.

### 9.2 Endpoints

```
GET  /api/v1/exchanges?role=guest|host&status=&needs_response=true
GET  /api/v1/exchanges/:id
     → Retorna TODO lo que necesitan las vistas de detalle (Módulos
       5 y 6): property, contraparte + su perfil de confianza,
       estado, stepper, resumen del acuerdo, acciones disponibles
       según status Y según si quien consulta es guest_id o host_id

POST /api/v1/exchanges/:id/accept
     → Además de cambiar el estado a CONFIRMADO, este endpoint DEBE
       ejecutar en la misma transacción (nunca como paso separado
       que pueda fallar independientemente):
         1. Bloquear en el calendario de la vivienda (properties
            calendar, ya definido en el registro de vivienda) todas
            las fechas entre check_in_date y check_out_date (Módulo 3.4)
         2. Retener los WP del huésped (Módulo 8)
       Si cualquiera de los dos pasos falla, ninguno se aplica —
       no puede confirmarse un intercambio con el calendario
       bloqueado pero sin WP retenidos, o viceversa
POST /api/v1/exchanges/:id/counter
POST /api/v1/exchanges/:id/reject
POST /api/v1/exchanges/:id/cancel
     → Libera de inmediato las fechas bloqueadas en el calendario
       de la vivienda (Módulo 3.4) si el intercambio ya estaba
       CONFIRMADO
     → Mismas acciones que ya viven en /api/v1/proposals/:id/* del
       anexo de Mensajería — o bien se renombran esos endpoints para
       apuntar aquí, o se dejan como alias del mismo controlador;
       la clave es que NO haya dos implementaciones separadas de
       la misma lógica (Módulo 2)

POST /api/v1/exchanges/:id/confirm-arrival   (huésped, opcional)
POST /api/v1/exchanges/:id/report            (reutiliza el endpoint
                                                ya definido en Mensajería)
```

### 9.3 Sincronización en tiempo real

```
□ WebSocket (o Server-Sent Events como alternativa más simple) sobre
  el canal `exchange:{id}` — tanto la vista de Mensajes como la de
  Intercambios se suscriben al mismo canal mientras están abiertas
□ Si no es viable a corto plazo, un polling corto (cada 10-15s)
  mientras la pantalla está activa es un respaldo aceptable para el
  piloto, con la aclaración de que WebSocket es la solución objetivo
```

---

## 10. Checklist de Implementación

```
FASE 1 — MODELO DE DATOS UNIFICADO
  □ Tabla exchanges + exchange_status_events (9.1)
  □ Migrar/unificar con lo que ya exista de `proposals` en Mensajería
    para que no queden dos fuentes de verdad

FASE 2 — LISTA CORREGIDA
  □ Cards distinguen rol (anfitrión/huésped) con la info correcta
    por rol (Módulo 4.1)
  □ Botón de acción contextual, ya no "Cancelar" fijo
  □ Filtro por rol / "necesitan tu respuesta"

FASE 3 — VISTAS DE DETALLE
  □ Vista de huésped completa (Módulo 5)
  □ Vista de anfitrión completa (Módulo 6) — esta es la que falta
    construir desde cero
  □ Stepper de ciclo de vida compartido entre ambas vistas

FASE 4 — EJECUCIÓN Y CIERRE
  □ Jobs automáticos de transición de estado (confirmado→en curso→
    completado, Módulo 7)
  □ Bloqueo automático de calendario al confirmar + liberación al
    cancelar/rechazar (Módulo 3.4) — probar específicamente que
    el buscador y la página de detalle dejan de mostrar esas fechas
    como disponibles apenas se confirma
  □ Escrow de WellPoints: retenido → liberado (Módulo 8)
  □ Conexión con la ventana de reseñas de 14 días ya definida

FASE 5 — SINCRONIZACIÓN
  □ Canal en tiempo real (o polling) entre Mensajes e Intercambios
  □ Mensajes de sistema en el chat cuando el estado cambia desde
    Intercambios

FASE 6 — VALIDACIÓN
  □ Prueba de flujo completo con dos usuarios de prueba, uno como
    anfitrión y otro como huésped, verificando que un cambio de
    estado en un lugar se refleje de inmediato en el otro
  □ Verificar que ningún intercambio con fecha pasada siga
    ofreciendo "Cancelar" (bug detectado en el Módulo 1)
```

---

*Este documento une y depende del anexo de Mensajería (conversación, Propuesta Estructurada, reporte de problemas) y del anexo de Perfil de Confianza (Índice de Confianza, reseñas con revelado simultáneo, Garantía Wellhouse). Define el ciclo de vida completo que faltaba: desde que se pide un intercambio hasta que se cierra el trato y se liberan los WellPoints.*
