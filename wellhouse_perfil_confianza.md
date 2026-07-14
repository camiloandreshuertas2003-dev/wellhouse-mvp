# Plan de Diseño — Perfil de Usuario Orientado a la Confianza
### Cómo hacer que dos desconocidos confíen lo suficiente para intercambiar su casa
**Documento adicional | Julio 2026 | Investigación aplicada + diseño + enforcement técnico**

> **Investigación previa:** revisé cómo Airbnb resolvió este mismo problema (confiar en un desconocido con tu casa) a lo largo de más de una década, incluyendo un cambio de política de 2014 que resultó clave y que vas a ver reflejado en el Módulo 7. Los hallazgos que más aplican a Wellhouse: la confianza en plataformas P2P se construye con **reputación acumulada** (reseñas reales, no promedios inflados), **verificación de identidad visible**, **autodivulgación personal** (una bio que muestra a una persona real, no un usuario anónimo) y **certificación otorgada por la plataforma** (un badge que la plataforma respalda, no que el usuario se autoasigna). El hallazgo más importante para este documento: **Airbnb descubrió que cuando las reseñas se publicaban de inmediato, la gente escribía reseñas más suaves por miedo a represalias — y cambió a un sistema de revelado simultáneo, que hizo las reseñas mucho más honestas.** Esto se replica directamente en el Módulo 7.

---

## Índice

