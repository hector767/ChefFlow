import React, { useEffect, useMemo, useState } from "react";

/**
 * Meal Queue Web App (single-file demo)
 * FRONTEND-ONLY: React + Tailwind (no external libs)
 *
 * This build focuses on a light, muted gray/blue landing (onboarding) page
 * with a gentle fade-in. It also keeps clean seams for backend handoff later.
 *
 * Color palette: slate/stone with subtle blue accents.
 * Animations: fade-in via Tailwind transitions (no custom config required).
 */

// ========== Types ==========
export type Unit =
  | "oz"
  | "cup"
  | "cups"
  | "lb"
  | "g"
  | "ml"
  | "piece"
  | "pcs"
  | "slice"
  | "clove"
  | "tbsp"
  | "tsp";

type Ingredient = {
  name: string;
  qty: number; // quantity required
  unit: Unit;
};

type InventoryItem = {
  name: string;
  qty: number; // in the same conceptual unit you’ll consume with
  unit: Unit;
  category: "protein" | "carb" | "veg" | "dairy" | "sauce" | "bread" | "other";
  perishable?: boolean;
  minThreshold?: number; // when below, add to shopping list
};

type Recipe = {
  id: string;
  name: string;
  prepLeadMin: number; // time BEFORE cooking (e.g., thaw/soak)
  cookTimeMin: number; // active + passive cook
  steps: string[]; // concise steps
  ingredients: Ingredient[];
  tags?: string[];
};

type Meal = {
  id: string;
  label: string; // e.g., "Tuesday Lunch"
  recipeId: string;
  portions?: number;
  notes?: string;
};

type UserProfile = {
  age: number | null;
  height: string; // "5'7\"" or cm
  weightLbs: number | null;
  desiredCalories: number | null; // optional
  desiredProtein: number | null; // g/day
  spiceTolerance: "mild" | "medium" | "hot" | "insane";
  dislikes: string; // comma-separated for now
  mealsToPrep: number; // count the app should plan for
  fridgeText: string; // free text list of items on hand
  maxPrepMinutes: number | null; // per-meal prep time cap
  onboardingComplete: boolean;
};

// Optional: request/response seams for backend handoff later
export type MealKey = {
  day: string; // e.g., "Mon"
  meal: string; // e.g., "Lunch"
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  recipe: string; // markdown or structured steps
  prepTimeWarning?: string | null;
  usesFridgeInventory: string[]; // matched items
  tools: string[]; // e.g., ["skillet", "oven"]
};

export type MealPlanRequest = {
  profile: UserProfile;
  inventory: InventoryItem[];
};

export type MealPlanResponse = {
  queue: MealKey[]; // for the week
  grocery: { name: string; qty: number; unit: Unit }[]; // extras to buy
};

// ========== Seed Data (demo) ==========
const seedInventory: InventoryItem[] = [
  { name: "Carne asada (cooked)", qty: 18, unit: "oz", category: "protein", perishable: true, minThreshold: 9 },
  { name: "Shrimp (raw, thawed)", qty: 16, unit: "oz", category: "protein", perishable: true },
  { name: "Cooked beans", qty: 6, unit: "cup", category: "carb", perishable: true, minThreshold: 2 },
  { name: "Roasted sweet potatoes", qty: 6, unit: "cup", category: "carb", perishable: true },
  { name: "Rice (cooked)", qty: 4, unit: "cup", category: "carb", perishable: true, minThreshold: 2 },
  { name: "Greek yogurt", qty: 24, unit: "oz", category: "dairy", perishable: true },
  { name: "Cotija", qty: 8, unit: "oz", category: "dairy", perishable: true },
  { name: "Mozzarella", qty: 8, unit: "oz", category: "dairy", perishable: true },
  { name: "Tortillas (medium)", qty: 10, unit: "pcs", category: "bread", perishable: false, minThreshold: 4 },
  { name: "Naan", qty: 2, unit: "pcs", category: "bread", perishable: true, minThreshold: 1 },
  { name: "Pita", qty: 4, unit: "pcs", category: "bread", perishable: true },
  { name: "Bolillo rolls", qty: 4, unit: "pcs", category: "bread", perishable: true },
  { name: "Salsa verde", qty: 12, unit: "oz", category: "sauce", perishable: true },
  { name: "Marinara", qty: 12, unit: "oz", category: "sauce", perishable: true },
  { name: "Limes", qty: 6, unit: "pcs", category: "veg", perishable: true },
  { name: "Cucumber", qty: 2, unit: "pcs", category: "veg", perishable: true },
  { name: "Red onion", qty: 2, unit: "pcs", category: "veg", perishable: true },
  { name: "Cilantro", qty: 2, unit: "pcs", category: "veg", perishable: true },
];

