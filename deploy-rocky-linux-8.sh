#!/bin/bash
# Deployment script for LuxOra e-commerce app on Rocky Linux 8
# Usage: sudo bash deploy-rocky-linux-8.sh

set -e  # exit on error

echo "========================================="
echo "LuxOra Deployment Script (Rocky Linux 8)"
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Update system
echo -e "${BLUE}[1/7] Updating system packages...${NC}"
dnf update -y
dnf install -y epel-release

# 2. Install prerequisites
echo -e "${BLUE}[2/7] Installing Git, Nginx, Certbot, and build tools...${NC}"
dnf install -y git curl nginx certbot python3-certbot-nginx gcc g++ make

# 3. Install Node.js 18
echo -e "${BLUE}[3/7] Installing Node.js 18 LTS...${NC}"
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
dnf install -y nodejs

# 4. Install PM2 globally
echo -e "${BLUE}[4/7] Installing PM2 process manager...${NC}"
npm install -g pm2

# 5. Create deployment user and directory
echo -e "${BLUE}[5/7] Setting up deployment directory...${NC}"
mkdir -p /var/www/final-year-project
if ! id -u deploy > /dev/null 2>&1; then
  useradd -m -s /bin/bash deploy
fi
chown deploy:deploy /var/www/final-year-project

# 6. Clone repository (as deploy user)
echo -e "${BLUE}[6/7] Cloning repository and installing dependencies...${NC}"
cd /var/www/final-year-project
sudo -u deploy git clone https://github.com/NishadApi25/final-year-project.git . || {
  echo "Note: Repository may already exist. If cloning failed due to that, continuing..."
}
sudo -u deploy npm ci

# 7. Create .env.local if it doesn't exist
echo -e "${BLUE}[7/7] Setting up environment file...${NC}"
if [ ! -f /var/www/final-year-project/.env.local ]; then
  echo "Creating .env.local. Please update with your production secrets:"
  cat > /var/www/final-year-project/.env.local <<'ENVEOF'
NEXT_PUBLIC_APP_NAME=LuxOra
NEXT_PUBLIC_APP_SLOGAN=Elevate your lifestyle, for less.
NEXT_PUBLIC_APP_DESCRIPTION=LuxOra is your ultimate shopping destination

# NextAuth
AUTH_SECRET=change_me_with_secure_secret
AUTH_GOOGLE_ID=your_google_id
AUTH_GOOGLE_SECRET=your_google_secret

# Database (using MongoDB Atlas)
MONGODB_URI=your_mongodb_uri_here

# Resend (Email)
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=noreply@yourdomain.com
SENDER_NAME=LuxOra

# PayPal
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_APP_SECRET=your_paypal_secret

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Uploadthing
UPLOADTHING_TOKEN=your_uploadthing_token

# bKash
BKASH_API_URL=https://sandbox.bkashapi.com
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_CALLBACK_URL=https://yourdomain.com/api/bkash/callback
NEXT_PUBLIC_MOCK_BKASH=false

# Public site URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ENVEOF
  chown deploy:deploy /var/www/final-year-project/.env.local
  chmod 600 /var/www/final-year-project/.env.local
  echo "⚠️  IMPORTANT: Edit .env.local with your production secrets:"
  echo "   nano /var/www/final-year-project/.env.local"
else
  echo "✓ .env.local already exists. Skipping creation."
fi

# 8. Build Next.js app
echo -e "${BLUE}Building Next.js application...${NC}"
cd /var/www/final-year-project
sudo -u deploy npm run build

# 9. Configure and start PM2
echo -e "${BLUE}Configuring PM2...${NC}"
sudo -u deploy pm2 start npm --name final-year-project -- run start
sudo -u deploy pm2 save

# Setup PM2 to start on boot
env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy

# 10. Enable and start Nginx
echo -e "${BLUE}Configuring Nginx...${NC}"
systemctl enable nginx
systemctl start nginx

# 11. Configure firewall
echo -e "${BLUE}Configuring firewall...${NC}"
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# 12. SELinux configuration
echo -e "${BLUE}Configuring SELinux for Nginx reverse proxy...${NC}"
setsebool -P httpd_can_network_connect 1

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}✓ Deployment preparation complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "NEXT STEPS:"
echo "1. SSH into your server and edit the .env.local file with production secrets:"
echo "   ssh deploy@10.10.20.91"
echo "   nano /var/www/final-year-project/.env.local"
echo ""
echo "2. Restart the application:"
echo "   pm2 restart final-year-project"
echo ""
echo "3. Check status:"
echo "   pm2 status"
echo "   pm2 logs final-year-project"
echo ""
echo "4. Configure Nginx (see nginx-config.conf in the repo)"
echo ""
echo "5. If using HTTPS with a domain, run Certbot:"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "App will be available at: http://10.10.20.91:4007 (direct)"
echo "                          http://yourdomain.com (via Nginx reverse proxy)"
