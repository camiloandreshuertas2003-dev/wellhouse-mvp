# Wellhouse: Plan de Ejecución y Stack Técnico

| | |
| :--- | :--- |
| **Proyecto** | Wellhouse Platform |
| **Documento** | Plan de Ejecución y Stack Técnico |
| **Versión** | 1.0 |
| **Fecha** | 27 de junio de 2026 |
| **Estado** | Borrador para Revisión |

---

## Resumen Ejecutivo

Este documento detalla el plan de ejecución estratégico y el stack tecnológico seleccionado para el desarrollo de la plataforma Wellhouse. Derivado del "Plan Maestro del Proyecto", su propósito es proporcionar una hoja de ruta clara para el equipo de desarrollo y los stakeholders, asegurando la alineación en cuanto a plazos, entregables y arquitectura técnica.

El plan está diseñado para entregar un Producto Mínimo Viable (MVP) robusto en un plazo estimado de 10 a 12 meses. La selección tecnológica se centra en un ecosistema moderno, escalable y de alta productividad que permitirá a Wellhouse posicionarse como líder en el mercado de intercambio de viviendas.

---

## 1. Stack Técnico

La arquitectura de Wellhouse se fundamentará en un conjunto de tecnologías modernas, seleccionadas por su robustez, escalabilidad, y el excelente ecosistema de desarrollo que ofrecen. Esta selección busca maximizar la productividad del equipo, facilitar el mantenimiento a largo plazo y garantizar una experiencia de usuario de primer nivel.

A continuación, se detalla el stack por cada capa del sistema:

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Frontend Web** | Next.js 14 (React 18) | Renderizado en servidor (SSR) para optimización SEO, App Router para enrutamiento moderno, Regeneración Estática Incremental (ISR), y un rendimiento excepcional. |
| **Estilos Web** | Tailwind CSS + shadcn/ui | Acelera el desarrollo mediante un sistema de utilidades, garantiza consistencia visual y provee componentes accesibles y personalizables. |
| **App Móvil** | React Native + Expo | Permite compartir una base de código única para iOS y Android, con acceso a APIs nativas y actualizaciones Over-The-Air (OTA) a través de Expo. |
| **Backend API** | NestJS (Node.js + TypeScript) | Su arquitectura modular, basada en decoradores e inyección de dependencias, es ideal para construir microservicios mantenibles y fuertemente tipados. |
| **ORM** | Prisma ORM | Proporciona una capa de acceso a datos segura en tipos (type-safe), con migraciones automáticas y una experiencia de desarrollador (DX) superior. |
| **Base de datos principal** | PostgreSQL 15 | Reconocido por su robustez relacional, soporte avanzado de JSON, capacidades geoespaciales (PostGIS) y escalabilidad probada en producción. |
| **Caché** | Redis 7 | Sistema de alto rendimiento para gestión de sesiones, limitación de tasa (rate limiting), mensajería pub/sub para chat y caché de consultas. |
| **Búsqueda** | Elasticsearch 8 | Motor de búsqueda potente para consultas full-text, filtros complejos y búsquedas geoespaciales, garantizando alta performance. |
| **Autenticación** | Auth0 + JWT | Solución gestionada para OAuth2/OIDC, manejo de sesiones y autenticación de dos factores (2FA), reduciendo la complejidad de implementación. |
| **Almacenamiento media** | AWS S3 + CloudFront CDN | Ofrece almacenamiento de objetos de escalabilidad virtualmente infinita y una red de entrega de contenido (CDN) global para baja latencia. |
| **Procesamiento imágenes** | Sharp (Node.js) | Librería de alto rendimiento para el procesamiento de imágenes en el servidor (redimensionamiento, compresión, conversión a WebP). |
| **Chat en tiempo real** | Socket.io (WebSockets) | Framework robusto para comunicación bidireccional en tiempo real, con fallback a long-polling y escalabilidad mediante Redis Pub/Sub. |
| **Cola de mensajes** | Bull + Redis / AWS SQS | Facilita el procesamiento asíncrono de tareas en segundo plano como envío de emails, notificaciones y moderación de contenido. |
| **Notificaciones push** | Firebase Cloud Messaging | Servicio confiable y multiplataforma (iOS/Android) para la entrega de notificaciones push, gratuito hasta una escala considerable. |
| **Email transaccional** | Resend + React Email | API moderna para el envío de correos, permitiendo la creación de plantillas con componentes de React para una mejor experiencia de desarrollo. |
| **SMS / 2FA** | Twilio | Plataforma líder en comunicaciones con APIs robustas para el envío de SMS y la implementación de verificación en dos pasos. |
| **Mapas y geocoding** | Mapbox | Alternativa personalizable y costo-efectiva a Google Maps a gran escala, con soporte para tiles vectoriales de alto rendimiento. |
| **Pagos** | Stripe | Estándar de la industria para el procesamiento de pagos, gestión de suscripciones y cumplimiento de la normativa PCI DSS. |
| **Verificación de identidad** | Veriff | Servicio automatizado para procesos de "Conoce a tu Cliente" (KYC), incluyendo verificación de documentos y pruebas de vida (liveness check). |
| **IA / ML** | OpenAI GPT-4o API | Integración de capacidades de inteligencia artificial para recomendaciones personalizadas, resúmenes de reseñas y moderación de contenido. |
| **Nube principal** | AWS (Amazon Web Services) | Ecosistema de nube líder que ofrece un portafolio completo de servicios, presencia global y acuerdos de nivel de servicio (SLAs) robustos. |
| **Contenedores** | Docker + Kubernetes (EKS) | Estandarización del entorno de desarrollo y producción, facilitando la portabilidad, el escalado automático y la orquestación de microservicios. |
| **CI/CD** | GitHub Actions | Automatización de los flujos de integración y despliegue continuo (CI/CD) directamente desde el repositorio de código. |
| **Monitoreo** | Datadog + Sentry | Soluciones para el monitoreo del rendimiento de aplicaciones (APM), centralización de logs, alertas y seguimiento de errores en tiempo real. |
| **Analytics** | Mixpanel + Google Analytics 4 | Herramientas para el análisis del comportamiento del usuario, seguimiento de eventos de producto, funnels de conversión y análisis de cohortes. |
| **Internacionalización** | next-intl / i18next | Librerías para la gestión de traducciones (i18n), pluralización y formato de fechas/monedas en múltiples idiomas. |

