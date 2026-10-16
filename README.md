# City Weather API

An Express 5 service that looks up the current weather and a 3-day forecast for any city via Open-Meteo. It can compare 2 to 5 cities in a single request, and caches previously successful lookups to save repeat requests from hitting Open-Meteo again. 

## Run it

Requires Node 24 or newer.

Using a Bash terminal:

```bash
npm install
cp .env.example .env
npm run dev
```

If using Command Prompt, use `copy .env.example .env` instead of `cp`.

The server runs at http://localhost:4000. `npm start` runs it without watching for changes.

## Environment variables

All variables are optional. The defaults listed below are used when a variable is not set.

| Variable | Default Value | Controls |
|---|---|---|
| `PORT` | `4000` | The port the server listens on |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL of the geocoding API |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL of the forecast API |
| `UPSTREAM_TIMEOUT_MS` | `5000` | How long to wait for each Open-Meteo request |
| `CACHE_TTL_SECONDS` | `600` | How long a cached answer stays valid |

## Endpoints

### `GET /api/weather?city=<name>`

Current weather and a 3-day forecast for one city.

```bash
curl "http://localhost:4000/api/weather?city=Toronto"
```

Responds `200` with `{ data, attribution }`, where `data` has `location`, `current`, `daily` (3 days), `fetchedAt` and `cached`. Responds `400` if `city` is missing, repeated or not 2 to 60 characters, and `404` if no city matches.

### `GET /api/compare?cities=<name>,<name>,...`

The same lookup for 2 to 5 cities at once.

```bash
curl "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

Responds `200` whenever the query is valid, even if some cities fail. `data.cities` has one entry per city in the order requested, each with `ok: true` and its `weather`, or `ok: false` and an `error`. `data.summary` has `succeeded`, `failed`, `warmest` and `coldest`. Responds `400` for a missing or repeated parameter, an empty name, fewer than 2 or more than 5 cities, a name that isn't 2 to 60 characters, or a city listed twice.

### `GET /api/cache/stats`

How many answers are cached and how often the cache was used.

```bash
curl "http://localhost:4000/api/cache/stats"
```

Responds `200` with `{ data: { entries, hits, misses, ttlSeconds } }`.

## Testing

Run these in order on a freshly started server. On Windows, run them in Git Bash.

```bash
# 1. Weather for a city: 200 (cached: false)
curl -i "http://localhost:4000/api/weather?city=Toronto"

# 2. The same city again: 200 (cached: true, same fetchedAt)
curl -i "http://localhost:4000/api/weather?city=toronto"

# 3. Weather without a city: 400
curl -i "http://localhost:4000/api/weather"

# 4. Weather for a city that doesn't exist: 404
curl -i "http://localhost:4000/api/weather?city=Qwertyville"

# 5. Compare three cities: 200
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"

# 6. Compare with one city that doesn't exist: 200 (that city has ok: false, status 404)
curl -i "http://localhost:4000/api/compare?cities=Vancouver,Halifax,Qwertyville"

# 7. Compare too many cities: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax,Calgary,Ottawa,Montreal"

# 8. Compare with a repeated city: 400
curl -i "http://localhost:4000/api/compare?cities=Toronto,Halifax,toronto"

# 9. Cache stats: 200
curl -i "http://localhost:4000/api/cache/stats"

# 10. Unknown route: 404
curl -i "http://localhost:4000/api/nope"
```

To test failures, change a value in `.env` and save (the dev server restarts and empties the cache):

## Data source

Weather data by [Open-Meteo.com](https://open-meteo.com/)

## AI use

AI was used to format the README in a way that was easy to read, digest, and execute on. Other than that, the work is entirely my own. 
