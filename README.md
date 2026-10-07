# Nimbus AI

Nimbus AI is a farmer-focused agriculture platform for Ahmedpur Circle, Latur District, Maharashtra.

## Features

- Weather intelligence using OpenWeather when configured, with a public forecast fallback
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
The browser API base is configured once in `client/js/api-config.js`. Leave it empty when Express serves both the website and `/api`. For the VS Code Live Server at `http://127.0.0.1:5500`, the config automatically sends API requests to `http://127.0.0.1:5000`; start the Node backend with `npm start --prefix server` as well. If the frontend is hosted separately, set it to the backend service origin (for example, `https://your-nimbus-api.example.com`, without a trailing slash or `/api`) and allow the frontend origin in the backend's `CLIENT_URL` setting. An API request that receives an HTML page instead of JSON now reports this hosting mismatch directly.

## Publish a shareable website link (Render)

The `render.yaml` Blueprint deploys one Node web service that serves both the website and `/api`; the public URL therefore does not send API requests to a static-site HTML fallback.

1. Push this project to a GitHub repository. Do not upload `.env`, API keys, or other secrets; `.gitignore` excludes local environment files.
2. In Render, choose **New** → **Blueprint**, connect the repository, and deploy `render.yaml`.
3. In the service environment settings, optionally add `MONGODB_URI` for saved farmer profiles, `OPENWEATHER_API_KEY` for preferred OpenWeather data, and `OPENAI_API_KEY` for AI crop/photo guidance.
4. Open and share the service's public HTTPS URL. Check `/api/health` on that same host; it must return JSON with `"ok": true`.

The website has no login or account-creation page. Farmers can optionally save details on the Profile page; the profile is stored only in that browser's local storage and remains available on that device. It is not synchronized to another device or backed up to the server.

Set `OPENWEATHER_API_KEY` as a backend-only secret in Render (or in the ignored root `.env` for local development) to use OpenWeather as the preferred weather source. The server falls back to Open-Meteo if OpenWeather is not configured or unavailable. The field advisor, crop chatbot, and photo review require `OPENAI_API_KEY`; for local development, add it to the root `.env` and restart `npm start --prefix server`, or add it to the Render service's environment settings and redeploy. The key must remain backend-only and must never be entered in browser code or committed. Features report unavailable when their backing service or required evidence is not configured rather than showing invented results.

## Data and integrations

Weather requests use freshly consented device coordinates when available; otherwise the selected Ahmedpur village is used. The Weather page requires **Check weather** after selecting a village and refreshes data periodically while it is open. OpenWeather current conditions and its five-day forecast are preferred when configured. Open-Meteo is a public fallback. Forecast values are provider/model estimates and not guaranteed field observations. Periodic forecast refresh is not a push alert service: users will not receive guaranteed warnings while the page is closed, and official IMD alert delivery must not be assumed. Crop advice and photo review use location-based weather and SoilGrids regional soil estimates; the estimates are not laboratory measurements, and advice does not use soil-test inputs. The scheme page is a curated directory of major central and Maharashtra programmes, not a live or exhaustive eligibility register. The product page shows returned mandi minimum, maximum, and modal prices for supported crop reports; reports may omit crop varieties, update dates, or Ahmedpur itself, so verify the source and current APMC rate before selling. Seed, fertilizer, and machinery prices remain seller-quote-required because no verified live Ahmedpur input-price feed is configured.

## Tech stack

- Node.js + Express
- MongoDB with Mongoose (optional, local-only persistence)
- Python + FastAPI
- HTML/CSS/JavaScript frontend
