# LuxOra Production Deployment Checklist (Rocky Linux 8)

## Server Information
- **VPS IP:** 10.10.20.91
- **OS:** Rocky Linux 8
- **Domain:** (to be configured)
- **App Port:** 4007
- **Nginx Port:** 80 (HTTP), 443 (HTTPS)

## Prerequisites
- SSH access to your VPS as root or a user with sudo privileges
- A domain name (optional, for HTTPS and DNS)
- MongoDB Atlas account with connection string (already in your `.env.local`)

---

## Deployment Steps (Execute on Your VPS)

### 1. Connect to Your VPS
```bash
ssh root@10.10.20.91
# or
ssh deploy@10.10.20.91
```

### 2. Upload Deployment Script
On your local machine, upload the script using SCP:
```bash
scp deploy-rocky-linux-8.sh root@10.10.20.91:/root/
# or use SFTP/File Manager to upload the file
```

### 3. Run Deployment Script
On your VPS, as root:
```bash
cd /root
chmod +x deploy-rocky-linux-8.sh
sudo bash deploy-rocky-linux-8.sh
```
This script will:
- Update system packages
- Install Node.js 18, Nginx, Certbot, and PM2
- Clone the repository
- Install dependencies
- Create a deployment user (`deploy`)
- Generate a template `.env.local` file
- Build the Next.js application
- Configure PM2 auto-startup
- Enable firewall rules for HTTP/HTTPS

### 4. Configure Environment Variables
After the script completes, edit the `.env.local` file with your **production** secrets:
```bash
nano /var/www/final-year-project/.env.local
```

**Required fields to update:**
- `AUTH_SECRET` — generate with `npx auth secret` on your local machine
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` — from Google Cloud Console
- `MONGODB_URI` — your MongoDB Atlas connection string (already in local .env.local, copy it)
- `RESEND_API_KEY` and `SENDER_EMAIL` — from Resend
- `PAYPAL_CLIENT_ID` and `PAYPAL_APP_SECRET` — from PayPal developer account
- `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `UPLOADTHING_TOKEN` — from Uploadthing
- `BKASH_APP_KEY` and `BKASH_APP_SECRET` — from bKash (if using)
- `NEXT_PUBLIC_APP_URL` — set to `https://yourdomain.com` (or use IP initially: `http://10.10.20.91`)

After editing, save and exit (Ctrl+X, then Y, then Enter in nano).

### 5. Restart Application
```bash
pm2 restart final-year-project
pm2 save
pm2 logs final-year-project --lines 50
```

### 6. Configure Nginx Reverse Proxy
Copy the Nginx configuration file from the repo to your server:
```bash
# On your local machine:
scp nginx-config.conf root@10.10.20.91:/etc/nginx/conf.d/final-year-project.conf
```

Or manually create it on the server:
```bash
sudo nano /etc/nginx/conf.d/final-year-project.conf
# Paste the content from nginx-config.conf in this repo
```

Test Nginx configuration and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7. (Optional) Set Up HTTPS with Certbot
If you have a domain name pointing to your VPS:
```bash
sudo certbot --nginx -d yourdomain.com
```

Then uncomment the HTTPS section in `/etc/nginx/conf.d/final-year-project.conf` and update `server_name` to your domain.

Certbot will auto-renew certificates; verify with:
```bash
sudo certbot renew --dry-run
```

### 8. Verify Deployment
Check that everything is running:

**PM2 Status:**
```bash
pm2 status
pm2 logs final-year-project --lines 100
```

**Nginx Status:**
```bash
sudo systemctl status nginx
```

**Test the app locally on the VPS:**
```bash
curl -I http://127.0.0.1:4007
curl -I http://10.10.20.91
```

**Test from your local machine:**
```bash
curl -I http://10.10.20.91
```

---

## Common Commands (on VPS)

### View Logs
```bash
pm2 logs final-year-project
pm2 logs final-year-project --lines 200
```

### Restart Application
```bash
pm2 restart final-year-project
```

### Stop Application
```bash
pm2 stop final-year-project
```

### View Running Processes
```bash
pm2 status
pm2 list
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t
```

### Check Firewall
```bash
sudo firewall-cmd --list-all
```

---

## Troubleshooting

### App Won't Start
1. Check logs: `pm2 logs final-year-project`
2. Verify `.env.local` is properly formatted and all required keys are set
3. Ensure `MONGODB_URI` is reachable from your VPS (test connection)

### Nginx Returns 502 Bad Gateway
1. Verify the app is running: `pm2 status`
2. Check that the app is listening on `127.0.0.1:4007`: `netstat -tulpn | grep 4007`
3. Check Nginx error log: `sudo journalctl -u nginx -n 50`
4. Verify SELinux allows Nginx to proxy: `sudo setsebool -P httpd_can_network_connect 1`

### Database Connection Error
1. Verify `MONGODB_URI` is correct in `.env.local`
2. Check MongoDB Atlas whitelist includes your VPS IP (if using MongoDB Atlas)
3. Test MongoDB connection from VPS:
   ```bash
   # Install MongoDB tools (optional)
   sudo dnf install -y mongodb-mongosh
   mongosh "your_mongodb_uri_here"
   ```

### HTTPS Not Working
1. Ensure domain is pointing to your VPS IP: `nslookup yourdomain.com`
2. Verify Certbot certificate was issued: `sudo certbot certificates`
3. Check Nginx config references correct cert paths
4. Restart Nginx after cert changes: `sudo systemctl restart nginx`

---

## Auto-Scaling & Performance Tuning (Optional)

### Use PM2 Cluster Mode (Multiple Instances)
Update `ecosystem.config.js`:
```javascript
instances: 'max',  // Uses all CPU cores
exec_mode: 'cluster',
```

Then restart:
```bash
pm2 start ecosystem.config.js
pm2 save
```

### Monitor with PM2 Plus (Optional)
```bash
pm2 plus
# or
pm2 web  # Opens web dashboard on http://localhost:9615
```

### Nginx Load Balancing (if running multiple instances)
Already configured in `nginx-config.conf` with `least_conn` load balancing.

---

## Backup & Maintenance

### Daily Automated Backups (Optional)
Create a cron job to back up your `.env.local` and database exports:
```bash
crontab -e
# Add:
# 0 2 * * * tar -czf /backups/luxora-env-$(date +\%Y\%m\%d).tar.gz /var/www/final-year-project/.env.local
```

### Monitor Disk Usage
```bash
df -h
du -sh /var/www/final-year-project
```

---

## Security Notes

⚠️ **Important:**
1. Never commit `.env.local` to Git. It's already in `.gitignore`.
2. Keep your production secrets secure. Do not share them in chat, emails, or public repos.
3. Regularly update Node.js, system packages, and dependencies:
   ```bash
   sudo dnf update -y
   npm update -g pm2
   ```
4. Enable firewall (already done by script) and restrict SSH access to trusted IPs
5. Monitor logs regularly: `pm2 logs final-year-project`

---

## Need Help?

- **App logs:** `pm2 logs final-year-project`
- **Nginx logs:** `sudo journalctl -u nginx -f`
- **System logs:** `sudo journalctl -xe`
- **MongoDB issues:** Check MongoDB Atlas dashboard and IP whitelist

Good luck! 🚀
