//Horrible, horrible things happen here. This would realsitically all get flushed out for api/db calls or something. We use localstorage for lack of time.

import { useEffect, useState } from "react";
import type { UserProfile } from "../types";


// ========== Persistence ==========
const PROFILE_KEY = "meal-queue-profile-v3-light"; // bump to avoid old cache


const defaultProfile: UserProfile = {
    age: null,
    height: "",
    weightLbs: null,
    desiredCalories: 1800,
    desiredProtein: 150,
    desiredCarbs: 225,
    desiredFat: 65,
    spiceTolerance: "medium",
    dislikes: "",
    mealsToPrep: 6,
    fridgeText: "",
    onboardingComplete: false,
};

export const loadProfile = (): UserProfile => {
    try {
        const raw = localStorage.getItem(PROFILE_KEY);
        if (!raw) throw new Error("empty");
        return JSON.parse(raw);
    } catch {
        return defaultProfile;
    }
};

export default function useProfile() {
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const saveProfile = () => localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));


    useEffect(() => {
        // assuming we use a db we would fetch here instead of using loadprofile.
        const loadedProfile = loadProfile();
        setProfile(loadedProfile);
    }, [])

    return ({ profile, setProfile, saveProfile, })
}