import { useEffect, useState } from "react";
import type { AppState } from "../types";
import { seedInventory, seedQueue } from "../helpers/seeds";

const LS_KEY = "meal-queue-state-v2";

export const loadState = (): AppState => {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) throw new Error("empty");
        return JSON.parse(raw);
    } catch {
        return { inventory: seedInventory, queue: seedQueue, completed: [] };
    }
};

export default function usePlan() {
    const [state, setState] = useState<AppState>(loadState());

    //we rly should not be saving state. Maybe with a redis cache or something. Maybe. I dont want to redo this tho

    const saveState = () => localStorage.setItem(LS_KEY, JSON.stringify(state));

    useEffect(() => {
        //once again for future use
    }, [])

    return ({ ...state, setState, saveState });
}