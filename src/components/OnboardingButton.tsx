'use client';

import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/lib/onboardingContext';

export default function OnboardingButton() {
  const { startOnboarding, resetOnboarding } = useOnboarding();
  const [showButton, setShowButton] = useState(true); // Default to showing the button
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if user has completed onboarding
  useEffect(() => {
    try {
      const completed = localStorage.getItem('onboardingCompleted') === 'true';
      setHasCompletedOnboarding(completed);
      setShowButton(true); // Always show the button, but text will change based on completion status
    } catch (error) {
      // If there's an error accessing localStorage, keep the button visible
      console.error('Error accessing localStorage:', error);
      setShowButton(true);
    }
  }, []);

  if (!showButton) return null;

  return (
    <div className="flex space-x-2">
      <button
        onClick={hasCompletedOnboarding ? resetOnboarding : startOnboarding}
        className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          {hasCompletedOnboarding ? (
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          )}
        </svg>
        <span>{hasCompletedOnboarding ? 'Restart Guided Tour' : 'Start Guided Tour'}</span>
      </button>
    </div>
  );
}