const recipes: Recipe[] = [
  {
    id: "shrimp-beans-salad",
    name: "Shrimp + Beans + Cucumber Salad",
    prepLeadMin: 0,
    cookTimeMin: 15,
    steps: [
      "Pat 8 oz shrimp dry. Season with 1 tsp oil, 1 clove garlic (minced), 1/2 tsp paprika, salt/pepper.",
      "Sear shrimp 2–3 min/side on medium‑high until pink.",
      "Warm 1 cup cooked beans in a pan 5 min (pinch cumin + squeeze lime).",
      "Dice 1/2 cucumber + slice 1/4 red onion + 1 tbsp cilantro; toss with juice of 1/2 lime + pinch salt.",
      "Plate: shrimp + beans + salad. Optional 1 tbsp cotija on top.",
    ],
    ingredients: [
      { name: "Shrimp (raw, thawed)", qty: 8, unit: "oz" },
      { name: "Cooked beans", qty: 1, unit: "cup" },
      { name: "Cucumber", qty: 0.5, unit: "pcs" },
      { name: "Red onion", qty: 0.25, unit: "pcs" },
      { name: "Cilantro", qty: 0.25, unit: "pcs" },
      { name: "Limes", qty: 0.5, unit: "pcs" },
      { name: "Cotija", qty: 1, unit: "tbsp" },
    ],
    tags: ["quiet", "high-protein", "fast"],
  },
  {
    id: "shrimp-sweetpot-salsaverde",
    name: "Shrimp + Sweet Potatoes + Salsa Verde",
    prepLeadMin: 0,
    cookTimeMin: 20,
    steps: [
      "Pat 8 oz shrimp dry; season as above. Sear 2–3 min/side.",
      "Crisp 1 cup roasted sweet potatoes in skillet 3–4 min.",
      "Warm 2 tbsp salsa verde; drizzle over shrimp + potatoes.",
      "Finish with 1 tbsp cotija + lime squeeze.",
    ],
    ingredients: [
      { name: "Shrimp (raw, thawed)", qty: 8, unit: "oz" },
      { name: "Roasted sweet potatoes", qty: 1, unit: "cup" },
      { name: "Salsa verde", qty: 2, unit: "tbsp" },
      { name: "Cotija", qty: 1, unit: "tbsp" },
      { name: "Limes", qty: 0.5, unit: "pcs" },
    ],
    tags: ["dinner", "high-protein"],
  },
  {
    id: "pepperoni-flatbread",
    name: "Turkey Pepperoni Flatbread Pizza",
    prepLeadMin: 0,
    cookTimeMin: 12,
    steps: [
      "Preheat oven to 425°F. Brush naan lightly with oil.",
      "Spread 1/4 cup marinara per naan; top with 2 oz shredded mozzarella.",
      "Add 8–10 turkey pepperoni per naan; optional onion/jalapeño.",
      "Bake 8–10 min until bubbly; rest 2 min and slice.",
    ],
    ingredients: [
      { name: "Naan", qty: 1, unit: "pcs" },
      { name: "Marinara", qty: 6, unit: "oz" },
      { name: "Mozzarella", qty: 2, unit: "oz" },
    ],
    tags: ["comfort", "fast"],
  },
  {
    id: "korean-beef-bowl",
    name: "Korean Beef Bowl",
    prepLeadMin: 0,
    cookTimeMin: 20,
    steps: [
      "Brown 10 oz ground beef/turkey; drain.",
      "Stir in 1 tbsp gochujang + 1 tbsp soy; simmer 2–3 min.",
      "Serve over 1 cup cooked rice; top with fried egg + sliced green onion.",
    ],
    ingredients: [{ name: "Rice (cooked)", qty: 1, unit: "cup" }],
    tags: ["protein-bomb"],
  },
];

const seedQueue: Meal[] = [
  { id: "mon-dinner", label: "Monday Dinner (Pepperoni Flatbread)", recipeId: "pepperoni-flatbread" },
  { id: "tue-lunch", label: "Tuesday Lunch", recipeId: "shrimp-beans-salad" },
  { id: "tue-dinner", label: "Tuesday Dinner", recipeId: "shrimp-sweetpot-salsaverde" },
  { id: "wed-dinner", label: "Wednesday Dinner", recipeId: "korean-beef-bowl" },
];

// ========== Persistence ==========
const LS_KEY = "meal-queue-state-v2";
const PROFILE_KEY = "meal-queue-profile-v2-light";