---

## 2. Plan de Ejecución (Roadmap)

El desarrollo del proyecto se ha estructurado en fases secuenciales para garantizar un progreso medible, la validación continua del producto y la entrega de valor en cada etapa. El objetivo es lanzar un MVP en un periodo de 10 a 12 meses, seguido de un ciclo de mejoras continuas basadas en datos y feedback de los usuarios.

- **Tiempo total estimado para lanzamiento MVP:** 10–12 meses
- **Equipo mínimo recomendado:** 2 Desarrolladores Backend, 2 Desarrolladores Frontend, 1 Desarrollador Móvil, 1 Diseñador UX/UI, 1 Ingeniero de QA, 1 Ingeniero DevOps/Cloud, 1 Product Manager.

|El cronograma detallado es el siguiente:

| Fase | Duración | Actividades Clave | Entregable Principal |
| :--- | :--- | :--- | :--- |
| **1. Investigación y Estrategia** | 4 semanas | Análisis competitivo, entrevistas con usuarios potenciales, definición de arquetipos (personas), validación del mercado hispano. | Informe de investigación con insights de usuario. |
| **2. Diseño de Experiencia (UX/UI)** | 6 semanas | Arquitectura de la información, wireframing, prototipado interactivo de alta fidelidad (Figma), pruebas de usabilidad y creación del Design System. | Prototipos validados y Design System completo. |
| **3. Arquitectura y Setup** | 3 semanas | Diseño de la arquitectura de microservicios, modelado de la base de datos, configuración de la infraestructura como código (IaC), y pipeline de CI/CD. | Diagramas de arquitectura y repositorios configurados. |
| **4. Desarrollo del Backend** | 12 semanas | Implementación de los servicios de autenticación, usuarios, propiedades, intercambios, mensajería, búsqueda y la API de administración. | API REST documentada bajo el estándar OpenAPI. |
| **5. Desarrollo del Frontend Web** | 10 semanas | Implementación de la aplicación web con Next.js, cubriendo todas las pantallas definidas, integración con la API y soporte de internacionalización (i18n). | Aplicación web funcional y responsive. |
| **6. Desarrollo de App Móvil** | 12 semanas | Implementación de las aplicaciones nativas para iOS y Android con React Native, incluyendo notificaciones push y acceso a funcionalidades del dispositivo. | Aplicaciones listas para publicación en App Store y Google Play. |
| **7. Aseguramiento de la Calidad (QA)** | 4 semanas | Ejecución de tests unitarios (>80% de cobertura), de integración, y End-to-End (E2E). Realización de pruebas de carga y de penetración. | Informe de QA y resolución de vulnerabilidades. |
| **8. Beta Privada** | 4 semanas | Lanzamiento controlado para un grupo de 100-500 usuarios. Recopilación de feedback, corrección de errores críticos y ajustes de UX. | Informe de feedback y lista de correcciones. |
| **9. Beta Pública** | 4 semanas | Apertura gradual a través de una lista de espera. Monitoreo intensivo del rendimiento y la estabilidad. Soporte activo a los primeros usuarios. | Métricas de activación y tasa de conversión inicial. |
| **10. Lanzamiento Oficial** | 2 semanas | Comunicado de prensa, ejecución de campañas de adquisición de usuarios, lanzamiento en plataformas como Product Hunt y optimización SEO. | Objetivo: 10,000 usuarios registrados post-lanzamiento. |
| **11. Mejora Continua** | Continuo | Ciclos de desarrollo en sprints de 2 semanas, con priorización de funcionalidades basada en datos y feedback de la comunidad. | Nuevas versiones con mejoras incrementales. |