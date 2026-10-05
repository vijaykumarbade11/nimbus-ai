# Nimbus AI

Nimbus AI is a farmer-focused agriculture platform for Ahmedpur Circle, Latur District, Maharashtra.

## Features

- Weather intelligence with demo/live fallback
- Crop advisory and disease analysis workflow
- Government scheme information
- Agriculture marketplace
- Seller and farmer dashboards
- Contact support and enquiry storage
- Python FastAPI AI service for advisory and disease prediction

## Quick start

1. Install Node dependencies:

   ```bash
   cd server
   npm install
   ```

2. Install Python dependencies:

   ```bash
   cd python-ai
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Start the AI service:

   ```bash
   python main.py
   ```

4. Start the Node server:

   ```bash
   cd server
   npm start
   ```

5. Open the frontend in a browser:

   ```text
   http://localhost:5000/
   ```

## Environment

Copy `.env.example` to `.env` at the project root and adjust values.

## Publish a shareable website link (Render)

The Render Blueprint in `render.yaml` deploys the Express server, website files, and API together. Render assigns the deployed service a public HTTPS URL.

1. Push this project to a GitHub repository. Do not upload `.env`, API keys, or other secrets; `.gitignore` excludes local environment files.
2. In Render, choose **New** → **Blueprint**, connect the repository, and deploy the `render.yaml` configuration.
3. Open the public URL shown for the `nimbus-ai` service and share it.

The website can be opened publicly without a farmer login. Farmer registration and login require a MongoDB connection; evidence-based AI crop/photo guidance requires a configured `OPENAI_API_KEY`. Add these as secret environment variables in Render if those features are needed. Do not put secrets in source files or the GitHub repository. Without the relevant provider configuration, those features report that they are unavailable instead of displaying invented results.

## Data and integrations

Weather uses the configured provider/model sources and shows an unavailable state when live data cannot be obtained. Forecast estimates are not guaranteed field observations.

## Tech stack

- Node.js + Express
- MongoDB with Mongoose (optional, local-only persistence)
- Python + FastAPI
- HTML/CSS/JavaScript frontend
