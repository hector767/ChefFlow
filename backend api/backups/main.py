
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os, requests

# Load .env variables locally
load_dotenv()

app = FastAPI(title="ZeroWaste Chef", version="0.1.0")

# CORS — in hackathon, allow all; lock down to your FE origin later
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- External APIs ---
NUTRITIONIX_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"
NIX_APP_ID  = os.getenv("NUTRITIONIX_APP_ID")
NIX_API_KEY = os.getenv("NUTRITIONIX_API_KEY")

SPOON_URL = "https://api.spoonacular.com/recipes"
SPOON_KEY = os.getenv("SPOONACULAR_API_KEY")  # optional

def require_nutritionix():
    if not NIX_APP_ID or not NIX_API_KEY:
        raise HTTPException(status_code=500, detail="Nutritionix credentials missing. Set NUTRITIONIX_APP_ID and NUTRITIONIX_API_KEY in .env")

def require_spoonacular():
    if not SPOON_KEY:
        raise HTTPException(status_code=500, detail="Spoonacular API key missing. Set SPOONACULAR_API_KEY in .env")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/calculate", tags=["macros"])
def calculate(body: dict = Body(..., example={"foods":["2 eggs","200g rice","150g chicken"]})):
    """Totals calories/macros using Nutritionix natural-language endpoint."""
    require_nutritionix()
    foods = body.get("foods", [])
    if not foods:
        raise HTTPException(status_code=400, detail="Provide foods as a non-empty list")
    q = ", ".join(foods)

    headers = {
        "x-app-id": NIX_APP_ID,
        "x-app-key": NIX_API_KEY,
        "Content-Type":"application/json"
    }
    r = requests.post(NUTRITIONIX_URL, headers=headers, json={"query": q}, timeout=20)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Nutritionix error: {r.text}")
    data = r.json()

    totals = {"calories":0.0,"protein":0.0,"fat":0.0,"carbs":0.0}
    items = []
    for f in data.get("foods", []):
        c = f.get("nf_calories", 0.0)
        p = f.get("nf_protein", 0.0)
        fat = f.get("nf_total_fat", 0.0)
        carb = f.get("nf_total_carbohydrate", 0.0)
        totals["calories"] += c; totals["protein"] += p; totals["fat"] += fat; totals["carbs"] += carb
        items.append({
            "item": f.get("food_name"),
            "grams": f.get("serving_weight_grams"),
            "calories": round(c,1), "protein": round(p,1),
            "fat": round(fat,1), "carbs": round(carb,1)
        })
    meals = max(1, int(totals["calories"] // 600))  # ~600 kcal / lunch baseline
    return {
        "totals": {k: round(v,1) for k,v in totals.items()},
        "mealsEstimated": meals,
        "itemsCalculated": items
    }

@app.post("/recipes", tags=["recipes"])
def recipes(body: dict = Body(..., example={"ingredients": ["chicken","rice","broccoli"], "count": 5})):
    """Find recipes by ingredients using Spoonacular (optional)."""
    require_spoonacular()
    ingredients = body.get("ingredients", [])
    count = int(body.get("count", 5))
    if not ingredients:
        raise HTTPException(status_code=400, detail="Provide ingredients as a non-empty list")

    params = {
        "ingredients": ",".join(ingredients),
        "number": count,
        "ranking": 1,
        "ignorePantry": "true",
        "apiKey": SPOON_KEY,
    }
    r = requests.get(f"{SPOON_URL}/findByIngredients", params=params, timeout=20)
    if r.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Spoonacular error: {r.text}")
    ids = r.json()

    # Get details for each recipe (include nutrition + time)
    out = []
    for rec in ids:
        rid = rec.get("id")
        p = {"includeNutrition": "true", "apiKey": SPOON_KEY}
        r2 = requests.get(f"{SPOON_URL}/{rid}/information", params=p, timeout=20)
        if r2.status_code >= 400:
            # Skip bad entries, but continue
            continue
        d = r2.json()
        out.append({
            "id": d.get("id"),
            "name": d.get("title"),
            "readyInMinutes": d.get("readyInMinutes"),
            "servings": d.get("servings"),
            "url": d.get("sourceUrl"),
            "image": d.get("image"),
            "nutrition": d.get("nutrition"),
        })
    return out

@app.post("/plan", tags=["planner"])
def plan(body: dict = Body(..., example={
    "profile":{"maxPrepMin":20,"spice":"medium"},
    "inventory":["2 eggs","200g rice","150g chicken"],
    "targetMeals":3
})):
    """Stub planner: returns two example lunches + a sample grocery delta.
    Replace with your greedy allocator when ready.
    """
    profile = body.get("profile", {})
    inventory = body.get("inventory", [])
    target = int(body.get("targetMeals", 3))

    sample = [
        {
          "day":"Mon","meal":"Lunch","name":"Chicken Rice Bowl","calories":620,
          "protein":38,"fat":18,"carbs":78,
          "recipe":"Sauté chicken, steam rice, toss with broccoli.",
          "prepTimeMin":25,"prepWarning":("Longer than your limit" if profile.get("maxPrepMin", 20) < 25 else None),
          "usesInventory":["chicken breast 150g","rice 200g","broccoli 120g"],
          "tools":["pan","knife","cutting board"]
        },
        {
          "day":"Tue","meal":"Lunch","name":"Egg & Avocado Toast","calories":520,
          "protein":22,"fat":28,"carbs":46,
          "recipe":"Toast bread, fry eggs, slice avocado, assemble.",
          "prepTimeMin":12,"prepWarning":None,
          "usesInventory":["eggs 2","avocado 1","bread 2 slices"],
          "tools":["pan","toaster","knife"]
        }
    ]
    grocery = [{"name":"broccoli","qty":200,"unit":"g","reason":"low"}]
    return {"meals": sample[:target], "grocery": grocery, "note":"planner stub; replace with real allocator"}
