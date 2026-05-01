# UFW Control Panel

Panel web para administrar UFW con Angular + Express.

## Estado actual (MVP funcional)
- Login JWT + roles (`admin`, `operator`, `viewer`)
- Dashboard con métricas reales de UFW
- Reglas:
  - listar reglas actuales (`ufw status numbered`)
  - vista previa de comando seguro
  - crear regla validada
  - eliminar por número UFW
- Auditoría de acciones
- Gestión básica de zonas
- Gestión básica de usuarios (admin)

## Requisito clave para ver/aplicar reglas reales del host
El backend necesita ejecutar `ufw` con permisos del sistema.
Si no configuras sudoers, verás advertencias como `sudo: a password is required` y no se podrán listar/crear reglas reales.

### Sudoers recomendado
Ejecuta `visudo` y agrega una regla mínima para el usuario que ejecuta Node:

```text
nodeufw ALL=(root) NOPASSWD: /usr/sbin/ufw
```

Recomendación fuerte: crear un wrapper seguro y permitir solo ese binario en sudoers.

## Estructura
- `backend/` API REST segura
- `frontend/` SPA Angular

## Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed:admin
npm run dev
```

## Frontend
```bash
cd frontend
npm install
npm start
```

## URLs (dev actual)
- Frontend: `http://localhost:4600`
- Backend: `http://localhost:4000`

## Credenciales iniciales
- `admin@local`
- `Admin123!`

## API principal
- `POST /api/auth/login`
- `GET /api/dashboard/summary`
- `GET /api/firewall/status`
- `POST /api/firewall/enable`
- `POST /api/firewall/disable`
- `POST /api/firewall/reload`
- `GET /api/rules`
- `POST /api/rules/preview`
- `POST /api/rules`
- `DELETE /api/rules/:ufwNumber`
- `GET /api/audit`
- `GET /api/zones`
- `POST /api/zones`
- `GET /api/users`

## Pendiente para versión completa
- Edición avanzada de reglas existentes
- Import/Export JSON de reglas
- Mapa visual de zonas con drag-and-drop
- Settings avanzados y políticas default UFW
- Docker compose de desarrollo con guía de limitaciones UFW en contenedores

## Reglas por interfaz de red

La vista de reglas ahora consulta interfaces desde:
- `GET /api/firewall/interfaces`

En el formulario puedes seleccionar:
- `direction`: `in` / `out`
- `interfaceName`: por ejemplo `eth0`

Ejemplo de comando generado:

```bash
ufw allow in on eth0 from 192.168.1.50 to any port 22 proto tcp
```

## Laboratorio Ubuntu para pruebas de UFW

Se agregó un laboratorio en contenedor:
- `infra/docker-compose.ufw-lab.yml`
- `infra/ufw-lab/Dockerfile`
- `infra/ufw-lab/README.md`

Levantar:

```bash
cd infra
docker compose -f docker-compose.ufw-lab.yml up -d --build
```

## Ejecutar Todo En Docker (recomendado en WSL)

Esto evita depender del bridge WSL para procesos locales.

```bash
cd /home/andres/workspace/dashma/ufw-control-panel/infra
docker compose -f docker-compose.app-dev.yml up -d
```

Ver logs:

```bash
docker compose -f docker-compose.app-dev.yml logs -f backend frontend ufw-lab
```

URLs:
- Frontend: `http://localhost:4600`
- Backend: `http://localhost:4000`
- Health: `http://localhost:4000/health`

Detener:

```bash
docker compose -f docker-compose.app-dev.yml down
```

## Instalación rápida en servidor (Docker)

1. Descarga y descomprime el paquete del release.
2. Entra al proyecto y ejecuta:

```bash
cd ufw-control-panel
./deploy/install.sh /opt/ufw-control-panel
```

URLs:
- Frontend: `http://localhost:4600`
- Backend health: `http://localhost:4000/health`
- Node-RED lab: `http://localhost:1890`

### Gestión rápida

```bash
./deploy/start.sh
./deploy/stop.sh
```

## Modo Producción: Controlar UFW del host (sin contenedor de prueba)

Usa este modo si quieres administrar el firewall REAL del servidor.

### Instalación

```bash
cd /tmp/ufw-control-panel
./deploy/install-host.sh /opt/ufw-control-panel TU_DOMINIO_O_IP ufwpanel
```

### Importante (obligatorio)

Configura sudoers para permitir solo `ufw` al usuario de servicio:

```bash
sudo visudo
```

Agregar:

```text
ufwpanel ALL=(root) NOPASSWD: /usr/sbin/ufw
```

### Operación

```bash
./deploy/start-host.sh
./deploy/stop-host.sh
```

### URLs
- App: `http://TU_DOMINIO_O_IP`
- API health: `http://TU_DOMINIO_O_IP/health`

## Modo laboratorio (opcional)

Si solo quieres pruebas aisladas con contenedor Ubuntu + Node-RED:

```bash
cd infra
docker compose -f docker-compose.app-dev.yml up -d
```
