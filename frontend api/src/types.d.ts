
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

export type Ingredient = {
    name: string;
    qty: number; // quantity required
    unit: Unit;
};

export type InventoryItem = {
    name: string;
    qty: number;
    unit: Unit;
    category: "protein" | "carb" | "veg" | "dairy" | "sauce" | "bread" | "other";
    perishable?: boolean;
    minThreshold?: number;
};

export type Recipe = {
    id: string;
    name: string;
    prepLeadMin: number; // time BEFORE cooking (e.g., thaw/soak)
    cookTimeMin: number; // cook time (active+passive)
    steps: string[];
    ingredients: Ingredient[];
    tags?: string[];
};

export type Meal = {
    id: string;
    label: string; // e.g., "Tuesday Lunch"
    recipeId: string;
    portions?: number;
    notes?: string;
};

export type UserProfile = {
    age: number | null;
    height: string; // "5'7\"" or cm
    weightLbs: number | null;
    desiredCalories: number | null; // kcal/day
    desiredProtein: number | null;  // g/day
    desiredCarbs: number | null;    // g/day
    desiredFat: number | null;      // g/day
    spiceTolerance: "mild" | "medium" | "hot" | "insane";
    dislikes: string; // comma-separated
    mealsToPrep: number;
    fridgeText: string;
    onboardingComplete: boolean;
};

// Optional: request/response seam for backend handoff later
export type MealKey = {
    day: string; // "Mon"
    meal: string; // "Lunch"
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    recipe: string; // markdown or text steps
    prepTimeWarning?: string | null;
    usesFridgeInventory: string[];
    tools: string[];
};

export type MealPlanRequest = {
    profile: UserProfile;
    inventory: InventoryItem[];
};

export type MealPlanResponse = {
    queue: MealKey[]; // for the week
    grocery: { name: string; qty: number; unit: Unit }[];
};

export type AppState = {
    inventory: InventoryItem[];
    queue: Meal[];
    completed: string[]; // meal ids
};