type AppState = {
  inventory: InventoryItem[];
  queue: Meal[];
  completed: string[]; // meal ids
};

const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw);
  } catch {
    return { inventory: seedInventory, queue: seedQueue, completed: [] };
  }
};

const saveState = (s: AppState) => localStorage.setItem(LS_KEY, JSON.stringify(s));

const loadProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) throw new Error("empty");
    return JSON.parse(raw);
  } catch {
    return {
      age: null,
      height: "",
      weightLbs: null,
      desiredCalories: 1800,
      desiredProtein: 150,
      spiceTolerance: "medium",
      dislikes: "",
      mealsToPrep: 6,
      fridgeText: "",
      maxPrepMinutes: 30,
      onboardingComplete: false,
    };
  }
};

const saveProfile = (p: UserProfile) => localStorage.setItem(PROFILE_KEY, JSON.stringify(p));

// ========== Helpers ==========
function groupBy<T>(arr: T[], key: (t: T) => string) {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item as any);
    acc[k] = acc[k] || [];
    acc[k].push(item);
    return acc;
  }, {});
}

function formatQty(qty: number, unit: Unit) {
  return `${qty}${unit === "pcs" ? " pcs" : ` ${unit}`}`;
}

// --- Unit conversion helpers (volume-biased demo) ---
const VOLUME_EQUIV: Record<Unit, number> = {
  tsp: 1,
  tbsp: 3, // 1 tbsp = 3 tsp
  oz: 6, // 1 fl oz ≈ 6 tsp
  cup: 48, // 1 cup = 48 tsp
  cups: 48,
  ml: 0.202884, // ≈ tsp
  g: NaN,
  lb: NaN,
  piece: NaN,
  pcs: NaN,
  slice: NaN,
  clove: NaN,
};

function canConvert(a: Unit, b: Unit) {
  const A = VOLUME_EQUIV[a], B = VOLUME_EQUIV[b];
  return Number.isFinite(A) && Number.isFinite(B);
}

function convertQty(qty: number, from: Unit, to: Unit): number | null {
  if (from === to) return qty;
  if (!canConvert(from, to)) return null;
  const inBase = qty * VOLUME_EQUIV[from];
  const out = inBase / VOLUME_EQUIV[to];
  return parseFloat(out.toFixed(4));
}

// consume inventory according to recipe ingredients (with unit conversion)
function consumeInventory(inv: InventoryItem[], ing: Ingredient[]): InventoryItem[] {
  const next = inv.map((i) => ({ ...i }));
  for (const req of ing) {
    let idx = next.findIndex((i) => i.name === req.name && i.unit === req.unit);
    if (idx < 0) idx = next.findIndex((i) => i.name === req.name && canConvert(req.unit, i.unit));
    if (idx < 0) continue; // not in stock

    const invItem = next[idx];
    const reqInInvUnits = req.unit === invItem.unit ? req.qty : convertQty(req.qty, req.unit, invItem.unit);
    if (reqInInvUnits == null) continue; // non-convertible units

    invItem.qty = Math.max(0, parseFloat((invItem.qty - reqInInvUnits).toFixed(2)));
  }
  return next;
}

// generate shopping list: items below threshold
function shoppingList(inv: InventoryItem[]) {
  return inv.filter((i) => typeof i.minThreshold === "number" && i.qty <= (i.minThreshold ?? 0));
}

function getRecipe(id: string) {
  return recipes.find((r) => r.id === id);
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const copy = [...arr];
  const tmp = copy[i];
  copy[i] = copy[j];
  copy[j] = tmp;
  return copy;
}

// fake async loading
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ========== Backend seam (stub) ==========
async function requestMealPlan(_req: MealPlanRequest): Promise<MealPlanResponse> {
  // TODO: replace with real fetch("/api/plan", { method: "POST", body: JSON.stringify(_req) })
  await wait(700);
  return {
    queue: [],
    grocery: [],
  };
}

// ========== Components ==========
function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
        <div className="text-sm text-slate-500">{label}…</div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
  );
}

