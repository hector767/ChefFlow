import { useMemo, useState } from "react";
import type { AppState, Meal, Recipe } from "../types";
import { getRecipe } from "../helpers/seeds";
import { consumeInventory, formatQty, groupBy, shoppingList, swap, wait } from "../helpers/util";
import LoadingScreen from "../components/LoadingScreen";
import Card from "../components/Card";

// ========== Queue Page ==========
export default function QueuePage({
    state,
    setState,
}: {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>; // dispatcher type so functional updaters work
}) {
    const { queue, inventory, completed } = state;
    const [loading, setLoading] = useState(false);
    const [altOffset, setAltOffset] = useState(3); // swap with +N ahead

    const currentMeal = queue[0];
    const currentRecipe = currentMeal ? getRecipe(currentMeal.recipeId) : undefined;
    const nextUp = queue
        .slice(1, 4)
        .map((m) => ({ m, r: getRecipe(m.recipeId) }))
        .filter((x): x is { m: Meal; r: Recipe } => Boolean(x.r));

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
                                    <h3 className="font-semibold mb-2 text-slate-800">Ingredients (auto-deduct)</h3>
                                    <ul className="space-y-1 text-sm text-slate-700">
                                        {currentRecipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-center justify-between">
                                                <span>{ing.name}</span>
                                                <span className="text-slate-500">{formatQty(ing.qty, ing.unit)}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <button
                                            onClick={completeCurrentMeal}
                                            className="py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={skipCurrentMeal}
                                            className="py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-medium"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            onClick={alternateSwap}
                                            className="py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium"
                                        >
                                            Alternate
                                        </button>
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
                                    <div className="text-xs text-slate-500 mt-1">
                                        Lead: {r.prepLeadMin} min • Cook: {r.cookTimeMin} min
                                    </div>
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
                                                            const raw = e.target.value;
                                                            const qty = raw === "" ? 0 : Number(raw);
                                                            setState((s) => ({
                                                                ...s,
                                                                inventory: s.inventory.map((x) =>
                                                                    x.name === it.name ? { ...x, qty } : x
                                                                ),
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
                                        <span className="text-slate-500">
                                            low (current: {it.qty} {it.unit})
                                        </span>
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
