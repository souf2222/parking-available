# Deployment to Unraid Server

This document describes how to deploy the Parking Available application to an Unraid server using Docker.

## Overview

Parking Available is a simple web application for sharing parking space availability with neighbors. The application features:

- **Calendar View** - Visual display of parking availability for the current month
- **Color-coded Status** - Green (available), Red (unavailable), Yellow (partial)
- **Time Selection** - For partial availability, select start and end times
- **JWT Authentication** - Secure login for the owner
- **Mobile-friendly** - Responsive design for all devices

---

## Prerequisites

- Unraid server with Docker plugin installed
- At least 512MB of free RAM
- Ports 80 and 8080 available (or modify docker-compose.yml)
- Basic familiarity with SSH and command line

---

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
PORT=8080
NODE_ENV=production
DATABASE_PATH=/app/data/parking.db
```

**Important:** Use a random string of at least 32 characters for JWT_SECRET.

### 3. Create Initial Owner User

After starting the containers, create the initial owner user:

```bash
# After containers are running, create the owner user:
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"yourname","password":"secure-password","role":"owner"}'
```

Example:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jade","password":"MySecurePass123","role":"owner"}'
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

You should see:
```
NAME                           IMAGE                        COMMAND             SERVICE    CREATED          STATUS          PORTS
parking-available-backend-1    parking-available-backend    "npm start"         backend    About a minute ago Up About a minute   0.0.0.0:8080->8080/tcp
parking-available-frontend-1   parking-available-frontend   "/docker-entrypoint" frontend   About a minute ago Up About a minute   0.0.0.0:80->80/tcp
```

---

## User Management

### User Roles

The application supports two user roles:

| Role | Permissions |
|------|-------------|
| **owner** | Can view and edit parking availability |
| **neighbor** | Can only view parking availability (read-only) |

### Creating Users

#### Using the API (Owner only)

```bash
# Create a neighbor user (can only view, cannot edit)
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"neighbor-name","password":"their-password","role":"neighbor"}'
```

Example:
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","password":"Neighbor123","role":"neighbor"}'
```

#### Response Format

```json
{
  "user": {
    "id": 2,
    "username": "bob",
    "role": "neighbor"
  }
}
```

### Editing Users

Currently, user editing must be done directly in the database.

#### Edit User Password via API

There's no direct password update endpoint. To change a password:

1. Delete the user
2. Recreate the user with the new password

#### Edit User Role via Database

Access the SQLite database directly:

```bash
# Method 1: Using docker exec with query (no sqlite3 needed)
docker exec parking-available-backend-1 sh -c "cat /app/data/parking.db" > parking.db

# Method 2: Install sqlite3 temporarily
docker exec -it parking-available-backend-1 apk add sqlite3 --no-cache
docker exec -it parking-available-backend-1 sqlite3 /app/data/parking.db

# In SQLite, update the role:
UPDATE users SET role = 'owner' WHERE username = 'username';

# Verify the change:
SELECT * FROM users;

# Exit SQLite
.quit

# Optional: Remove sqlite3 from container
docker exec parking-available-backend-1 apk del sqlite3
```

**Or query directly via docker exec without sqlite3:**
```bash
# View all users
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "SELECT id, username, role FROM users;"

# Update user role
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "UPDATE users SET role='owner' WHERE username='jade';"
```

### Removing Users

#### Delete User via Database

The API doesn't have a delete user endpoint. Use the database:

```bash
# Method 1: Install sqlite3 temporarily in container
docker exec parking-available-backend-1 apk add sqlite3 --no-cache
docker exec -it parking-available-backend-1 sqlite3 /app/data/parking.db

# Delete a user:
DELETE FROM users WHERE username = 'username';

# Verify deletion:
SELECT * FROM users;

.quit

# Optional: Remove sqlite3
docker exec parking-available-backend-1 apk del sqlite3
```

**Or query directly via docker exec:**
```bash
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "DELETE FROM users WHERE username = 'bob';"
docker exec parking-available-backend-1 cat /app/data/parking.db | sqlite3 "SELECT * FROM users;"
```

