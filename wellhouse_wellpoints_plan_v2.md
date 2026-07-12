# Plan de Implementación de WellPoints — Wellhouse
### Sistema de Economía Interna para Plataforma de Intercambio de Viviendas
**Versión 2.0 | Julio 2026 | Documento técnico para equipo de desarrollo**

---

> **Nota de versión:** Este documento reemplaza completamente el plan v1.0.
> El sistema WellPoints descrito aquí está 100% alineado con Wellhouse como
> plataforma de **intercambio de viviendas** — no como app de bienestar.

---

## Índice

1. [Visión General y Filosofía del Sistema](#1-visión-general-y-filosofía-del-sistema)
2. [Benchmark — Qué hace bien la competencia](#2-benchmark--qué-hace-bien-la-competencia)
3. [Diferenciadores Innovadores de WellPoints](#3-diferenciadores-innovadores-de-wellpoints)
4. [Conceptos Clave y Terminología](#4-conceptos-clave-y-terminología)
5. [Diseño del Sistema — Mecanismos de Ganancia](#5-diseño-del-sistema--mecanismos-de-ganancia)
6. [Valoración Dinámica de Viviendas (WellScore)](#6-valoración-dinámica-de-viviendas-wellscore)
7. [Cómo se Gastan los WellPoints](#7-cómo-se-gastan-los-wellpoints)
8. [Sistema de Niveles y Reputación](#8-sistema-de-niveles-y-reputación)
9. [Gamificación — Insignias, Logros y Misiones](#9-gamificación--insignias-logros-y-misiones)
10. [Economía del Sistema — Balance y Anti-fraude](#10-economía-del-sistema--balance-y-anti-fraude)
11. [Esquema de Base de Datos](#11-esquema-de-base-de-datos)
12. [Endpoints de API](#12-endpoints-de-api)
13. [Lógica Backend — Detalle Técnico](#13-lógica-backend--detalle-técnico)
14. [UI/UX — Pantallas del Sistema WellPoints](#14-uiux--pantallas-del-sistema-wellpoints)
15. [Plan por Fases — Implementación](#15-plan-por-fases--implementación)
16. [Innovaciones para Fases Futuras](#16-innovaciones-para-fases-futuras)
17. [Consideraciones de Seguridad y Cumplimiento](#17-consideraciones-de-seguridad-y-cumplimiento)

---

## 1. Visión General y Filosofía del Sistema

### 1.1 ¿Qué son los WellPoints?

Los **WellPoints** son la moneda interna de Wellhouse — una representación de
la **confianza, hospitalidad y reciprocidad** que un usuario aporta a la
comunidad de intercambio de viviendas.

A diferencia de una moneda monetaria, los WellPoints no tienen valor de cambio
real ni son convertibles a dinero. Son un sistema de crédito basado
exclusivamente en la contribución comunitaria: **para recibir hay que dar**.

```
PRINCIPIO FUNDACIONAL:
┌─────────────────────────────────────────────────────────┐
│  Tú hospedas a alguien  →  Ganas WellPoints             │
│  Usas WellPoints        →  Te alojas en otra vivienda   │
│  Cuanto más contribuyes →  Más y mejor puedes viajar    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Objetivos del Sistema

| Objetivo | Cómo lo logra WellPoints |
|---|---|
| **Desbloquear intercambios no simultáneos** | Los WP permiten que A hospede ahora y viaje después, sin necesidad de que B quiera ir a casa de A |
| **Compensar asimetrías entre viviendas** | Una villa de lujo y un apartamento estudio se equilibran con WP |
| **Aumentar la oferta de viviendas disponibles** | Incentivar a propietarios a publicar su vivienda y mantener el calendario activo |
| **Construir reputación y confianza** | Los WP reflejan el historial de hospitalidad real, no comprable |
| **Reducir el churn (abandono)** | Usuarios con WP acumulados tienen razones concretas para quedarse |
| **Premiar a los mejores miembros** | Superhosts y viajeros frecuentes reciben beneficios adicionales |

### 1.3 Principios de Diseño No Negociables

- ✅ **Los WellPoints NO se compran con dinero** (en el plan base)
- ✅ **Los WellPoints NO expiran en el corto plazo** (24 meses desde la última actividad)
- ✅ **El sistema es transparente**: el usuario siempre sabe exactamente cuánto vale su vivienda y por qué
- ✅ **Es equitativo**: no premia la riqueza sino la participación y la hospitalidad
- ✅ **Es explicable**: un usuario puede entenderlo en 60 segundos

---

## 2. Benchmark — Qué hace bien la competencia

### 2.1 HomeExchange GuestPoints — Lo que funciona

HomeExchange usa GuestPoints desde 2017 y hoy tiene más de 200,000 miembros
en 155 países. Estos son sus aciertos clave que Wellhouse debe adoptar y
superar:

```
✅ ADOPTAR de HomeExchange:
├── Puntos de bienvenida al registrarse (onboarding inmediato)
├── Valoración automática de vivienda por algoritmo (no manual)
├── Transferencia automática de puntos al finalizar intercambio
├── WP por noche multiplicado por valor de la vivienda
├── Opción de intercambio recíproco O por puntos (flexibilidad)
└── Puntos extra al completar el perfil al 100%

❌ MEJORAR vs HomeExchange:
├── Su UX para gestionar GP es anticuada y confusa
├── No penaliza cancelaciones tardías
├── No tiene gamificación real (insignias, niveles, misiones)
├── No usa IA para recomendar intercambios compatibles
├── No diferencia WP por calidad de la hospitalidad (solo por noches)
└── No tiene sistema de reputación dinámico
```

### 2.2 Kindred Credits — Lo que funciona

Kindred usa un sistema aún más simple: 1 crédito = 1 noche, sin distinción
por tamaño o ubicación. Su principio "give to get" es muy claro.

```
✅ ADOPTAR de Kindred:
├── Mensaje simple: "da una noche, recibe una noche"
├── 5 créditos de bienvenida para que puedas probar sin hospedar primero
├── Créditos por referidos (con verificación de que el amigo completó perfil)
└── NO se pueden comprar créditos → integridad del sistema

❌ MEJORAR vs Kindred:
├── Su modelo ignora diferencias de vivienda (injusto para propietarios de mejores casas)
├── No tiene gamificación
├── No diferencia entre anfitrión novato y Superhost
└── Solo disponible en EE.UU. y Europa (Wellhouse foco LATAM)
```

### 2.3 Síntesis: El modelo híbrido de Wellhouse

Wellhouse toma lo mejor de ambos y añade innovación propia:

```
WELLPOINTS = (Base Kindred: simplicidad y reciprocidad)
           + (Algoritmo HomeExchange: valoración dinámica)
           + (Innovación Wellhouse: IA + reputación + gamificación + LATAM)
```

---

## 3. Diferenciadores Innovadores de WellPoints

Estos son los elementos que hacen al sistema de Wellhouse único en el mercado:

### 3.1 WellScore™ — Valoración Dinámica con IA

A diferencia de HomeExchange (que usa un algoritmo estático) y Kindred (que
ignora la calidad de la vivienda), Wellhouse usa un **modelo de IA que
recalcula el valor de cada vivienda en tiempo real**, considerando demanda
histórica, temporada, calidad de reseñas y competencia en la ciudad.

### 3.2 Reputación como Multiplicador

Los WellPoints ganados por noche se multiplican por el **índice de
reputación** del anfitrión. Hospedar bien vale más que hospedar simplemente.
Un Superhost con 5 estrellas gana más WP por la misma noche que un anfitrión
nuevo.

### 3.3 WellPoints de Comunidad

Acciones que fortalecen la comunidad también generan WellPoints: escribir
reseñas detalladas, completar el perfil, responder rápido a solicitudes,
mantener el calendario actualizado. Esto resuelve el "problema del huevo y la
gallina" en plataformas nuevas.

### 3.4 Sistema de Misiones (Quests)

Primera plataforma de intercambio de viviendas con **misiones contextuales**:
"Publica tu primera vivienda esta semana y gana 200 WP de bonus", "Completa 3
intercambios en 6 meses y sube al nivel Explorer".

### 3.5 WellPoints Garantizados por Cancelación

Si un anfitrión cancela en las últimas 72 horas, el huésped recibe
**WellPoints de compensación** automáticamente. Esto elimina uno de los
principales puntos de dolor de las plataformas actuales.

---

## 4. Conceptos Clave y Terminología

| Término | Definición |
|---|---|
| **WellPoints (WP)** | Moneda interna de Wellhouse. Se ganan hospedando y contribuyendo a la comunidad. Se gastan al alojarse en casa de otro miembro. |
| **WellScore™** | Puntuación dinámica calculada por IA que determina cuántos WP vale cada noche en cada vivienda. |
| **Intercambio Recíproco** | Dos usuarios intercambian viviendas simultáneamente o en fechas diferentes. Sin uso de WP. |
| **Intercambio por WellPoints** | Un usuario hospeda a otro y recibe WP. Luego usa esos WP para alojarse en cualquier otra vivienda. |
| **Nivel de Miembro** | Categoría del usuario según su historial (Newcomer → Explorer → Traveler → Superhost → Ambassador). |
| **Índice de Hospitalidad (IH)** | Puntuación 0-10 que refleja la calidad histórica de un anfitrión. Multiplicador de WP ganados. |
| **WellPoints de Bienvenida** | Puntos otorgados al registrarse para que el usuario pueda hacer su primer intercambio antes de hospedar. |
| **WellPoints de Comunidad** | Puntos ganados por acciones que fortalecen la plataforma (reseñas, completar perfil, respuesta rápida). |
| **WellPoints de Compensación** | Puntos otorgados automáticamente cuando un intercambio confirmado es cancelado por el anfitrión. |
| **Misiones** | Objetivos con plazo específico que generan WP bonus al completarse. |
| **Insignias** | Reconocimientos permanentes en el perfil del usuario por logros específicos. |
| **Caducidad de WP** | Los WP expiran 24 meses después de la última actividad (no del último uso). |

---

## 5. Diseño del Sistema — Mecanismos de Ganancia

### 5.1 Categoría A: Hosting (Fuente Principal)

La forma principal y más valiosa de ganar WP es hospedando a otros miembros.

```
FÓRMULA BASE:
WP ganados = WellScore™ de tu vivienda (por noche) × Índice de Hospitalidad

Ejemplo:
  - Tu vivienda tiene WellScore™ de 80 WP/noche
  - Tu Índice de Hospitalidad es 1.2 (eres un buen anfitrión)
  - Hospedas 5 noches
  → Ganas: 80 × 1.2 × 5 = 480 WP
```

**Desglose de WP por hosting:**

| Situación | WP Base | Modificador | Resultado ejemplo |
|---|---|---|---|
| Intercambio no simultáneo (tú hospedas, no viajas aún) | `WellScore™/noche` | × IH | 80 WP × 1.0 × 3 noches = 240 WP |
| Intercambio recíproco con diferencia de valor | Solo el delta | × IH | Si tu casa vale 100 y la otra 80 → ganas 20 WP/noche |
| Hospedaje de habitación privada (no casa completa) | 50% del WellScore™ | × IH | 40 WP × 1.1 × 2 noches = 88 WP |

### 5.2 Categoría B: Perfil y Confianza

Estas acciones se completan una sola vez (o periódicamente) y aseguran que
los nuevos usuarios tengan WP suficientes para su primer intercambio.

| Acción | WP otorgados | Frecuencia | Notas |
|---|---|---|---|
| Registro en Wellhouse | **+100 WP** | Una vez | WP de bienvenida para el primer intercambio |
| Completar perfil al 100% (foto, bio, idiomas) | **+150 WP** | Una vez | Se verifica automáticamente |
| Verificar email | **+25 WP** | Una vez | — |
| Verificar número de teléfono | **+25 WP** | Una vez | — |
| Verificar identidad Nivel 2 (documento oficial) | **+200 WP** | Una vez | Máxima confianza |
| Publicar primera vivienda con ≥5 fotos | **+200 WP** | Una vez | Incentivo crítico para masa crítica |
| Completar perfil de vivienda al 100% | **+100 WP** | Por vivienda | Máximo 2 viviendas en plan Free |
| Activar membresía Premium por primera vez | **+300 WP** | Una vez | Retención del upgrade |
| Renovar membresía Premium | **+150 WP** | Anual | Retención de largo plazo |

### 5.3 Categoría C: Comportamiento Comunitario

Estas acciones fortalecen la confianza y la calidad de la comunidad.
Se pueden repetir pero con límites para evitar abuso.

| Acción | WP otorgados | Límite | Notas |
|---|---|---|---|
| Escribir reseña detallada (>80 palabras) al huésped | **+30 WP** | Por intercambio | Solo si también el otro escribe reseña |
| Escribir reseña detallada (>80 palabras) al anfitrión | **+30 WP** | Por intercambio | Sistema de doble ciego — ambos ganan |
| Responder solicitud de intercambio en <12 horas | **+10 WP** | Por solicitud respondida | Incentiva tasa de respuesta |
| Mantener calendario actualizado por 30 días consecutivos | **+50 WP** | Mensual | Aumenta disponibilidad real |
| Referir a un amigo que completa perfil + vivienda | **+100 WP** | Hasta 10 referidos | El amigo también recibe los WP de bienvenida |
| Referir a un amigo que hace su primer intercambio | **+150 WP adicionales** | Hasta 10 referidos | Bonus cuando el referido es activo de verdad |
| Actualizar fotos de vivienda (nuevas fotos de calidad) | **+30 WP** | 2 veces/año | Moderación manual necesaria |
| Completar encuesta de experiencia post-intercambio | **+15 WP** | Por intercambio | Datos para mejora del producto |

### 5.4 Categoría D: Logros y Misiones

| Tipo | Ejemplo | WP otorgados |
|---|---|---|
| **Misión semanal** | "Responde 3 solicitudes esta semana" | +50 WP |
| **Misión mensual** | "Completa tu primer intercambio este mes" | +200 WP |
| **Misión de temporada** | "Hospeda a alguien en diciembre" | +300 WP |
| **Logro permanente** | "Tu primera vez: primer intercambio completado" | +250 WP (una vez) |
| **Logro permanente** | "5 intercambios completados" | +500 WP (una vez) |
| **Logro permanente** | "Anfitrión 5 estrellas: 3 reseñas perfectas seguidas" | +400 WP (una vez) |
| **Racha de respuesta** | "Respondiste todas las solicitudes en <6h por 30 días" | +200 WP |

### 5.5 WellPoints de Compensación (Sistema de Garantías)

Este mecanismo, único en el mercado, protege al huésped y penaliza la mala
conducta del anfitrión.

| Situación | Compensación al afectado | Penalización al responsable |
|---|---|---|
| Anfitrión cancela con >14 días de anticipación | +50 WP al huésped | -20 WP al anfitrión |
| Anfitrión cancela entre 7–14 días antes | +100 WP al huésped | -50 WP al anfitrión |
| Anfitrión cancela con <7 días antes | +200 WP al huésped | -100 WP al anfitrión |
| Anfitrión cancela con <72 horas antes | +400 WP al huésped | -200 WP + badge de advertencia |
| Vivienda no coincide con descripción (denuncia verificada) | +150 WP al huésped | -100 WP + revisión |

> **Nota técnica:** Las penalizaciones no pueden dejar al usuario en saldo
> negativo. Si el anfitrión tiene menos WP que la penalización, se le aplica
> restricción de funciones Premium hasta que lo recupere hospedando.

---

## 6. Valoración Dinámica de Viviendas (WellScore™)

El **WellScore™** es el corazón del sistema. Determina cuántos WP vale
cada noche en cada vivienda y se recalcula automáticamente.

### 6.1 Factores del Algoritmo

```
WellScore™ = (Score_Base) × (Multiplicador_Calidad) × (Factor_Demanda)

Score_Base se calcula con:
┌─────────────────────────────────────────────────────────┐
│  Factor             │  Peso  │  Ejemplo                 │
│─────────────────────│────────│──────────────────────────│
│  Ubicación (ciudad) │  35%   │  Ciudad capital = mayor  │
│  Capacidad (camas)  │  20%   │  +10 WP por habitación   │
│  Superficie (m²)    │  15%   │  +5 WP por cada 20m²     │
│  Amenidades clave   │  20%   │  +15 WP piscina, +10 WiFi│
│  Tipo de propiedad  │  10%   │  Villa > Appto > Estudio  │
└─────────────────────────────────────────────────────────┘

Multiplicador_Calidad (varía entre 0.7 y 1.5):
  - Promedio reseñas (40% del multiplicador)
  - Número de intercambios exitosos (30%)
  - Tasa de cancelación (penaliza, 20%)
  - Completitud del perfil de vivienda (10%)

Factor_Demanda (varía entre 0.8 y 1.3, recalculado semanalmente):
  - Alta demanda en ese destino en esa fecha = Factor sube
  - Baja demanda = Factor baja (incentivo para el huésped)
  - Temporada alta/baja detectada automáticamente
```

### 6.2 Ejemplos de WellScore™

| Vivienda | Score_Base | × Calidad | × Demanda | WellScore™ final |
|---|---|---|---|---|
| Estudio 1 cama, Cali, nuevo | 45 WP | × 0.85 | × 1.0 | **~38 WP/noche** |
| Appto 2 hab, Bogotá, 4.5★ | 75 WP | × 1.1 | × 1.1 | **~91 WP/noche** |
| Casa 3 hab + jardín, Medellín, 5★ | 110 WP | × 1.4 | × 1.2 | **~185 WP/noche** |
| Villa 5 hab + piscina, Cartagena, 5★ | 180 WP | × 1.5 | × 1.3 | **~351 WP/noche** |

### 6.3 Transparencia Total

El propietario **siempre puede ver el desglose** de por qué su vivienda
tiene ese WellScore™ y qué acciones pueden subirlo:

```
Tu vivienda: Apartamento en Laureles, Medellín
WellScore™ actual: 92 WP/noche

Desglose:
  📍 Ubicación (Medellín, Laureles)    → 38 WP base
  🛏 2 habitaciones, 4 camas           → +18 WP
  📐 75m²                              → +12 WP
  🌐 WiFi fibra óptica + Netflix       → +10 WP
  🚗 Parqueadero incluido              → +7 WP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   Score base: 85 WP

  ⭐ Calidad (4.8★ en 6 intercambios)  → × 1.10
  📈 Demanda alta (semana de festival)  → × 1.20
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   WellScore™: ~112 WP/noche

💡 Tip: Si añades una lavadora, tu score sube ~8 WP/noche.
```

---

## 7. Cómo se Gastan los WellPoints

### 7.1 Gasto Principal — Intercambios por WellPoints

Cuando un usuario quiere alojarse en una vivienda sin ofrecer la suya a
cambio simultáneamente:

```
WP gastados = WellScore™ de la vivienda destino × noches de estancia

Ejemplo:
  - Quiero ir a Cartagena 5 noches
  - Villa en Cartagena tiene WellScore™ de 180 WP/noche
  → Necesito: 180 × 5 = 900 WP
  → Saldo mío: 1,200 WP
  → Después del intercambio: 300 WP disponibles
  → El anfitrión de Cartagena recibe: 900 WP × su IH
```

### 7.2 Ajuste en Intercambios Recíprocos con Diferencia de Valor

Cuando dos viviendas tienen WellScores™ diferentes en un intercambio directo:

```
Casa A (Cali)    → WellScore™: 70 WP/noche
Casa B (Bogotá)  → WellScore™: 100 WP/noche
Ambos se quedan 7 noches

Diferencia: 30 WP/noche × 7 noches = 210 WP
El dueño de Casa A (la de menor valor) debe:
→ OPCIÓN 1: Pagar 210 WP de diferencia
→ OPCIÓN 2: Ofrecer 1 noche adicional (si el dueño de B acepta)
→ OPCIÓN 3: Negociar directamente (el sistema sugiere opciones)
```

### 7.3 Otros Usos de WellPoints

| Uso | WP necesarios | Notas |
|---|---|---|
| Desbloquear función de chat previo a solicitud (plan Free) | 10 WP por conversación | En Premium es gratis |
| Solicitud urgente (respuesta garantizada en <4h) | 50 WP | Solo disponible en V2 |
| Boost de visibilidad de tu vivienda (1 semana) | 100 WP | Aparece primero en búsquedas |
| Acceso a lista de espera de viviendas exclusivas | 200 WP | Viviendas con lista de espera |
| Transferir WP a otro usuario (solo Premium) | Los WP transferidos | Límite: 500 WP/mes en V2 |

---

## 8. Sistema de Niveles y Reputación

### 8.1 Niveles de Miembro

Los niveles son permanentes (no caducan) y se basan en el **historial total**
de participación, no solo en los WP actuales.

```
NIVEL 1 — NEWCOMER 🏠
  Requisitos: Recién registrado
  Beneficios:
    • WP de bienvenida (100 WP)
    • Acceso a búsqueda y exploración
    • Puede enviar hasta 3 solicitudes/mes (plan Free)

NIVEL 2 — EXPLORER 🧳
  Requisitos: 1 intercambio completado + perfil >80% completo
  Beneficios:
    • +5% de WP en cada hosting (multiplicador de nivel)
    • Insignia "Explorer" visible en perfil
    • Puede enviar hasta 5 solicitudes/mes
    • Acceso a chat de comunidad

NIVEL 3 — TRAVELER ✈️
  Requisitos: 3 intercambios completados + promedio ≥4.5★
  Beneficios:
    • +10% de WP en cada hosting
    • Prioridad en búsquedas (aparece antes en resultados)
    • 10 solicitudes/mes plan Free
    • Acceso a misiones exclusivas de temporada

NIVEL 4 — SUPERHOST 🌟
  Requisitos: 7 intercambios + promedio ≥4.8★ + sin cancelaciones en 6 meses
  Beneficios:
    • +20% de WP en cada hosting
    • Badge dorado en perfil y en resultados de búsqueda
    • Solicitudes ilimitadas
    • Soporte prioritario 24/7
    • Acceso anticipado a nuevas funcionalidades

NIVEL 5 — AMBASSADOR 🏆
  Requisitos: 15 intercambios + promedio ≥4.9★ + ≥3 referidos activos
  Beneficios:
    • +30% de WP en cada hosting
    • Badge de diamante en perfil
    • 1 mes de Premium gratis al año
    • Beta tester oficial de nuevas funciones
    • Posibilidad de ser "Anfitrión Destacado" en la homepage
```

### 8.2 Índice de Hospitalidad (IH) — El multiplicador de reputación

El IH es el diferenciador más innovador de Wellhouse vs la competencia.
Se calcula automáticamente y se actualiza tras cada intercambio.

```
IH = ((Rating promedio / 5) × 0.50)
   + ((Tasa de respuesta <12h) × 0.20)
   + ((Tasa de no-cancelación) × 0.20)
   + ((Completitud de reseñas escritas) × 0.10)

Escala del IH:
  0.70 – 0.84  → Anfitrión Básico (penaliza ligeramente)
  0.85 – 0.99  → Anfitrión Estándar (neutro)
  1.00 – 1.14  → Buen Anfitrión (+10-14% de WP)
  1.15 – 1.29  → Excelente Anfitrión (+15-29% de WP)
  1.30 – 1.50  → Superhost Elite (+30-50% de WP)

Ejemplo de impacto:
  - WellScore™ vivienda: 100 WP/noche
  - 3 noches de hospedaje
  
  Anfitrión con IH 0.80 → gana: 100 × 0.80 × 3 = 240 WP
  Anfitrión con IH 1.40 → gana: 100 × 1.40 × 3 = 420 WP
  
  → La calidad de la hospitalidad vale un 75% más WP
```

---

## 9. Gamificación — Insignias, Logros y Misiones

### 9.1 Insignias de Hospitalidad

| Insignia | Criterio de desbloqueo | WP bonus |
|---|---|---|
| 🏠 **Primera Llave** | Completa tu primer intercambio como anfitrión | +250 WP |
| 🌍 **Primer Destino** | Completa tu primer intercambio como huésped | +250 WP |
| ⚡ **Respuesta Rápida** | Tasa de respuesta <6h por 30 días consecutivos | +150 WP |
| 📸 **Fotógrafo Pro** | Sube ≥15 fotos de alta calidad verificadas | +100 WP |
| 🗣 **Buen Narrador** | Escribe 10 reseñas de más de 100 palabras | +200 WP |
| 🤝 **Conector** | Refiere a 3 amigos que completan su primer intercambio | +400 WP |
| 🌟 **Sin Cancelaciones** | 6 meses sin cancelar ningún intercambio confirmado | +300 WP |
| 🏆 **Viajero Serial** | 10 intercambios completados (como huésped) | +600 WP |
| 👑 **Anfitrión Élite** | 10 intercambios completados (como anfitrión) con ≥4.8★ | +800 WP |
| 🌎 **Explorador LATAM** | Intercambios en 3 países diferentes | +500 WP |
| 💬 **Comunidad Activa** | Miembro activo durante 1 año calendario | +200 WP |
| 🆕 **Early Adopter** | Registrado durante los primeros 6 meses de Wellhouse | +500 WP (especial) |

### 9.2 Sistema de Misiones

Las misiones son temporales, con fecha de inicio y fin. Se muestran en un
panel dedicado en la app.

#### Misiones Siempre Disponibles (resets mensual)

| Misión | Descripción | Recompensa |
|---|---|---|
| 📅 **Calendario Vivo** | Mantén tu calendario de disponibilidad actualizado los próximos 30 días | +50 WP |
| ✍️ **Escritor de Viajes** | Escribe 2 reseñas detalladas este mes | +60 WP |
| 📲 **Responde Ya** | Responde 5 solicitudes en menos de 6 horas esta semana | +40 WP |
| 🔗 **Comparte Wellhouse** | Invita a 1 amigo que complete su perfil este mes | +80 WP |

#### Misiones de Temporada (nuevas cada trimestre)

```
Ejemplo Q1 (Enero–Marzo):
  🏖 "Viaje de Semana Santa" → Hospeda entre el 10 y 20 de abril → +300 WP
  🏡 "Año Nuevo, Casa Nueva" → Publica tu primera vivienda en enero → +250 WP

Ejemplo Q3 (Julio–Septiembre):
  ☀️ "Verano Sin Fronteras" → Completa 1 intercambio internacional → +400 WP
  📷 "Renueva tu Espacio" → Actualiza fotos de tu vivienda en agosto → +100 WP
```

#### Misiones de Onboarding (solo usuarios nuevos, primeros 30 días)

```
Día 1:  "Bienvenido a Wellhouse"  → Completa tu perfil al 80%     → +100 WP
Día 3:  "Tu hogar, tu mundo"      → Publica tu primera vivienda    → +200 WP
Día 7:  "Explora el mapa"         → Guarda 3 viviendas en favoritos → +30 WP
Día 14: "Primer paso"             → Envía tu primera solicitud      → +50 WP
Día 30: "Miembro activo"          → Completa cualquier intercambio  → +300 WP
```

### 9.3 Leaderboard (Tabla de Clasificación)

La tabla de clasificación **no usa WP actuales** (para no discriminar a
quienes ganan menos porque viajan más). Usa el **total histórico de WP
ganados** — que refleja contribución real a la comunidad.

```
Tipos de leaderboard:
┌──────────────────────────────────────────────────────────────┐
│  🌍 Global All-Time       → Top anfitriones de todo Wellhouse│
│  🇨🇴 Tu País             → Top de Colombia (o tu país)       │
│  👥 Entre amigos          → Solo tu red de contactos         │
│  📅 Este mes              → Reset el 1ro de cada mes         │
│  🏙 Tu ciudad             → Solo en tu ciudad                │
└──────────────────────────────────────────────────────────────┘

Privacidad: El usuario puede optar por NO aparecer en leaderboards.
```

---

## 10. Economía del Sistema — Balance y Anti-fraude

### 10.1 El Problema de las Economías de Puntos y Cómo lo Resolvemos

El mayor riesgo de cualquier sistema de puntos es la **inflación** (demasiados
puntos, pocos lugares disponibles) o la **deflación** (muy difícil ganar
puntos, usuarios frustrados). Wellhouse usa tres mecanismos:

#### A) Oferta controlada
- Los WP solo se emiten por hosting real verificado o acciones comunitarias
- **No se compran** en el plan base (V1 y V2)
- Los WP de bienvenida son limitados y calculados para cubrir ≈ 3-5 noches
  promedio, no más

#### B) Caducidad progresiva
```
Caducidad: 24 meses después de la última actividad del usuario
  (no del último uso de WP — la actividad incluye hospedar, responder
  solicitudes, actualizar calendario, escribir reseñas)

Aviso de caducidad:
  → 90 días antes: notificación en app + email
  → 30 días antes: notificación urgente con misión especial para "reactivar"
  → 7 días antes: notificación final

WP que caducan → NO desaparecen del sistema, se redistribuyen al
               fondo de compensaciones (ver §5.5)
```

#### C) Monitor de anomalías (Anti-fraude)
```
El sistema detecta automáticamente:
  ⚠️  Usuario con 0 intercambios pero >500 WP acumulados (posible abuso
       de misiones sin participación real)
  ⚠️  Patrón de intercambios falsos entre cuentas relacionadas
       (mismo dispositivo, misma IP, transferencias inmediatas)
  ⚠️  Reseñas sospechosas (misma IP, textos similares entre usuarios)
  ⚠️  Tasa de cancelación >25% en los últimos 3 meses

Respuesta automática:
  → Congelamiento temporal de WP pendientes de recibir
  → Revisión manual por equipo de Trust & Safety
  → Deducción permanente si se confirma fraude
```

### 10.2 Límites por Plan

| Límite | Plan Free | Plan Premium |
|---|---|---|
| WP de bienvenida | 100 WP | 300 WP (al activar) |
| WP máximos acumulables | Sin límite | Sin límite |
| Solicitudes de intercambio/mes | 3 | Ilimitadas |
| Transferir WP a otros usuarios | ❌ No | ✅ Hasta 500 WP/mes |
| Usar WP para boost de visibilidad | ❌ No | ✅ Sí |
| Acceso a leaderboard global | Solo ver | Participar activamente |

---

## 11. Esquema de Base de Datos

### 11.1 Tablas Core del Sistema WellPoints

```sql
-- ================================================================
-- TABLA: wellpoint_balances
-- Balance actual y total histórico por usuario
-- ================================================================
TABLE wellpoint_balances (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_balance       INTEGER NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
  total_earned_lifetime INTEGER NOT NULL DEFAULT 0,  -- nunca baja
  total_spent_lifetime  INTEGER NOT NULL DEFAULT 0,
  last_activity_at      TIMESTAMPTZ,  -- para calcular caducidad
  expires_at            TIMESTAMPTZ,  -- 24 meses desde last_activity_at
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- TABLA: wellpoint_transactions
-- Ledger inmutable de todos los movimientos de WP
-- ================================================================
TABLE wellpoint_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  amount           INTEGER NOT NULL,  -- positivo=ganado, negativo=gastado
  balance_after    INTEGER NOT NULL,  -- saldo tras la transacción
  type             VARCHAR(50) NOT NULL,
  -- Valores de type:
  --   'hosting_earned'        → WP por hospedar
  --   'exchange_spent'        → WP gastados al alojarse
  --   'welcome_bonus'         → WP de bienvenida al registro
  --   'profile_completion'    → Completar perfil
  --   'verification_bonus'    → Verificar identidad
  --   'property_published'    → Primera vivienda publicada
  --   'review_written'        → Reseña escrita
  --   'referral_bonus'        → Referido completado
  --   'mission_completed'     → Misión completada
  --   'badge_earned'          → Insignia desbloqueada
  --   'calendar_active'       → Calendario actualizado
  --   'cancellation_penalty'  → Penalización por cancelar
  --   'compensation_received' → Compensación por cancelación de otro
  --   'transfer_sent'         → WP transferidos a otro usuario (Premium)
  --   'transfer_received'     → WP recibidos de otro usuario (Premium)
  --   'expiration_deducted'   → WP caducados
  --   'rapid_response_bonus'  → Bonus por respuesta rápida
  --   'premium_activation'    → Bonus al activar Premium
  --   'level_up_bonus'        → Bonus al subir de nivel
  reference_type   VARCHAR(50),   -- 'exchange', 'mission', 'badge', etc.
  reference_id     UUID,          -- FK al objeto relacionado
  exchange_id      UUID REFERENCES exchanges(id),
  description      TEXT,          -- Descripción legible para el usuario
  metadata         JSONB,         -- Datos adicionales (IH, WellScore™, etc.)
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  -- Ledger inmutable: sin UPDATE ni DELETE
  CONSTRAINT amount_not_zero CHECK (amount != 0)
);

-- Índices para performance
CREATE INDEX idx_wp_transactions_user_date ON wellpoint_transactions(user_id, created_at DESC);
CREATE INDEX idx_wp_transactions_type ON wellpoint_transactions(type);
CREATE INDEX idx_wp_transactions_exchange ON wellpoint_transactions(exchange_id);

-- ================================================================
-- TABLA: wellscore_snapshots
-- Historial del WellScore™ de cada vivienda (para auditoría y transparencia)
-- ================================================================
TABLE wellscore_snapshots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL REFERENCES properties(id),
  wellscore           DECIMAL(6,2) NOT NULL,       -- WP/noche
  score_base          DECIMAL(6,2) NOT NULL,
  quality_multiplier  DECIMAL(4,3) NOT NULL,
  demand_factor       DECIMAL(4,3) NOT NULL,
  -- Desglose del score base
  location_score      DECIMAL(5,2),
  capacity_score      DECIMAL(5,2),
  size_score          DECIMAL(5,2),
  amenities_score     DECIMAL(5,2),
  type_score          DECIMAL(5,2),
  -- Desglose del multiplicador de calidad
  avg_rating          DECIMAL(3,2),
  exchange_count      INTEGER,
  cancellation_rate   DECIMAL(4,3),
  profile_completeness DECIMAL(4,3),
  calculated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wellscore_property_date ON wellscore_snapshots(property_id, calculated_at DESC);

-- ================================================================
-- TABLA: hospitality_index
-- Índice de Hospitalidad por usuario (actualizado tras cada intercambio)
-- ================================================================
TABLE hospitality_index (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  index_value          DECIMAL(4,3) NOT NULL DEFAULT 1.000 CHECK (index_value BETWEEN 0.5 AND 1.5),
  avg_rating           DECIMAL(3,2),
  response_rate        DECIMAL(4,3),  -- % de solicitudes respondidas en <12h
  no_cancel_rate       DECIMAL(4,3),  -- % de intercambios no cancelados
  review_completion    DECIMAL(4,3),  -- % de intercambios con reseña escrita
  total_exchanges      INTEGER DEFAULT 0,
  calculated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ================================================================
-- TABLA: member_levels
-- Nivel actual de cada usuario
-- ================================================================
TABLE member_levels (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level              VARCHAR(20) NOT NULL DEFAULT 'newcomer',
  -- Valores: 'newcomer', 'explorer', 'traveler', 'superhost', 'ambassador'
  level_reached_at   TIMESTAMPTZ DEFAULT NOW(),
  previous_level     VARCHAR(20),
  UNIQUE(user_id)
);

-- ================================================================
-- TABLA: badges
-- Catálogo de todas las insignias del sistema
-- ================================================================
TABLE badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            VARCHAR(50) UNIQUE NOT NULL,  -- 'first_key', 'speed_responder', etc.
  name            VARCHAR(100) NOT NULL,
  description     TEXT NOT NULL,
  icon_url        VARCHAR(255),
  wellpoints_bonus INTEGER NOT NULL DEFAULT 0,
  criteria        JSONB NOT NULL,
  -- Ejemplo criteria:
  -- { "type": "exchanges_as_host", "count": 1, "min_rating": null }
  -- { "type": "response_rate", "threshold": 0.95, "days": 30 }
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLA: user_badges
-- Insignias ganadas por cada usuario
-- ================================================================
TABLE user_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id        UUID NOT NULL REFERENCES badges(id),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  transaction_id  UUID REFERENCES wellpoint_transactions(id),
  UNIQUE(user_id, badge_id)  -- cada insignia se gana una sola vez
);

-- ================================================================
-- TABLA: missions
-- Catálogo de misiones (algunas son temporales, otras siempre activas)
-- ================================================================
TABLE missions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(100) UNIQUE NOT NULL,
  name              VARCHAR(150) NOT NULL,
  description       TEXT NOT NULL,
  type              VARCHAR(20) NOT NULL,
  -- Valores: 'onboarding', 'monthly', 'seasonal', 'permanent'
  wellpoints_reward INTEGER NOT NULL,
  criteria          JSONB NOT NULL,
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  max_completions   INTEGER DEFAULT 1,  -- cuántas veces puede completarla 1 usuario
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLA: user_missions
-- Progreso y completitud de misiones por usuario
-- ================================================================
TABLE user_missions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id      UUID NOT NULL REFERENCES missions(id),
  status          VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  -- Valores: 'in_progress', 'completed', 'expired'
  progress        JSONB,     -- progreso actual {"current": 2, "target": 3}
  completed_at    TIMESTAMPTZ,
  times_completed INTEGER DEFAULT 0,
  started_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_missions_active ON user_missions(user_id, status) WHERE status = 'in_progress';

-- ================================================================
-- TABLA: leaderboard_cache
-- Cache de leaderboards (actualizados periódicamente)
-- ================================================================
TABLE leaderboard_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         VARCHAR(50) NOT NULL,
  -- Valores: 'global_alltime', 'country_monthly', 'city_monthly', 'friends'
  scope        VARCHAR(100),  -- Ej: 'CO', 'Bogotá', o user_id del dueño del ranking
  user_id      UUID NOT NULL REFERENCES users(id),
  rank         INTEGER NOT NULL,
  score        INTEGER NOT NULL,  -- total_earned_lifetime para all-time, o mes actual
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_type_scope ON leaderboard_cache(type, scope, rank);

-- ================================================================
-- TABLA: wellpoint_transfers
-- Transferencias P2P de WellPoints (solo Premium, V2+)
-- ================================================================
TABLE wellpoint_transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id       UUID NOT NULL REFERENCES users(id),
  receiver_id     UUID NOT NULL REFERENCES users(id),
  amount          INTEGER NOT NULL CHECK (amount > 0),
  message         TEXT,
  status          VARCHAR(20) DEFAULT 'completed',
  sender_tx_id    UUID REFERENCES wellpoint_transactions(id),
  receiver_tx_id  UUID REFERENCES wellpoint_transactions(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Endpoints de API

### 12.1 Balance y Transacciones

```
GET    /api/v1/wellpoints/balance
       → Retorna: { current_balance, total_earned_lifetime, expires_at,
                    level, hospitality_index }

GET    /api/v1/wellpoints/transactions?page=1&limit=20&type=hosting_earned
       → Retorna: Lista paginada de transacciones con filtros por tipo y fecha

GET    /api/v1/wellpoints/transactions/:transactionId
       → Retorna: Detalle completo de una transacción específica

GET    /api/v1/wellpoints/summary
       → Retorna: WP este mes ganados, gastados, próximas misiones,
                  WP que caducan pronto
```

### 12.2 WellScore™

```
GET    /api/v1/properties/:propertyId/wellscore
       → Retorna: WellScore™ actual + desglose completo + tips para mejorar

GET    /api/v1/properties/:propertyId/wellscore/history?months=6
       → Retorna: Evolución del WellScore™ en los últimos N meses

POST   /api/v1/admin/wellscore/recalculate-all
       → (Solo Admin) Dispara recálculo masivo del WellScore™
```

### 12.3 Intercambios y WP

```
GET    /api/v1/exchanges/:exchangeId/wellpoints-preview
       → Retorna: Cuántos WP ganaría/gastaría el usuario en este intercambio
                  antes de confirmarlo

POST   /api/v1/exchanges/:exchangeId/finalize
       → Finaliza el intercambio y DISPARA la transferencia automática de WP
       → Body: { confirmation_code, actual_checkin, actual_checkout }
       → Esto activa: acreditación de WP al anfitrión, evaluación de badges,
                      actualización del IH, trigger de misiones

POST   /api/v1/exchanges/:exchangeId/cancel
       → Cancela un intercambio y calcula compensación/penalización de WP
       → Body: { reason, cancelled_by_role: 'host' | 'guest' }
```

### 12.4 Misiones e Insignias

```
GET    /api/v1/missions?status=in_progress
       → Retorna: Misiones activas del usuario con progreso actual

GET    /api/v1/missions/available
       → Retorna: Misiones disponibles que el usuario puede iniciar

POST   /api/v1/missions/:missionId/start
       → Inicia una misión disponible (para misiones que requieren opt-in)

GET    /api/v1/badges
       → Retorna: Todas las insignias (ganadas y bloqueadas) con criterios

GET    /api/v1/badges/earned
       → Retorna: Insignias ganadas por el usuario autenticado

GET    /api/v1/users/:userId/badges
       → Retorna: Insignias públicas de cualquier usuario (para ver en perfil)
```

### 12.5 Niveles y Reputación

```
GET    /api/v1/wellpoints/level
       → Retorna: Nivel actual, beneficios, requisitos para el siguiente nivel

GET    /api/v1/wellpoints/hospitality-index
       → Retorna: IH actual con desglose de componentes y comparación
                  con el promedio de la comunidad

GET    /api/v1/leaderboards/:type?scope=CO&limit=50
       → Retorna: Tabla de clasificación por tipo y scope
       → Tipos: 'global_alltime', 'country_monthly', 'city_monthly', 'friends'
```

### 12.6 Transferencias (Premium)

```
GET    /api/v1/wellpoints/transfers/history
       → Retorna: Historial de transferencias enviadas y recibidas

POST   /api/v1/wellpoints/transfers
       → Body: { receiver_user_id, amount, message }
       → Valida: usuario Premium, saldo suficiente, límite mensual de 500 WP
```

---

## 13. Lógica Backend — Detalle Técnico

### 13.1 Servicio de Transacciones — Atomicidad Garantizada

**Regla de oro:** Toda operación de WP que involucre múltiples escrituras debe
ser una **transacción atómica en PostgreSQL**. Nunca actualizar el balance sin
registrar en el ledger, ni viceversa.

```typescript
// Pseudocódigo del WellPointsService
class WellPointsService {

  async creditHostingWellpoints(exchangeId: string): Promise<void> {
    return await db.transaction(async (trx) => {

      // 1. Obtener datos del intercambio
      const exchange = await trx('exchanges').where({ id: exchangeId }).first()
      const host = await trx('users').where({ id: exchange.host_id }).first()

      // 2. Obtener WellScore™ vigente de la vivienda anfitriona
      const wellscore = await this.getCurrentWellscore(exchange.host_property_id, trx)

      // 3. Obtener Índice de Hospitalidad del anfitrión
      const ih = await this.getHospitalityIndex(exchange.host_id, trx)

      // 4. Calcular WP a acreditar
      const nights = this.calculateNights(exchange.checkin_date, exchange.checkout_date)
      const level_multiplier = this.getLevelMultiplier(host.member_level)
      const wp_to_credit = Math.round(wellscore * ih.index_value * nights * level_multiplier)

      // 5. Insertar transacción en ledger (inmutable)
      const [transaction] = await trx('wellpoint_transactions').insert({
        user_id: exchange.host_id,
        amount: wp_to_credit,
        balance_after: host_balance.current_balance + wp_to_credit,
        type: 'hosting_earned',
        reference_type: 'exchange',
        reference_id: exchangeId,
        exchange_id: exchangeId,
        description: `Hosting en ${exchange.guest_name} — ${nights} noches`,
        metadata: {
          wellscore,
          hospitality_index: ih.index_value,
          nights,
          level_multiplier,
          breakdown: { base: wellscore, ih: ih.index_value, nights }
        }
      }).returning('*')

      // 6. Actualizar balance (atómico con el insert anterior)
      await trx('wellpoint_balances')
        .where({ user_id: exchange.host_id })
        .update({
          current_balance: trx.raw('current_balance + ?', [wp_to_credit]),
          total_earned_lifetime: trx.raw('total_earned_lifetime + ?', [wp_to_credit]),
          last_activity_at: new Date(),
          expires_at: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // +24 meses
          updated_at: new Date()
        })

      // 7. Evaluar badges y misiones en background (no bloquea la transacción)
      await this.queueBadgeEvaluation(exchange.host_id, 'hosting_earned', { exchange_id: exchangeId })
      await this.queueMissionProgress(exchange.host_id, 'exchange_hosted')
      await this.queueLeaderboardUpdate(exchange.host_id)

      // 8. Emitir evento para notificación al usuario
      await this.eventBus.emit('wellpoints.credited', {
        user_id: exchange.host_id,
        amount: wp_to_credit,
        transaction_id: transaction.id,
        type: 'hosting_earned'
      })

    }) // fin de la transacción atómica
  }
```

### 13.2 Recálculo del WellScore™

El WellScore™ se recalcula de forma automática en dos momentos:

```
TRIGGERS DE RECÁLCULO:
  1. Inmediatamente cuando el propietario:
     - Actualiza fotos, descripción o amenidades
     - Agrega o elimina una cama/habitación
     - Su promedio de reseñas cambia tras un nuevo intercambio

  2. Por lote semanal (cada lunes 3am):
     - Actualiza el Factor de Demanda para todas las viviendas
     - Recalcula scores con datos de búsqueda y solicitudes de la semana

  3. No se recalcula mid-stay:
     - Si el intercambio ya está confirmado, el WellScore™ acordado
       en el momento de confirmación es el que se usa para pagar los WP
```

### 13.3 Evaluación Asíncrona de Misiones e Insignias

Las misiones e insignias **no se evalúan en tiempo real** durante la
transacción principal para no añadir latencia. Se procesan en una cola:

```
FLUJO ASÍNCRONO:
  1. Evento emitido: 'exchange.finalized'
  2. Worker de misiones consume el evento
  3. Identifica qué misiones en progreso pueden avanzar
  4. Actualiza progreso en user_missions
  5. Si mission.progress == mission.target:
     → Crea transacción de WP (tipo: 'mission_completed')
     → Actualiza user_missions.status = 'completed'
     → Envía notificación push + in-app
  6. Worker de insignias hace el mismo proceso en paralelo
  7. Si hay insignia desbloqueada:
     → Inserta en user_badges
     → Crea transacción de WP (tipo: 'badge_earned')
     → Envía notificación especial con animación

Cola recomendada: Bull + Redis / AWS SQS
Tiempo máximo de procesamiento: < 30 segundos después del evento
```

### 13.4 Caducidad de WellPoints

```
PROCESO DE CADUCIDAD (corre diariamente a las 2am):
  1. Consulta usuarios con expires_at entre hoy y hoy + 90 días
  2. Para cada usuario:
     a. Si expires_at > hoy + 90: no hace nada
     b. Si expires_at está en (hoy + 30, hoy + 90]: envía aviso
     c. Si expires_at está en (hoy, hoy + 30]: envía aviso urgente
     d. Si expires_at <= hoy y current_balance > 0:
        → Crea transacción negativa: amount = -current_balance, type = 'expiration_deducted'
        → Actualiza current_balance = 0 (NUNCA toca total_earned_lifetime)
        → Los WP van al fondo de compensaciones (tabla: wellpoints_fund)
        → Envía notificación de caducidad
```

---

## 14. UI/UX — Pantallas del Sistema WellPoints

### 14.1 Widget de Balance (aparece en todas las pantallas)

```
┌─────────────────────────────────────┐
│  💎 1,240 WellPoints               │
│  Nivel: Traveler ✈️  [Ver detalles]  │
└─────────────────────────────────────┘
```

Tap en el widget lleva al Dashboard de WellPoints.

### 14.2 Dashboard de WellPoints (pantalla dedicada)

```
┌──────────────────────────────────────────────────┐
│  MIS WELLPOINTS                                  │
│                                                  │
│     💎 1,240 WP disponibles                      │
│     📈 Total ganado siempre: 3,890 WP           │
│     ⏳ Vencen en: 18 meses (feb 2028)           │
│                                                  │
│  ┌────────┬────────┬────────┐                    │
│  │Este mes│  Total │Historial│                   │
│  │+340 WP │3,890 WP│  ver ↓  │                  │
│  └────────┴────────┴────────┘                    │
│                                                  │
│  🏠 Tu WellScore™: 92 WP/noche                  │
│  [Ver desglose completo →]                       │
│                                                  │
│  ── MISIONES ACTIVAS ──────────────────────────  │
│  📅 Calendario Vivo   ████████░░  80%  +50 WP   │
│  ✍️  Escritor de Viajes ███░░░░░░░  30%  +60 WP  │
│  [Ver todas las misiones →]                      │
│                                                  │
│  ── INSIGNIAS RECIENTES ───────────────────────  │
│  🏠 Primera Llave  ✈️ Primer Destino  ⚡ Veloz   │
│  [Ver mis 8 insignias →]                         │
│                                                  │
│  ── HISTORIAL DE MOVIMIENTOS ──────────────────  │
│  ▲ +480 WP  Hosting — Juan Pérez (5 noches)     │
│  ▼ -350 WP  Intercambio — Casa en Cartagena     │
│  ▲ +250 WP  Insignia — Primera Llave 🏠          │
│  ▲ +30 WP   Reseña completada                   │
│  [Ver historial completo →]                      │
└──────────────────────────────────────────────────┘
```

### 14.3 Vista del WellScore™ (desde el perfil de vivienda)

```
┌──────────────────────────────────────────────────┐
│  💎 WELLSCORE™ de tu vivienda                    │
│                                                  │
│         92 WP / noche                           │
│                                                  │
│  DESGLOSE:                                       │
│  📍 Ubicación (Laureles, Medellín)    38 WP     │
│  🛏 2 hab, 4 camas                    18 WP     │
│  📐 75 m²                             12 WP     │
│  🌐 WiFi + Netflix                    10 WP     │
│  🚗 Parqueadero                        7 WP     │
│  ─────────────────────────────────  Base: 85 WP │
│  ⭐ Calidad (4.8★ × 6 intercambios)   × 1.10   │
│  📈 Demanda esta semana               × 1.10   │
│  ─────────────────────────────────  Total: ~103 │
│                                                  │
│  💡 CÓMO MEJORAR TU SCORE:                       │
│  • Añade lavadora (+8 WP/noche)                 │
│  • Responde más rápido (+IH → +WP por hosting)  │
│  • Completa descripción al 100% (+5 WP/noche)   │
└──────────────────────────────────────────────────┘
```

### 14.4 Animaciones y Microinteracciones (Mobile)

```
CUANDO EL USUARIO GANA WP:
  → Animación de monedas flotando hacia el contador superior
  → Contador incrementa con efecto "roll-up"
  → Toast notification: "¡+480 WP ganados! 💎 Hosting completado"
  → Haptic feedback suave en iOS/Android

CUANDO DESBLOQUEA UNA INSIGNIA:
  → Modal de celebración con confetti
  → Insignia gira y aparece con efecto 3D
  → Opción de compartir en redes sociales

CUANDO SUBE DE NIVEL:
  → Pantalla completa de celebración con nivel nuevo
  → Lista de nuevos beneficios desbloqueados
  → CTA para el siguiente nivel
```

### 14.5 Preview de WP antes de solicitar intercambio

En la pantalla de detalle de vivienda, antes de enviar solicitud:

```
┌──────────────────────────────────────────────────┐
│  RESUMEN DEL INTERCAMBIO                         │
│  Casa en el Poblado, Medellín                    │
│  5 noches · 15–20 agosto                        │
│                                                  │
│  💎 Costo: 460 WP  (92 WP × 5 noches)          │
│  Tu saldo actual: 1,240 WP                      │
│  Saldo después: 780 WP                          │
│                                                  │
│  ✅ Tienes puntos suficientes                    │
│                                                  │
│  Tipo de intercambio:                            │
│  ○ Por WellPoints (usa 460 WP)                  │
│  ○ Intercambio recíproco (sin WP)               │
│                                                  │
│  [Solicitar intercambio →]                       │
└──────────────────────────────────────────────────┘
```

---

## 15. Plan por Fases — Implementación

### Fase 1 — MVP del Sistema WellPoints (semanas 1–8)

**Objetivo:** Sistema funcional mínimo que permite intercambios no simultáneos.

**Backend:**
- [ ] Tablas: `wellpoint_balances`, `wellpoint_transactions`, `wellscore_snapshots`
- [ ] Servicio de transacciones atómicas (crédito y débito)
- [ ] Cálculo básico del WellScore™ (sin Factor de Demanda dinámico aún — usar factor fijo 1.0)
- [ ] Acreditación automática de WP al finalizar un intercambio
- [ ] Débito de WP al confirmar solicitud de intercambio por WP
- [ ] WP de bienvenida al registrarse (+100 WP)
- [ ] WP por completar perfil y publicar vivienda

**Frontend:**
- [ ] Widget de balance en header/navbar
- [ ] Dashboard básico de WellPoints (balance + últimos 10 movimientos)
- [ ] Preview de WP antes de solicitar intercambio
- [ ] Vista del WellScore™ en perfil de vivienda (desglose básico)

**Endpoints:**
- [ ] `GET /wellpoints/balance`
- [ ] `GET /wellpoints/transactions`
- [ ] `GET /properties/:id/wellscore`
- [ ] `GET /exchanges/:id/wellpoints-preview`

---

### Fase 2 — Confianza y Reputación (semanas 9–16)

**Objetivo:** Añadir el sistema de reputación que diferencia a Wellhouse.

**Backend:**
- [ ] Tabla `hospitality_index` + servicio de cálculo automático
- [ ] Tabla `member_levels` + lógica de subida de nivel automática
- [ ] WP por acciones comunitarias (reseñas, respuesta rápida, referidos)
- [ ] Sistema de penalizaciones y compensaciones por cancelación
- [ ] Caducidad de WP (proceso batch nocturno)
- [ ] Sistema anti-fraude básico (detección de anomalías)

**Frontend:**
- [ ] Índice de Hospitalidad visible en perfil del anfitrión
- [ ] Nivel de miembro + beneficios en perfil
- [ ] Pantalla de caducidad con aviso proactivo
- [ ] WP de compensación con explicación clara al usuario

**Endpoints:**
- [ ] `GET /wellpoints/level`
- [ ] `GET /wellpoints/hospitality-index`
- [ ] `POST /exchanges/:id/cancel` (con lógica de compensación)

---

### Fase 3 — Gamificación (semanas 17–24)

**Objetivo:** Añadir el sistema de misiones, insignias y leaderboard.

**Backend:**
- [ ] Tablas `badges`, `user_badges`, `missions`, `user_missions`
- [ ] Seeder inicial: 12 insignias del catálogo + 8 misiones de onboarding/mensual
- [ ] Worker asíncrono de evaluación de misiones e insignias (Bull + Redis)
- [ ] Tabla `leaderboard_cache` + job de actualización (cada 6 horas)
- [ ] Factor de Demanda dinámico en WellScore™ (integración con datos de búsqueda)

**Frontend:**
- [ ] Pantalla de Misiones con progreso visual
- [ ] Pantalla de Insignias (galería con bloqueadas/desbloqueadas)
- [ ] Modal de celebración al ganar insignia
- [ ] Pantalla de Leaderboard (global + entre amigos)
- [ ] Animaciones de WP ganados (confetti, contador animado)
- [ ] Notificaciones push para misiones completadas e insignias

**Endpoints:**
- [ ] `GET /missions`, `GET /missions/available`, `POST /missions/:id/start`
- [ ] `GET /badges`, `GET /badges/earned`
- [ ] `GET /leaderboards/:type`

---

### Fase 4 — WellScore™ con IA + Transferencias P2P (semanas 25–36)

**Objetivo:** Innovación diferencial con IA y funcionalidades Premium avanzadas.

**Backend:**
- [ ] Modelo ML para Factor de Demanda basado en histórico de búsquedas y temporadas
- [ ] Tabla `wellpoint_transfers` + endpoints de transferencia P2P (solo Premium)
- [ ] Límite mensual de transferencias + validación de fraude en P2P
- [ ] API de recomendación de intercambios compatible con WP disponibles
- [ ] Dashboard de analytics de WP para administradores

**Frontend:**
- [ ] Panel de transferencia P2P en app Premium
- [ ] "Intercambios recomendados con tus WP actuales" en la pantalla de inicio
- [ ] Historial de WellScore™ de tu vivienda (evolución en el tiempo)
- [ ] Tips personalizados con IA para mejorar el IH y el WellScore™

---

## 16. Innovaciones para Fases Futuras

### 16.1 WellPoints y Sostenibilidad

Una de las innovaciones más diferenciadas para el mercado LATAM:

```
WELLHOUSE GREEN PROGRAM:
  → Viviendas con certificación ambiental obtienen +20% en su WellScore™
  → Usuarios que viajan en transporte sostenible (tren, bus) pueden declararlo
    y ganar 50 WP bonus por intercambio
  → Opción de "donar WP" a proyectos de reforestación en Colombia
    (1 WP = 1 árbol plantado, en alianza con ONG local)
  → Badge especial: 🌱 "Viajero Verde"
```

### 16.2 WellPoints Sociales — Intercambios de Grupo

Para grupos de amigos o familias extendidas:

```
WELLPOINTS POOL (V3+):
  → Hasta 5 usuarios pueden crear un "grupo familiar" y agrupar WP
  → Intercambios de grupo: una familia de 3 puede combinar WP para
    pagar una vivienda grande que ninguno podría pagar solo
  → El WP pool tiene su propio saldo, historial y beneficios de grupo
```

### 16.3 WellPoints como Reputación Portátil

```
WELLHOUSE PASSPORT (V3+):
  → El usuario puede exportar su reputación de Wellhouse
    (nivel, IH, badges) como un "Passport" verificable
  → Esto puede servir como referencia de confianza en otras plataformas
    de economía colaborativa (coworkings, car-sharing, etc.)
  → Potencialmente usando credenciales verificables (DID) sin blockchain compleja
```

### 16.4 WellPoints y Partners Externos

```
WELLHOUSE ALLIANCE (largo plazo):
  → Alianza con aerolíneas: WP canjeables por descuentos en vuelos
    (ej: 500 WP = 15% descuento en Avianca/Latam Colombia)
  → Alianza con seguros: niveles altos de WP = descuento en seguro de viaje
  → Alianza con coworkings: WP para acceso a espacios de trabajo durante el intercambio
  
IMPORTANTE: Estas alianzas se implementan DESPUÉS de alcanzar 50,000 usuarios
activos, para tener poder de negociación real con los partners.
```

---

## 17. Consideraciones de Seguridad y Cumplimiento

### 17.1 Integridad del Ledger

```
REGLAS ABSOLUTAS:
  ✅ La tabla wellpoint_transactions es APPEND-ONLY (nunca UPDATE o DELETE)
  ✅ Toda modificación de balance pasa por una transacción de BD atómica
  ✅ El current_balance es siempre recalculable desde el ledger (fuente de verdad)
  ✅ Se hace reconciliación automática diaria (balance == suma del ledger)
  ✅ Cualquier discrepancia genera alerta al equipo de ingeniería
```

### 17.2 Prevención de Fraude

```
CONTROLES EN CAPAS:
  Capa 1 — Validación en tiempo real (al acreditar WP):
    • Verificar que el exchange.status == 'completed' antes de acreditar
    • Verificar que WP no hayan sido acreditados ya para este exchange_id
    • Verificar que el user_id sea efectivamente el host del exchange

  Capa 2 — Detección asíncrona (worker de fraude, cada hora):
    • Usuarios con >1000 WP pero 0 intercambios verificados
    • Patrón: usuario A y usuario B se intercambian WP entre sí ≥3 veces
    • Creación de múltiples cuentas desde misma IP/dispositivo
    • Reseñas recíprocas perfectas sin historial previo

  Capa 3 — Revisión manual:
    • Cualquier alerta de Capa 2 genera ticket en panel de admin
    • Equipo de Trust & Safety revisa en <24 horas
    • Puede congelar WP pendientes o hacer rollback de transacciones
      (el rollback es una transacción compensatoria, no un DELETE)
```

### 17.3 Cumplimiento y Regulación

```
IMPORTANTE — LOS WP NO SON DINERO:
  Los WellPoints NO son:
  ❌ Una moneda virtual con valor monetario
  ❌ Canjeables por dinero real
  ❌ Transferibles por dinero real (ni compra ni venta)
  ❌ Un activo financiero regulado

  Los WellPoints SÍ son:
  ✅ Un sistema de crédito interno de la plataforma
  ✅ Similar a "millas" de aerolíneas (sin valor monetario declarado)
  ✅ Sujetos a las Términos y Condiciones de Wellhouse
  ✅ Que pueden ser modificados o descontinuados por Wellhouse
     previo aviso de 90 días

GDPR / Ley de Habeas Data Colombia:
  → Todos los datos de transacciones son datos personales
  → El usuario puede solicitar exportación de su historial
  → Al eliminar cuenta: datos de transacciones se anonomizan,
    no se eliminan (por integridad del ledger comunitario)
```

### 17.4 Comunicación Transparente al Usuario

```
El sistema SIEMPRE debe comunicar:
  → Cuántos WP ganará ANTES de confirmar que hospedará (preview)
  → Cuántos WP gastará ANTES de confirmar una solicitud (preview)
  → Por qué su WellScore™ es el que es (desglose visible)
  → Cuándo caducan sus WP (con múltiples avisos)
  → Cualquier penalización ANTES de cancelar (aviso con cálculo)

"Si el usuario entiende el sistema, lo usará.
 Si no lo entiende, lo rechazará."
```

---

## Apéndice A — Resumen de Valores de WP

| Acción | WP |
|---|---|
| **GANAN WP** | |
| Registro (bienvenida) | +100 |
| Perfil al 100% | +150 |
| Email verificado | +25 |
| Teléfono verificado | +25 |
| Identidad verificada (Nivel 2) | +200 |
| Primera vivienda publicada | +200 |
| Vivienda al 100% | +100 |
| Primera activación Premium | +300 |
| Renovación Premium | +150 |
| Hosting (por noche) | `WellScore™ × IH × nivel` |
| Reseña escrita (>80 palabras) | +30 |
| Respuesta <12h | +10 |
| Calendario activo 30 días | +50 |
| Referido completa perfil | +100 |
| Referido completa intercambio | +150 |
| Misiones (varía) | +40 a +400 |
| Insignias (varía) | +100 a +800 |
| Compensación por cancelación del anfitrión | +50 a +400 |
| **GASTAN WP** | |
| Intercambio por WellPoints | `WellScore™ × noches` |
| Chat previo a solicitud (Free) | -10 |
| Boost de visibilidad (1 semana) | -100 |
| Acceso lista de espera exclusiva | -200 |
| Transferencia a otro usuario (Premium) | El monto |
| **PENALIZACIONES** | |
| Cancelar con <7 días | -100 |
| Cancelar con <72 horas | -200 |
| Fraude confirmado | Hasta -100% del saldo |

---

## Apéndice B — Checklist de Implementación

```
FASE 1 — MVP
  □ Crear tablas en migración limpia con rollback
  □ Servicio atómico de crédito/débito de WP
  □ Cálculo de WellScore™ v1 (sin demanda dinámica)
  □ Trigger de acreditación al finalizar exchange
  □ WP de bienvenida en flow de registro
  □ Widget de balance en UI
  □ Dashboard básico de WellPoints
  □ Preview de WP en pantalla de solicitud
  □ Tests unitarios del servicio de transacciones (cobertura >90%)
  □ Tests de integración del flujo completo exchange → WP

FASE 2 — REPUTACIÓN
  □ Tabla hospitality_index + cálculo automático post-exchange
  □ Tabla member_levels + evaluación automática
  □ WP por acciones comunitarias (con límites de abuso)
  □ Sistema de compensación/penalización por cancelación
  □ Batch nocturno de caducidad de WP
  □ Monitor de anomalías v1 (reglas básicas)

FASE 3 — GAMIFICACIÓN
  □ Seeder de badges y missions
  □ Worker asíncrono de evaluación (Bull + Redis)
  □ Sistema de leaderboard con cache
  □ Factor de demanda dinámica en WellScore™
  □ Animaciones en mobile (confetti, roll-up counter)
  □ Notificaciones push para WP, misiones e insignias

FASE 4 — IA Y PREMIUM
  □ Modelo ML para Factor de Demanda
  □ Transferencias P2P con validación de fraude
  □ Recomendaciones de intercambio por WP disponibles
  □ Dashboard de analytics para admin
```

---

*Este documento es la guía técnica definitiva para el sistema WellPoints de Wellhouse.*
*Toda decisión de implementación que contradiga este documento debe ser discutida*
*con el equipo de producto antes de ejecutarse.*

**Wellhouse — Intercambia tu hogar, vive el mundo 🌍**
