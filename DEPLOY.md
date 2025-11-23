# Deployment Guide

This guide will help you deploy your Rock-Paper-Scissors game to the web using a custom subdomain.

## Prerequisites
- A GitHub account.
- Accounts on **Render** (for backend) and **Vercel** (for frontend).
- Access to your domain's DNS settings (e.g., GoDaddy, Namecheap, Cloudflare).

---

## Part 1: Deploy the Backend (Server)

We will use **Render** because it supports Node.js and WebSockets easily.

1. **Push your code to GitHub**:
   - Create a new repository on GitHub.
   - Push your project code to this repository.

2. **Create a Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory**: `server` (Important! This tells Render to look in the server folder).
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - Click **Create Web Service**.

3. **Get your Backend URL**:
   - Once deployed, Render will give you a URL like `https://rps-server.onrender.com`.
   - **Copy this URL**. You will need it for the frontend.

---

## Part 2: Deploy the Frontend (Client)

We will use **Vercel** for the frontend as it's fast and easy to configure with custom domains.

1. **Create a Project on Vercel**:
   - Go to [vercel.com](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Import the same GitHub repository.

2. **Configure Environment Variables**:
   - In the "Configure Project" screen, look for **Environment Variables**.
   - Add a new variable:
     - **Name**: `VITE_SERVER_URL`
     - **Value**: Your Render Backend URL (e.g., `https://rps-server.onrender.com`)
   - **Root Directory**: Click "Edit" next to Root Directory and select `.` (the root of your repo, which is default) or if you moved frontend code, point to it. Since your `package.json` for vite is in the root, leave it as default.

3. **Deploy**:
   - Click **Deploy**. Vercel will build your React app.

---

## Part 3: Connect Your Subdomain

Now to make it accessible at `play.yourdomain.com`.

1. **Go to Vercel Settings**:
   - In your Vercel project dashboard, go to **Settings** -> **Domains**.

2. **Add Your Subdomain**:
   - Enter your desired subdomain, e.g., `play.yourdomain.com`.
   - Click **Add**.

3. **Update DNS Records**:
   - Vercel will show you a **CNAME** record to add to your DNS provider.
   - Log in to your domain registrar (where you bought your domain).
   - Go to DNS Management.
   - Add a new record:
     - **Type**: `CNAME`
     - **Name**: `play` (or whatever subdomain you chose)
     - **Value**: `cname.vercel-dns.com` (or whatever Vercel provides)
   - Save the record.

4. **Wait for Propagation**:
   - It might take a few minutes to an hour. Once Vercel shows a green checkmark, your site is live!

---

## Part 4: Final Backend Configuration

To ensure security and proper connection:

1. **Go back to Render Dashboard**:
   - Go to your Web Service -> **Environment**.
   - Add a new Environment Variable:
     - **Key**: `CLIENT_URL`
     - **Value**: `https://play.yourdomain.com` (The full URL of your frontend).
   - This ensures your server only accepts connections from your game.

## Troubleshooting
- **Game stuck on "Connecting..."**: Check if `VITE_SERVER_URL` is set correctly in Vercel.
- **CORS Errors**: Check if `CLIENT_URL` in Render matches your Vercel domain exactly (no trailing slashes usually best).
