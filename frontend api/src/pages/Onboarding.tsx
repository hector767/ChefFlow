import { useEffect, useState } from "react";
import requestMealPlan from "../helpers/requestMealPlan";
import useProfile from "../hooks/useProfile";
import { wait } from "../helpers/util";
import useStateState from "../hooks/useStateState";
import LoadingScreen from "../components/LoadingScreen";
import Card from "../components/Card";
import type { UserProfile } from "../types";

// ========== Onboarding ==========
export default function Onboarding({ onDone }: { onDone: () => void }) {
    const { profile, setProfile, saveProfile } = useProfile();
    const { inventory, queue, } = useStateState();

    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false); // fade-in

    // Baseline targets for meters (approx "average" scale)
    const BASE = { calories: 2000, protein: 100, carbs: 275, fat: 70 };
    const clamp = (n: number, min = 0, max = 150) => Math.max(min, Math.min(max, n));
    const pct = (val: number | null | undefined, base: number) =>
        clamp(Math.round(((val || 0) / base) * 100));

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 40);
        return () => clearTimeout(t);
    }, []);

    const submit = async () => {
        setLoading(true);
        try {
            await requestMealPlan({ profile, inventory });
        } finally {
            await wait(400);
            setProfile({ ...profile, onboardingComplete: true });
            saveProfile();
            setLoading(false);
            onDone();
        }
    };

    const randomize = async () => {
        setLoading(true);
        await wait(300);
        setProfile((p) => ({ ...p, onboardingComplete: true }));
        saveProfile();
        setLoading(false);
        onDone();
    };

    if (loading) return <LoadingScreen label="Setting things up" />;

    const Meter = ({ label, value, base }: { label: string; value: number | null | undefined; base: number }) => {
        const percent = pct(value, base);
        return (
            <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>{label}</span>
                    <span>
                        {value ?? 0}
                        {label === "Calories" ? " kcal" : " g"} • {percent}%
                    </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div style={{ width: `${percent}%` }} className="h-full bg-blue-500 transition-all" />
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-slate-100 text-slate-900 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
            <div className="max-w-6xl mx-auto p-8 md:p-12 space-y-8">
                <header className="space-y-2">
                    <h1 className="text-4xl font-semibold tracking-tight text-slate-800">Welcome</h1>
                    <p className="text-slate-600 text-base">
                        Tell me your targets and what you have. I’ll craft a precise grocery list and a zero-leftovers plan.
                    </p>
                </header>

                {/* Targets with meters */}
                <Card className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Daily Targets</div>
                            <div className="grid grid-cols-2 gap-3 items-center">
                                <label className="text-xs text-slate-600">Calories</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                    value={profile.desiredCalories ?? ""}
                                    onChange={(e) => setProfile((p) => ({ ...p, desiredCalories: Number(e.target.value) }))}
                                    placeholder="2000"
                                />

                                <label className="text-xs text-slate-600">Protein (g)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                    value={profile.desiredProtein ?? ""}
                                    onChange={(e) => setProfile((p) => ({ ...p, desiredProtein: Number(e.target.value) }))}
                                    placeholder="100"
                                />

                                <label className="text-xs text-slate-600">Carbs (g)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                    value={profile.desiredCarbs ?? ""}
                                    onChange={(e) => setProfile((p) => ({ ...p, desiredCarbs: Number(e.target.value) }))}
                                    placeholder="275"
                                />

                                <label className="text-xs text-slate-600">Fat (g)</label>
                                <input
                                    type="number"
                                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                    value={profile.desiredFat ?? ""}
                                    onChange={(e) => setProfile((p) => ({ ...p, desiredFat: Number(e.target.value) }))}
                                    placeholder="70"
                                />
                            </div>
                        </div>

                        {/* Meters */}
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
                            <Meter label="Calories" value={profile.desiredCalories} base={BASE.calories} />
                            <Meter label="Protein" value={profile.desiredProtein} base={BASE.protein} />
                            <Meter label="Carbs" value={profile.desiredCarbs} base={BASE.carbs} />
                            <Meter label="Fat" value={profile.desiredFat} base={BASE.fat} />
                        </div>
                    </div>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">You</div>
                        <div className="grid grid-cols-2 gap-3 items-center">
                            <label className="text-xs text-slate-600">Age</label>
                            <input
                                type="number"
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={profile.age ?? ""}
                                onChange={(e) => setProfile((p) => ({ ...p, age: Number(e.target.value) }))}
                                placeholder="21"
                            />
                            <label className="text-xs text-slate-600">Height</label>
                            <input
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={profile.height}
                                onChange={(e) => setProfile((p) => ({ ...p, height: e.target.value }))}
                                placeholder={`5'7"`}
                            />
                            <label className="text-xs text-slate-600">Weight (lb)</label>
                            <input
                                type="number"
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={profile.weightLbs ?? ""}
                                onChange={(e) => setProfile((p) => ({ ...p, weightLbs: Number(e.target.value) }))}
                                placeholder="160"
                            />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Prep & Preferences</div>
                        <div className="grid grid-cols-2 gap-3 items-center">
                            <label className="text-xs text-slate-600">Meals to Prep</label>
                            <input
                                type="number"
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={profile.mealsToPrep}
                                onChange={(e) => setProfile((p) => ({ ...p, mealsToPrep: Number(e.target.value) }))}
                                placeholder="6"
                            />
                            <label className="text-xs text-slate-600">Spice</label>
                            <select
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                                value={profile.spiceTolerance}
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, spiceTolerance: e.target.value as UserProfile["spiceTolerance"] }))
                                }
                            >
                                <option value="mild">Mild</option>
                                <option value="medium">Medium</option>
                                <option value="hot">Hot</option>
                                <option value="insane">Insane</option>
                            </select>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <label className="block text-xs text-slate-500 mb-2">Dislikes / Avoid</label>
                        <input
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-base"
                            value={profile.dislikes}
                            onChange={(e) => setProfile((p) => ({ ...p, dislikes: e.target.value }))}
                            placeholder="e.g., olives, blue cheese"
                        />
                    </Card>

                    <Card className="p-6">
                        <label className="block text-xs text-slate-500 mb-2">What’s in your fridge to use?</label>
                        <textarea
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 h-28 text-base"
                            value={profile.fridgeText}
                            onChange={(e) => setProfile((p) => ({ ...p, fridgeText: e.target.value }))}
                            placeholder="e.g., steak, shrimp, beans, yogurt, cucumbers"
                        />
                    </Card>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={submit}
                        className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-base"
                    >
                        Build My Plan
                    </button>
                    <button
                        onClick={randomize}
                        className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 font-medium text-base"
                    >
                        Skip / Randomize
                    </button>
                </div>
            </div>
        </div>
    );
}
