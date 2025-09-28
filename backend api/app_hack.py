# app_hack.py
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
import os, requests

app = FastAPI(title="ZeroWaste Chef")

# CORS (add your frontend URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NUTRITIONIX_URL = "https://trackapi.nutritionix.com/v2/natural/nutrients"
APP_ID  = os.getenv("NUTRITIONIX_APP_ID")
API_KEY = os.getenv("NUTRITIONIX_API_KEY")

@app.get("/health")
def health(): return {"ok": True}

@app.post("/calculate")
def calculate(body: dict = Body(..., example={"foods":["2 eggs","200g rice","150g chicken"]})):
    q = ", ".join(body.get("foods", []))
    headers = {"x-app-id": APP_ID, "x-app-key": API_KEY, "Content-Type":"application/json"}
    r = requests.post(NUTRITIONIX_URL, headers=headers, json={"query": q}); r.raise_for_status()
    data = r.json()

    totals = {"calories":0.0,"protein":0.0,"fat":0.0,"carbs":0.0}
    items = []
    for f in data.get("foods", []):
        c,p,fat,carb = f["nf_calories"], f["nf_protein"], f["nf_total_fat"], f["nf_total_carbohydrate"]
        totals["calories"] += c; totals["protein"] += p; totals["fat"] += fat; totals["carbs"] += carb
        items.append({
            "item": f["food_name"],
            "grams": f.get("serving_weight_grams"),
            "calories": round(c,1), "protein": round(p,1), "fat": round(fat,1), "carbs": round(carb,1)
        })
    meals = max(1, int(totals["calories"] // 600))
    return {"totals": {k: round(v,1) for k,v in totals.items()}, "mealsEstimated": meals, "itemsCalculated": items}

@app.post("/plan")
def plan(body: dict = Body(..., example={"profile":{"maxPrepMin":20},"inventory":["2 eggs","200g rice"], "targetMeals":3})):
    # stub so FE can integrate your schema now
    sample = [
        {
          "day":"Mon","meal":"Lunch","name":"Chicken Rice Bowl","calories":620,
          "protein":38,"fat":18,"carbs":78,
          "recipe":"Sauté chicken, steam rice, toss with broccoli.",
          "prepTimeMin":25,"prepWarning":"Longer than your 20-min limit",
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
    return {"meals": sample, "grocery": grocery}
