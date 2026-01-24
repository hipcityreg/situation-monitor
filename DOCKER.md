# Docker Deployment Guide

This guide explains how to run the Situation Monitor in a Docker container, with specific instructions for Unraid users.

## Quick Start

### Using Docker Compose (Recommended for Unraid)

1. Clone or download this repository to your Unraid server
2. Navigate to the project directory
3. Run the container:

```bash
docker-compose up -d
```

The application will be available at `http://your-server-ip:8034`

### Using Docker CLI

Build and run the container manually:

```bash
# Build the image
docker build -t situation-monitor .

# Run the container
docker run -d \
  --name situation-monitor \
  -p 8034:80 \
  --restart unless-stopped \
  situation-monitor
```

## Unraid Deployment

### Method 1: Docker Compose (Easiest)

1. Install the **Compose Manager** plugin from Community Applications
2. Clone this repository to your Unraid server (e.g., `/mnt/user/appdata/situation-monitor/`)
3. In Compose Manager, add a new stack pointing to the directory containing `docker-compose.yml`
4. Start the stack

### Method 2: Unraid Docker Template

1. Go to **Docker** tab in Unraid
2. Click **Add Container**
3. Configure the following:

   - **Name:** `situation-monitor`
   - **Repository:** `your-dockerhub-username/situation-monitor` (after pushing to Docker Hub)
   - **Network Type:** `bridge`
   - **Port Mappings:**
     - Container Port: `80`
     - Host Port: `8034` (or your preferred port)
   - **Restart Policy:** `unless-stopped`

4. Click **Apply**

### Method 3: Build from Source on Unraid

1. SSH into your Unraid server
2. Navigate to where you want to store the project:
   ```bash
   cd /mnt/user/appdata
   git clone https://github.com/your-username/situation-monitor.git
   cd situation-monitor
   ```
3. Build and run:
   ```bash
   docker-compose up -d
   ```

## Configuration

### Port Configuration

By default, the container exposes port 80 internally and maps to port 8034 on the host. You can change the host port in `docker-compose.yml`:

```yaml
ports:
  - "8034:80"  # Change 8034 to your preferred port
```

### Timezone

Set your timezone in `docker-compose.yml`:

```yaml
environment:
  - TZ=America/New_York  # Change to your timezone
```

### Reverse Proxy

If using a reverse proxy (like Nginx Proxy Manager on Unraid):

1. Keep the container on the default bridge network or create a custom network
2. Point your reverse proxy to `http://situation-monitor:80` (container name)
3. No special configuration needed - the app is fully static

Example Nginx Proxy Manager configuration:
- **Scheme:** `http`
- **Forward Hostname/IP:** `situation-monitor` (or your container's IP)
- **Forward Port:** `80`
- **Websockets Support:** Not required

## Building a Custom Image

If you want to push this to Docker Hub for easier deployment:

```bash
# Build for your platform
docker build -t your-dockerhub-username/situation-monitor:latest .

# Build for multiple platforms (requires buildx)
docker buildx build --platform linux/amd64,linux/arm64 \
  -t your-dockerhub-username/situation-monitor:latest \
  --push .
```

## Health Checks

The container includes a health check that runs every 30 seconds. You can check the container's health status:

```bash
docker ps
```

Look for the `healthy` status in the `STATUS` column.

## Updating

### Docker Compose Method

```bash
cd /path/to/situation-monitor
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

### Docker CLI Method

```bash
docker stop situation-monitor
docker rm situation-monitor
cd /path/to/situation-monitor
git pull
docker build -t situation-monitor .
docker run -d --name situation-monitor -p 8034:80 --restart unless-stopped situation-monitor
```

## Troubleshooting

### Container won't start

Check the logs:
```bash
docker logs situation-monitor
```

Or with docker-compose:
```bash
docker-compose logs
```

### Application not accessible

1. Verify the container is running: `docker ps`
2. Check if the port is accessible: `curl http://localhost:8034`
3. Ensure your firewall allows traffic on port 8034
4. On Unraid, make sure the port isn't already in use

### Build fails

1. Ensure you have enough disk space
2. Check that Docker has internet access to download dependencies
3. Try cleaning Docker cache: `docker system prune -a`

## Resource Usage

- **Build time:** ~2-5 minutes (depending on hardware)
- **Image size:** ~50-60 MB (compressed)
- **Runtime memory:** ~10-20 MB
- **CPU:** Minimal (nginx serving static files)

## Data Persistence

This application is fully static and doesn't require any persistent data storage. All data is fetched from external APIs at runtime.

## Security Notes

1. The application runs as a non-root user in the container
2. Only port 80 is exposed internally (mapped to your chosen host port)
3. The nginx configuration includes basic security headers
4. No sensitive data is stored in the container
5. All external API calls are made client-side from the user's browser

## Support

For issues related to:
- **Docker setup:** Check this documentation
- **Application bugs:** Open an issue on GitHub
- **Unraid-specific issues:** Check Unraid forums or Docker documentation
