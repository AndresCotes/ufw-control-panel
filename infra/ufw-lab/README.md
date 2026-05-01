# UFW Lab (Ubuntu Container)

Este entorno sirve para pruebas de reglas UFW en un namespace de red aislado.

## Levantar laboratorio

```bash
cd /home/andres/workspace/dashma/ufw-control-panel/infra
docker compose -f docker-compose.ufw-lab.yml up -d --build
```

## Ver interfaces disponibles del contenedor

```bash
docker exec -it ufw-lab ip -o link show
```

Usualmente verás `eth0` (y `lo`).

## Validar UFW

```bash
docker exec -it ufw-lab ufw status numbered
docker exec -it ufw-lab ufw status verbose
```

## Ejemplo regla por interfaz

```bash
docker exec -it ufw-lab ufw allow in on eth0 to any port 80 proto tcp
```

## Nota importante

Esto NO administra el firewall del host; solo el del contenedor.
Es ideal para pruebas funcionales de la app y del constructor de reglas.
