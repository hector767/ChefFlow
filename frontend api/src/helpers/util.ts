import type { Ingredient, InventoryItem, Unit } from "../types";

// fake async loading
export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function groupBy<T>(arr: T[], key: (t: T) => string) {
    return arr.reduce<Record<string, T[]>>((acc, item) => {
        const k = key(item as any);
        acc[k] = acc[k] || [];
        acc[k].push(item);
        return acc;
    }, {});
}

export function formatQty(qty: number, unit: Unit) {
    return `${qty}${unit === "pcs" ? " pcs" : ` ${unit}`}`;
}

// --- Unit conversion helpers (volume-biased demo for tbsp/tsp/oz/cup/ml) ---
const VOLUME_EQUIV: Record<Unit, number> = {
    tsp: 1,
    tbsp: 3,
    oz: 6,     // 1 fl oz ≈ 6 tsp
    cup: 48,   // 1 cup = 48 tsp
    cups: 48,
    ml: 0.202884,
    g: NaN, lb: NaN, piece: NaN, pcs: NaN, slice: NaN, clove: NaN,
};

export function canConvert(a: Unit, b: Unit) {
    const A = VOLUME_EQUIV[a], B = VOLUME_EQUIV[b];
    return Number.isFinite(A) && Number.isFinite(B);
}

export function convertQty(qty: number, from: Unit, to: Unit): number | null {
    if (from === to) return qty;
    if (!canConvert(from, to)) return null;
    const inBase = qty * VOLUME_EQUIV[from];
    const out = inBase / VOLUME_EQUIV[to];
    return parseFloat(out.toFixed(4));
}

// consume inventory according to recipe ingredients (with unit conversion)
export function consumeInventory(inv: InventoryItem[], ing: Ingredient[]): InventoryItem[] {
    const next = inv.map((i) => ({ ...i }));
    for (const req of ing) {
        let idx = next.findIndex((i) => i.name === req.name && i.unit === req.unit);
        if (idx < 0) idx = next.findIndex((i) => i.name === req.name && canConvert(req.unit, i.unit));
        if (idx < 0) continue;
        const invItem = next[idx];
        const reqInInvUnits = req.unit === invItem.unit ? req.qty : convertQty(req.qty, req.unit, invItem.unit);
        if (reqInInvUnits == null) continue;
        invItem.qty = Math.max(0, parseFloat((invItem.qty - reqInInvUnits).toFixed(2)));
    }
    return next;
}

// generate shopping list: items below threshold
export function shoppingList(inv: InventoryItem[]) {
    return inv.filter((i) => typeof i.minThreshold === "number" && i.qty <= (i.minThreshold ?? 0));
}

export function swap<T>(arr: T[], i: number, j: number): T[] {
    const copy = [...arr];
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
    return copy;
}
