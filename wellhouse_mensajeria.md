# Plan de Diseño — Sección de Mensajes
### Cerrar un trato fácil y dejar un respaldo de seguridad real, no solo un chat
**Documento adicional | Julio 2026 | Extiende el Módulo 4 y 5 del anexo de Perfil de Confianza**

> **La tensión que resuelve este documento:** un chat libre (tipo WhatsApp) es fácil de usar pero deja un rastro desordenado si algo sale mal ("dijiste que sí" / "no, dije tal vez"). Un formulario rígido de reserva es seguro pero elimina la conversación natural que hace que alguien confíe en cerrar un intercambio. La solución no es elegir entre los dos — es que la **conversación libre y la propuesta estructurada convivan en el mismo hilo**: se habla como en un chat normal, pero el acuerdo real (fechas, WP, condiciones) siempre pasa por una tarjeta de propuesta con datos concretos, nunca solo por texto suelto. Eso es lo que a la vez facilita cerrar el trato Y genera el respaldo de seguridad.

---

## Índice

1. [Módulo 1 — Principios de Diseño](#módulo-1--principios-de-diseño)
2. [Módulo 2 — Anatomía de la Conversación](#módulo-2--anatomía-de-la-conversación)
3. [Módulo 3 — Cerrar un Trato Fácil: la Propuesta Estructurada](#módulo-3--cerrar-un-trato-fácil-la-propuesta-estructurada)
4. [Módulo 4 — Videollamada Integrada (Tour Virtual)](#módulo-4--videollamada-integrada-tour-virtual)
5. [Módulo 5 — Respaldo de Seguridad](#módulo-5--respaldo-de-seguridad)
6. [Módulo 6 — Protección Contra Contacto Externo (aplicado aquí)](#módulo-6--protección-contra-contacto-externo-aplicado-aquí)
7. [Módulo 7 — Funciones Innovadoras Adicionales](#módulo-7--funciones-innovadoras-adicionales)
8. [Módulo 8 — Diseño Visual y Responsividad](#módulo-8--diseño-visual-y-responsividad)
9. [Módulo 9 — Plan de Acción Técnico](#módulo-9--plan-de-acción-técnico)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## Módulo 1 — Principios de Diseño

```
1. Conversación libre + propuesta estructurada en el mismo hilo
   (nunca dos pantallas separadas — el usuario no debe salir del
   chat para "hacer lo formal")

2. Todo acuerdo real (fechas, WP, condiciones) queda como un objeto
   de datos, no como una frase que alguien puede malinterpretar
   después

3. Cada mensaje y cada propuesta son inmutables una vez enviados
   (se pueden ocultar de la vista propia, nunca borrar del registro
   — mismo principio append-only ya usado en el ledger de WellPoints)

4. La app nunca debe ser el paso lento comparado con "mejor te
   escribo por WhatsApp" — cada función de este plan existe también
   para que quedarse en Wellhouse sea más rápido, no solo más seguro
```

---

## Módulo 2 — Anatomía de la Conversación

### 2.1 Estructura de la pantalla

```
┌──────────────────────────────────────────────┐
│  [Foto] Camilo G.   Índice de Confianza ●●●●○  │  ← header fijo,
│  🏠 Casa con jardín en Barcelona · 170 WP/noche │    property mini-card
├──────────────────────────────────────────────┤
│  Estado: Propuesta enviada · esperando respuesta│  ← barra de estado
├──────────────────────────────────────────────┤
│  Hola, ¿está disponible del 20 al 25 de agosto?│
│                                    11:32 a.m.  │
│                                                │
│         Claro, esas fechas están libres 👍     │
│         11:40 a.m. ✓✓ Leído                    │
│                                                │
│   ┌────────────────────────────────┐          │
│   │  📋 Propuesta de intercambio     │          │
│   │  20–25 ago · 170 WP/noche · 5 n. │          │
│   │  Total: 850 WP                   │          │
│   │  [Aceptar] [Contrapropuesta]     │          │
│   └────────────────────────────────┘          │
│                                                │
│  🔒 Toda esta conversación está protegida por   │
│     la Garantía Wellhouse                       │
├──────────────────────────────────────────────┤
│  [Plantillas ▾] [📅] [📋 Proponer] [🎥]  [Escribe...] [Enviar]│
└──────────────────────────────────────────────┘
```

### 2.2 Barra de estado (siempre visible arriba del hilo)

```
Estados posibles, cada uno con su color del sistema (nunca rojo/
verde genérico de semáforo — usa los tokens ya definidos):
  □ "Conversando" (neutro, sin propuesta activa aún)
  □ "Propuesta enviada · esperando respuesta" (`accent-cobalt`)
  □ "Contrapropuesta recibida" (`wellpoint-gold`, llama la atención
    sin ser una alerta de error)
  □ "Intercambio confirmado ✓" (`signal-green`)
  □ "Intercambio cancelado" (`text-muted`, informativo, no dramático)
```

Esto resuelve algo muy común en negociaciones por chat: nadie tiene que hacer scroll para recordar "¿en qué quedamos?" — el estado siempre está arriba.

---

## Módulo 3 — Cerrar un Trato Fácil: la Propuesta Estructurada

### 3.1 Qué es una Propuesta (objeto de datos, no un mensaje de texto)

```
□ Cualquiera de las dos partes puede tocar "Proponer" y llenar un
  mini-formulario inline (nunca sale del chat):
    - Fechas (selector de calendario, cruza automáticamente con la
      disponibilidad real de la vivienda del anexo de detalle)
    - WP por noche (prellenado con el precio real de la vivienda,
      editable si se está negociando)
    - Tipo de intercambio (recíproco / WP comprados — ya definido
      en el anexo de WellPoints)
    - Nota corta opcional (texto libre, máximo 200 caracteres)
□ La propuesta se renderiza como una tarjeta dentro del chat (2.1),
  nunca como texto plano — así es imposible "perderla" en el
  historial de mensajes
```

### 3.2 Flujo de respuesta (un toque, no un formulario nuevo)

```
□ [Aceptar] → confirma el intercambio de inmediato: bloquea el
  calendario de la vivienda, mueve los WP correspondientes según
  el ledger ya definido, cambia el estado a "Intercambio confirmado"
  y genera automáticamente el Resumen del Acuerdo (Módulo 5.2)
□ [Contrapropuesta] → abre el mismo mini-formulario de 3.1
  precargado con los valores actuales, para solo ajustar lo que
  cambia (ej. solo las fechas), no rellenar todo de nuevo
□ [Rechazar] → cierra esa propuesta específica sin cerrar la
  conversación completa, con opción de agregar una razón breve
```

### 3.3 Por qué esto es más rápido que negociar en texto libre

```
Antes (chat libre):                 Con Propuesta Estructurada:
"¿170 está bien?"                    [Tarjeta: 170 WP/noche, 20-25 ago]
"mejor 150 porque son 5 noches"      → [Contrapropuesta: 150 WP/noche]
"vale, hecho"                        → [Aceptar] (un toque)
→ nadie sabe si "hecho" cerró        → queda registrado exactamente
  el trato en 150 o si falta           qué se aceptó, con fecha y hora
  confirmar algo más                   exacta (Módulo 5)
```

---

## Módulo 4 — Videollamada Integrada (Tour Virtual)

**Esta es la pieza más innovadora del plan, y resuelve dos problemas a la vez:** le da al usuario una razón real para no salir a Zoom/WhatsApp (coherente con el anexo de Perfil de Confianza, Módulo 4), y facilita cerrar el trato porque ver la vivienda en vivo genera más confianza que solo fotos.

```
□ Botón 🎥 dentro del mismo chat, sin salir de la app ni instalar nada
  adicional (WebRTC nativo del navegador/app)
□ Cualquiera de las dos partes puede iniciar una videollamada
  ("Tour virtual") directamente desde la conversación
□ La videollamada NO se graba por defecto (privacidad) — pero al
  finalizar, se registra automáticamente en el hilo un evento
  informativo: "Videollamada realizada el 14 jul 2026, duración
  12 min" (metadato, no el contenido), como evidencia de que hubo
  contacto adicional dentro de la plataforma, coherente con el
  respaldo de seguridad del Módulo 5
□ Botón de "Compartir pantalla" opcional, útil si el anfitrión
  quiere mostrar el vecindario por mapa o fotos adicionales en vivo
```

---

## Módulo 5 — Respaldo de Seguridad

Esto es lo que convierte la mensajería en algo que de verdad protege a Wellhouse y a sus usuarios si hay un problema después, no solo una promesa.

### 5.1 Registro inmutable

```
□ Ningún mensaje ni propuesta se elimina del registro una vez
  enviado — un usuario puede "ocultar" un mensaje de su propia
  vista (ej. si se equivocó al escribir), pero el dato original
  permanece en el backend con marca de tiempo exacta
□ Toda acción sobre una Propuesta (creada, contraofertada, aceptada,
  rechazada, cancelada) se guarda como un evento con timestamp,
  no se sobreescribe el estado anterior — mismo patrón append-only
  ya usado en el ledger de WellPoints (consistencia entre anexos)
```

### 5.2 Resumen del Acuerdo (generado automáticamente al aceptar)

```
□ En el momento exacto en que una Propuesta se acepta, el sistema
  genera un documento simple y claro (visible dentro del chat como
  una tarjeta fija, y descargable en PDF) con:
    - Ambas partes (nombre + inicial, coherente con la privacidad
      ya definida en el anexo de Perfil de Confianza)
    - Vivienda, fechas, WP acordados, tipo de intercambio
    - Fecha y hora exacta de la aceptación
    - Enlace directo a la conversación completa que llevó a ese
      acuerdo
□ Este documento es lo primero que el equipo de soporte revisa si
  hay una disputa — no tienen que leer 40 mensajes para reconstruir
  qué se acordó
```

### 5.3 Botón de reporte con contexto automático

```
□ Cada conversación tiene un botón "Reportar un problema" (ícono
  del set ya definido, nunca un signo de exclamación genérico
  alarmante) que abre un formulario corto y adjunta automáticamente:
    - El historial completo de la conversación
    - El Resumen del Acuerdo si existe
    - Las flags de intento de contacto externo si las hubo
      (Módulo 6)
□ Esto elimina la fricción de "tener que explicar todo desde cero"
  al reportar — el equipo de soporte ya llega con el contexto completo
```

### 5.4 Retención específica para conversaciones con intercambio confirmado

```
□ La política general de retención de conversaciones (definida en
  el anexo de WellBot, 12 meses) se extiende a un mínimo de 12
  meses DESPUÉS de la fecha del intercambio (no desde el envío del
  mensaje) para conversaciones que llegaron a una Propuesta
  aceptada — da tiempo suficiente para que cualquier disputa
  posterior al viaje tenga el registro disponible
```

---

## Módulo 6 — Protección Contra Contacto Externo (aplicado aquí)

*(La lógica completa de detección de dos capas ya está definida en el anexo de Perfil de Confianza, Módulo 5 — aquí solo se especifica cómo se ve en la UI de mensajería.)*

```
□ El aviso educativo (Capa 1) aparece como un modal ligero justo
  antes de enviar, nunca bloquea el campo de texto mientras se
  escribe (no interrumpe el flujo natural de escribir un mensaje)
□ El recordatorio pasivo "🔒 Protegido por la Garantía Wellhouse"
  vive fijo en la parte inferior del hilo (visible en 2.1),
  reforzando el incentivo sin sonar a advertencia constante
```

---

## Módulo 7 — Funciones Innovadoras Adicionales

```
□ Plantillas rápidas — botón "Plantillas ▾" con mensajes comunes
  precargados y editables antes de enviar:
    "¿Tienes disponibilidad para [fechas]?"
    "¿Aceptas WellPoints comprados o solo recíproco?"
    "¿Podríamos agendar un tour virtual?"
  (reduce la fricción de "no sé cómo empezar la conversación",
  especialmente para usuarios nuevos)

□ "Resúmeme esta conversación" — botón que invoca a WellBot
  (anexo correspondiente) para generar un resumen corto de una
  conversación larga con desplazamiento extenso, sin tener que
  leer todo el historial de nuevo

□ Recordatorio automático de respuesta pendiente — si una Propuesta
  lleva más de 24 horas sin respuesta, se envía una notificación
  suave a quien debe responder ("Camilo está esperando tu respuesta
  sobre las fechas del 20-25 ago") — mejora la tasa de respuesta
  que alimenta el Índice de Confianza (anexo de Perfil de Confianza)

□ Búsqueda dentro de la conversación — encontrar un mensaje o
  propuesta anterior sin hacer scroll manual, útil en
  conversaciones largas antes de un intercambio

□ Mensaje anclado — cualquiera de las dos partes puede "anclar" un
  mensaje importante (ej. la dirección exacta ya compartida tras
  confirmar) para que quede siempre visible arriba del hilo

□ Traducción automática — no crítico para el piloto en Colombia
  (audiencia hispanohablante), pero se deja como función de la
  hoja de ruta para cuando Wellhouse crezca a otros países;
  técnicamente se apoya en el mismo pipeline de WellBot
```

---

## Módulo 8 — Diseño Visual y Responsividad

```
□ Usa exclusivamente los tokens ya definidos: `accent-cobalt` para
  CTAs (Aceptar, Proponer), `wellpoint-gold` solo si la propuesta
  involucra WP directamente en su tarjeta, `signal-green` para
  confirmaciones, Space Grotesk para el nombre del contacto, Inter
  para los mensajes
□ Mobile: la tarjeta de Propuesta ocupa el ancho completo del chat,
  los botones de acción (Aceptar/Contrapropuesta) se apilan si no
  caben en una fila; la barra de herramientas inferior (Plantillas,
  calendario, proponer, video) colapsa en un solo botón "+" que
  expande las opciones hacia arriba
□ Desktop: lista de conversaciones a la izquierda + hilo activo a
  la derecha (layout de mensajería estándar), igual patrón sticky
  ya usado en otros paneles del sistema
□ Validar en la matriz de dispositivos ya aprobada
```

---

## Módulo 9 — Plan de Acción Técnico

```
Frontend:
  □ <ConversationThread /> con <StatusBar />, <MessageBubble />,
    <ProposalCard />, <QuickActionsBar />
  □ <ProposalComposer /> (mini-formulario inline, Módulo 3.1)
  □ <VideoCallButton /> + <VideoCallOverlay /> (WebRTC, Módulo 4)
  □ <DealSummaryCard /> (Módulo 5.2), con botón de descarga PDF
  □ <ReportIssueButton /> con adjunto automático de contexto (5.3)

Backend:
  GET  /api/v1/conversations
  GET  /api/v1/conversations/:id/messages
  POST /api/v1/conversations/:id/messages
      → Ejecuta la Capa 1 de detección de contacto (anexo de
        Perfil de Confianza, Módulo 5) antes de aceptar

  POST /api/v1/conversations/:id/proposals
      → Crea una Propuesta (estado: pending)
  POST /api/v1/proposals/:id/accept
      → Bloquea calendario, ejecuta transacción en el ledger de
        WellPoints, genera el Resumen del Acuerdo, cambia estado
        de la conversación a "confirmado"
  POST /api/v1/proposals/:id/counter
  POST /api/v1/proposals/:id/reject

  POST /api/v1/conversations/:id/video-call/start
  POST /api/v1/conversations/:id/video-call/end
      → Registra el evento informativo (Módulo 4), sin grabar contenido

  POST /api/v1/conversations/:id/report
      → Adjunta automáticamente historial completo + flags + resumen

  GET /api/v1/deal-summaries/:id/pdf
      → Genera el PDF descargable del Resumen del Acuerdo

Base de datos (nuevas tablas):
  □ conversations (id, participant_a, participant_b, property_id,
    status, created_at)
  □ messages (id, conversation_id, sender_id, content, sent_at,
    hidden_by_sender BOOLEAN) — nunca DELETE real
  □ proposals (id, conversation_id, created_by, dates, wp_per_night,
    exchange_type, status, created_at, resolved_at)
  □ deal_summaries (id, proposal_id, generated_at, pdf_url)
  □ video_call_events (id, conversation_id, started_at, ended_at,
    initiated_by)
```

---

## 10. Checklist de Implementación

```
FASE 1 — CONVERSACIÓN BASE
  □ <ConversationThread /> con historial inmutable
  □ Barra de estado (2.2)
  □ Plantillas rápidas (7)

FASE 2 — PROPUESTA ESTRUCTURADA
  □ <ProposalComposer /> + <ProposalCard />
  □ Flujo Aceptar / Contrapropuesta / Rechazar (3.2)
  □ Integración con calendario real de la vivienda y ledger de
    WellPoints al aceptar

FASE 3 — RESPALDO DE SEGURIDAD
  □ Resumen del Acuerdo autogenerado + descarga PDF (5.2)
  □ Botón de reporte con contexto automático (5.3)
  □ Retención extendida para conversaciones con intercambio
    confirmado (5.4)

FASE 4 — VIDEOLLAMADA
  □ Integración WebRTC básica (iniciar/finalizar)
  □ Registro del evento informativo en el hilo

FASE 5 — PROTECCIÓN Y REFUERZO
  □ Aplicación de la detección de contacto externo (Módulo 6,
    reutilizando lógica ya definida)
  □ Recordatorio pasivo de Garantía Wellhouse visible en el hilo

FASE 6 — MEJORAS DE COMUNICACIÓN
  □ "Resúmeme esta conversación" vía WellBot
  □ Recordatorio automático de respuesta pendiente
  □ Búsqueda y mensaje anclado

FASE 7 — VALIDACIÓN
  □ Responsividad en la matriz de dispositivos ya aprobada
  □ Prueba de flujo completo: propuesta → contrapropuesta →
    aceptación → generación correcta del Resumen del Acuerdo
```

---

*Este documento depende del anexo de Perfil de Confianza (comunicación en la app, detección de contacto externo, Garantía Wellhouse), el anexo de WellPoints (ledger, tipos de intercambio) y el anexo de WellBot (resumen de conversaciones). No redefine ninguno de esos — construye sobre ellos la experiencia de mensajería completa.*
