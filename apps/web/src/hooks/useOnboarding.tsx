import { useState, useEffect } from "react";

const ONBOARDING_KEY = "socialpulse_onboarding_complete";

export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isComplete, setIsComplete] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowWelcome(true);
      setIsComplete(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
    setIsComplete(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowWelcome(true);
    setIsComplete(false);
  };

  return {
    showWelcome,
    isComplete,
    completeOnboarding,
    resetOnboarding,
  };
}