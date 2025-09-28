import type { MealPlanRequest, MealPlanResponse } from "../types";
import { wait } from "./util";

// ========== Backend seam (stub) ==========
export default async function requestMealPlan(_req: MealPlanRequest): Promise<MealPlanResponse> {
    // TODO: replace with real fetch("/api/plan", { method: "POST", body: JSON.stringify(_req) })
    await wait(500);
    return { queue: [], grocery: [] };
}