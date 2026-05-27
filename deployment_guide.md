# Production Deployment Guide: Lost & Found Tracker

This guide provides a comprehensive, step-by-step walkthrough to deploy your full-stack, three-tier application (React client, Node Express server, Python FastAPI AI service, and MongoDB Atlas database) from GitHub to production.

---

## 🛠️ Architecture & Tech Stack Overview
Before deploying, it helps to understand how the components interact in production:
*   **Database**: MongoDB Atlas (Free cloud cluster)
*   **AI Service (Python)**: Hosted on **Hugging Face Spaces** (Free Docker container with **16GB RAM + 2 vCPU**, crucial for running PyTorch and Hugging Face CLIP models smoothly without running out of memory).
*   **Backend (Node.js)**: Hosted on **Render** (Free Node Web Service).
*   **Frontend (Vite + React)**: Hosted on **Vercel** (Free, optimized static hosting).

---

## 📂 Step 1: Secure Git & Push to GitHub

To prevent sensitive information (like database passwords and private keys) or massive build/cache directories from being uploaded, we have already configured a secure root `.gitignore` file.

### 1.1 Double Check Git Status
Open your terminal in the root directory `lostandfound` and check your git status:
```bash
git status
```
If `.env` files or the `.venv` directory are listed as untracked and ready to be committed, run the following commands to untrack them:
```bash
git rm -r --cached client/.env
git rm -r --cached server/.env
git rm -r --cached server/ai_service/.venv
```

