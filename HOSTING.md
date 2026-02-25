# Hosting Instructions

This guide covers deployment strategies for Vercel, AWS, Oracle Cloud, and Custom VPS.

---

## 1. Vercel (Recommended)

Vercel is the creators of Next.js and offers the best developer experience and performance.

### Steps:
1.  Push your code to GitHub.
2.  Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3.  Import your GitHub repository (`surajmagar1993/Website`).
4.  **Configure Environment Variables:**
    *   Add all keys from your `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.) into the Vercel Project Settings.
5.  Click **Deploy**.

**Pros:** Automatic CI/CD, Edge Network, Zero Config.

---

## 2. Custom Cloud / VPS (Ubuntu)

Use this for DigitalOcean, Linode, AWS EC2, or Oracle Cloud Compute.

### Prerequisites:
*   Ubuntu 20.04/22.04 Server
*   Node.js 18+ installed
*   PM2 (Process Manager)
*   Nginx (Reverse Proxy)

### Steps:

1.  **SSH into your server:**
    ```bash
    ssh user@your-ip
    ```

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/surajmagar1993/Website.git
    cd Website
    ```

3.  **Install Dependencies & Build:**
    ```bash
    npm install
    npm run build
    ```

4.  **Start with PM2:**
    ```bash
    npm install -g pm2
    pm2 start npm --name "genesoft" -- start
    pm2 save
    ```

5.  **Configure Nginx (Reverse Proxy):**
    Edit `/etc/nginx/sites-available/default`:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Restart Nginx: `sudo systemctl restart nginx`

---

## 3. AWS (Amazon Web Services)

### Option A: AWS Amplify (Easiest)
1.  Go to AWS Amplify Console.
2.  Connect your GitHub repository.
3.  Add Environment Variables in the Amplify Console.
4.  Deploy. (Similar experience to Vercel).

### Option B: AWS EC2 (Manual)
Follow the **Custom Cloud / VPS** instructions above on an EC2 instance (t3.small or larger recommended).

---

## 4. Oracle Cloud

### Steps:
1.  Create a **Compute Instance** (VM.Standard.E2.1.Micro is free tier eligible).
2.  Open Ports 80 (HTTP) and 443 (HTTPS) in the Oracle VCN Security List.
3.  SSH into the instance and follow the **Custom Cloud / VPS** instructions above.
4.  **Important:** Oracle Cloud requires explicit firewall rule updates in `iptables` to allow traffic even if the VCN allows it.
    ```bash
    sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
    sudo netfilter-persistent save
    ```

---

## 🔐 Security Checklist for ANY Deployment

1.  **Environment Variables:** NEVER commit `.env` files. Always check `.gitignore`.
2.  **SSL/TLS:** Use Certbot (`sudo apt install certbot python3-certbot-nginx`) to enable HTTPS on VPS/EC2/Oracle.
3.  **Database Security:** Ensure Supabase RLS policies are active.
