import type { InventoryItem, Meal, Recipe } from "../types";

// ========== Seed Data (demo) ==========
export const seedInventory: InventoryItem[] = [
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

export const recipes: Recipe[] = [
    {
        id: "shrimp-beans-salad",
        name: "Shrimp + Beans + Cucumber Salad",
        prepLeadMin: 0,
        cookTimeMin: 15,
        steps: [
            "Pat 8 oz shrimp dry. Season with 1 tsp oil, 1 clove garlic (minced), 1/2 tsp paprika, salt/pepper.",
            "Sear shrimp 2–3 min/side on medium-high until pink.",
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

export const seedQueue: Meal[] = [
    { id: "mon-dinner", label: "Monday Dinner (Pepperoni Flatbread)", recipeId: "pepperoni-flatbread" },
    { id: "tue-lunch", label: "Tuesday Lunch", recipeId: "shrimp-beans-salad" },
    { id: "tue-dinner", label: "Tuesday Dinner", recipeId: "shrimp-sweetpot-salsaverde" },
    { id: "wed-dinner", label: "Wednesday Dinner", recipeId: "korean-beef-bowl" },
];

export function getRecipe(id: string) {
    return recipes.find((r) => r.id === id);
}