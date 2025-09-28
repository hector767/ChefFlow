
# ZeroWaste Chef (Hackathon MVP)

Backend: FastAPI + Nutritionix (macros) + optional Spoonacular (recipes).

## Quickstart

```bash
# 1) Create venv (Windows)
py -m venv .venv
.\.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate

# 2) Install
pip install -r requirements.txt

# 3) Configure env
cp .env.example .env   # (Windows: copy .env.example .env)
# Fill in NUTRITIONIX_* and optional SPOONACULAR_API_KEY

# 4) Run
uvicorn main:app --reload --port 8001
```

Open docs: http://127.0.0.1:8001/docs

## Endpoints

- `GET /health` → `{ ok: true }`
- `POST /calculate` → Body: `{ "foods": ["2 eggs", "200g rice", "150g chicken"] }`
- `POST /recipes` → Body: `{ "ingredients": ["chicken","rice","broccoli"], "count": 5 }` (requires Spoonacular key)
- `POST /plan` → Body: `{ "profile": {...}, "inventory": [...], "targetMeals": 3 }` (stub returns sample meals)

## Deploy (Heroku-style Procfile)
Use the Procfile provided or on Render set start command:
```
uvicorn main:app --host 0.0.0.0 --port 8000
```
