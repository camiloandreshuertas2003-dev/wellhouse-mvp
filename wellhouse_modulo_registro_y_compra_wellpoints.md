# Módulo Complementario — Registro de Viviendas y Compra de WellPoints
### Anexo técnico al "Plan de Implementación de WellPoints v2.0"
**Documento adicional | Julio 2026 | No reemplaza el plan base, lo extiende**

> **Cómo encaja este documento:** El plan v2.0 define el "cómo se gana" (hospitalidad → WP). Este anexo define dos piezas nuevas: **(1)** cómo debe verse el flujo de registro de una vivienda, y **(2)** una segunda vía de entrada al ecosistema para usuarios sin vivienda, mediante **compra directa de WellPoints**. Esto último **modifica un principio del documento base** (sección 1.3 y 17.3, que hoy dicen "los WP no se compran"), así que empiezo señalando ese punto antes de diseñar la solución.

---

## Índice

1. [Investigación de Benchmarking — Registro de Vivienda](#1-investigación-de-benchmarking--registro-de-vivienda)
2. [Nota de Producto: El Conflicto con el Plan Base y Cómo se Resuelve](#2-nota-de-producto-el-conflicto-con-el-plan-base-y-cómo-se-resuelve)
3. [Nueva Lógica de Negocio — Compra de WellPoints y Membresías](#3-nueva-lógica-de-negocio--compra-de-wellpoints-y-membresías)
4. [Plan de Acción Técnico para el Desarrollador](#4-plan-de-acción-técnico-para-el-desarrollador)
5. [Checklist de Implementación](#5-checklist-de-implementación)

---

## 1. Investigación de Benchmarking — Registro de Vivienda

### 1.1 HomeExchange — flujo de registro

HomeExchange presenta el registro como un proceso simple y guiado, donde la verificación del perfil aumenta la credibilidad y ayuda a conectar más rápido con otros miembros. Su listado se completa mediante un editor propio ("My Home") donde el usuario sube fotos, descripción y calendario, y el sistema le muestra explícitamente **qué porcentaje del listado lleva completado**, incentivando llegar al 100%.

Puntos fuertes observados:
- **Onboarding sin fricción de pago**: el usuario puede explorar cientos de viviendas antes de pagar nada, y solo se compromete económicamente una vez que ya acordó un intercambio.
- **Calidad de fotos como palanca de conversión**: el sistema educa activamente al usuario sobre cómo fotografiar cada espacio (dormitorios, cocina, sala, exteriores, amenities específicos como piscina).
- **Verificación como señal de confianza**, no como barrera: perfiles verificados reciben más respuestas, lo que crea un incentivo orgánico a completarla.
- **Calendario como parte del registro**, no como paso posterior: se le pide al usuario indicar disponibilidad desde el inicio.
- **Publicación reversible**: el usuario puede despublicar o eliminar su vivienda en cualquier momento desde un toggle simple, sin fricción ni proceso de soporte.

Debilidades identificadas (oportunidad para Wellhouse):
- El flujo está fragmentado en múltiples pantallas de ayuda/soporte en vez de un wizard único.
- No hay retroalimentación en tiempo real tipo "score" mientras el usuario completa el formulario (solo un % estático).
- La verificación de identidad no está integrada al flujo de registro de la vivienda; son procesos separados.

### 1.2 Airbnb — flujo de registro

Airbnb es la referencia de la industria en reducir fricción de publicación mediante un **wizard lineal de pocos pasos** (tipo de espacio → ubicación → capacidad/amenities → fotos → título/descripción → precio → calendario), con guardado automático en cada paso y posibilidad de retomar después. Sus aciertos estructurales, ya validados a escala masiva:

- **Progressive disclosure**: nunca muestra más de una decisión relevante por pantalla.
- **Sugerencias asistidas por IA** para título, descripción y precio inicial, que el usuario puede aceptar o editar.
- **Verificación de dirección con mapa interactivo** en vez de campos de texto libres, reduciendo errores de geolocalización.
- **Preview en vivo** de cómo se verá el listado mientras se construye.
- **Checklist de calidad post-publicación** (fotos, respuesta rápida, políticas claras) que alimenta un score de "listing quality" interno, aunque no siempre visible al usuario con el mismo nivel de transparencia que HomeExchange.

Debilidades relevantes para un modelo de intercambio (no solo alquiler):
- El flujo de Airbnb está optimizado para **monetización directa**, no para explicar reciprocidad o crédito comunitario, por lo que no sirve como referencia para comunicar el valor de los WP.
- No tiene concepto de "calendario de intercambio" ni de vivienda como contraparte de otra vivienda.

### 1.3 Tabla comparativa

| Criterio | HomeExchange | Airbnb | Wellhouse (propuesta) |
|---|---|---|---|
| Estructura del flujo | Multi-página con ayuda dispersa | Wizard lineal guiado | Wizard lineal + feedback en tiempo real |
| Feedback de progreso | % estático de completitud | Checklist post-publicación | **WellScore™ Preview en vivo** durante el registro |
| Verificación | Separada del registro de vivienda | Separada | **Integrada como paso del mismo flujo**, gamificada |
| Ayuda con fotos/descripción | Tips estáticos | Sugerencias IA | Sugerencias IA + ejemplos curados por categoría de vivienda |
| Calendario | Parte del registro | Paso posterior opcional | Parte del registro, obligatorio antes de publicar |
| Recompensa por completar | Ninguna explícita | Ninguna explícita | **+200 WP al 100%, visibles desde el primer paso** (ya definido en plan base, sección Apéndice A) |

### 1.4 Propuesta de valor diferenciadora de Wellhouse

El registro de vivienda en Wellhouse debe diferenciarse en tres ejes, apoyándose en el sistema WellPoints que ya existe (no en features nuevas y aisladas):

1. **Transparencia de valor en tiempo real**: mientras el usuario completa su vivienda, ve cómo sube su **WellScore™ estimado** paso a paso ("agregar 3 fotos más: +0.4 WP/noche estimados"). Ningún competidor analizado hace esto — convierte el registro en un juego con recompensa visible, no en un formulario burocrático.
2. **Verificación como parte del mismo flujo, no un trámite aparte**: se solicita en el mismo wizard (no en una sección de cuenta separada), con progreso compartido con el resto del registro.
3. **Doble narrativa según el perfil de usuario**: el mismo flujo comunica un mensaje distinto si el usuario llega como potencial anfitrión ("publica y empieza a ganar WP") o si ya eligió el camino de comprador de paquetes (ver sección 3) — sin forzar a nadie a publicar vivienda para participar.

---

## 2. Nota de Producto: El Conflicto con el Plan Base y Cómo se Resuelve

Antes de diseñar la compra de WellPoints, es importante que quede documentado (para ti y para el equipo) que el plan v2.0 actual establece explícitamente lo contrario en dos lugares:

- Sección 1.3: *"Los WellPoints NO se compran con dinero (en el plan base)"*.
- Sección 17.3: *"Los WellPoints NO son... canjeables por dinero real... Son similares a millas de aerolíneas (sin valor monetario declarado)"*.

Esto no es un error tuyo ni mío — es una decisión de producto que **cambió** entre el plan v2.0 y lo que me pides ahora, y es correcto adaptarla. Pero permitir la compra directa de la *misma* moneda que representa "confianza y hospitalidad" tiene dos riesgos que conviene resolver por diseño, no solo por redacción:

1. **Riesgo de percepción entre anfitriones**: si un usuario que nunca hospedó puede comprar los mismos WP que un Superhost gana con esfuerzo, el sistema deja de sentirse "ganado" para quien aporta vivienda — exactamente lo que el plan base busca evitar (sección 1.3: *"premia la participación, no la riqueza"*).
2. **Riesgo regulatorio**: en el momento en que una moneda interna se puede **comprar con dinero**, dependiendo de la jurisdicción puede empezar a mirarse distinto a un programa de fidelización tipo millas (que no se compran, se ganan) y acercarse a un instrumento prepago / dinero electrónico, con obligaciones adicionales de reporte y protección al consumidor. No sustituye una revisión legal formal, pero el diseño técnico puede minimizar esa exposición.

**Solución de diseño recomendada:** no mezclar libremente WP ganados y WP comprados en el mismo saldo sin trazabilidad. En su lugar, todo WP comprado se emite con **origen marcado en el ledger** (`type = 'purchased_package'`), y las viviendas premium o de alta demanda pueden, opcionalmente, indicar si aceptan WP comprados o solo WP ganados por hospitalidad (ver sección 3.4). Esto te da la flexibilidad de negocio que pides, sin romper la promesa de integridad que ya le hiciste a los anfitriones en el documento base. Recomiendo también que el equipo legal confirme el tratamiento de estos paquetes antes de facturarlos como "compra de puntos" — probablemente conviene venderlos como **"paquetes de estadías prepagadas"** en los Términos y Condiciones, no como "moneda", para mantener el mismo espíritu de "no es dinero" que ya declaraste en 17.3.

---

## 3. Nueva Lógica de Negocio — Compra de WellPoints y Membresías

### 3.1 Los dos caminos de entrada al ecosistema

```
CAMINO A — ANFITRIÓN (ya definido en plan base v2.0)
  Registra vivienda → Hospeda → Gana WP → Viaja con WP ganados

CAMINO B — VIAJERO SIN VIVIENDA (nuevo, este documento)
  Se registra → Compra paquete/membresía de WP → Viaja con WP comprados
  (Opcionalmente puede publicar vivienda después y pasar a ganar WP también)
```

Ambos caminos conviven en la misma plataforma y el mismo inventario de viviendas — la diferencia está en el **origen** de los WP, no en la experiencia de reserva.

### 3.2 Estructura de paquetes (Camino B)

Se proponen dos modelos comerciales combinables, tal como pediste — **paquetes de una sola compra** y **membresía recurrente**:

| Plan | Tipo | Precio sugerido (referencia mercado LATAM) | WP incluidos | Posicionamiento |
|---|---|---|---|---|
| **Pack Explorador** | Compra única | Definir junto a finanzas, ancla en % del costo de 2–3 noches de hotel promedio en la ciudad de mayor demanda | ~equivalente a 2 noches | Prueba el ecosistema, bajo compromiso |
| **Pack Viajero** | Compra única | Descuento vs. comprar dos Packs Explorador | ~equivalente a 5 noches | Mejor relación costo/noche, ancla de "ahorro masivo" |
| **Membresía Nómada** | Suscripción mensual | Precio fijo mensual | WP mensuales recurrentes + rollover limitado | Uso frecuente, fideliza como Netflix del hospedaje |
| **Membresía Explorer Anual** | Suscripción anual | Descuento vs. 12 meses de Membresía Nómada | WP anuales entregados por lotes trimestrales (no todos de una vez, para evitar acumulación especulativa) | Compromiso alto, mejor margen para Wellhouse |

**Nota sobre el mensaje de ahorro:** el eje de marketing que describes (drásticamente más barato que un hotel) debe comunicarse comparando **costo por noche equivalente en WP** contra el promedio de hotel/Airbnb en el destino, no contra el precio de otra vivienda Wellhouse — así el mensaje es siempre verificable y no depende de cuánto valga una vivienda específica según su WellScore™.

### 3.3 Reglas de negocio específicas

1. Los WP comprados **se rigen por las mismas reglas de gasto** ya definidas en el plan base (sección 7): se usan para intercambios por WellPoints, boost de visibilidad, lista de espera, etc.
2. Los WP comprados **no generan Índice de Hospitalidad (IH)** ni cuentan para subir de Nivel de Miembro vía "contribución" — el Nivel para estos usuarios se basa en antigüedad y gasto, con una nomenclatura separada visible en su perfil (ej. "Miembro Viajero" vs. "Miembro Anfitrión"), para no diluir el mérito de quien hospeda.
3. Los WP comprados **sí caducan** igual que los ganados (24 meses de inactividad), y **no son reembolsables ni transferibles a otro usuario** (evita arbitraje o reventa informal).
4. Un usuario del Camino B que decide publicar su vivienda **no pierde nada**: a partir de ese momento empieza a ganar WP normales (Camino A) que se suman al mismo balance, pero quedan marcados con `type = 'hosting_earned'` en el ledger para mantener trazabilidad de origen.

### 3.4 Salvaguarda para anfitriones (mitiga el riesgo de la sección 2)

Se añade un campo de configuración a nivel de vivienda:

```
properties.accepts_purchased_wellpoints  BOOLEAN DEFAULT TRUE
```

Por defecto, todas las viviendas aceptan ambos orígenes de WP (maximiza liquidez del sistema, que es lo que tú buscas). Pero cualquier anfitrión puede desactivarlo desde su panel si prefiere recibir huéspedes que "también dan, no solo compran" — esto es opcional, no bloqueante, y resuelve la tensión de percepción sin restarle alcance al modelo de negocio.

### 3.5 Nuevos conceptos y terminología (extiende la sección 4 del plan base)

| Término nuevo | Definición |
|---|---|
| **WP Comprados** | WellPoints adquiridos mediante Pack o Membresía, con dinero real. Se distinguen en el ledger pero se gastan igual que los WP ganados. |
| **Pack de WellPoints** | Compra única de un lote fijo de WP. |
| **Membresía Nómada / Explorer** | Suscripción recurrente que entrega WP periódicamente. |
| **Miembro Viajero** | Usuario que participa solo por Camino B (compra), sin vivienda publicada. |
| **Vivienda WP-Restringida** | Vivienda cuyo anfitrión configuró `accepts_purchased_wellpoints = false`. |

---

## 4. Plan de Acción Técnico para el Desarrollador

### Módulo A — Flujo de Registro de Vivienda Optimizado

**Historias de usuario**

```
HU-A1. Como usuario nuevo, quiero un wizard de un solo flujo (no páginas
       de ayuda dispersas) para publicar mi vivienda, para no abandonar
       el proceso a mitad de camino.
       Criterio de aceptación: máximo 6 pasos, guardado automático entre
       pasos, posibilidad de retomar desde donde quedó.

HU-A2. Como usuario completando mi vivienda, quiero ver mi WellScore™
       estimado subir en tiempo real mientras agrego información, para
       entender qué acciones aumentan el valor de mi vivienda.
       Criterio de aceptación: el estimado se recalcula en cliente con
       una versión ligera del algoritmo (sin llamar al endpoint completo
       en cada tecla) y se sincroniza con el backend al guardar cada paso.

HU-A3. Como usuario nuevo, quiero verificar mi identidad dentro del mismo
       flujo de registro de vivienda (no en una sección aparte), para no
       sentir que son dos trámites distintos.
       Criterio de aceptación: paso de verificación embebido como parte
       del wizard, con opción de "verificar después" sin bloquear el
       resto del flujo.

HU-A4. Como usuario, quiero recibir sugerencias asistidas (título,
       descripción, tips de fotos por tipo de espacio) mientras completo
       mi vivienda, para reducir el esfuerzo de escritura.
       Criterio de aceptación: sugerencias editables, nunca auto-publicadas
       sin revisión del usuario.

HU-A5. Como usuario, quiero definir mi calendario de disponibilidad como
       parte del registro inicial, no como paso posterior opcional.
       Criterio de aceptación: la vivienda no puede pasar a estado
       "publicada" sin al menos un rango de disponibilidad definido.
```

**Requerimientos técnicos**

```
Frontend:
  □ Wizard de 6 pasos: Tipo de vivienda → Ubicación (mapa interactivo) →
    Capacidad/Amenities → Fotos → Título/Descripción (con asistencia IA) →
    Calendario + Revisión final
  □ Componente de "WellScore™ Preview" persistente (sidebar o barra
    superior) visible en todos los pasos
  □ Guardado automático (debounce 2s) en cada campo vía PATCH parcial
  □ Barra de progreso + checklist de completitud (no solo %, sino qué
    falta específicamente)

Backend:
  □ Endpoint de creación incremental de vivienda (estado 'draft')
      POST   /api/v1/properties               → crea draft
      PATCH  /api/v1/properties/:id/step/:n    → guarda progreso de un paso
      GET    /api/v1/properties/:id/wellscore-preview
             → retorna WellScore™ estimado dado el estado actual del draft
      POST   /api/v1/properties/:id/publish    → valida completitud mínima
             y calendario, pasa de 'draft' a 'published'
  □ Servicio de sugerencias IA (título/descripción) reutilizable, con
    rate limit por usuario para evitar abuso
  □ Validación server-side de completitud mínima antes de permitir publish
    (no confiar solo en el frontend)

Base de datos (extiende esquema existente de properties):
  □ properties.status ENUM('draft','published','unpublished') 
  □ properties.completion_percentage INTEGER (recalculado en cada guardado)
  □ properties.accepts_purchased_wellpoints BOOLEAN DEFAULT TRUE (ver 3.4)
  □ Tabla property_draft_steps para trackear en qué paso quedó cada
    usuario (analítica de abandono del funnel)
```

---

### Módulo B — Compra y Suscripción de WellPoints

**Historias de usuario**

```
HU-B1. Como usuario sin vivienda publicada, quiero comprar un paquete de
       WellPoints con tarjeta/medio de pago local, para poder reservar
       una estadía sin necesidad de hospedar primero.
       Criterio de aceptación: checkout completo en <3 pasos, confirmación
       inmediata de saldo tras el pago.

HU-B2. Como usuario, quiero suscribirme a una membresía mensual o anual
       que me entregue WP de forma recurrente, para planear mis viajes
       sin comprar paquetes cada vez.
       Criterio de aceptación: cobro recurrente automatizado, cancelación
       self-service, WP no retroactivos si cancela.

HU-B3. Como usuario, quiero ver claramente en la app cuánto ahorraría
       usando WP comprados vs. pagar un hotel en el mismo destino, para
       entender el valor de comprar un paquete.
       Criterio de aceptación: comparador visible en la pantalla de compra
       y en el checkout de reserva, basado en tarifa promedio de mercado
       del destino (fuente de datos a definir con producto).

HU-B4. Como anfitrión, quiero poder decidir si mi vivienda acepta
       huéspedes que pagan con WP comprados o solo con WP ganados por
       hospitalidad, para mantener control sobre mi propia política.
       Criterio de aceptación: toggle en configuración de vivienda,
       filtro correspondiente aplicado en la búsqueda de huéspedes.

HU-B5. Como equipo de finanzas, quiero que todo WP comprado quede
       marcado con su origen en el ledger, para poder auditar ingresos
       reales vs. economía interna gratuita por separado.
       Criterio de aceptación: reporte exportable que separa
       total_earned_lifetime (gratuito) de total_purchased_lifetime.
```

**Requerimientos técnicos**

```
Integración de pagos:
  □ Pasarela de pago (a definir: Stripe / PayU / Wompi según cobertura
    LATAM) para compra única y suscripción recurrente
  □ Webhook de confirmación de pago → dispara acreditación atómica de WP
    (reutiliza el mismo patrón de transacción atómica de la sección 13.1
    del plan base, con nuevo type)
  □ Manejo de fallos de pago / reintentos de suscripción sin duplicar
    acreditación de WP (idempotencia por payment_intent_id)

Backend — nuevos endpoints:
  GET    /api/v1/wellpoints/packages
         → Lista de paquetes y membresías disponibles con precio y WP incluidos

  POST   /api/v1/wellpoints/packages/:packageId/purchase
         → Body: { payment_method_id }
         → Crea payment_intent, retorna client_secret para completar pago

  POST   /api/v1/wellpoints/memberships/:planId/subscribe
         → Body: { payment_method_id }
         → Crea suscripción recurrente

  POST   /api/v1/wellpoints/memberships/cancel
         → Cancela la suscripción activa del usuario (self-service)

  GET    /api/v1/wellpoints/purchases/history
         → Historial de compras y suscripciones del usuario

  POST   /api/v1/webhooks/payments
         → Webhook de la pasarela (firma verificada), dispara
           creditPurchasedWellpoints() de forma atómica e idempotente

Base de datos (nuevas tablas, no modifica las del plan base):
```

```sql
-- ================================================================
-- TABLA: wellpoint_packages
-- Catálogo de paquetes de compra única
-- ================================================================
TABLE wellpoint_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(50) UNIQUE NOT NULL,     -- 'pack_explorador'
  name            VARCHAR(100) NOT NULL,
  wellpoints      INTEGER NOT NULL,
  price_cents     INTEGER NOT NULL,
  currency        VARCHAR(3) NOT NULL DEFAULT 'COP',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLA: membership_plans
-- Catálogo de membresías recurrentes
-- ================================================================
TABLE membership_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(50) UNIQUE NOT NULL,   -- 'nomada_mensual'
  name              VARCHAR(100) NOT NULL,
  billing_interval  VARCHAR(20) NOT NULL,          -- 'monthly' | 'yearly'
  wellpoints_per_cycle INTEGER NOT NULL,
  price_cents       INTEGER NOT NULL,
  currency          VARCHAR(3) NOT NULL DEFAULT 'COP',
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLA: user_memberships
-- Suscripción activa (o histórica) de cada usuario
-- ================================================================
TABLE user_memberships (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id            UUID NOT NULL REFERENCES membership_plans(id),
  status             VARCHAR(20) NOT NULL DEFAULT 'active',
  -- 'active', 'cancelled', 'past_due', 'expired'
  external_subscription_id VARCHAR(120), -- ID en la pasarela de pago
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancelled_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLA: wellpoint_purchases
-- Registro de cada compra (paquete o ciclo de membresía) — separado
-- del ledger general para conciliación financiera con el proveedor de pagos
-- ================================================================
TABLE wellpoint_purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  source_type       VARCHAR(20) NOT NULL,    -- 'package' | 'membership_cycle'
  source_id         UUID NOT NULL,           -- FK a wellpoint_packages o membership_plans
  wellpoints        INTEGER NOT NULL,
  amount_paid_cents INTEGER NOT NULL,
  currency          VARCHAR(3) NOT NULL,
  payment_provider  VARCHAR(30) NOT NULL,    -- 'stripe' | 'wompi' | 'payu'
  payment_intent_id VARCHAR(120) UNIQUE NOT NULL,  -- garantiza idempotencia
  status            VARCHAR(20) NOT NULL DEFAULT 'completed',
  transaction_id    UUID REFERENCES wellpoint_transactions(id),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

```
Extensión de tablas existentes del plan base (v2.0):
  □ wellpoint_transactions.type → agregar nuevos valores:
      'purchased_package'   → WP acreditados por compra única
      'purchased_membership'→ WP acreditados por ciclo de membresía
      'purchase_refund'     → reverso por disputa/chargeback (compensatorio,
                               nunca DELETE, sigue la regla de ledger append-only
                               de la sección 17.1 del plan base)
  □ wellpoint_balances → agregar columna total_purchased_lifetime INTEGER
      DEFAULT 0, para poder reportar origen sin recorrer todo el ledger
  □ properties → agregar accepts_purchased_wellpoints BOOLEAN DEFAULT TRUE
      (definido en sección 3.4 de este documento)
```

**Lógica de acreditación (extiende el patrón de la sección 13.1 del plan base)**

```typescript
// Pseudocódigo — mismo patrón atómico que creditHostingWellpoints(),
// pero disparado por webhook de pago en vez de finalización de exchange
async creditPurchasedWellpoints(paymentIntentId: string): Promise<void> {
  return await db.transaction(async (trx) => {

    // 1. Idempotencia: si ya existe una compra con este payment_intent_id, salir
    const existing = await trx('wellpoint_purchases')
      .where({ payment_intent_id: paymentIntentId }).first()
    if (existing) return

    // 2. Verificar el pago contra el proveedor (firma del webhook ya validada
    //    en el controller antes de llegar aquí)
    const payment = await this.getVerifiedPayment(paymentIntentId)
    const source = payment.source_type === 'package'
      ? await trx('wellpoint_packages').where({ id: payment.source_id }).first()
      : await trx('membership_plans').where({ id: payment.source_id }).first()

    const balance = await trx('wellpoint_balances')
      .where({ user_id: payment.user_id }).first()

    // 3. Insertar en ledger (mismo patrón append-only del plan base)
    const [transaction] = await trx('wellpoint_transactions').insert({
      user_id: payment.user_id,
      amount: source.wellpoints,
      balance_after: balance.current_balance + source.wellpoints,
      type: payment.source_type === 'package'
        ? 'purchased_package' : 'purchased_membership',
      reference_type: payment.source_type,
      reference_id: source.id,
      description: `Compra: ${source.name}`,
      metadata: { payment_provider: payment.provider, amount_paid_cents: payment.amount }
    }).returning('*')

    // 4. Registrar en wellpoint_purchases (conciliación financiera)
    await trx('wellpoint_purchases').insert({
      user_id: payment.user_id,
      source_type: payment.source_type,
      source_id: source.id,
      wellpoints: source.wellpoints,
      amount_paid_cents: payment.amount,
      currency: payment.currency,
      payment_provider: payment.provider,
      payment_intent_id: paymentIntentId,
      transaction_id: transaction.id
    })

    // 5. Actualizar balance — nótese total_purchased_lifetime aparte
    //    de total_earned_lifetime, para no mezclar origen en reportes
    await trx('wellpoint_balances')
      .where({ user_id: payment.user_id })
      .update({
        current_balance: trx.raw('current_balance + ?', [source.wellpoints]),
        total_purchased_lifetime: trx.raw('total_purchased_lifetime + ?', [source.wellpoints]),
        last_activity_at: new Date(),
        expires_at: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      })
  })
}
```

**Ajuste al matching de búsqueda/reserva**

```
Al filtrar viviendas disponibles para un usuario que va a pagar con WP:
  □ Si accepts_purchased_wellpoints = false en la vivienda Y el usuario
    va a pagar con WP de origen 'purchased_*' → excluir del resultado
    (o mostrarla atenuada con mensaje "este anfitrión prefiere huéspedes
    que también hospedan")
  □ Esta validación va tanto en el endpoint de búsqueda como en el
    endpoint de creación de solicitud de intercambio (defensa en profundidad,
    no confiar solo en el filtro de búsqueda)
```

---

## 5. Checklist de Implementación

```
FASE 1 — REGISTRO DE VIVIENDA (Módulo A)
  □ Wizard de 6 pasos con guardado incremental
  □ Endpoint de WellScore™ Preview (versión ligera para uso en tiempo real)
  □ Verificación embebida en el flujo (con opción de posponerla)
  □ Validación server-side de completitud antes de publish
  □ Analítica de abandono por paso (property_draft_steps)

FASE 2 — COMPRA DE WELLPOINTS (Módulo B, base)
  □ Tablas: wellpoint_packages, membership_plans, user_memberships,
    wellpoint_purchases
  □ Integración de pasarela de pago (compra única primero, membresía después)
  □ Webhook idempotente + servicio atómico creditPurchasedWellpoints()
  □ Nuevos types en wellpoint_transactions + columna total_purchased_lifetime
  □ Pantallas: catálogo de paquetes, checkout, historial de compras

FASE 3 — MEMBRESÍAS RECURRENTES Y SALVAGUARDAS
  □ Suscripción recurrente + manejo de renovación/fallo de cobro
  □ Cancelación self-service
  □ Campo accepts_purchased_wellpoints en properties + filtro en búsqueda
  □ Comparador de ahorro (WP comprados vs. tarifa hotelera del destino)
  □ Reporte financiero: earned vs. purchased, para conciliación contable

FASE 4 — REFINAMIENTO
  □ Sugerencias IA de título/descripción en el wizard de registro
  □ A/B testing del wizard (tasa de conversión de draft → published)
  □ Revisión legal de términos de "paquetes de estadías prepagadas"
    (ver sección 2 de este documento) antes de escalar el marketing
    de membresías
```

---

*Este documento se entrega como anexo independiente. Cualquier cambio a las reglas ya definidas en el "Plan de Implementación de WellPoints v2.0" (secciones 1.3 y 17.3 en particular) debería reflejarse ahí también una vez se apruebe formalmente, para que ambos documentos queden consistentes.*
