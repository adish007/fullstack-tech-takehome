'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboarding, OnboardingStep } from '@/lib/onboardingContext';

interface StepContent {
  title: string;
  description: string;
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  targetSelector?: string;
  actionText?: string;
  skipText?: string;
  showPrevious?: boolean;
  requiredAction?: {
    type: 'input' | 'click' | 'select' | 'connect' | 'navigate' | 'none' | 'configure';
    selector?: string;
    condition?: (element: HTMLElement | null) => boolean;
    targetPath?: string;
  };
}

export default function OnboardingGuide() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    isActive, 
    currentStep, 
    nextStep, 
    previousStep, 
    endOnboarding,
    progress,
    completeStep,
    stepCompleted
  } = useOnboarding();
  
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipSize, setTooltipSize] = useState({ width: 320, height: 200 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  
  // Refs for event listeners
  const eventListenersRef = useRef<{ type: string; handler: EventListener; element: HTMLElement | Document | Window }[]>([]);
  const currentObserverRef = useRef<MutationObserver | null>(null);

  // Define content for each step
  const stepContent: Record<OnboardingStep, StepContent> = {
    [OnboardingStep.Welcome]: {
      title: 'Welcome to Workflow Builder!',
      description: 'This guided tour will help you create your first workflow. You\'ll learn how to add nodes, connect them, and execute your workflow.',
      position: 'center',
      actionText: 'Start Tour',
      skipText: 'Skip Tour',
      requiredAction: { type: 'none' }
    },
    [OnboardingStep.NavigateToCreate]: {
      title: 'Create a New Workflow',
      description: 'First, let\'s create a new workflow. Click the "Create Workflow" button to get started.',
      position: 'bottom',
      targetSelector: 'a[href="/workflows/new"]',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'click',
        selector: 'a[href="/workflows/new"]'
      }
    },
    [OnboardingStep.CreateWorkflow]: {
      title: 'Name Your Workflow',
      description: 'Give your workflow a name. This will help you identify it later.',
      position: 'bottom',
      targetSelector: 'input#name',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'input',
        selector: 'input#name',
        condition: (element) => element instanceof HTMLInputElement && element.value.trim().length > 0
      }
    },
    [OnboardingStep.AddFirstNode]: {
      title: 'Add Your First Node',
      description: 'Now, let\'s add an API node to your workflow. Click the "Add API Node" button to create your first node.',
      position: 'bottom',
      targetSelector: 'button[type="button"]:nth-of-type(1)',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'click',
        selector: 'button[type="button"]:nth-of-type(1)'
      }
    },
    [OnboardingStep.ConfigureNode]: {
      title: 'Configure Your API Node',
      description: 'Click on the API node to configure it. You can choose between a Custom API or Stripe API. For Stripe, select "Stripe API" from the provider dropdown and enter the endpoint path (e.g., "/v1/customers"). For custom APIs, enter the full URL, method, headers, and body. Click "Save Configuration" when done.',
      position: 'right',
      targetSelector: '.react-flow__node',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'configure'
      }
    },
    [OnboardingStep.AddSecondNode]: {
      title: 'Add Another Node',
      description: 'Let\'s add an output node to display the results. Click the "Add Output" button.',
      position: 'bottom',
      targetSelector: 'button[type="button"]:nth-of-type(3)',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'click',
        selector: 'button[type="button"]:nth-of-type(3)'
      }
    },
    [OnboardingStep.ConnectNodes]: {
      title: 'Connect Your Nodes',
      description: 'Now, connect your nodes by clicking and dragging from the API node\'s handle to the Output node\'s handle.',
      position: 'right',
      targetSelector: '.react-flow__node',
      actionText: 'Continue',
      showPrevious: true,
      requiredAction: {
        type: 'connect',
        condition: () => {
          // Check if there's at least one edge in the workflow
          const edges = document.querySelectorAll('.react-flow__edge');
          return edges.length > 0;
        }
      }
    },
    [OnboardingStep.Complete]: {
      title: 'Congratulations!',
      description: 'You\'ve successfully created your first workflow. Now save your workflow by clicking the "Create Workflow" button at the bottom of the page.',
      position: 'center',
      actionText: 'Finish',
      requiredAction: { type: 'none' }
    },
    [OnboardingStep.Inactive]: {
      title: '',
      description: '',
      position: 'center',
      requiredAction: { type: 'none' }
    },
  };

  // Setup action detection and completion
  useEffect(() => {
    if (!isActive || currentStep === OnboardingStep.Inactive) return;
    
    const action = stepContent[currentStep]?.requiredAction;
    if (!action) return;
    
    // Clear previous event listeners
    eventListenersRef.current.forEach(({ type, handler, element }) => {
      element.removeEventListener(type, handler);
    });
    eventListenersRef.current = [];
    
    // Reset action completed state
    setActionCompleted(stepCompleted(currentStep));
    
    const setupActionDetection = () => {
      switch (action.type) {
        case 'input': {
          if (!action.selector) break;
          
          const targetElement = document.querySelector(action.selector);
          if (!targetElement) break;
          
          const handleInput = () => {
            if (action.condition && !action.condition(targetElement as HTMLElement)) return;
            completeStep(currentStep);
          };
          
          targetElement.addEventListener('input', handleInput);
          eventListenersRef.current.push({ type: 'input', handler: handleInput as EventListener, element: targetElement as HTMLElement });
          
          // Check initial state
          if (action.condition && action.condition(targetElement as HTMLElement)) {
            completeStep(currentStep);
          }
          break;
        }
        case 'click': {
          if (!action.selector) break;
          
          // Special handling for navigation between pages
          if (currentStep === OnboardingStep.NavigateToCreate) {
            // For the NavigateToCreate step, we need to detect when the user clicks on the Create Workflow button
            // and then automatically complete this step and move to the next one
            const targetElement = document.querySelector(action.selector);
            if (targetElement) {
              const handleClick = () => {
                completeStep(currentStep);
                // We'll automatically move to the next step when the new page loads
              };
              
              targetElement.addEventListener('click', handleClick);
              eventListenersRef.current.push({ type: 'click', handler: handleClick as EventListener, element: targetElement as HTMLElement });
            }
          } else {
            // Normal click handling for other steps
            const targetElement = document.querySelector(action.selector);
            if (targetElement) {
              const handleClick = () => {
                completeStep(currentStep);
              };
              
              targetElement.addEventListener('click', handleClick);
              eventListenersRef.current.push({ type: 'click', handler: handleClick as EventListener, element: targetElement as HTMLElement });
            }
          }
          break;
        }
        case 'connect': {
          // For connection, we'll check periodically if edges exist
          const checkEdges = () => {
            if (action.condition && action.condition(null)) {
              completeStep(currentStep);
            }
          };
          
          // Initial check
          checkEdges();
          
          // Setup mutation observer to detect when edges are added
          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'childList') {
                checkEdges();
                break;
              }
            }
          });
          
          // Observe the entire document for changes
          observer.observe(document.body, { 
            childList: true, 
            subtree: true 
          });
          
          // Store observer in ref for cleanup
          const cleanupObserver = () => observer.disconnect();
          window.addEventListener('beforeunload', cleanupObserver);
          eventListenersRef.current.push({ 
            type: 'beforeunload', 
            handler: cleanupObserver as EventListener, 
            element: window 
          });
          break;
        }
        case 'navigate': {
          if (action.targetPath && pathname === action.targetPath) {
            completeStep(currentStep);
          }
          break;
        }
        case 'none': {
          // No action required, mark as completed
          completeStep(currentStep);
          break;
        }
        case 'configure': {
          // For the configure action type, we'll listen for a custom event from the Save Configuration button
          const handleApiNodeConfigured = (event: Event) => {
            // When the custom event is fired, complete this step
            completeStep(currentStep);
          };
          
          // Add event listener for our custom event
          document.addEventListener('apiNodeConfigured', handleApiNodeConfigured);
          
          // Store the event listener reference for cleanup
          eventListenersRef.current.push({ 
            type: 'apiNodeConfigured', 
            handler: handleApiNodeConfigured as EventListener, 
            element: document 
          });
          break;
        }
      }
    };

    // Setup after a short delay to ensure DOM is ready
    const timer = setTimeout(setupActionDetection, 500);
    return () => {
      clearTimeout(timer);
      if (currentObserverRef.current) {
        currentObserverRef.current.disconnect();
      }
    };
  }, [isActive, currentStep, completeStep, stepCompleted, pathname]);

  // Helper function to find elements with special selectors
  const findElement = (selector: string): HTMLElement | null => {
    // Handle special selector syntax for text content
    if (selector.includes(':contains(')) {
      const match = selector.match(/:contains\("([^"]+)"\)/);
      if (match && match[1]) {
        const textToFind = match[1];
        const baseSelector = selector.split(':contains')[0];
        
        const elements = Array.from(document.querySelectorAll(baseSelector)) as HTMLElement[];
        return elements.find(el => el.textContent?.includes(textToFind)) || null;
      }
    }
    
    return document.querySelector(selector) as HTMLElement;
  };

  // Find target element and calculate tooltip position
  useEffect(() => {
    if (!isActive || currentStep === OnboardingStep.Inactive) {
      setTooltipVisible(false);
      return;
    }

    const content = stepContent[currentStep];
    
    // Short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      let element: HTMLElement | null = null;
      
      if (content.targetSelector) {
        element = findElement(content.targetSelector);
      }
      
      setTargetElement(element);
      
      // Calculate position based on target element and position preference
      if (element && content.position !== 'center') {
        const rect = element.getBoundingClientRect();
        const tooltipWidth = tooltipSize.width;
        const tooltipHeight = tooltipSize.height;
        
        let top = 0;
        let left = 0;
        
        // Position the tooltip with more space to avoid overlapping the target element
        switch (content.position) {
          case 'top':
            top = rect.top - tooltipHeight - 20; // Increased distance
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'right':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + 20; // Increased distance
            break;
          case 'bottom':
            top = rect.bottom + 20; // Increased distance
            left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
            break;
          case 'left':
            top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left - tooltipWidth - 20; // Increased distance
            break;
        }
        
        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        if (left < 20) left = 20;
        if (left + tooltipWidth > viewportWidth - 20) left = viewportWidth - tooltipWidth - 20;
        if (top < 20) top = 20;
        if (top + tooltipHeight > viewportHeight - 20) top = viewportHeight - tooltipHeight - 20;
        
        setTooltipPosition({ top, left });
      } else {
        // Center in viewport for steps without a target or with center position
        setTooltipPosition({
          top: (window.innerHeight - tooltipSize.height) / 2,
          left: (window.innerWidth - tooltipSize.width) / 2
        });
      }
      
      setTooltipVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isActive, currentStep, stepContent]);

  // Handle resize to reposition tooltip
  useEffect(() => {
    const handleResize = () => {
      // Trigger recalculation of tooltip position
      setTooltipVisible(false);
      setTimeout(() => {
        if (isActive && currentStep !== OnboardingStep.Inactive) {
          setTooltipVisible(true);
        }
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isActive, currentStep]);

  // If onboarding is not active, don't render anything
  if (!isActive || currentStep === OnboardingStep.Inactive) {
    return null;
  }

  const content = stepContent[currentStep];

  // Highlight target element
  const highlightTarget = () => {
    if (!targetElement || content.position === 'center') return null;
    
    const rect = targetElement.getBoundingClientRect();
    
    return (
      <div 
        className="absolute z-40 border-2 border-orange-500 rounded-md animate-pulse pointer-events-none"
        style={{
          top: rect.top - 4 + window.scrollY,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8
        }}
      />
    );
  };

  return (
    <>
      {/* Overlay - Changed to pointer-events-none to allow clicking through */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-30 pointer-events-none" />
      
      {/* Target highlight */}
      {highlightTarget()}
      
      {/* Tooltip - Keep pointer events enabled for the tooltip */}
      {tooltipVisible && (
        <div 
          className="fixed bg-zinc-800 rounded-lg shadow-lg p-6 z-50 border border-orange-500 pointer-events-auto"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            width: tooltipSize.width,
            maxWidth: '90vw'
          }}
          ref={(el) => {
            if (el) {
              const { height, width } = el.getBoundingClientRect();
              if (height !== tooltipSize.height || width !== tooltipSize.width) {
                setTooltipSize({ height, width });
              }
            }
          }}
        >
          {/* Progress bar */}
          <div className="w-full h-1 bg-zinc-600 rounded-full mb-4">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
          <p className="text-zinc-300 mb-6">{content.description}</p>
          
          <div className="flex justify-between">
            {content.showPrevious ? (
              <button
                onClick={previousStep}
                className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            <div className="flex space-x-3">
              {content.skipText && (
                <button
                  onClick={endOnboarding}
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                >
                  {content.skipText}
                </button>
              )}
              
              <button
                onClick={nextStep}
                disabled={!actionCompleted}
                className={`px-4 py-2 ${
                  actionCompleted 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'bg-zinc-600 cursor-not-allowed'
                } text-white rounded-lg transition-colors`}
              >
                {content.actionText || 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
