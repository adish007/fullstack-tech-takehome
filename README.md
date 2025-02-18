# Workflow Builder Take-Home Project

## Project Overview

Create a full-stack Next.js application that enables users to build and execute automated workflows using drag-and-drop functionality. The application should demonstrate your ability to create intuitive user interfaces, handle complex state management, and integrate third-party APIs.

### Core Requirements

1. **Workflow Management**
   - Users can create, edit, delete, and manage multiple workflows
   - Each workflow should have a name, description, and creation/modified dates
   - Implement a dashboard to list and organize workflows
   - Add search and filter capabilities for workflows
   - Enable workflow duplication and templates

2. **Drag & Drop Interface**
   - Integrate [@xyflow/react](https://reactflow.dev/) for the workflow builder
   - Implement the following node types:
     - A start/entry node which is manually triggered
     - API nodes (e.g., HTTP requests for Stripe integration)
     - Transform nodes for data manipulation
     - Output nodes to display results
   - Enable node connections with visual validation
   - Provide real-time feedback on connection validity
   - Support undo/redo operations
   - Implement node configuration panels
   - Add mini-map for large workflows

3. **Guided Onboarding**
   - Create an interactive step-by-step tutorial (it's up to your creative freedom to make this as intuitive and frictionless as possible)
   - Walk users through:
     - Creating their first workflow
     - Adding and connecting nodes
     - Configuring node properties
     - Executing the workflow
   - Implement persistent progress tracking
   - Add tooltips for all major features
   - Provide contextual help documentation

4. **Applied Execution**
   - Implement workflow execution engine
   - Add Stripe API integration to fetch customer profiles
   - Display execution results in a structured format
   - Implement error handling and retries
   - Add execution history and logs
   - Support canceling running workflows

## Evaluation Criteria

Your submission will be evaluated based on:

### 1. User Experience (50%)
- Intuitive and responsive interface
- Clear and effective onboarding process
- Thoughtful error handling and feedback
- Mobile responsiveness
- Loading states and animations
- Accessibility compliance

### 2. Technical Implementation (30%)
- Code organization and architecture
- State management approach
- API design and implementation
- Performance optimization
- Security considerations
- Testing coverage (unit, integration, e2e)
- Type safety (TypeScript)

### 3. Additional Features (20%)
- Innovation beyond core requirements
- Documentation quality
- Deployment configuration
- Development setup
- Git commit history and organization

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Set up environment variables:
   ```
   STRIPE_SECRET_KEY=your_stripe_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Submission Requirements

1. Source code in a private GitHub repository
2. README with:
   - Setup instructions
   - Architecture overview
   - Technical decisions and tradeoffs
   - Future improvements
3. Deployed demo (Vercel recommended)
4. Video walkthrough of key features

## Time Expectation

- Expected completion time: 6-8 hours
- Maximum time limit: 12 hours

You're encouraged to draw from both your own design experience/taste as well as research on best practices from existing best-of-class workflow builders. Focus on delivering a polished core experience rather than implementing every possible feature.

We understand that there are token costs associated with using the Stripe API, so we've provided a test key and credentials for you to use. We will also reimburse for any token or subscription costs incurred up to $100.