Example:
```bash
# Install sqlite3
docker exec parking-available-backend-1 apk add sqlite3 --no-cache

# Connect and delete
docker exec -it parking-available-backend-1 sqlite3 /app/data/parking.db
SQLite version 3.40.1 2022-12-28 14:45:22
Enter ".help" for instructions
sqlite> DELETE FROM users WHERE username = 'bob';
sqlite> SELECT * FROM users;
sqlite> .quit

# Clean up
docker exec parking-available-backend-1 apk del sqlite3
```

### Listing All Users

```bash
docker exec -it parking-available-backend-1 sqlite3 /app/data/parking.db "SELECT id, username, role, created_at FROM users;"
```

---

## Managing the Application

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove Volumes (WARNING: deletes all data including users and availability)

```bash
docker-compose down -v
```

### Restart the Application

```bash
docker-compose restart
```

Or restart individual services:
```bash
docker-compose restart backend
docker-compose restart frontend
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend

# Frontend logs only
docker-compose logs -f frontend
```

### Update Application

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

---

## Unraid-Specific Configuration

### Using Unraid Docker Templates

1. In Unraid web UI, go to **Docker** tab
2. Add container using **Add Container**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | parking-available |
| **Repository** | (build locally or use your registry) |
| **Network Type** | Host |
| **Port Mappings** | 80:80 (frontend), 8080:8080 (backend) |
| **Volume Mappings** | `/mnt/cache/appdata/parking-available/data` -> `/app/data` |

4. Click **Apply** to start the container

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

---

## API Reference

### Authentication Endpoints

#### Register User
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "role": "owner" | "neighbor"
}
```

#### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

# Response
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "string",
    "role": "owner" | "neighbor"
  }
}
```

### Availability Endpoints (requires JWT token)

#### Get Monthly Availability
```bash
GET /api/v1/availability/:year/:month
Authorization: Bearer <token>

# Example
GET /api/v1/availability/2026/01
```

#### Create/Update Availability
```bash
POST /api/v1/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "YYYY-MM-DD",
  "status": "available" | "unavailable" | "partial",
  "note": "string (optional, auto-generated for partial)"
}
```

#### Delete Availability
```bash
DELETE /api/v1/availability/:date
Authorization: Bearer <token>
```

---

## Security Considerations

1. **Change JWT_SECRET** before first deployment - use a random string
2. **Use strong passwords** for all user accounts
3. **Consider using HTTPS** with a reverse proxy (Traefik, Nginx Proxy Manager)
4. **Restrict port 8080** - backend should only be accessible from frontend
5. **Regular backups** of the data directory
6. **Limit neighbor accounts** - only create accounts for people who need access

### Enabling HTTPS (Optional)

For production, consider using:

- **Traefik** - Reverse proxy with automatic HTTPS
- **Nginx Proxy Manager** - Web-based interface for managing reverse proxies
- **Let's Encrypt** - Free SSL certificates

Example with Nginx Proxy Manager:
1. Install Nginx Proxy Manager via Docker
2. Add proxy hosts for your domain
3. Enable "Force SSL" for HTTPS

---

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
3. Verify nginx proxy is configured correctly

### Database issues

Reset the database (WARNING: deletes all data):
```bash
docker-compose down -v
rm -rf backend/data/parking.db
docker-compose up -d
```

### User login fails

1. Verify user exists:
   ```bash
   docker exec -it parking-available-backend-1 sqlite3 /app/data/parking.db "SELECT * FROM users;"
   ```

2. Check password is correct - passwords are hashed and cannot be recovered

3. Recreate user if needed:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"name","password":"newpassword","role":"owner"}'
   ```

---

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

### Automated Backups (Cron)

Add to crontab on Unraid server:
```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * /path/to/backup-script.sh
```

Example backup script:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/mnt/cache/appdata/backups/parking"
mkdir -p $BACKUP_DIR
cp -r /mnt/cache/appdata/parking-available/data $BACKUP_DIR/parking_$DATE
# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

---

## Data Storage

The application stores all data in:
```
/mnt/cache/appdata/parking-available/data/parking.db
```

This SQLite database contains:
- **users** - User accounts and roles
- **availability** - Parking availability records

Back up this file regularly to prevent data loss.

---

## Support

For issues or questions:
1. Check the logs: `docker-compose logs`
2. Verify container status: `docker-compose ps`
3. Test API endpoints directly using curl
