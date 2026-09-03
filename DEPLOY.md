# NumCheck — How to Deploy (For Non-Developers)

You have zero coding experience? No problem. Follow these steps exactly and you'll have NumCheck running on the internet for free, accessible from your phone.

---

## What You Need

- A computer (laptop/desktop) — just to upload files. You won't run code on it.
- A free GitHub account
- A free Render account

Total time: ~15 minutes.

---

## Step 1: Create a GitHub Account

1. Go to https://github.com/signup
2. Enter your email, create a password, pick a username
3. Verify your email
4. Done. You now have a GitHub account.

---

## Step 2: Create a New Repository and Upload the Code

1. Go to https://github.com/new
2. **Repository name:** type `numcheck`
3. **Visibility:** select **Private** (only you can see it)
4. **Don't** check "Add a README file" — leave it unchecked
5. Click the green **Create repository** button
6. You'll see a page with setup options. Ignore all of them.
7. Instead, look near the top of the page for a button that says **"uploading an existing file"** — click that link.
8. You should see a drag-and-drop area. Now unzip the `numcheck.zip` file you downloaded earlier. You'll get a `numcheck/` folder with `server/` and `extension/` inside it.
9. Drag ALL the files and folders from inside the `server/` folder (NOT the `extension/` folder — just the `server/` folder's contents) into the GitHub upload area. Specifically, drag these items:
   - `src/` (the folder)
   - `package.json`
   - `Dockerfile`
   - `render.yaml`
   - `.env.example`
   - `.gitignore`
   - `README.md`
10. Wait for all files to upload. You'll see them listed.
11. Scroll down, click the green **Commit changes** button.
12. Done. Your code is now on GitHub.

---

## Step 3: Create a Render Account

1. Go to https://render.com and click **Sign Up**
2. Click **GitHub** to sign up with your GitHub account
3. Authorize Render to access your GitHub (click the green Authorize button)
4. You now have a Render account.

---

## Step 4: Deploy the Server on Render

1. After signing in, go to https://dashboard.render.com
2. Click the **New +** button (top right) → select **Web Service**
3. You'll see your GitHub repos. Find `numcheck` and click **Connect**
4. Fill in these fields:
   - **Name:** `numcheck` (or anything you like)
   - **Region:** pick the one closest to you (e.g., Singapore if you're in India)
   - **Branch:** `main` (should be auto-filled)
   - **Runtime:** it should auto-detect **Node**. If it asks, pick **Node**
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Instance Type:** **Free** (important — don't pick a paid one)
5. Scroll down and click **Create Web Service**
6. Render will now build and start your server. This takes 2-3 minutes. You'll see a log scrolling on screen.
7. When it's done, you'll see a green **Live** badge at the top.
8. At the top of the page, you'll see a URL like `https://numcheck-xxxx.onrender.com`. **Copy this URL.** This is your server's internet address. Write it down somewhere.

### Test it works

Open a browser tab, paste your URL followed by `/api/health`. For example:
```
https://numcheck-xxxx.onrender.com/api/health
```
You should see: `{"status":"ok","version":"0.1.0"}`

If you see that, your server is live on the internet. 🎉

---

## Step 5: Install the Extension on Your Android Phone

### Install Kiwi Browser

Chrome on Android doesn't support extensions, but Kiwi Browser does — it's Chrome under the hood.

1. On your phone, open the Play Store
2. Search for **Kiwi Browser** and install it
3. Open Kiwi Browser

### Load the Extension

1. Transfer the `extension/` folder (from inside `numcheck.zip`) to your phone. You can:
   - Email it to yourself and download it
   - Use Google Drive / WhatsApp / USB cable
   - Whatever's easiest. Just get the `extension/` folder onto your phone.
2. Unzip it if needed. You should have a folder called `extension` containing `manifest.json`, `background.js`, `content.js`, `sidepanel.html`, `sidepanel.js`, and an `icons` folder.
3. In Kiwi Browser, type this in the address bar: `kiwi://extensions`
4. Toggle on **Developer mode** (top right)
5. Tap **+ (from .zip/.crx/.user.js)** — if this option exists, you can zip the extension folder and load it directly.
   - **Alternative:** If Kiwi shows a "Load unpacked" button, tap that and select the `extension` folder.
6. You should now see NumCheck in your extensions list.

### Point it to Your Server

1. While still on `kiwi://extensions`, find NumCheck in the list
2. Tap on it, then look for **Details** → **Extension options** (or tap the NumCheck icon in the toolbar)
3. The side panel should open. Tap **⚙ Server settings**
4. In the **Backend URL** field, paste your Render URL (e.g., `https://numcheck-xxxx.onrender.com`) — no trailing slash
5. Tap **Save**

---

## Step 6: Use It!

1. In Kiwi Browser, go to any news article
2. Tap the NumCheck icon (top right, next to the address bar)
3. Tap **Scan This Page**
4. Wait a few seconds — it'll extract claims and show you the raw numbers from primary sources

Done. You're now reading past the narrative.

---

## Troubleshooting

**"Backend error" or nothing happens when scanning**
- Make sure your Render URL is correct (no trailing slash, starts with `https://`)
- Test it by visiting `https://your-url.onrender.com/api/health` in your browser — you should see `{"status":"ok"}`
- Free Render services sleep after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Just wait and try again.

**Extension doesn't show up in Kiwi**
- Make sure you loaded the `extension/` folder (the one with `manifest.json` directly inside it), not the `numcheck/` parent folder
- Try restarting Kiwi Browser

**"No claims found"**
- The page might not have enough numerical data. Try a news article with statistics or percentages in it

**Want better search results?**
- Sign up for a free Brave Search API key at https://brave.com/search/api/ (2000 free searches/month)
- In Render, go to your service → **Environment** → add an environment variable:
  - Key: `BRAVE_SEARCH_API_KEY`
  - Value: your API key
- Save and the server will restart automatically with better search

---

## Cost

Everything in this guide uses free tiers. You pay nothing.

- GitHub: free
- Render: free tier (service sleeps after 15 min inactivity, which is fine for personal use)
- Kiwi Browser: free
- Brave Search API (optional): free for 2000 searches/month
