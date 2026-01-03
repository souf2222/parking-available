# Unraid Installation Guide

## Option 1: Using Unraid Apps Template (Recommended)

### Prerequisites
- Unraid 6.12 or later
- Docker plugin installed and running

### Installation Steps

1. **Add Template Repository**
   - Go to Settings > Docker
   - Scroll to "Template Repositories"
   - Add: `https://raw.githubusercontent.com/souf2222/parking-available/main/.unraid/`

2. **Install the App**
   - Go to the "Apps" tab
   - Search for "Parking Available"
   - Click "Install"

3. **Configure**
   - **Host Port**: Default `8080` - change if needed
   - **Volume Path**: Default `/mnt/user/appdata/parking-available`
   - **Timezone**: Default `Europe/Paris`
   - **JWT Secret**: Change the default secret for production

4. **Start Container**
   - Click "Apply" to start the container
   - Wait for the container to initialize (first run may take a few minutes)

5. **Access the Application**
   - Open: `http://[UNRAID_IP]:8080`

---

## Option 2: Using Docker Compose (Advanced)

### Steps

1. **SSH into Unraid** or use the terminal from the web UI

2. **Create directory**:
   ```bash
   mkdir -p /mnt/user/appdata/parking-available
   cd /mnt/user/appdata/parking-available
   ```

3. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'

   services:
     backend:
       image: souf2222/parking-available-backend:latest
       ports:
         - "8080:8080"
       environment:
         - NODE_ENV=production
         - PORT=8080
         - JWT_SECRET=your-secret-key-change-in-production
       volumes:
         - ./data:/app/data
       restart: unless-stopped

     frontend:
       image: souf2222/parking-available-frontend:latest
       ports:
         - "80:80"
       depends_on:
         - backend
       restart: unless-stopped
   ```

4. **Start containers**:
   ```bash
   docker-compose up -d
   ```

5. **Access**: `http://[UNRAID_IP]`

---

## Default Users

The following users are created on first run:

| Username | Password   | Role   |
|----------|------------|--------|
| admin    | admin123   | owner  |
| jade     | jade123    | owner  |
| bob      | bob123     | neighbor |

**Important**: Change passwords after first login!

---

## Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker logs parking-available
   ```

2. Verify port is not in use:
   ```bash
   docker ps | grep 8080
   ```

### Cannot access the application

1. Check if Unraid firewall allows the port
2. Verify the container is running:
   ```bash
   docker ps | grep parking
   ```

3. Check container health:
   ```bash
   docker inspect parking-available | jq '.[0].State.Health'
   ```

### Reset database

To reset all data:
```bash
docker stop parking-available
rm -rf /mnt/user/appdata/parking-available/*
docker start parking-available
```

---

## Upgrading

### Via Template

1. Go to Docker tab
2. Click "Check for updates" or use "Update" button
3. Select "Yes" to update

### Via Docker Compose

```bash
cd /mnt/user/appdata/parking-available
docker-compose pull
docker-compose up -d
```

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| TZ | Europe/Paris | Container timezone |
| PORT | 8080 | Application port |
| JWT_SECRET | change-this... | Secret key for JWT tokens |

### Changing JWT Secret

1. Stop the container
2. Edit the template/environment variable
3. Start the container

**Note**: Changing JWT_SECRET will invalidate all existing sessions.

---

## Support

- GitHub Issues: https://github.com/souf2222/parking-available/issues
- Report bugs, feature requests, or ask questions