1. [Módulo 1 — Principios de Confianza Aplicados a Wellhouse](#módulo-1--principios-de-confianza-aplicados-a-wellhouse)
2. [Módulo 2 — Anatomía del Perfil de Confianza](#módulo-2--anatomía-del-perfil-de-confianza)
3. [Módulo 3 — Índice de Confianza (distinto del WellRank™)](#módulo-3--índice-de-confianza-distinto-del-wellrank)
4. [Módulo 4 — Comunicación 100% Dentro de la App](#módulo-4--comunicación-100-dentro-de-la-app)
5. [Módulo 5 — Detección y Bloqueo de Contacto Externo](#módulo-5--detección-y-bloqueo-de-contacto-externo)
6. [Módulo 6 — Garantía Wellhouse (el incentivo real para quedarse en la app)](#módulo-6--garantía-wellhouse-el-incentivo-real-para-quedarse-en-la-app)
7. [Módulo 7 — Reseñas Mutuas con Revelado Simultáneo](#módulo-7--reseñas-mutuas-con-revelado-simultáneo)
8. [Módulo 8 — Diseño Visual y Responsividad](#módulo-8--diseño-visual-y-responsividad)
9. [Módulo 9 — Plan de Acción Técnico](#módulo-9--plan-de-acción-técnico)
10. [Checklist de Implementación](#10-checklist-de-implementación)

---

## Módulo 1 — Principios de Confianza Aplicados a Wellhouse

| Principio (evidencia de la industria) | Cómo se traduce en Wellhouse |
|---|---|
| Reputación acumulada real, no inflada | Reseñas mutuas con revelado simultáneo (Módulo 7) — nunca un promedio sin historial visible detrás |
| Verificación de identidad visible | Badge "Verificado" ya existente en toda la app, ahora también en el perfil con el detalle de QUÉ se verificó (cédula, correo, teléfono — sin mostrar el teléfono mismo) |
| Autodivulgación personal (bio real) | Sección de bio obligatoria con mínimo de contenido — un perfil vacío genera más dudas que uno completo, aunque el usuario sea nuevo |
| Certificación otorgada por la plataforma, no autoasignada | El Índice de Confianza (Módulo 3) lo calcula Wellhouse con datos reales, el usuario no puede editarlo ni inflarlo |
| Reducir el miedo a represalias en las reseñas | Revelado simultáneo — nadie ve la reseña del otro hasta que ambos ya escribieron la suya (Módulo 7) |
| La foto comunica calidez, no solo identidad | Guía de foto de perfil enfocada en transmitir cercanía (Módulo 2.3), no solo una foto tipo cédula |

**Principio rector de este documento:** la confianza no se pide con un mensaje ("¡somos seguros!") — se **demuestra con evidencia verificable** en cada elemento del perfil. Cada pieza de este plan existe para responder, sin que el usuario tenga que preguntarlo, la duda de fondo: *"¿esta persona es quien dice ser, y qué pasa si algo sale mal?"*

---

## Módulo 2 — Anatomía del Perfil de Confianza

### 2.1 Estructura de la pantalla

```
┌──────────────────────────────────────────┐
│   [Foto de perfil]   Camilo G.            │  ← nombre + inicial del
│                       📍 Bogotá, Colombia  │    apellido, nunca completo
│                       Miembro desde jul. 2026│  (privacidad, 2.4)
│                                             │
│   ✓ Identidad verificada  ✓ Correo verificado│  ← íconos del set ya
│   ✓ Teléfono verificado (no se muestra)     │    definido, nunca emoji
│                                             │
│   Índice de Confianza: ●●●●○  (Módulo 3)    │
│   Tiempo de respuesta: ~2 horas             │
│   Tasa de respuesta: 95%                    │
├──────────────────────────────────────────┤
│  Sobre mí                                   │
│  [bio del usuario, mínimo 100 caracteres]   │
├──────────────────────────────────────────┤
│  Idiomas: Español, Inglés                   │
├──────────────────────────────────────────┤
│  Mi vivienda (si tiene una publicada)       │
│  [PropertyCard]                             │
├──────────────────────────────────────────┤
│  Reseñas (12) — como anfitrión · como huésped│
│  [lista de reseñas reales, Módulo 7]        │
└──────────────────────────────────────────┘
        [💬 Enviar mensaje] ← siempre dentro de la app (Módulo 4)
```

### 2.2 Qué se muestra vs. qué nunca se muestra

```
✅ SE MUESTRA:
   Nombre + inicial del apellido, foto, ciudad (no dirección exacta),
   verificaciones (como insignias, sin el dato crudo), Índice de
   Confianza, tiempo/tasa de respuesta, bio, idiomas, reseñas,
   vivienda publicada (si aplica)

❌ NUNCA SE MUESTRA:
   Número de teléfono, correo electrónico completo, dirección exacta
   de la vivienda (hasta que el intercambio esté confirmado — ya
   definido en el anexo de detalle de vivienda), documento de
   identidad, apellido completo
```

### 2.3 Guía de foto de perfil (para el usuario, no solo para diseño)

```
□ Al momento de subir la foto, un microtexto guía (ya con el patrón
  de asistencia del registro de vivienda): "Una foto donde se te vea
  la cara con buena luz genera más confianza que un logo o una foto
  de paisaje — los perfiles con foto real reciben más solicitudes
  de intercambio"
□ Validación básica: se rechaza si la foto es un ícono genérico,
  un logo, o está evidentemente recortada de otra imagen (puede
  empezar como una regla simple de moderación manual y luego
  evolucionar a una validación automática)
```

### 2.4 Privacidad del nombre (decisión de producto, no solo de UI)

```
□ El sistema guarda el nombre completo real (requerido en la
  verificación de identidad), pero SOLO expone "Nombre + inicial
  del apellido" en cualquier vista pública del perfil
□ El nombre completo solo se revela automáticamente una vez el
  intercambio está confirmado y ambas partes lo necesitan para
  formalidades (ya coherente con la regla de dirección exacta del
  anexo de detalle de vivienda — incluida la misma justificación
  de progresividad de datos)
```

---

## Módulo 3 — Índice de Confianza (distinto del WellRank™)

**Aclaración importante:** el WellRank™ ya definido en anexos anteriores mide la **calidad de una vivienda**. Este es un concepto nuevo y separado — mide la **confiabilidad de una persona**. No deben mezclarse visualmente ni conceptualmente, o el usuario va a confundir "esta casa es buena" con "esta persona es confiable", que son preguntas distintas.

### 3.1 Factores que lo componen (todos verificables, ninguno autodeclarado)

```
□ Verificación de identidad completada          (peso alto)
□ Tasa de respuesta a mensajes (últimos 90 días) (peso medio-alto)
□ Tiempo promedio de respuesta                    (peso medio)
□ Reseñas recibidas (promedio + volumen)          (peso alto)
□ Intercambios completados sin incidentes         (peso alto)
□ Antigüedad en la plataforma                     (peso bajo —
  no penaliza a los nuevos, pero suma con el tiempo)
```

### 3.2 Representación visual

```
□ Se muestra como puntos llenos (●●●●○) o una barra simple — nunca
  un anillo circular como el WellRank™ de las viviendas, para
  que la diferencia sea inmediata a simple vista, no solo conceptual
□ Color: `ink-teal-700`, nunca `wellpoint-gold` (ese color es
  exclusivo de WellPoints, regla ya establecida) ni `accent-cobalt`
  (exclusivo de acciones/CTAs)
□ Un usuario nuevo sin historial no muestra "0 de 5" (se siente como
  una mala calificación) — muestra un estado neutro tipo "Miembro
  nuevo — aún sin historial de intercambios", coherente con el
  principio de Airbnb de dar señales de confianza sustitutas
  mientras se construye el historial real
```

### 3.3 Requerimientos técnicos

```
□ Columna calculada `users.trust_index` (recalculada por job
  periódico, no en cada carga de perfil — es costoso de recalcular
  en tiempo real y no cambia de un minuto a otro)
□ Tabla `trust_index_factors` con el desglose (igual patrón de
  transparencia que el WellRank™ breakdown del anexo de detalle
  de vivienda) — el usuario puede ver POR QUÉ tiene el índice que
  tiene, y qué mejorar
```

---

## Módulo 4 — Comunicación 100% Dentro de la App

Esta es la pieza central de tu pedido: que todo el contacto pase por Wellhouse, no por WhatsApp o llamadas directas.

### 4.1 Por qué esto no es solo una preferencia de producto

```
□ Es lo que permite que la Garantía Wellhouse (Módulo 6) tenga
  evidencia real si algo sale mal — sin registro de la conversación,
  la plataforma no puede mediar un conflicto con datos reales
□ Es lo que alimenta al Índice de Confianza (tasa/tiempo de
  respuesta, Módulo 3) — si la conversación se sale de la app,
  esos datos dejan de existir
□ Es lo que le da a WellBot contexto real para ayudar (anexo de
  WellBot) — no puede ayudar con una conversación que no ve
```

### 4.2 Diseño de la mensajería

```
□ Chat interno con historial permanente, igual de accesible desde
  Mensajes en el dashboard (ya definido en el anexo de dashboard)
□ Nunca se expone teléfono ni correo real en ningún punto del flujo
  de mensajería o de coordinación de un intercambio
□ Notificaciones push/email cuando llega un mensaje nuevo, para que
  no sentir que "hay que salir de la app para no perderse algo" sea
  una razón para migrar la conversación a WhatsApp
```

---

## Módulo 5 — Detección y Bloqueo de Contacto Externo

**Esto es lo que hace el incentivo "infalible" en vez de solo una recomendación que la gente ignora.**

### 5.1 Estrategia de dos capas

```
CAPA 1 — Detección automática en tiempo real (regex, rápida y barata)
  □ Antes de enviar un mensaje, se escanea el texto contra patrones
    de números telefónicos colombianos (con o sin espacios/puntos/
    guiones), direcciones de correo, y menciones directas de
    "WhatsApp", "llámame al", etc.
  □ Si se detecta, el mensaje NO se bloquea de forma agresiva en el
    primer intento — se muestra un aviso educativo antes de enviar:
    "Por tu seguridad y para que la Garantía Wellhouse aplique,
    mantén la conversación dentro de la app. ¿Seguro que quieres
    enviar esto?" con opción de editar o enviar igual la primera vez
  □ El envío igual queda registrado internamente (no se le impide al
    usuario del todo en el primer caso — un falso positivo agresivo
    frustra más de lo que protege)

CAPA 2 — Detección de intentos disimulados (números escritos en
palabras, con emojis entre dígitos, etc.) usando una revisión
adicional más flexible, no solo regex exacto
  □ Ejemplo de lo que un regex simple NO detecta: "tres uno cero,
    cuatro cinco seis..." o "3️⃣1️⃣0️⃣"
  □ Para esto, se reutiliza el mismo pipeline de análisis del anexo
    de WellBot (Módulo 4.3 — la llamada de clasificación asíncrona
    ya definida): el mensaje pasa por una clasificación ligera que
    detecta intención de compartir contacto externo aunque esté
    disimulado, y lo marca para revisión — no bloquea en tiempo real
    (sería más lento), pero alimenta la cola de moderación
```

### 5.2 Escalación progresiva (nunca sanciona de más en el primer intento)

```
1er intento detectado  → aviso educativo (5.1), se permite enviar
2do-3er intento        → aviso más directo + se registra en el
                          perfil interno del usuario (no visible
                          para otros usuarios, solo para moderación)
Patrón repetido         → el caso entra a la cola de moderación humana
                          (mismo patrón de panel del anexo de WellBot,
                          Módulo 5) para que el equipo decida si
                          amerita una advertencia formal
```

### 5.3 Requerimientos técnicos

```
□ Middleware de mensajería que corre la Capa 1 (regex) de forma
  síncrona antes de aceptar el envío
□ Job asíncrono de Capa 2 (clasificación), reutilizando la misma
  infraestructura de insights ya definida en el anexo de WellBot
□ Tabla `contact_sharing_flags` (user_id, message_id, capa,
  severity, reviewed_by_team BOOLEAN)
```

---

## Módulo 6 — Garantía Wellhouse (el incentivo real para quedarse en la app)

Detectar y avisar no es suficiente por sí solo — la razón de fondo por la que alguien debería QUERER quedarse en la app es que le conviene, no solo que se lo pidan.

```
□ La "Garantía Wellhouse" (mediación de disputas, prioridad de
  soporte si algo sale mal en un intercambio) se ofrece
  EXPLÍCITAMENTE solo para intercambios donde toda la coordinación
  quedó registrada en la app — esto se comunica de forma clara y
  positiva, no como una amenaza:
  "Toda tu conversación con Casa con jardín en Barcelona está
  protegida por la Garantía Wellhouse ✓" (usando el ícono de check
  ya establecido, nunca un candado amenazante)
□ Este mensaje aparece visible dentro del chat mismo, como un
  recordatorio pasivo constante, no solo al momento de intentar
  compartir un contacto
□ Si una disputa llega a soporte y la conversación relevante se
  salió de la app en algún punto, el equipo de soporte lo ve
  reflejado (vía las flags del Módulo 5.3) y lo tiene en cuenta
  al mediar — sin negarle ayuda al usuario, pero sí explicando la
  limitación real de lo que la plataforma puede verificar
```

---

## Módulo 7 — Reseñas Mutuas con Revelado Simultáneo

Este es el hallazgo de investigación más importante de este documento, ya mencionado en la introducción.

```
□ Después de un intercambio completado, ambas partes pueden escribir
  su reseña de la otra, pero NINGUNA reseña se publica hasta que:
  (a) ambas partes ya escribieron la suya, O
  (b) pasen 14 días desde el fin del intercambio (lo que ocurra primero)
□ Mientras tanto, cada usuario ve solo un estado "Tu reseña está
  guardada, se publicará cuando la otra persona también escriba la
  suya (o en un máximo de 14 días)" — nunca ve el contenido de la
  reseña del otro antes de tiempo
□ Esto reduce el miedo a la represalia (si escribo algo crítico, me
  van a poner mala reseña de vuelta) que Airbnb identificó como el
  problema principal de su sistema anterior de reseñas inmediatas
□ Las reseñas alimentan tanto el Índice de Confianza (Módulo 3) como,
  si aplica, el WellRank™ de la vivienda (ya definido) — pero cada
  una en su propio cálculo, sin mezclarse
```

### 7.1 Requerimientos técnicos

```
□ Tabla `reviews` con campos: exchange_id, reviewer_id, reviewee_id,
  content, rating, submitted_at, published_at NULLABLE,
  visible_to_other BOOLEAN DEFAULT FALSE
□ Job programado que revisa diariamente las reseñas con más de 14
  días sin publicar y las libera automáticamente
□ Trigger que publica ambas reseñas simultáneamente en el momento
  exacto en que la segunda persona envía la suya (no una antes que
  la otra por segundos)
```

---

## Módulo 8 — Diseño Visual y Responsividad

```
□ Usa exclusivamente los tokens ya definidos (Módulo 1 del anexo de
  UI/UX): `accent-cobalt`, `ink-teal-900`, `wellpoint-gold` (solo
  para WP), Space Grotesk para el nombre/títulos, Inter para el resto
□ Íconos de verificación del mismo set ya definido (Módulo E),
  nunca un candado genérico de librería sin relación con el resto
  del sistema
□ Responsivo: en mobile, el perfil se apila en una sola columna;
  en desktop, la foto y los datos rápidos (Índice de Confianza,
  tiempo de respuesta) quedan fijos en un panel lateral mientras
  el usuario hace scroll por bio/reseñas — mismo patrón sticky ya
  usado en el panel de reserva del anexo de detalle de vivienda
□ Validar en la matriz de dispositivos ya aprobada antes de cerrar
```

---

## Módulo 9 — Plan de Acción Técnico

```
Frontend:
  □ <TrustProfilePage /> con los bloques de la sección 2.1
  □ <TrustIndexBadge value={n} state={'new'|'active'} /> (Módulo 3.2)
  □ <VerificationBadgeList /> reutilizando el set de íconos ya definido
  □ <ReviewsSection /> con las dos pestañas (como anfitrión / como
    huésped, mismo patrón ya definido en el anexo de dashboard)
  □ <InAppOnlyNotice /> — el recordatorio pasivo dentro del chat
    (Módulo 6)
  □ Middleware de detección de contacto (Capa 1) integrado en el
    componente de envío de mensaje, con el modal de aviso educativo

Backend:
  GET  /api/v1/users/:id/profile
      → { name_display, photo, city, member_since, verifications[],
          trust_index, response_rate, response_time_avg, bio,
          languages[], property (si aplica), reviews[] }

  POST /api/v1/messages
      → Ejecuta la Capa 1 de detección antes de aceptar el envío
      → Dispara la Capa 2 (clasificación asíncrona) después de enviar

  POST /api/v1/reviews
      → Guarda la reseña con visible_to_other = false
      → Verifica si ya existe la reseña de la contraparte; si sí,
        publica ambas de inmediato (7.1)

  GET  /api/v1/admin/contact-flags?severity=&reviewed=
      → Cola de moderación (Módulo 5.2), mismo patrón de panel que
        el anexo de WellBot

Base de datos (nuevas tablas, además de las ya definidas):
  □ trust_index_factors (Módulo 3.3)
  □ contact_sharing_flags (Módulo 5.3)
  □ reviews (Módulo 7.1)
```

---

## 10. Checklist de Implementación

```
FASE 1 — PERFIL BASE
  □ <TrustProfilePage /> con nombre parcial, foto, verificaciones,
    bio, idiomas (Módulo 2)
  □ Reglas de privacidad de nombre/contacto aplicadas en el backend,
    no solo ocultas visualmente en el frontend

FASE 2 — ÍNDICE DE CONFIANZA
  □ Cálculo inicial de trust_index con los factores del Módulo 3.1
  □ Estado neutro para usuarios nuevos (3.2)

FASE 3 — MENSAJERÍA PROTEGIDA
  □ Middleware de detección Capa 1 (regex) en el envío de mensajes
  □ Aviso educativo + registro interno de intentos
  □ Job de clasificación Capa 2 reutilizando pipeline de WellBot

FASE 4 — GARANTÍA WELLHOUSE
  □ Mensaje pasivo dentro del chat (Módulo 6)
  □ Cola de moderación para patrones repetidos

FASE 5 — RESEÑAS MUTUAS
  □ Tabla reviews con revelado simultáneo/14 días
  □ Job de liberación automática por tiempo

FASE 6 — VALIDACIÓN
  □ Responsividad en la matriz de dispositivos ya aprobada
  □ Prueba de flujo completo: dos usuarios de prueba intercambian
    mensajes, uno intenta compartir un número disimulado, se
    verifica que la Capa 2 lo detecte correctamente
```

---

*Este documento se apoya en la investigación de cómo Airbnb resolvió el mismo problema de confianza entre desconocidos a lo largo de más de una década, adaptada a las particularidades de Wellhouse (WellPoints, WellRank™, WellBot). Usa y depende del sistema de diseño, la iconografía y el pipeline de moderación ya definidos en anexos anteriores.*