### 1.2 Commit and Push to GitHub
1. Create a new **public or private repository** on [GitHub](https://github.com/new).
2. Run these commands in your project root folder:
   ```bash
   # Initialize git if you haven't already
   git init
   
   # Add files and commit
   git add .
   git commit -m "Configure project for production deployment"
   
   # Rename default branch to main
   git branch -M main
   
   # Add your GitHub repository link and push
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```

---

## 🍃 Step 2: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new **Database Cluster** (select the **M1 Shared Free Tier**).
3. **Database Access**: Create a database user. Note down the **Username** and **Password**.
4. **Network Access**: Add a new IP address:
   * Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   * *Note: Since cloud servers like Render change their IP addresses constantly, this is necessary to ensure the backend can connect to the database.*
5. **Get Connection String**:
   * Click **Connect** on your Database Cluster -> select **Drivers**.
   * Copy the connection string. It will look like this:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   * Replace `<username>` and `<password>` with the database credentials you created in step 3. Rename the DB from `?` to `/lostandfound?` to create a dedicated database. Keep this connection string safe!

---

## 🤗 Step 3: Deploy AI Service (FastAPI) on Hugging Face Spaces

The AI microservice loads a deep learning model (`openai/clip-vit-base-patch32`) using PyTorch and Hugging Face Transformers. Running this on a 512MB RAM free-tier server (like Render or Koyeb) will crash due to Out Of Memory (OOM) errors. 

**Hugging Face Spaces** offers free Docker hosting with **16GB RAM**, making it the absolute best free option.

1. Sign up/Log in on [Hugging Face](https://huggingface.co/).
2. Click on your profile picture in the top-right corner and select **New Space**.
3. Fill out the creation form:
   * **Space Name**: `lost-and-found-ai`
   * **License**: `mit`
   * **SDK**: Select **Docker** (Very Important!)
   * **Template**: Select **Blank**
   * **Space Visibility**: **Public** (required for free API access)
4. Click **Create Space**.
5. Once created, navigate to the **Files** tab and create/upload the following files from your `server/ai_service/` directory:

### 1️⃣ Upload `app.py`
Create a new file named `app.py` and copy the code from your local `server/ai_service/app.py` into it.

### 2️⃣ Upload `requirements.txt`
Create a new file named `requirements.txt` and copy the dependencies from your local `server/ai_service/requirements.txt`:
```text
fastapi
uvicorn
transformers
torch --index-url https://download.pytorch.org/whl/cpu
Pillow
pydantic
```

### 3️⃣ Create a `Dockerfile`
Create a new file in the Hugging Face repository named `Dockerfile` (no file extension) and paste the following content:
```dockerfile
FROM python:3.9-slim

# Set working directory
WORKDIR /code

# Copy requirements and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the application code
COPY ./app.py /code/app.py

# Expose the FastAPI port
EXPOSE 7860

# Start FastAPI on port 7860 (Hugging Face expects port 7860)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
```

### 4️⃣ Let HF Build
Hugging Face will automatically start building your Docker image. Once complete (usually takes 1–2 minutes to install PyTorch and download the CLIP model), the status will change to **Running**.
* Your AI Service production URL will be:
  `https://<your-hf-username>-<space-name>.hf.space`
  *(For example: `https://shuvamshres11-lost-and-found-ai.hf.space`)*
* You can test it by going to `https://<your-hf-username>-<space-name>.hf.space/docs` to see the interactive FastAPI Swagger UI.

---

## 🚀 Step 4: Deploy Express Backend on Render

1. Go to [Render](https://render.com/) and sign up or sign in.
2. On the dashboard, click **New** -> **Web Service**.
3. Connect your GitHub account and select your **Lost & Found Tracker** repository.
4. Configure the Web Service:
   * **Name**: `lost-and-found-backend`
   * **Region**: Select the region closest to you
   * **Branch**: `main`
   * **Root Directory**: `server` 👈 *Crucial! This tells Render to only run build and start steps inside the `server/` directory.*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
   * **Instance Type**: `Free`
5. Click the **Advanced** button to add Environment Variables:
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string from Step 2 |
   | `JWT_SECRET` | `your-secure-random-secret-key` | A long, secure random string for JWT signing |
   | `AI_SERVICE_URL` | `https://<your-username>-<space-name>.hf.space` | The Hugging Face Space URL from Step 3 (No `/embed` ending) |
   | `FRONTEND_URL` | `https://<your-app-name>.vercel.app` | *For now, type `https://temp-vercel-url.vercel.app`. You will update this in Step 6 once your Vercel URL is created.* |
   | `VITE_API_URL` | `http://localhost:5000/api` | (Used locally, can be omitted in production env) |

6. Click **Create Web Service**. 
7. Render will build and deploy your Node.js backend. Once finished, copy the backend URL displayed at the top of your Render dashboard:
   `https://lost-and-found-backend.onrender.com`

---

## 💻 Step 5: Deploy React Frontend on Vercel

1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Select your GitHub repository and click **Import**.
4. Configure the Project settings:
   * **Framework Preset**: Select **Vite** (Vercel should auto-detect this).
   * **Root Directory**: Click Edit and select `client` 👈 *Crucial! This tells Vercel to compile only the React code inside `client/`.*
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Open the **Environment Variables** accordion and add the following two variables:
   
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://lost-and-found-backend.onrender.com/api` | Your Render Backend URL + `/api` |
   | `VITE_SOCKET_URL` | `https://lost-and-found-backend.onrender.com` | Your Render Backend URL (without `/api` suffix) |

6. Click **Deploy**. Vercel will build and compile your static React client and deploy it.
7. Once deployment is complete, copy your production frontend URL:
   `https://lost-and-found-tracker.vercel.app`

---

## 🔄 Step 6: Link Frontend and Backend (Final Step)

Because your backend uses Cors and Socket.io, it restricts incoming connections for security. We must update the `FRONTEND_URL` in the backend so it allows connections from your newly deployed Vercel site.

1. Go to your **Render Dashboard** and open your Node backend service (`lost-and-found-backend`).
2. Go to the **Environment** tab on the left sidebar.
3. Edit the value of `FRONTEND_URL` to match your Vercel frontend URL:
   `https://lost-and-found-tracker.vercel.app`
4. Click **Save Changes**. Render will automatically trigger a rolling redeploy of your backend with the new configuration.

---

## 🎉 Verification Checklist
Once all servers are up and active, test the deployment:
1. Open your Vercel URL in a browser.
2. Register a new user and login. (If this succeeds, your Vercel frontend is communicating with your Render backend, and the backend is talking to MongoDB Atlas!).
3. Navigate to **Post an Item** and create a post with an image.
4. Navigate to **My Items** or **Matches**. If a matching status notification shows up, the AI service on Hugging Face Spaces successfully processed the image, calculated the vector, and communicated back to the Express server to save it!
5. Open two different browsers (e.g. Chrome and Firefox), log into two separate accounts, and go to the **Chat** page. Send a message to verify that Socket.io real-time chat is functioning dynamically.

Your Lost & Found Tracker is now fully deployed and production-ready! 🚀
