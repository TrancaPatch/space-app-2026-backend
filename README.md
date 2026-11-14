# SpaceAppsPOC - Backend Service

Servidor NestJS para la plataforma médica espacial de SpaceAppsPOC.

## Características de la Fase 1
* **NestJS 11 + TypeScript** con arquitectura modular.
* **OpenAPI / Swagger** integrado en `/docs`.
* **CORS habilitado** para Vite React (`http://localhost:5173`).
* **Prefijo global `/api`** para endpoints REST.
* **Módulos base de eventos (`@nestjs/event-emitter`, `@nestjs/cqrs`)** y configuración (`@nestjs/config`).

## Instalación y Ejecución

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar en modo desarrollo
pnpm start:dev

# 3. Acceder a Swagger
http://localhost:3000/docs
```
