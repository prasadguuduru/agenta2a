# AWS Bedrock Agent Chat SPA

A secure, feature-rich Single Page Application for interacting with AWS Bedrock agents with enhanced security features, rich UI components, and integrated payment processing.

![AWS Bedrock Agent Chat](./screenshot.png)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Core Functionality](#core-functionality)
  - [Security Features](#security-features)
  - [Payment Integration](#payment-integration)
  - [Developer Experience](#developer-experience)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Using the Application](#using-the-application)
  - [Authentication](#authentication)
  - [Chat Interface](#chat-interface)
  - [Payments and Subscriptions](#payments-and-subscriptions)
  - [Settings](#settings)
- [Development Guide](#development-guide)
  - [Project Structure](#project-structure)
  - [Mock Mode vs Production Mode](#mock-mode-vs-production-mode)
  - [Testing Chat Features](#testing-chat-features)
  - [Payment Integration Details](#payment-integration-details)
  - [Building for Production](#building-for-production)
- [Security Implementation](#security-implementation)
  - [Authentication](#authentication-1)
  - [API Security](#api-security)
  - [Payment Security](#payment-security)
  - [Backend Proxy (Production)](#backend-proxy-production)
- [Technical Architecture](#technical-architecture)
  - [Component Hierarchy](#component-hierarchy)
  - [State Management](#state-management)
  - [API Communication](#api-communication)
  - [Payment Processing Flow](#payment-processing-flow)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

This React-based application provides a modern interface for interacting with AWS Bedrock agents. It features a comprehensive security implementation that ensures your AWS credentials remain protected while still allowing for development with mock data. The application now includes a complete Stripe payment integration for processing payments and managing subscriptions directly within the chat interface.

## Features

### Core Functionality
- Rich chat interface with session management
- Support for multiple content types (text, video, choices, forms, payments)
- Stripe payment integration for subscriptions and one-time purchases
- Responsive design for desktop and mobile
- Session history and persistence
- Interactive UI elements with real-time feedback

### Security Features
- Token-based authentication system
- Rate limiting to prevent API abuse
- Session management with automatic timeout
- Input validation to prevent injection attacks
- Security notifications and alerts
- Role-based access control
- Secure payment processing

### Payment Integration
- Stripe payment processing for subscriptions and one-time payments
- Multiple payment methods (credit card, bank account, digital wallets)
- Interactive payment forms embedded directly in chat
- Payment confirmation and receipt generation
- Subscription management dashboard
- Secure handling of payment information

### Developer Experience
- Mock mode for development without AWS credentials
- Simulated payment processing for testing
- TypeScript for improved type safety
- Storybook component documentation
- Comprehensive error handling
- Hot module replacement for fast development

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern web browser
- Stripe account (for production payment processing)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd aws-bedrock-agent-chat-spa
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Access the application at http://localhost:5173

### Configuration

You can customize the application behavior through the Settings page:

1. **General Settings**
   - API Mode (Mock/Production)
   - AWS Region
   - Agent ID
   - Agent Alias ID

2. **Security Settings**
   - Session Timeout
   - Session History
   - Rate Limiting

3. **Payment Settings**
   - Stripe API Key
   - Default Currency
   - Subscription Plans

For production use, you'll need to:

1. Create an AWS Bedrock agent
2. Set up a Stripe account and obtain API keys
3. Configure a backend proxy for secure API communication
4. Deploy the application to a web server

## Using the Application

### Authentication

The application uses a simulated authentication system in development mode:

- Click the "One-Click Demo Login" button to access the chat interface
- Login is persisted in localStorage
- User session can be configured to timeout after inactivity

In production, you can implement:
- OAuth integration with identity providers
- AWS Cognito authentication
- Custom authentication system

### Chat Interface

The chat interface supports a variety of content types:

1. **Text Messages**
   - Standard text responses with markdown support
   - Code highlighting for technical content

2. **Interactive Elements**
   - Selection lists (radio buttons, checkboxes)
   - Form inputs (text, date, file upload)
   - Rating and feedback collection

3. **Media Content**
   - Video players with additional actions
   - Image display and galleries

4. **Payment Processing**
   - Payment forms for one-time purchases
   - Subscription management
   - Payment confirmation and receipts

### Payments and Subscriptions

The application includes a complete payment integration:

1. **Triggering Payments**
   - Type "payment" or "checkout" to get a payment form
   - Type "subscribe" to see subscription options

2. **Payment Methods**
   - Credit/Debit Cards
   - Bank Accounts
   - Digital Wallets (PayPal, Apple Pay, Google Pay)

3. **Subscription Management**
   - View and manage current subscription
   - Upgrade/downgrade plans
   - Cancel subscription

4. **Payment Security**
   - No payment information stored in browser
   - Tokenized payment processing
   - PCI-compliant implementation

### Settings

Access the Settings page to configure:

1. **API Settings**
   - Toggle between mock and production mode
   - Configure AWS region and agent IDs

2. **Security Settings**
   - Session timeout duration
   - Rate limiting controls
   - History management

3. **Subscription Settings**
   - Manage subscription plans
   - View payment history
   - Update payment methods

## Development Guide

### Project Structure

```
src/
├── api/                  # API services and types
│   ├── agentApi.ts       # AWS Bedrock API integration
│   ├── mockAgentApi.ts   # Mock API for development
│   ├── secureAgentApi.ts # Enhanced API with security features
│   └── types.ts          # TypeScript type definitions
├── components/           # UI components
│   ├── AgentChat/        # Main chat interface
│   ├── ChatBubble/       # Message rendering
│   ├── ChatInput/        # User input component
│   ├── ChatList/         # Message list component
│   ├── Header/           # Application header
│   ├── Notification/     # Notification system
│   ├── Payment/          # Payment-related components
│   └── SessionList/      # Chat session management
├── contexts/             # React contexts for state management
│   ├── AgentContext.tsx  # Agent state and API access
│   ├── AuthContext.tsx   # Authentication state
│   └── StripeContext.tsx # Stripe payment integration
├── hooks/                # Custom React hooks
│   ├── useAgent.ts       # Agent interaction hook
│   └── useStripePayment.ts # Payment processing hook
├── pages/                # Application pages
│   ├── ChatPage.tsx      # Main chat page
│   ├── LoginPage.tsx     # Authentication page
│   └── SettingsPage.tsx  # Configuration page
├── services/             # Core services
│   ├── authService.ts    # Authentication service
│   ├── notificationService.ts # Notification system
│   ├── rateLimiterService.ts # API rate limiting
│   ├── sessionService.ts # Session management
│   ├── stripeInitializer.ts # Stripe initialization
│   └── stripeService.ts  # Stripe API integration
├── styles/               # Global styles
└── utils/                # Utility functions
```

### Mock Mode vs Production Mode

The application can operate in two modes:

1. **Mock Mode (Default)**
   - Uses simulated API responses
   - No AWS credentials required
   - Simulated payment processing
   - Security features still active for testing

2. **Production Mode**
   - Connects to real AWS Bedrock agents
   - Processes real payments through Stripe
   - Requires proper AWS and Stripe configuration
   - Backend proxy recommended for production use

### Testing Chat Features

The mock API provides different response types based on keywords:

- Type "video" to get a video response
- Type "options" or "choose" to get radio button choices
- Type "features" or "select" to get checkbox options
- Type "security" to get security best practices
- Type "payment" or "checkout" to get a payment form
- Type "subscribe" to see subscription options
- Any other input will get a default text response

### Payment Integration Details

The payment integration includes several components:

1. **Types and Interfaces**
   - `PaymentContent`: Defines the structure for payment forms
   - `PaymentConfirmationContent`: For payment confirmations
   - `PaymentMethodOption`: Payment method definitions

2. **UI Components**
   - Payment form with method selection
   - Credit card input fields
   - Bank account details form
   - Digital wallet integration
   - Payment confirmation display

3. **Services**
   - `stripeService`: Core service for Stripe API integration
   - `stripeInitializer`: Handles Stripe.js initialization
   - Mock payment processing for development

4. **State Management**
   - `useStripePayment` hook for payment processing
   - `StripeContext` for application-wide payment state

### Building for Production

```bash
npm run build
# or
yarn build
```

For production deployment:

1. Configure environment variables for API endpoints
2. Set up Stripe production keys
3. Implement a backend proxy for AWS credentials
4. Deploy to a secure hosting service

## Security Implementation

### Authentication

The secure authentication system includes:

- JWT token-based authentication
- Automatic token refresh
- Session timeout mechanism
- Role-based access control
- Protection against common attacks:
  - CSRF (Cross-Site Request Forgery)
  - XSS (Cross-Site Scripting)
  - Session hijacking

### API Security

All communication with AWS Bedrock is secured:

- Request validation prevents injection attacks
- Rate limiting protects against abuse
- Proper error handling with user feedback
- Input sanitization for all user-provided data
- Secure storage of API credentials

### Payment Security

The payment system is designed with security in mind:

- No payment information is stored on the client
- Stripe Elements for secure card entry
- PCI-compliant payment processing
- Tokenization of sensitive payment data
- HTTPS for all payment communication
- Validation of payment responses

### Backend Proxy (Production)

For production use, a secure backend proxy should be implemented to:

- Protect AWS credentials
- Handle Stripe API keys securely
- Provide additional security layers
- Handle authentication validation
- Implement server-side rate limiting
- Log and monitor for suspicious activities

## Technical Architecture

### Component Hierarchy

```
App
├── AuthProvider
│   └── StripeProvider
│       └── AgentProvider
│           ├── LoginPage
│           ├── ChatPage
│           │   └── AgentChat
│           │       ├── Header
│           │       ├── SessionList
│           │       ├── ChatList
│           │       │   └── ChatBubble
│           │       │       ├── TextContent
│           │       │       ├── ChoiceContent
│           │       │       ├── VideoContent
│           │       │       ├── PaymentContent
│           │       │       └── PaymentConfirmationContent
│           │       └── ChatInput
│           └── SettingsPage
└── NotificationProvider
```

### State Management

The application uses a combination of:

1. **React Context API**
   - `AuthContext`: User authentication state
   - `AgentContext`: Agent configuration and chat sessions
   - `StripeContext`: Payment processing state

2. **Local Component State**
   - UI interaction state
   - Form values
   - Loading indicators

3. **Local Storage**
   - Session persistence
   - User preferences
   - Authentication tokens

### API Communication

Communication flow:

1. **Chat Messages**
   ```
   User Input → ChatInput → AgentContext → API Service → AWS Bedrock → Response Parsing → ChatList → ChatBubble
   ```

2. **Authentication**
   ```
   Login Form → AuthContext → Authentication Service → Token Management → Protected Routes
   ```

3. **Payment Processing**
   ```
   Payment Form → StripeContext → Stripe Service → Stripe API → Payment Confirmation → ChatBubble
   ```

### Payment Processing Flow

1. User triggers payment with keywords
2. Agent responds with payment form
3. User selects payment method and enters details
4. Form submits payment data to agent
5. Payment is processed (mock or real)
6. Confirmation message displayed in chat
7. Receipt generated for successful payments

## Troubleshooting

Common issues and solutions:

1. **Build Errors**
   - Ensure all required dependencies are installed
   - Check for TypeScript errors in the code
   - Verify import paths are correct

2. **Payment Processing Issues**
   - Check browser console for errors
   - Verify Stripe initialization
   - Ensure payment submission is formatted correctly

3. **Mock API Not Working**
   - Verify useMockApi setting is enabled
   - Check for keyword triggers in messages
   - Inspect network requests for errors

4. **Authentication Problems**
   - Clear browser storage and try again
   - Check token expiration logic
   - Verify authentication service configuration

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

[MIT License](LICENSE)

## Acknowledgements

- AWS Bedrock documentation
- Stripe API documentation
- React and TypeScript communities
- Google's A2A protocol specification
- Security best practices from OWASP