function Onboarding({ onDone }: { onDone: () => void }) {
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false); // fade-in control

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  const submit = async () => {
    setLoading(true);
    // seam: when backend is ready, send profile + inventory to get a generated plan
    try {
      await requestMealPlan({ profile, inventory: seedInventory });
    } finally {
      await wait(500);
      saveProfile({ ...profile, onboardingComplete: true });
      setLoading(false);
      onDone();
    }
  };

  const randomize = async () => {
    setLoading(true);
    await wait(400);
    setProfile((p) => ({ ...p, onboardingComplete: true }));
    saveProfile({ ...profile, onboardingComplete: true });
    setLoading(false);
    onDone();
  };

  if (loading) return <LoadingScreen label="Setting things up" />;

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 transition-opacity duration-700 ${
      visible ? "opacity-100" : "opacity-0"
    }`}>
      <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Welcome</h1>
          <p className="text-slate-600 text-sm">
            Tell me your targets and what you have. I’ll craft a precise grocery list and a zero‑leftovers plan.
          </p>
        </header>

        {/* quick summary guide */}
        <Card className="p-4 md:p-5">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Daily Targets</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500 self-center">Calories</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.desiredCalories ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, desiredCalories: Number(e.target.value) }))}
                  placeholder="1800"
                />
                <label className="text-xs text-slate-500 self-center">Protein (g)</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.desiredProtein ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, desiredProtein: Number(e.target.value) }))}
                  placeholder="150"
                />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">You</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500 self-center">Age</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.age ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                  placeholder="21"
                />
                <label className="text-xs text-slate-500 self-center">Height</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.height}
                  onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
                  placeholder={`5'7"`}
                />
                <label className="text-xs text-slate-500 self-center">Weight (lb)</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.weightLbs ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, weightLbs: Number(e.target.value) }))}
                  placeholder="160"
                />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Prep Settings</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-slate-500 self-center">Meals to Prep</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.mealsToPrep}
                  onChange={(e) => setProfile((p) => ({ ...p, mealsToPrep: Number(e.target.value) }))}
                  placeholder="6"
                />
                <label className="text-xs text-slate-500 self-center">Max Prep (min)</label>
                <input
                  type="number"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.maxPrepMinutes ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...p, maxPrepMinutes: Number(e.target.value) }))}
                  placeholder="30"
                />
                <label className="text-xs text-slate-500 self-center">Spice</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={profile.spiceTolerance}
                  onChange={(e) => setProfile((p) => ({ ...p, spiceTolerance: e.target.value as UserProfile["spiceTolerance"] }))}
                >
                  <option value="mild">Mild</option>
                  <option value="medium">Medium</option>
                  <option value="hot">Hot</option>
                  <option value="insane">Insane</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 md:p-5">
            <label className="block text-xs text-slate-500 mb-1">Dislikes / Avoid</label>
            <input
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={profile.dislikes}
              onChange={(e) => setProfile((p) => ({ ...p, dislikes: e.target.value }))}
              placeholder="e.g., olives, blue cheese"
            />
          </Card>

          <Card className="p-4 md:p-5">
            <label className="block text-xs text-slate-500 mb-1">What’s in your fridge to use?</label>
            <textarea
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 h-24 text-sm"
              value={profile.fridgeText}
              onChange={(e) => setProfile((p) => ({ ...p, fridgeText: e.target.value }))}
              placeholder="e.g., steak, shrimp, beans, yogurt, cucumbers"
            />
          </Card>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={submit}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
          >Build My Plan</button>
          <button
            onClick={randomize}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-medium"
          >Skip / Randomize</button>
        </div>
      </div>
    </div>
  );
}

