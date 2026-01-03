# Deployment to Unraid Server

This document describes how to deploy the Parking Available application to an Unraid server using Docker.

## Prerequisites

- Unraid server with Docker plugin installed
- At least 512MB of free RAM
- Port 80 and 8080 available (or modify docker-compose.yml)

## Quick Start

### 1. Clone the Repository

Upload the project to your Unraid server or clone via SSH:

```bash
git clone <your-repo-url>
cd parking-available
```

### 2. Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Edit `.env` and set a secure JWT secret:

```env
JWT_SECRET=your-very-secure-random-string-at-least-32-chars
```

### 3.Before Create Initial User

 starting the containers, create the initial owner user by modifying the backend to register on startup, or use the API after starting:

```bash
# After containers are running, create the owner user:
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"owner","password":"your-secure-password","role":"owner"}'
```

### 4. Build and Start Containers

Using docker-compose:

```bash
docker-compose up -d --build
```

### 5. Access the Application

- **Frontend**: http://your-unraid-ip
- **Backend API**: http://your-unraid-ip:8080/api/v1

### 6. Verify Deployment

Check that containers are running:

```bash
docker-compose ps
```

Check logs:

```bash
docker-compose logs -f
```

## Managing the Application

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove Volumes (WARNING: deletes database)

```bash
docker-compose down -v
```

### Restart the Application

```bash
docker-compose restart
```

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Updating the Application

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

## Unraid-Specific Configuration

### Using Unraid Docker Templates

1. In Unraid web UI, go to **Docker** tab
2. Add container using **Add Container**
3. Configure:
   - **Name**: parking-available
   - **Repository**: (build locally or use your registry)
   - **Network Type**: Host
   - **Port Mappings**:
     - 80:80 (frontend)
     - 8080:8080 (backend)
   - **Volume Mappings**:
     - `/mnt/cache/appdata/parking-available/data` -> `/app/data` (backend data)

### Using Docker CLI

```bash
# Create data directory
mkdir -p /mnt/cache/appdata/parking-available/data

# Run backend
docker run -d \
  --name parking-backend \
  -p 8080:8080 \
  -v /mnt/cache/appdata/parking-available/data:/app/data \
  -e JWT_SECRET=your-secret \
  parking-available-backend

# Run frontend
docker run -d \
  --name parking-frontend \
  -p 80:80 \
  --link parking-backend:backend \
  parking-available-frontend
```

## Security Considerations

1. **Change JWT_SECRET** before first deployment
2. **Use strong passwords** for the owner account
3. **Consider using HTTPS** with a reverse proxy (like Traefik or Nginx Proxy Manager)
4. **Restrict port 8080** so only the frontend can access the backend API
5. **Regular backups** of the data directory

## Troubleshooting

### Backend won't start

Check logs:
```bash
docker-compose logs backend
```

Common issues:
- Port 8080 already in use
- Missing environment variables
- Permission issues with data directory

### Frontend can't connect to backend

1. Verify backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify CORS settings in backend configuration

### Database issues

Reset the database:
```bash
docker-compose down -v
rm -rf backend/data/parking.db
docker-compose up -d
```

## Backup and Restore

### Backup

```bash
# Stop containers
docker-compose down

# Backup data directory
cp -r /mnt/cache/appdata/parking-available/data /path/to/backup/

# Start containers
docker-compose up -d
```

### Restore

```bash
# Stop containers
docker-compose down

# Restore data
cp -r /path/to/backup/data/* /mnt/cache/appdata/parking-available/data/

# Start containers
docker-compose up -d
```
