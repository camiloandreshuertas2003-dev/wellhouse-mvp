# Plan de Diseño — Dashboard de Usuario
### De panel estático a centro de control funcional, elegante y responsivo
**Documento adicional | Julio 2026 | Sintetiza y conecta todos los anexos anteriores en una sola pantalla**

> **Investigación previa:** antes de diseñar, revisé qué separa un dashboard de SaaS mediocre de uno bueno en 2026 (fuentes: FlowmazeUX, CodeTheorem, Context.dev, MakeMyBrand — todas de 2026). Los hallazgos que más aplican a Wellhouse: **minimalismo funcional** (mostrar solo lo que importa, no menos datos sino menos ruido), **estados vacíos con acción inmediata** en vez de bloques inertes, **gamificación con propósito** (no decorativa — Wellhouse ya tiene esto de fábrica gracias a WellPoints y WellScore™, solo falta explotarlo bien), **diseño mobile-first** con jerarquía adaptativa (no solo "que quepa" en el celular, sino que priorice distinto), y **navegación que se siente invisible** porque el usuario siempre sabe dónde está.

---

## Índice

1. [Diagnóstico del Dashboard Actual](#1-diagnóstico-del-dashboard-actual)
2. [Módulo 1 — Iconografía del Dashboard](#módulo-1--iconografía-del-dashboard)
3. [Módulo 2 — Arquitectura de Navegación](#módulo-2--arquitectura-de-navegación)
4. [Módulo 3 — Widgets Funcionales (uno por cada sección real)](#módulo-3--widgets-funcionales-uno-por-cada-sección-real)
5. [Módulo 4 — Gamificación con Propósito](#módulo-4--gamificación-con-propósito)
6. [Módulo 5 — Responsividad Total](#módulo-5--responsividad-total)
7. [Módulo 6 — Plan de Acción Técnico](#módulo-6--plan-de-acción-técnico)
8. [Checklist de Implementación](#8-checklist-de-implementación)

---

## 1. Diagnóstico del Dashboard Actual

A partir de tu captura:

| Problema observado | Por qué importa |
|---|---|
| Emojis en el banner de bienvenida (🏠), en la card de WellPoints (💰) y en el estado vacío de "Mi Vivienda" (🏠 grande) | Rompe la identidad de marca ya definida — mismo problema que se corrigió en el resto de la app, aquí aún falta |
| Cards de KPI (WellPoints / Intercambios / Mi Vivienda) muestran el número pero no llevan a ninguna acción real más allá de "Registrar ahora" | Un dashboard debe ser un centro de control, no una vitrina — cada número debe poder explorarse |
| "Historial de WellPoints" está vacío sin explicar qué va a aparecer ahí ni cómo generar la primera transacción | Estado vacío sin guía — el usuario no sabe qué hacer para que esa sección cobre vida |
| "Favoritos" y "Reseñas" existen en el menú lateral pero no hay evidencia de que funcionen | Navegación que promete algo que no se cumple daña la confianza más que no tener la opción |
| "Panel Admin" aparece al mismo nivel que las secciones de un usuario normal | Mezcla roles distintos (usuario vs. administrador de plataforma) en un solo menú — confirmas que se atiende aparte, así que se retira de aquí |
| El carrusel "Descubre viviendas disponibles" al final ya sigue el patrón de hileras (bien) pero repite la propuesta de valor del banner de arriba en vez de ser información nueva | Redundancia de mensaje — el dashboard tiene dos invitaciones casi idénticas a registrar vivienda |

---

## Módulo 1 — Iconografía del Dashboard

Aplica exactamente el sistema ya definido (Módulo E del plan de acción de interfaz): Lucide para conceptos estándar, sin excepciones aquí porque todo lo que aparece en el dashboard ya tiene equivalente estándar — no hace falta generación por IA en este módulo.

| Emoji actual | Reemplazo (Lucide) |
|---|---|
| 🏠 (banner de bienvenida) | `home` en `base-paper` sobre el fondo del banner |
| 💰 (card WellPoints) | `coins`, en `wellpoint-gold` (refuerza la identidad ya establecida para todo lo de WP) |
| 🔄 (card Intercambios) — ya es un ícono, se mantiene pero se recolorea a `ink-teal-700` en vez de azul genérico | `repeat` de Lucide |
| 🏠 grande (estado vacío "Mi Vivienda") | Ilustración de línea simple (mismo criterio del Módulo 1.4 del anexo de diseño: ilustración en `ink-teal-500` sobre `surface-mist`, nunca un ícono de emoji ampliado) |
| Badge "Newcomer" con 🏠 | Chip de texto simple sin ícono, o ícono `sparkles` de Lucide si se quiere mantener el acento visual |

```
□ Auditoría de emojis restantes en todo el dashboard (misma regex
  del Módulo E) antes de cerrar este módulo
□ Todos los íconos de esta pantalla en `ink-teal-700` por defecto,
  `wellpoint-gold` solo para lo relacionado a WellPoints — misma
  regla de uso exclusivo ya establecida
```

---

## Módulo 2 — Arquitectura de Navegación

### 2.1 Menú lateral corregido

```
ANTES:                          DESPUÉS:
Resumen                         Resumen
Mi Vivienda •                   Mi Vivienda •
Intercambios                    Intercambios
Mensajes                        WellPoints          ← nuevo, sección propia
Favoritos                       Mensajes
Reseñas                         Favoritos
Panel Admin      ← se retira    Reseñas
Configuración                   Configuración
```

- **Panel Admin sale del menú de usuario por completo** en esta fase — como bien dices, es un flujo distinto (administración de plataforma, no de cuenta personal) y se diseña aparte más adelante.
- **WellPoints pasa a tener su propia sección** en el menú, en vez de vivir solo como una card en el resumen — es lo que pediste que "funcione muy bien aquí", y una card sola en el resumen no alcanza para eso (necesita su propia vista con historial, compra de paquetes y membresías del anexo de WellPoints).
- El punto naranja junto a "Mi Vivienda" (ya existe en tu captura) se mantiene como indicador de acción pendiente — es buen patrón, solo se recolorea a `accent-mango` según el sistema de diseño.

### 2.2 Requerimientos técnicos

```
□ <DashboardSidebar /> con las secciones de 2.1, ítem activo resaltado
  con `surface-mist` de fondo + texto `ink-teal-900` (ya casi igual
  a tu captura actual, solo se ajustan colores a los tokens exactos)
□ Ruta /dashboard/panel-admin se elimina de la navegación visible,
  no se borra del código — solo se retira el link hasta que se
  diseñe su propio flujo
```

---

## Módulo 3 — Widgets Funcionales (uno por cada sección real)

Esta es la parte central de tu pedido: que **cada punto del dashboard funcione**, no solo se vea bien. Cada widget de abajo ya tiene su lógica de negocio definida en un anexo anterior — aquí se conecta, no se reinventa.

### 3.1 Resumen (home del dashboard)

```
□ Banner de bienvenida: se mantiene, se corrige el emoji (Módulo 1)
  y cambia de mensaje automáticamente según el estado real del
  usuario (sin vivienda registrada / con vivienda en draft / con
  vivienda publicada) — nunca un mensaje genérico fijo
□ 3 KPI cards (WellPoints, Intercambios, Mi Vivienda) — cada una
  es clicable y lleva directo a su sección completa, no solo
  decorativa
□ "Mi Vivienda" (resumen): si ya existe una vivienda publicada,
  aquí se muestra la card real de esa vivienda (mismo <PropertyCard />
  del sistema de diseño, no un bloque distinto) con accesos rápidos
  a "Ver como la ven los huéspedes" (abre la página de detalle,
  anexo correspondiente) y "Editar"
□ Se elimina la duplicación con el carrusel inferior: el carrusel
  de "Descubre viviendas disponibles" solo aparece si el usuario NO
  tiene vivienda registrada; si ya publicó, esa misma sección
  cambia a "Recomendado para ti" con datos reales de personalización
```

### 3.2 Sección WellPoints (nueva, propia)

Conecta directo con el Módulo B del anexo de WellPoints (compra/membresías) y el ledger ya definido en el plan base:

```
□ Saldo actual (grande, `data-lg` en Plex Mono) + fecha de próxima
  caducidad si aplica
□ Historial de transacciones real, paginado, con el mismo patrón de
  ledger append-only ya definido (tipo de transacción con ícono:
  ganado por hospitalidad, comprado, gastado en intercambio)
□ CTA "Comprar WellPoints" → abre el catálogo de paquetes/membresías
  ya diseñado en el anexo de WellPoints (Módulo B), no una pantalla
  nueva distinta
□ Si el usuario ya tiene una membresía activa, se muestra aquí su
  plan actual + fecha de renovación + botón de cancelación
  self-service (ya definido en ese mismo anexo)
```

### 3.3 Mi Vivienda

```
□ Si no hay vivienda: estado vacío con ilustración de línea
  (Módulo 1) + CTA que abre directo el wizard de registro (Módulo A
  del primer anexo de UI/UX), no una página intermedia
□ Si hay una vivienda en draft (registro incompleto): se muestra el
  progreso real del wizard con el WellScore™ Preview en vivo (ya
  definido en el Módulo A) y un botón "Continuar registro"
□ Si hay una vivienda publicada: se muestra la card real + accesos a
  Editar, Ver estadísticas básicas (vistas, solicitudes recibidas) y
  Despublicar
```

### 3.4 Intercambios

```
□ Lista de solicitudes de intercambio reales (enviadas y recibidas),
  con estado: pendiente / aceptada / rechazada / completada
□ Cada fila lleva a la conversación correspondiente en Mensajes
  (no duplica la lógica de mensajería, solo enlaza)
```

### 3.5 Favoritos

```
□ Grid de viviendas guardadas por el usuario (mismo <PropertyCard />
  del sistema de diseño), con opción de quitar de favoritos directo
  desde aquí
□ Estado vacío con CTA "Explorar viviendas" → lleva a /explorar
  (Módulo 3 del anexo de UI/UX, las hileras por categoría)

Backend:
  GET  /api/v1/favorites
  POST /api/v1/favorites/:propertyId
  DELETE /api/v1/favorites/:propertyId
```

### 3.6 Reseñas

```
□ Dos pestañas: "Reseñas que he escrito" / "Reseñas sobre mi vivienda"
  (esta segunda solo visible si el usuario tiene vivienda publicada)
□ Estado vacío explica cuándo podrá dejar una reseña (después de
  completar un intercambio), no solo "no hay reseñas"
```

---

## Módulo 4 — Gamificación con Propósito

La investigación de 2026 confirma que la gamificación funciona cuando tiene propósito, no cuando es decorativa. Wellhouse ya tiene la pieza correcta para esto (WellScore™, niveles de miembro) — el dashboard debe explotarla, no ignorarla:

```
□ Barra de progreso hacia el siguiente nivel de miembro, visible en
  el Resumen — usa `wellpoint-gold` sobre `surface-mist`, mismo
  lenguaje visual que el WellScoreRing del resto de la app
□ Micro-mensajes contextuales con acción concreta, nunca genéricos:
  "Te faltan 30 WP para el siguiente nivel — hospeda tu primer
  intercambio para ganarlos" en vez de solo mostrar una barra sin
  explicación
□ El badge "Newcomer" evoluciona automáticamente (Anfitrión Nuevo →
  Anfitrión Activo → Superanfitrión, terminología a definir con
  producto) según actividad real, nunca estático
```

---

## Módulo 5 — Responsividad Total

| Elemento | Mobile | Tablet | Desktop |
|---|---|---|---|
| Navegación | Sidebar se convierte en bottom tab bar (5 accesos principales: Resumen, Mi Vivienda, WellPoints, Mensajes, Más) + menú "Más" para Favoritos/Reseñas/Configuración | Sidebar colapsable (íconos solamente, expande al tocar) | Sidebar fija completa, como en tu captura actual |
| KPI cards | Se apilan verticalmente, 1 por fila, cada una con altura reducida | 2 columnas | 3 columnas (como está hoy) |
| Mi Vivienda / Favoritos | Cards a ancho completo | 2 columnas | Grid según Módulo 2 del anexo de UI/UX |
| Historial de WellPoints | Lista simplificada (ícono + monto + fecha en una línea) | Igual que desktop | Tabla completa con más columnas |

```
□ Se valida en la misma matriz de dispositivos ya aprobada (Módulo 7
  del anexo de UI/UX) — sin matriz nueva
□ Bottom tab bar en mobile sigue el mismo criterio de objetivos
  táctiles de 44x44px mínimo ya establecido
```

---

## Módulo 6 — Plan de Acción Técnico

```
Frontend:
  □ <DashboardLayout /> con sidebar/bottom-nav responsivo (Módulo 5)
  □ <WelcomeBanner state={userState} /> con mensaje dinámico (3.1)
  □ <KPICard /> clicable, reutilizada en las 3 tarjetas del resumen
  □ <WellPointsSection />, <PropertySection />, <ExchangesSection />,
    <FavoritesSection />, <ReviewsSection /> — cada una como ruta
    propia dentro de /dashboard, no todo apilado en una sola página
  □ Reutiliza <PropertyCard />, <WellScoreRing />, <AmenityIcon />
    y demás componentes ya definidos — este módulo no crea
    componentes visuales nuevos de vivienda, solo los orquesta

Backend (endpoints nuevos, además de los ya definidos en anexos previos):
  GET /api/v1/dashboard/summary
      → { user_state, wellpoints_balance, exchanges_count,
          property_status, next_level_progress }
      → Una sola llamada para pintar el Resumen completo sin
        fragmentar en 5 requests distintos al cargar la página

  GET /api/v1/exchanges?status=&direction=sent|received
  GET /api/v1/reviews?type=written|received
```

---

## 8. Checklist de Implementación

```
□ Reemplazar todos los emojis del dashboard (Módulo 1) + auditoría final
□ Retirar "Panel Admin" del menú de usuario (Módulo 2)
□ Crear sección propia de WellPoints conectada al anexo de compra/
  membresías (Módulo 3.2)
□ Conectar "Mi Vivienda" a los 3 estados reales: sin registrar /
  en draft / publicada (Módulo 3.3)
□ Implementar Favoritos end-to-end (endpoints + UI) — hoy no hay
  evidencia de que funcione (Módulo 3.5)
□ Implementar Reseñas con sus dos pestañas y estado vacío explicativo
  (Módulo 3.6)
□ Barra de progreso de nivel con micro-mensaje accionable (Módulo 4)
□ Sidebar → bottom tab bar en mobile (Módulo 5)
□ Endpoint único /api/v1/dashboard/summary para el Resumen
□ Validar en la matriz de dispositivos ya aprobada antes de cerrar
```

---

*Este documento conecta el dashboard con los anexos ya entregados: sistema de diseño e iconografía (anexo de UI/UX), registro de vivienda y compra/membresías de WellPoints (anexo de WellPoints), y la página de detalle de vivienda. No redefine ninguna de esas piezas — las hace visibles y accionables en un solo lugar.*
