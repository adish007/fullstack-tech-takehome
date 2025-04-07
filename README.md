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


### Setup Instructions

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up .env variables:
   ```
   NEXT_PUBLIC_STRIPE_SECRET_KEY=your_stripe_key
   NEXT_PUBLIC_OPEN_AI_KEY=your_openai_key
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Access the application:
   - Open your browser and navigate to `http://localhost:3000`



### Architecture overview
This application is a workflow automation platform built with a modern full-stack architecture:

Frontend
Next.js 15: Provides the React framework with server-side rendering capabilities
React Flow (@xyflow/react): Powers the interactive workflow editor with drag-and-drop node connections
TailwindCSS: Handles styling throughout the application
Backend
Next.js API Routes: Serverless functions that handle API requests
In-memory Database: Simulates persistence for workflows and execution logs
Workflow Executor: Core engine that processes workflow nodes sequentially
Key Components
Workflow System
Workflow Editor: Visual interface for creating and editing workflows
Node Types:
API Nodes: Make HTTP requests to custom endpoints or integrated services
Transform Nodes: Process data using OpenAI's GPT-4o for cleaning and formatting
Start/Output Nodes: Control workflow execution flow
Integrations
Stripe API: Integrated payment processing with customer profile management
OpenAI: AI-powered data transformation capabilities


### Technical decisions and tradeoffs

1. In-memory Database: Opted for simplicity over persistence. Quick to implement, but is not suitable for production use.


### Future improvements

1. Add database integration for persistent storage of workflows and execution logs
2. Add authentication and authorization for security
3. Add support for more node types and integrations
4. Add support for more data transformation capabilities


