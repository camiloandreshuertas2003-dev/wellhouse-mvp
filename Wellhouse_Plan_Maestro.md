PHPWord
* {font-family: Arial; font-size: 10pt;}
a.NoteRef {text-decoration: none;}
hr {height: 1px; padding: 0; margin: 1em 0; border: 0; border-top: 1px solid #CCC;}
table {border: 1px solid black; border-spacing: 0px; width : 100%;}
td {border: 1px solid black;}
.Title {font-size: 28pt;}
h1 {font-size: 16pt; color: #2E74B5;}
h2 {font-size: 13pt; color: #2E74B5;}
h3 {font-size: 12pt; color: #1F4D78;}
h4 {color: #2E74B5; font-style: italic;}
h5 {color: #2E74B5;}
h6 {color: #1F4D78;}
.Strong {font-weight: bold;}
.Hyperlink {color: #0563C1; text-decoration: underline ;}
.footnote reference {vertical-align: super;}
.footnote text {font-size: 10pt;}
.Footnote Text Char {font-size: 10pt;}
.endnote reference {vertical-align: super;}
.endnote text {font-size: 10pt;}
.Endnote Text Char {font-size: 10pt;}
WELLHOUSE

Plataforma de Intercambio de Viviendas

PLAN MAESTRO DEL PROYECTO

Documento de Arquitectura, Diseño y Estrategia

Versión 1.0 | 2025

Confidencial — Solo uso interno

1. VISIÓN GENERAL DEL PROYECTO
==============================

1.1 Objetivo
------------

Wellhouse es una plataforma digital (web y móvil) que permite a propietarios e inquilinos de viviendas en todo el mundo intercambiar sus hogares de forma temporal, gratuita o mediante un sistema de puntos, con el objetivo de democratizar los viajes y el turismo colaborativo.

El objetivo central es construir la comunidad más confiable y moderna de intercambio de viviendas del mundo hispanohablante, con proyección global.

1.2 Problema que Resuelve
-------------------------

El alojamiento representa entre el 30% y el 50% del presupuesto de un viaje. Las alternativas actuales presentan fricciones importantes:

1.3 Propuesta de Valor
----------------------

Viajar gratis alojándote en hogares reales, intercambiando tu vivienda con personas verificadas de todo el mundo — con la confianza de una red colaborativa y la tecnología de una plataforma moderna.

Los pilares de valor de Wellhouse son:

1.4 Público Objetivo
--------------------

Segmento

Descripción

Motivación

Viajeros frecuentes

25–55 años, viven en ciudades, viajan 2+ veces al año

Reducir costos de alojamiento

Familias

Familias con hijos que necesitan espacios amplios

Imposible costear hotel para 4+ personas

Nómadas digitales

Trabajan en remoto, buscan estadías largas

Hogar completo con cocina y Wi-Fi

Jubilados activos

+55 años con tiempo libre y vivienda propia

Viajar sin gastar ahorros

Propietarios con segunda residencia

Tienen propiedad vacacional desocupada

Rentabilizar sin alquiler monetario

Comunidad creativa

Artistas, diseñadores, arquitectos

Vivir en hogares con identidad

1.5 Diferenciadores Frente a HomeExchange y Airbnb
--------------------------------------------------

Característica

Airbnb

HomeExchange

WELLHOUSE

Modelo económico

Pago por noche

Membresía anual

Freemium + WellPoints

Costo promedio usuario

USD 80–200/noche

USD 200/año

USD 0–9.99/mes

Intercambio sin dinero

No

Sí (solo miembros)

Sí (todos)

Sistema de puntos flexible

No

GuestPoints limitado

WellPoints avanzado

Verificación de identidad

Básica

Media

Robusta (3 niveles)

Enfoque hispanohablante

No

No

Sí (prioritario)

UX moderna (2024+)

Alta

Baja

Alta (diseño nativo)

Chat en tiempo real

Sí

Básico

Sí (WebSockets)

IA para recomendaciones

Sí

No

Sí

Comunidad y perfil humano

Bajo

Medio

Alto

App móvil nativa

Sí

Parcial

Sí (iOS + Android)

2. ARQUITECTURA GENERAL DEL SISTEMA
===================================

2.1 Visión Arquitectónica
-------------------------

Wellhouse se construye sobre una arquitectura de microservicios desacoplados, con una API RESTful centralizada y capacidad de escalar horizontalmente cada componente de forma independiente.

Arquitectura: Microservicios → API Gateway → Clientes (Web / App iOS / App Android) Capa de datos: PostgreSQL (relacional) + Redis (caché) + Elasticsearch (búsqueda) + S3 (media) Capa de infraestructura: AWS/GCP + CDN + Load Balancer + Auto Scaling Groups

2.2 Componentes Principales
---------------------------

Componente

Tecnología

Función

Frontend Web

Next.js 14 (React)

Interfaz web SSR/CSR, SEO optimizado

App iOS

React Native / Expo

Aplicación móvil nativa iOS

App Android

React Native / Expo

Aplicación móvil nativa Android

API Gateway

Node.js + Express / NestJS

Punto único de entrada, autenticación, rate limiting

Auth Service

JWT + OAuth2 + Auth0

Registro, login, sesiones, 2FA

User Service

Node.js / NestJS

Gestión de perfiles, verificaciones

Property Service

Node.js / NestJS

CRUD viviendas, fotos, calendario

Exchange Service

Node.js / NestJS

Solicitudes, intercambios, WellPoints

Messaging Service

Node.js + Socket.io

Chat en tiempo real, notificaciones

Search Service

Elasticsearch + Node.js

Búsqueda avanzada, filtros, mapa

Notification Service

Node.js + Firebase/OneSignal

Push, email, SMS

Payment Service

Stripe + Node.js

Suscripciones premium, WellPoints

Media Service

Node.js + AWS S3 + CloudFront

Subida, procesamiento y entrega de imágenes

Admin Panel

React + Next.js (interno)

Gestión completa de la plataforma

Base de datos principal

PostgreSQL 15

Datos relacionales principales

Caché

Redis 7

Sesiones, caché de búsquedas frecuentes

Búsqueda

Elasticsearch 8

Búsqueda fulltext, geoespacial

Cola de mensajes

RabbitMQ / AWS SQS

Procesamiento asíncrono de tareas

Monitoreo

Datadog / Sentry

Logs, errores, APM

2.3 Relación entre Web, App y Backend
-------------------------------------

Tanto la aplicación web (Next.js) como las aplicaciones móviles (React Native) consumen exactamente la misma API REST. Esto garantiza consistencia de datos y facilita el mantenimiento.

2.4 Panel Administrativo
------------------------

El panel administrativo es una aplicación web independiente (misma API, permisos diferenciados) accesible solo desde IPs autorizadas y con autenticación 2FA obligatoria. Incluye dashboards, gestión de usuarios, moderación de contenido, reportes y configuración global.

2.5 Diagrama Conceptual de Arquitectura
---------------------------------------

CLIENTES ├── Web App (Next.js) → HTTPS ├── iOS App (React Native) → HTTPS └── Android App (React Native) → HTTPS │ ▼ \[API GATEWAY + Load Balancer\] Auth · Rate Limiting · Logging │ ┌─────┴──────┬──────────┬──────────┬──────────┐ ▼ ▼ ▼ ▼ ▼ User Svc Property Exchange Messaging Search Svc Svc Svc Svc (Elastic) │ │ │ │ └─────┬──────┘ │ Socket.io ▼ ▼ (WebSocket) PostgreSQL Redis (Principal) (Caché/Pub-Sub) │ Elasticsearch (Búsqueda geo) │ AWS S3 + CloudFront (Media/Imágenes) │ Stripe · Firebase · SendGrid · Twilio (Servicios externos)

2.6 Servicios Externos Integrados
---------------------------------

Servicio

Proveedor

Uso

Autenticación social

Google, Facebook, Apple OAuth

Login sin contraseña

Email transaccional

SendGrid / Resend

Verificaciones, notificaciones

SMS / 2FA

Twilio

Verificación de teléfono, 2FA

Push notifications

Firebase Cloud Messaging

Notificaciones móviles

Mapas

Mapbox / Google Maps

Mapa interactivo, geocoding

Pagos

Stripe

Suscripciones, cargos premium

Almacenamiento media

AWS S3 + CloudFront

Fotos de viviendas/usuarios

Verificación de identidad

Persona / Onfido / Veriff

KYC, verificación de documentos

IA / Recomendaciones

OpenAI API / AWS Bedrock

Sugerencias, resumen de reseñas

Traducción

DeepL API / Google Translate

Plataforma multiidioma

Analytics

Mixpanel + GA4

Comportamiento de usuarios

Monitoreo

Datadog + Sentry

APM, errores, logs

CDN

AWS CloudFront / Cloudflare

Rendimiento global

3. MÓDULOS PRINCIPALES
======================

3.1 Módulo de Registro e Inicio de Sesión
-----------------------------------------

Punto de entrada a la plataforma. Debe ser fluido, seguro y con múltiples métodos de autenticación.

### Funcionalidades:

3.2 Módulo de Perfil de Usuario
-------------------------------

El perfil es el corazón de la confianza en Wellhouse. Debe transmitir autenticidad y generar seguridad.

### Datos del perfil:

### Badges y verificaciones visibles:

3.3 Módulo de Perfil de Vivienda
--------------------------------

Cada usuario puede tener una o más viviendas. La ficha de vivienda es fundamental para la decisión de intercambio.

### Datos de la vivienda:

3.4 Módulo de Sistema de Fotografías
------------------------------------

3.5 Módulo de Calendario de Disponibilidad
------------------------------------------

3.6 Módulo de Búsqueda Avanzada
-------------------------------

### Filtros disponibles:

### Características de búsqueda:

3.7 Módulo de Mapa Interactivo
------------------------------

3.8 Módulo de Sistema de Intercambio
------------------------------------

### 3.8.1 Tipos de intercambio:

### 3.8.2 Sistema de WellPoints:

### 3.8.3 Flujo de solicitud de intercambio:

3.9 Módulo de Mensajería y Chat
-------------------------------

3.10 Módulo de Notificaciones
-----------------------------

### Tipos de notificaciones:

3.11 Módulo de Favoritos
------------------------

3.12 Módulo de Historial
------------------------

3.13 Módulo de Reseñas y Calificaciones
---------------------------------------

Las reseñas son el corazón de la confianza. El sistema está inspirado en el modelo de Airbnb pero adaptado para el intercambio.

3.14 Módulo de Reportes y Seguridad Comunitaria
-----------------------------------------------

3.15 Centro de Ayuda
--------------------

3.16 Módulo de Configuración
----------------------------

3.17 Módulo de Verificación de Identidad
----------------------------------------

### Niveles de verificación:

Proveedor recomendado: Veriff o Persona.com para integración automatizada de KYC.

Los usuarios con nivel 3 obtienen badge 'Identidad verificada' y acceso a funciones exclusivas.

3.18 Módulo de Verificación de Vivienda
---------------------------------------

4. FLUJO COMPLETO DEL USUARIO
=============================

Este flujo describe el recorrido de un usuario desde que descubre Wellhouse hasta completar su primer intercambio exitoso.

FASE 1: Descubrimiento y Registro
---------------------------------

FASE 2: Publicación de Vivienda
-------------------------------

FASE 3: Búsqueda y Selección
----------------------------

FASE 4: Solicitud de Intercambio
--------------------------------

FASE 5: Gestión de la Solicitud (Propietario)
---------------------------------------------

FASE 6: Confirmación y Preparación
----------------------------------

FASE 7: El Intercambio
----------------------

FASE 8: Post-intercambio
------------------------

5. ROLES DEL SISTEMA
====================

Rol

Descripción

Permisos Principales

Usuario Free

Miembro registrado con acceso básico

Publicar 1 vivienda, buscar, enviar 3 solicitudes/mes, chatear

Usuario Premium

Miembro con suscripción activa

Ilimitado en solicitudes, WellPoints avanzados, soporte prioritario, verificación nivel 2

Superhost

Usuario con 10+ intercambios exitosos y 4.8+ estrellas

Badge especial, mayor visibilidad, soporte prioritario

Moderador

Staff de Wellhouse que revisa contenido

Moderar fotos/textos, gestionar reportes, suspender temporalmente

Soporte

Agente de atención al cliente

Ver datos de usuario, gestionar tickets, acceder a historial de intercambios

Administrador

Staff senior con acceso total al panel

Todo lo anterior + config del sistema, gestión de roles, analytics, payouts

Super Administrador

CTO / CEO / Director de operaciones

Acceso a configuración crítica, datos financieros, eliminación de cuentas

6. BASE DE DATOS — ENTIDADES PRINCIPALES
========================================

Se utiliza PostgreSQL como base de datos relacional principal. Las entidades se describen conceptualmente con sus relaciones clave.

Entidad

Campos Principales

Relaciones

users

id, email, password\_hash, phone, name, bio, avatar\_url, role, plan, status, created\_at

→ properties, exchanges, reviews, messages, wellpoints\_ledger, verifications

user\_verifications

id, user\_id, type (email/phone/id/address), status, verified\_at, document\_url

→ users

properties

id, user\_id, title, description, type, country, city, lat, lng, capacity, bedrooms, bathrooms, area\_m2, status

→ users, property\_amenities, property\_photos, availability\_blocks, exchanges

property\_amenities

id, property\_id, amenity\_type (wifi/pool/parking/pets/etc.)

→ properties

property\_photos

id, property\_id, url, order, is\_cover, moderation\_status

→ properties

availability\_blocks

id, property\_id, start\_date, end\_date, type (available/blocked/exchange)

→ properties, exchanges

exchanges

id, requester\_id, host\_id, requester\_property\_id, host\_property\_id, start\_date, end\_date, type (simultaneous/points/direct), status, wellpoints\_used, created\_at

→ users, properties, reviews, messages

exchange\_requests

id, exchange\_id, message, status (pending/accepted/rejected/cancelled), responded\_at

→ exchanges

messages

id, exchange\_id, sender\_id, content, type (text/image), read\_at, created\_at

→ exchanges, users

conversations

id, participant\_ids\[\], last\_message\_id, created\_at

→ users, messages

reviews

id, exchange\_id, reviewer\_id, reviewed\_id, property\_id, rating\_overall, rating\_cleanliness, rating\_communication, rating\_accuracy, text, published\_at

→ exchanges, users, properties

wellpoints\_ledger

id, user\_id, amount, type (earned/spent/expired/bonus), reference\_id, reference\_type, created\_at

→ users, exchanges

favorites

id, user\_id, property\_id, list\_id, created\_at

→ users, properties, favorite\_lists

favorite\_lists

id, user\_id, name, is\_shared, share\_token, created\_at

→ users, favorites

notifications

id, user\_id, type, title, body, data\_json, read\_at, sent\_at

→ users

reports

id, reporter\_id, reported\_user\_id, reported\_property\_id, type, description, status, resolved\_at

→ users, properties

support\_tickets

id, user\_id, category, subject, description, status, priority, assigned\_to, created\_at

→ users

subscriptions

id, user\_id, plan, status, stripe\_subscription\_id, current\_period\_start, current\_period\_end

→ users

sessions

id, user\_id, token\_hash, device, ip, created\_at, expires\_at

→ users

audit\_logs

id, user\_id, action, resource\_type, resource\_id, ip, user\_agent, created\_at

→ users

7. FUNCIONALIDADES PARA EL MVP
==============================

El MVP (Minimum Viable Product) incluye las funcionalidades indispensables para lanzar una versión funcional que valide el modelo de negocio con usuarios reales.

7.1 Autenticación y Perfiles
----------------------------

7.2 Búsqueda y Descubrimiento
-----------------------------

7.3 Sistema de Intercambio
--------------------------

7.4 Comunicación
----------------

7.5 Confianza y Seguridad
-------------------------

7.6 Gestión
-----------

7.7 Plataformas
---------------

Área

Incluido en MVP

Excluido del MVP

Auth

Email, Google OAuth, 2FA

Apple ID, Facebook OAuth

Viviendas

1 vivienda por usuario, fotos, calendario

Múltiples viviendas, video tour

Búsqueda

Filtros básicos, lista, mapa

IA de recomendaciones, alertas avanzadas

Intercambio

Simultáneo + WellPoints básico

Intercambio directo peer-to-peer avanzado

Chat

Mensajes de texto

Imágenes en chat, traducción automática

Verificación

Nivel 1 (email + tel)

Nivel 2 y 3 (documentos, video)

Pagos

Suscripción Premium básica (Stripe)

Marketplace de WellPoints

App móvil

Responsive web (PWA)

Apps nativas iOS/Android

Admin

Gestión básica usuarios/propiedades

Analytics avanzados, herramientas de BI

8. FUNCIONALIDADES PARA FUTURAS VERSIONES
=========================================

8.1 Versión 2 (6–12 meses post-lanzamiento)
-------------------------------------------

### Aplicaciones móviles nativas:

### Mejoras de confianza:

### Funcionalidades sociales:

### Búsqueda y descubrimiento:

### Intercambio:

8.2 Versión 3 (12–24 meses)
---------------------------

### Inteligencia Artificial:

### Experiencias y servicios adicionales:

### Internacionalización:

### Monetización:

8.3 Largo Plazo (24+ meses)
---------------------------

9. TECNOLOGÍAS RECOMENDADAS
===========================

Capa

Tecnología

Justificación

Frontend Web

Next.js 14 (React 18)

SSR para SEO, App Router, ISR, excelente rendimiento y ecosistema maduro

Estilos Web

Tailwind CSS + shadcn/ui

Velocidad de desarrollo, consistencia visual, componentes accesibles

App Móvil

React Native + Expo

Código compartido iOS/Android, acceso a APIs nativas, OTA updates con Expo

Backend API

NestJS (Node.js + TypeScript)

Arquitectura modular, decoradores, DI nativa, ideal para microservicios, tipado fuerte

ORM

Prisma ORM

Type-safe, migraciones automáticas, compatible con PostgreSQL, excelente DX

Base de datos principal

PostgreSQL 15

Robustez relacional, soporte JSON, PostGIS para geolocalización, escalabilidad probada

Caché

Redis 7

Sesiones, rate limiting, pub/sub para chat, caché de búsquedas frecuentes

Búsqueda

Elasticsearch 8

Búsqueda fulltext, filtros complejos, queries geoespaciales, alta performance

Autenticación

Auth0 + JWT

OAuth2/OIDC, gestión de sesiones, 2FA integrado, sin fricción de implementación

Almacenamiento media

AWS S3 + CloudFront CDN

Escalabilidad infinita, entrega global rápida, costos bajos, integración con Sharp

Procesamiento imágenes

Sharp (Node.js)

Redimensionamiento, compresión y conversión WebP en servidor de forma eficiente

Chat en tiempo real

Socket.io (WebSockets)

Estable, fallback a long-polling, salas de chat, compatible con Redis Pub/Sub

Cola de mensajes

Bull + Redis / AWS SQS

Procesamiento asíncrono de emails, notificaciones, moderación de imágenes

Notificaciones push

Firebase Cloud Messaging

Soporte iOS + Android, confiable, gratuito hasta escala alta

Email transaccional

Resend + React Email

API moderna, plantillas en React, mejor DX que SendGrid para startups

SMS / 2FA

Twilio

Líder del mercado, APIs robustas, cobertura global, precios competitivos

Mapas y geocoding

Mapbox

Mejor precio que Google Maps a escala, personalización, tiles vectoriales

Pagos

Stripe

Estándar de la industria, suscripciones, webhooks, compliant PCI DSS

Verificación de identidad

Veriff

KYC automatizado, liveness check, cobertura global de documentos

IA / ML

OpenAI GPT-4o API

Recomendaciones, resumen de reseñas, chatbot de soporte, moderación de contenido

Nube principal

AWS (Amazon Web Services)

Ecosistema completo, presencia global, SLAs robustos, integración con todos los servicios

Contenedores

Docker + Kubernetes (EKS)

Portabilidad, escalado automático, gestión de microservicios

CI/CD

GitHub Actions

Integración con repositorio, pipelines de tests, despliegues automáticos

Monitoreo

Datadog + Sentry

APM, logs centralizados, alertas, tracking de errores en producción

Analytics

Mixpanel + Google Analytics 4

Eventos de producto, funnels de conversión, cohortes de usuarios

Internacionalización

next-intl / i18next

Gestión de traducciones, plurales, formateo de fechas y monedas

10. DISEÑO UX/UI — PANTALLAS PRINCIPALES
========================================

Principios de diseño: mobile-first, accesible (WCAG 2.1 AA), minimalista-cálido, velocidad percibida alta, conversacional y confiable.

10.1 Pantallas Web (Desktop y Mobile Responsive)
------------------------------------------------

### Marketing y Onboarding:

### Búsqueda y Descubrimiento:

### Gestión de Usuario:

### Configuración y Seguridad:

### Soporte:

10.2 Pantallas App Móvil (iOS y Android)
----------------------------------------

### Tab Bar Principal:

### Flujos Específicos Mobile:

10.3 Principios de Accesibilidad
--------------------------------

11. PANEL ADMINISTRATIVO
========================

El panel administrativo es una aplicación web interna separada, accesible solo para el equipo de Wellhouse, con autenticación 2FA obligatoria y log de auditoría de cada acción.

11.1 Dashboard General
----------------------

11.2 Gestión de Usuarios
------------------------

11.3 Gestión de Viviendas
-------------------------

11.4 Gestión de Intercambios
----------------------------

11.5 Moderación de Contenido
----------------------------

11.6 Gestión de Soporte
-----------------------

11.7 Sistema de WellPoints
--------------------------

11.8 Analytics y Reportes
-------------------------

11.9 Configuración Global
-------------------------

12. SEGURIDAD
=============

12.1 Protección de Datos y Cumplimiento
---------------------------------------

12.2 Cifrado
------------

12.3 Autenticación y Autorización
---------------------------------

12.4 Prevención de Fraude
-------------------------

12.5 Protección de la Infraestructura
-------------------------------------

12.6 Auditoría
--------------

13. ESCALABILIDAD
=================

Wellhouse se diseña desde el día 1 para soportar desde 1,000 hasta 10 millones de usuarios sin rediseño arquitectónico.

13.1 Escalado Horizontal
------------------------

13.2 Base de Datos
------------------

13.3 Caché y CDN
----------------

13.4 Búsqueda
-------------

13.5 Chat y Tiempo Real
-----------------------

13.6 Estrategia de Crecimiento por Etapas
-----------------------------------------

Etapa

Usuarios

Arquitectura

Lanzamiento

0–10K

1 servidor principal, PostgreSQL single, Redis single, S3

Tracción

10K–100K

Microservicios separados, RDS multi-AZ, Redis Cluster, ElasticSearch

Crecimiento

100K–1M

Kubernetes (EKS), read replicas, ElasticSearch cluster 5 nodos, CDN activo

Escala

1M–10M

Sharding de BD, colas distribuidas, múltiples regiones AWS, ML para recomendaciones

Global

+10M

Multi-región activo-activo, edge computing, arquitectura event-driven completa

14. ROADMAP DE DESARROLLO
=========================

Fase

Duración

Actividades Clave

Entregable

1\. Investigación

4 semanas

Benchmark de competidores, entrevistas con usuarios potenciales, análisis de mercado hispano, definición de personas

Research report, personas, insights de usuario

2\. Diseño UX/UI

6 semanas

Arquitectura de información, wireframes, prototipo interactivo (Figma), pruebas de usabilidad, design system

Figma design system completo, prototipos validados

3\. Arquitectura

3 semanas

Definición de microservicios, modelado de BD, configuración de infraestructura AWS, setup de CI/CD

Diagramas de arquitectura, IaC (Terraform), repos configurados

4\. Backend

12 semanas

Auth service, User/Property/Exchange services, Messaging service, Search service, Admin API

API REST completa documentada (OpenAPI)

5\. Frontend Web

10 semanas

Implementación Next.js, todas las pantallas web, integración con API, i18n ES/EN

Web app funcional y responsive

6\. App Móvil

12 semanas

Implementación React Native, pantallas nativas iOS/Android, notificaciones push, acceso a cámara/galería

Apps publicadas en App Store y Google Play

7\. Testing

4 semanas

Tests unitarios (&gt;80% coverage), tests de integración, E2E (Playwright/Detox), penetration testing, pruebas de carga

Informe de QA, vulnerabilidades resueltas

8\. Beta Privada

4 semanas

Beta con 100–500 usuarios invitados, recogida de feedback, corrección de bugs críticos, ajustes de UX

Lista de bugs corregidos, feedback sintetizado

9\. Beta Pública

4 semanas

Apertura gradual (waitlist), monitoreo intensivo, soporte activo, ajuste de onboarding

Métricas de activación, tasa de conversión

10\. Lanzamiento

2 semanas

Press release, campañas de adquisición, ProductHunt, SEO, partnerships iniciales

10,000 usuarios registrados en 30 días

11\. Mejoras Continuas

Continuo

Sprints de 2 semanas, priorización por datos, iteración sobre feedback de usuarios

Releases quincenales con mejoras incrementales

TIEMPO TOTAL ESTIMADO PARA LANZAMIENTO MVP: 10–12 meses Equipo mínimo recomendado: 2 Backend developers, 2 Frontend developers, 1 Mobile developer, 1 UX/UI designer, 1 QA engineer, 1 DevOps/Cloud, 1 Product Manager

15. LISTA COMPLETA DE FUNCIONALIDADES (CHECKLIST)
=================================================

15.1 Autenticación y Seguridad de Cuenta
----------------------------------------

15.2 Perfil de Usuario
----------------------

15.3 Viviendas
--------------

15.4 Búsqueda y Descubrimiento
------------------------------

15.5 Sistema de Intercambio
---------------------------

15.6 WellPoints
---------------

15.7 Comunicación
-----------------

15.8 Confianza y Comunidad
--------------------------

15.9 Monetización
-----------------

15.10 Admin y Operaciones
-------------------------

Leyenda: funcionalidades sin sangría = MVP | con sangría (nivel 1) = versión 2 o posterior

16. BENCHMARK — ANÁLISIS COMPARATIVO DE COMPETIDORES
====================================================

16.1 Matriz de Comparación de Funcionalidades
---------------------------------------------

Funcionalidad

HomeExchange

Airbnb

Couchsurfing

Kindred

Behomm

WELLHOUSE

Intercambio sin dinero

✅ Sí

❌ No

✅ Sí

✅ Sí

✅ Sí

✅ Sí

Sistema de puntos

✅ GuestPoints

❌ No

❌ No

⚠️ Limitado

❌ No

✅ WellPoints avanzado

Pago por noche

❌ No

✅ Core

❌ No

❌ No

❌ No

❌ No

Membresía anual

✅ USD 220/año

❌ No

✅ USD 2.99/mes

✅ USD 19/mes

✅ EUR 125/año

⚠️ Freemium

App móvil nativa

⚠️ Básica

✅ Excelente

⚠️ Descontinuada

✅ Sí

❌ No

✅ iOS + Android

Verificación de identidad

⚠️ Media

✅ Alta

⚠️ Básica

✅ Alta

⚠️ Media

✅ 3 niveles

Chat en tiempo real

⚠️ Básico

✅ Sí

⚠️ Básico

✅ Sí

❌ Email

✅ WebSockets

Mapa interactivo

✅ Sí

✅ Excelente

❌ No

✅ Sí

❌ No

✅ Avanzado

Búsqueda avanzada

⚠️ Media

✅ Excelente

⚠️ Básica

⚠️ Media

⚠️ Básica

✅ Con IA

Reseñas doble ciega

❌ No

✅ Sí

✅ Sí

✅ Sí

❌ No

✅ Sí

En español

⚠️ Parcial

✅ Sí

⚠️ Parcial

❌ No

❌ No

✅ Nativo

IA / Recomendaciones

❌ No

✅ Sí

❌ No

⚠️ Básico

❌ No

✅ GPT-4o

Modelo freemium

❌ No

❌ No

❌ No

❌ No

❌ No

✅ Sí

Comunidad / Social

⚠️ Básica

⚠️ Básica

✅ Fuerte

⚠️ Media

⚠️ Básica

✅ Objetivo

UX Moderna (2024+)

❌ Anticuada

✅ Excelente

❌ Anticuada

✅ Buena

⚠️ Media

✅ Excelente

Nichos específicos

Familias

Todos

Mochileros

Profesionales

Creativos

Todos + Hispano

Soporte 24/7

⚠️ Limitado

✅ Sí

❌ No

⚠️ Medio

❌ No

✅ Premium

16.2 Análisis por Plataforma
----------------------------

### HomeExchange (2020–presente)

### Airbnb

### Couchsurfing

### Kindred

### Behomm

16.3 Posicionamiento Estratégico de Wellhouse
---------------------------------------------

WELLHOUSE = Lo mejor de cada plataforma + Innovación propia: • De HomeExchange → Sistema de puntos + intercambio no simultáneo • De Airbnb → Estándares de UX + verificación + reseñas doble ciega • De Couchsurfing → Espíritu comunitario + perfil humano • De Kindred → Diseño moderno + verificación como diferenciador • De Behomm → Curaduría de calidad + estética premium + Propio → Freemium accesible + enfoque hispanohablante + IA + WellPoints avanzado

WELLHOUSE

Plan Maestro del Proyecto — Documento Base de Ingeniería

Versión 1.0 · 2025 · Confidencial

Este documento ha sido elaborado como base de trabajo para el equipo de desarrollo de Wellhouse.

Su contenido es confidencial y no debe ser compartido fuera del equipo sin autorización.