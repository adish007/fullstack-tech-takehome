'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the onboarding steps
export enum OnboardingStep {
  Welcome = 'welcome',
  NavigateToCreate = 'navigate_to_create',
  CreateWorkflow = 'create_workflow',
  AddFirstNode = 'add_first_node',
  ConfigureNode = 'configure_node',
  AddSecondNode = 'add_second_node',
  ConnectNodes = 'connect_nodes',
  Complete = 'complete',
  Inactive = 'inactive'
}

// Define a type for active onboarding steps (excluding Inactive)
type ActiveOnboardingStep = Exclude<OnboardingStep, OnboardingStep.Inactive>;

// Define the onboarding context type
interface OnboardingContextType {
  isActive: boolean;
  currentStep: OnboardingStep;
  startOnboarding: () => void;
  endOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipToStep: (step: OnboardingStep) => void;
  progress: number;
  completeStep: (step: OnboardingStep) => void;
  stepCompleted: (step: OnboardingStep) => boolean;
  resetOnboarding: () => void;
}

// Create the context with default values
const OnboardingContext = createContext<OnboardingContextType>({
  isActive: false,
  currentStep: OnboardingStep.Inactive,
  startOnboarding: () => {},
  endOnboarding: () => {},
  nextStep: () => {},
  previousStep: () => {},
  skipToStep: () => {},
  progress: 0,
  completeStep: () => {},
  stepCompleted: () => false,
  resetOnboarding: () => {}
});

// Define props for the provider component
interface OnboardingProviderProps {
  children: ReactNode;
}

// Create the provider component
export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(OnboardingStep.Inactive);
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set());
  
  // Calculate progress percentage based on current step
  const calculateProgress = (): number => {
    const steps = Object.values(OnboardingStep).filter(step => step !== OnboardingStep.Inactive) as ActiveOnboardingStep[];
    const currentIndex = steps.indexOf(currentStep as ActiveOnboardingStep);
    return currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
  };

  // Check local storage on initial load to see if user has completed onboarding
  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';
      if (!hasCompletedOnboarding) {
        // Don't auto-start onboarding, let user choose to start it
        setIsActive(false);
        setCurrentStep(OnboardingStep.Inactive);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  }, []);

  // Start the onboarding process
  const startOnboarding = () => {
    setIsActive(true);
    setCurrentStep(OnboardingStep.Welcome);
    setCompletedSteps(new Set([OnboardingStep.Welcome])); // Mark Welcome as completed by default
  };

  // End the onboarding process and mark as completed
  const endOnboarding = () => {
    try {
      setIsActive(false);
      setCurrentStep(OnboardingStep.Inactive);
      localStorage.setItem('onboardingCompleted', 'true');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  };

  // Reset the onboarding process
  const resetOnboarding = () => {
    try {
      setIsActive(false);
      setCurrentStep(OnboardingStep.Inactive);
      setCompletedSteps(new Set());
      localStorage.removeItem('onboardingCompleted');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
  };

  // Mark a step as completed
  const completeStep = (step: OnboardingStep) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
  };

  // Check if a step is completed
  const stepCompleted = (step: OnboardingStep): boolean => {
    return completedSteps.has(step);
  };

  // Move to the next step only if current step is completed
  const nextStep = () => {
    const steps = Object.values(OnboardingStep).filter(step => step !== OnboardingStep.Inactive) as ActiveOnboardingStep[];
    const currentIndex = steps.indexOf(currentStep as ActiveOnboardingStep);
    
    // Only proceed if current step is completed
    if (stepCompleted(currentStep) && currentIndex < steps.length - 1) {
      // If we're at ConnectNodes, the next step is Complete
      if (currentStep === OnboardingStep.ConnectNodes) {
        setCurrentStep(OnboardingStep.Complete);
      } else {
        setCurrentStep(steps[currentIndex + 1]);
      }
    } else if (currentStep === OnboardingStep.Complete) {
      endOnboarding();
    }
  };

  // Move to the previous step
  const previousStep = () => {
    const steps = Object.values(OnboardingStep).filter(step => step !== OnboardingStep.Inactive) as ActiveOnboardingStep[];
    const currentIndex = steps.indexOf(currentStep as ActiveOnboardingStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  // Skip to a specific step
  const skipToStep = (step: OnboardingStep) => {
    setCurrentStep(step);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        startOnboarding,
        endOnboarding,
        nextStep,
        previousStep,
        skipToStep,
        progress: calculateProgress(),
        completeStep,
        stepCompleted,
        resetOnboarding
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

// Custom hook to use the onboarding context
export function useOnboarding() {
  return useContext(OnboardingContext);
}