function QueuePage({ state, setState }: { state: AppState; setState: (s: AppState) => void }) {
  const { queue, inventory, completed } = state;
  const [loading, setLoading] = useState(false);
  const [altOffset, setAltOffset] = useState(3); // default: alternate with 3-days-ahead meal

  const currentMeal = queue[0];
  const currentRecipe = currentMeal ? getRecipe(currentMeal.recipeId) : undefined;
  const nextUp = queue
    .slice(1, 4)
    .map((m) => ({ m, r: getRecipe(m.recipeId) }))
    .filter((x) => !!x.r) as { m: Meal; r: Recipe }[];

  const prepWarning = useMemo(() => {
    if (!currentRecipe) return null;
    return currentRecipe.prepLeadMin > 30
      ? `Heads up: ${currentRecipe.name} needs ${currentRecipe.prepLeadMin} min prep lead.`
      : null;
  }, [currentRecipe]);

  const completeCurrentMeal = async () => {
    if (!currentMeal || !currentRecipe) return;
    setLoading(true);
    await wait(600);
    const updatedInv = consumeInventory(inventory, currentRecipe.ingredients);
    const updatedQueue = queue.slice(1);
    const updatedCompleted = [...completed, currentMeal.id];
    setState({ inventory: updatedInv, queue: updatedQueue, completed: updatedCompleted });
    setLoading(false);
  };

  const skipCurrentMeal = async () => {
    if (!currentMeal) return;
    setLoading(true);
    await wait(300);
    const updatedQueue = [...queue.slice(1), currentMeal];
    setState({ ...state, queue: updatedQueue });
    setLoading(false);
  };

  const alternateSwap = async () => {
    if (queue.length <= altOffset) return;
    setLoading(true);
    await wait(300);
    const updatedQueue = swap(queue, 0, altOffset);
    setState({ ...state, queue: updatedQueue });
    setLoading(false);
  };

  const shop = shoppingList(inventory);
  const invGrouped = groupBy(inventory, (i) => i.category);

  if (loading) return <LoadingScreen label="Working" />;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Column 1: Queue */}
        <div className="lg:col-span-2 space-y-4">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-800">Meal Queue</h1>
            <div className="flex items-center gap-2 text-slate-600">
              <label className="text-xs">Alternate with +</label>
              <input
                type="number"
                min={1}
                value={altOffset}
                onChange={(e) => setAltOffset(Math.max(1, Number(e.target.value)))}
                className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right text-sm"
              />
              <span className="text-xs">in queue</span>
            </div>
          </header>

          {currentMeal && currentRecipe ? (
            <Card className="p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">Current Meal</div>
                  <h2 className="text-xl font-semibold">{currentMeal.label}</h2>
                </div>
                <div className="text-xs text-slate-500">Cook time ~{currentRecipe.cookTimeMin} min</div>
              </div>

              {prepWarning && <div className="mt-3 text-amber-600 text-sm">{prepWarning}</div>}

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 text-slate-800">Steps</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                    {currentRecipe.steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-slate-800">Ingredients (auto‑deduct)</h3>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {currentRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>{(ing as any).name}</span>
                        <span className="text-slate-500">{formatQty(ing.qty, ing.unit)}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={completeCurrentMeal}
                      className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                    >Complete</button>
                    <button
                      onClick={skipCurrentMeal}
                      className="py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-medium"
                    >Skip</button>
                    <button
                      onClick={alternateSwap}
                      className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
                    >Alternate</button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center text-slate-600">Queue empty. Add more meals.</Card>
          )}

          {/* Next up preview */}
          <Card className="p-4 md:p-5">
            <h3 className="font-semibold mb-3 text-slate-800">Next Up</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {nextUp.map(({ m, r }) => (
                <div key={m.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500">{m.label}</div>
                  <div className="font-medium text-slate-800">{r.name}</div>
                  <div className="text-xs text-slate-500 mt-1">Lead: {r.prepLeadMin} min • Cook: {r.cookTimeMin} min</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Column 2: Inventory & Shopping */}
        <div className="space-y-4">
          <Card className="p-4 md:p-5">
            <h3 className="font-semibold mb-3 text-slate-800">Inventory</h3>
            <div className="space-y-3">
              {Object.entries(invGrouped).map(([cat, items]) => (
                <div key={cat}>
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">{cat}</div>
                  <div className="divide-y divide-slate-200">
                    {items.map((it) => (
                      <div key={it.name} className="flex items-center justify-between py-2">
                        <div className="text-sm text-slate-800">{it.name}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right text-sm"
                            value={it.qty}
                            onChange={(e) => {
                              const qty = Number(e.target.value);
                              setState((s) => ({
                                ...s,
                                inventory: s.inventory.map((x) => (x.name === it.name ? { ...x, qty } : x)),
                              }));
                            }}
                          />
                          <span className="text-slate-500 text-sm">{it.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 md:p-5">
            <h3 className="font-semibold mb-3 text-slate-800">Shopping List (auto)</h3>
            {shop.length === 0 ? (
              <div className="text-sm text-slate-600">Nothing flagged. You’re stocked.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {shop.map((it) => (
                  <li key={it.name} className="flex items-center justify-between">
                    <span className="text-slate-800">{it.name}</span>
                    <span className="text-slate-500">low (current: {it.qty} {it.unit})</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

// ========== Root App ==========
export default function App() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [state, setState] = useState<AppState>(loadState());
  const [route, setRoute] = useState<"loading" | "onboarding" | "queue">("loading");

  useEffect(() => {
    const go = async () => {
      await wait(350);
      setRoute(profile.onboardingComplete ? "queue" : "onboarding");
    };
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => saveState(state), [state]);
  useEffect(() => saveProfile(profile), [profile]);

  if (route === "loading") return <LoadingScreen label="Booting up" />;
  if (route === "onboarding") return <Onboarding onDone={() => setRoute("queue")} />;
  return <QueuePage state={state} setState={setState} />;
}
