# AWS Bedrock Agent Chat SPA

A secure, feature-rich Single Page Application for interacting with AWS Bedrock agents with enhanced security features and rich UI components.

## Overview

This React-based application provides a modern interface for interacting with AWS Bedrock agents. It features a comprehensive security implementation that ensures your AWS credentials remain protected while still allowing for development with mock data.

![AWS Bedrock Agent Chat](./screenshot.png)

## Features

### Core Functionality
- Rich chat interface with session management
- Support for multiple content types (text, video, choices)
- Responsive design for desktop and mobile
- Session history and persistence

### Security Features
- Token-based authentication system
- Rate limiting to prevent API abuse
- Session management with automatic timeout
- Input validation to prevent injection attacks
- Security notifications and alerts
- Role-based access control

### Developer Experience
- Mock mode for development without AWS credentials
- TypeScript for improved type safety
- Storybook component documentation
- Comprehensive error handling

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern web browser

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

### Authentication

The application uses a simulated authentication system in development mode:

- Click the "One-Click Demo Login" button to access the chat interface
- Login is persisted in localStorage
- User session can be configured to timeout after inactivity

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

## Development Guide

### Project Structure

```
src/
├── api/                  # API services and types
├── components/           # UI components
├── contexts/             # React contexts for state management
├── hooks/                # Custom React hooks
├── pages/                # Application pages
├── services/             # Core services (auth, security, etc.)
├── styles/               # Global styles
└── utils/                # Utility functions
```

### Mock Mode vs Production Mode

The application can operate in two modes:

1. **Mock Mode (Default)**
   - Uses simulated API responses
   - No AWS credentials required
   - Security features still active for testing

2. **Production Mode**
   - Connects to real AWS Bedrock agents
   - Requires proper AWS configuration
   - Backend proxy recommended for production use

### Testing Chat Features

The mock API provides different response types based on keywords:

- Type "video" to get a video response
- Type "options" or "choose" to get radio button choices
- Type "features" or "select" to get checkbox options
- Type "security" to get security best practices
- Any other input will get a default text response

### Building for Production

```bash
npm run build
# or
yarn build
```

## Security Implementation

### Authentication

The secure authentication system includes:

- JWT token-based authentication
- Automatic token refresh
- Session timeout mechanism
- Role-based access control

### API Security

All communication with AWS Bedrock is secured:

- Request validation prevents injection attacks
- Rate limiting protects against abuse
- Proper error handling with user feedback

### Backend Proxy (Production)

For production use, a secure backend proxy should be implemented to:

- Protect AWS credentials
- Provide additional security layers
- Handle authentication validation
- Implement server-side rate limiting

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

[MIT License](LICENSE)

## Acknowledgements

- AWS Bedrock documentation
- Google's A2A protocol specification
- Security best practices from OWASP