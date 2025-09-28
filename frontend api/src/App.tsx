import React, { useEffect, useMemo, useState } from "react";
import type { InventoryItem, Meal, UserProfile } from "./types";
import useProfile from "./hooks/useProfile";
import LoadingScreen from "./components/LoadingScreen";
import Onboarding from "./pages/Onboarding";
import QueuePage from "./pages/QueuePage";
import { wait } from "./helpers/util";
import useStateState from "./hooks/useStateState";

/**
 * ChefFlow — Frontend-only demo (single file)
 * Light muted gray/blue theme + fade-in onboarding
 * Carbs/Fat targets with meters; no "max prep" field (prep is per-recipe)
 * Clean backend seam via requestMealPlan()
 */


// ========== Root App ==========
export default function App() {
  const { profile, saveProfile } = useProfile();
  const { setState, saveState, ...state } = useStateState();

  const [route, setRoute] = useState<"loading" | "onboarding" | "queue">("loading");

  useEffect(() => {
    const go = async () => {
      await wait(350);
      setRoute(profile.onboardingComplete ? "queue" : "onboarding");
    };
    go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => saveState(), [state]);
  useEffect(() => saveProfile(), [profile]);

  if (route === "loading") return <LoadingScreen label="Booting up" />;
  if (route === "onboarding") return <Onboarding onDone={() => setRoute("queue")} />;
  return <QueuePage state={state} setState={setState} />;
}
