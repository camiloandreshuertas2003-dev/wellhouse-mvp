# Wellhouse: Plan de Ejecución y Stack Técnico

Este documento contiene la consolidación del **Stack Técnico** y el **Plan de Ejecución** (Roadmap de Desarrollo) para el proyecto Wellhouse, estructurado y extraído a partir del documento maestro [Wellhouse_Plan_Maestro.md](file:///c:/Users/camil/OneDrive/Desktop/CURSOAI%20para%20Developers/CLASE3/Wellhouse_Plan_Maestro.md).

---

## 1. Stack Técnico (Tecnologías Recomendadas)

El sistema de Wellhouse se ha estructurado utilizando tecnologías modernas, optimizadas para alta escalabilidad, modularidad y excelente experiencia de desarrollo (DX). A continuación se detalla la propuesta tecnológica por cada capa de software e infraestructura:

| Capa / Componente | Tecnología | Justificación y Detalles |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 14 (React 18) | SSR (Server-Side Rendering) para optimización SEO, App Router, ISR (Incremental Static Regeneration) y excelente rendimiento general. |
| **Estilos Web** | Tailwind CSS + shadcn/ui | Velocidad acelerada de desarrollo, consistencia visual, componentes de UI altamente accesibles. |
| **App Móvil** | React Native + Expo | Base de código única compartida para iOS y Android, acceso a APIs nativas y soporte para actualizaciones Over-The-Air (OTA) vía Expo. |
| **Backend API** | NestJS (Node.js + TypeScript) | Arquitectura modular, soporte de decoradores, inyección de dependencias (DI) nativa, excelente para microservicios y tipado robusto. |
| **ORM** | Prisma ORM | Acceso de base de datos type-safe, migraciones automatizadas y excelente DX (Developer Experience). |
| **Base de Datos Principal** | PostgreSQL 15 | Robustez relacional para datos estructurados principales, soporte nativo JSON y PostGIS para geolocalización. |
| **Caché** | Redis 7 | Almacenamiento rápido en memoria para sesiones de usuario, rate limiting, pub/sub para mensajería y caché de consultas frecuentes. |
| **Búsqueda** | Elasticsearch 8 | Motor de búsqueda de alto rendimiento para filtros complejos, queries geoespaciales y búsqueda full-text. |
| **Autenticación** | Auth0 + JWT | Implementación segura de OAuth2/OIDC, gestión robusta de sesiones y 2FA integrado. |
| **Almacenamiento Media** | AWS S3 + CloudFront CDN | Almacenamiento elástico e ilimitado para multimedia (fotos de perfiles y viviendas) entregado globalmente con baja latencia. |
| **Procesamiento de Imágenes** | Sharp (Node.js) | Compresión, redimensionamiento rápido y conversión eficiente a formato WebP del lado del servidor. |
| **Chat en Tiempo Real** | Socket.io (WebSockets) | Comunicación bidireccional estable, fallback inteligente a long-polling y compatibilidad con Redis Pub/Sub. |
| **Cola de Mensajes** | Bull + Redis / AWS SQS | Procesamiento asíncrono de tareas pesadas en segundo plano (emails, notificaciones push, moderación). |
| **Notificaciones Push** | Firebase Cloud Messaging | Soporte multiplataforma confiable (iOS + Android) y gratuito a gran escala. |
| **Email Transaccional** | Resend + React Email | API moderna para envío de correos, maquetación usando componentes React y excelente DX. |
| **SMS / 2FA** | Twilio | Cobertura global robusta y APIs estables para verificación por SMS y segundo factor. |
| **Mapas y Geocoding** | Mapbox | Alternativa costo-efectiva a Google Maps, personalización avanzada y tiles vectoriales interactivos. |
| **Pagos** | Stripe | Estándar de la industria, suscripciones recurrentes, procesamiento de pagos y cumplimiento PCI DSS. |
| **Verificación de Identidad** | Veriff | KYC automatizado, liveness check y reconocimiento global de documentos oficiales. |
| **IA / ML** | OpenAI GPT-4o API | Motor inteligente para recomendaciones, resúmenes de calificaciones y reseñas de viviendas, y soporte interactivo. |
| **Nube Principal** | AWS (Amazon Web Services) | Ecosistema cloud dominante, infraestructura altamente disponible con SLAs robustos. |
| **Contenedores** | Docker + Kubernetes (EKS) | Portabilidad total de servicios, auto-escalado horizontal y orquestación avanzada de microservicios. |
| **CI/CD** | GitHub Actions | Integración y despliegue continuo integrado directamente con el repositorio. |
| **Monitoreo** | Datadog + Sentry | Observabilidad completa (APM), logs centralizados y rastreo de excepciones en producción. |
| **Analytics** | Mixpanel + Google Analytics 4 | Métricas detalladas del comportamiento del usuario y embudos (funnels) de conversión. |
| **Internacionalización** | next-intl / i18next | Librerías robustas para manejo de traducciones, internacionalización (i18n), formatos de fechas y monedas. |

---

## 2. Plan de Ejecución (Roadmap del MVP)

El plan de ejecución contempla las fases secuenciales necesarias para el diseño, desarrollo, pruebas y lanzamiento del **Producto Mínimo Viable (MVP)** en un plazo estimado de **10 a 12 meses**.

*   **Equipo Mínimo Recomendado:**
    *   2 Desarrolladores Backend (Node.js / NestJS)
    *   2 Desarrolladores Frontend (React / Next.js)
    *   1 Desarrollador Móvil (React Native / Expo)
    *   1 Diseñador UX/UI
    *   1 Ingeniero de QA
    *   1 Ingeniero de DevOps/Cloud
    *   1 Product Manager

### Cronograma de Fases y Entregables

| Fase | Duración | Actividades Clave | Entregable Principal |
| :--- | :--- | :--- | :--- |
| **1. Investigación** | 4 semanas | Benchmark profundo de competidores, entrevistas cualitativas con usuarios potenciales, análisis del mercado hispanohablante y definición de "user personas". | **Reporte de Investigación de Mercado e Insights de Usuario** |
| **2. Diseño UX/UI** | 6 semanas | Definición de arquitectura de la información, diseño de wireframes, creación del prototipo interactivo (Figma), pruebas de usabilidad iterativas y setup del Design System. | **Figma Design System y Prototipos UI Validados** |
| **3. Arquitectura** | 3 semanas | Detalle de límites de microservicios, modelado conceptual y lógico de base de datos relacional, configuración inicial de infraestructura como código (Terraform) y pipelines de CI/CD. | **Diagramas Arquitectónicos e Infraestructura Base (IaC)** |
| **4. Backend** | 12 semanas | Desarrollo de servicios CORE: Auth service, User Service, Property Service, Exchange Service, Messaging/Chat, Search Service y API administrativa básica. | **API REST Documentada (OpenAPI / Swagger)** |
| **5. Frontend Web** | 10 semanas | Implementación responsive en Next.js 14, desarrollo de pantallas del MVP, integración con la API REST principal y soporte multiidioma (i18n ES/EN). | **Web App Funcional y Responsive (PWA)** |
| **6. App Móvil** | 12 semanas | Implementación nativa híbrida con React Native/Expo, layouts nativos para iOS y Android, notificaciones push nativas y accesos de hardware (cámara/galería). | **Apps Compiladas y Publicadas en App Store & Play Store** |
| **7. Testing** | 4 semanas | Implementación de pruebas unitarias (>80% de cobertura de código), pruebas integradas de API, tests End-to-End (Playwright y Detox), auditoría de seguridad y pruebas de carga. | **Informe de QA, Cobertura de Código y Correcciones de Seguridad** |
| **8. Beta Privada** | 4 semanas | Despliegue inicial para un grupo cerrado de 100–500 usuarios invitados, canalización de feedback continuo, resolución de bugs de alta prioridad y ajustes ergonómicos de UX. | **Reporte de Feedback de Beta Privada y Lista de Parches Críticos** |
| **9. Beta Pública** | 4 semanas | Apertura progresiva mediante lista de espera (waitlist), monitorización intensiva en producción (APM), optimización de rendimiento en vivo y soporte al usuario. | **Métricas de Activación de Usuarios y Embudos de Conversión** |
| **10. Lanzamiento** | 2 semanas | Campañas de marketing de adquisición, publicación de notas de prensa, lanzamiento en ProductHunt, posicionamiento SEO y convenios de lanzamiento. | **Objetivo de Tracción: 10,000 usuarios registrados en los primeros 30 días** |
| **11. Mejora Continua** | Continuo | Ciclos ágiles (Sprints de 2 semanas), priorización en base a analytics y comportamiento del usuario real, y despliegues constantes. | **Releases Quincenales con Mejoras Incrementales** |
