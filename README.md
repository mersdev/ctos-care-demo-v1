# Trapeza V1

A modern web application built with React, TypeScript, and Vite for managing and analyzing financial data.

## Project Overview

Trapeza V1 is a financial data management platform that helps users organize, analyze, and visualize their financial information. The application provides an intuitive interface for data input, processing, and visualization.

## Tech Stack

- Frontend: React + TypeScript
- Build Tool: Vite
- Styling: CSS/SCSS
- Package Manager: npm/yarn

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern web browser

## Setup and Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/trapeza-v1-demo.git
cd trapeza-v1-demo
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=your_api_url
VITE_APP_ENV=development
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Environment Variables

The following environment variables are required:

- `VITE_API_URL`: Base URL for the API endpoints
- `VITE_APP_ENV`: Application environment (development/production)

Note: Never commit the `.env` file or expose sensitive information in the codebase.

## Usage Instructions

1. Development Mode:

   - Run `npm run dev` or `yarn dev`
   - Access the application at `http://localhost:5173`

2. Production Build:
   - Run `npm run build` or `yarn build`
   - Preview the build using `npm run preview` or `yarn preview`

## Development Guidelines

1. Code Style

   - Follow the ESLint configuration provided
   - Use TypeScript for type safety
   - Follow React best practices and hooks guidelines

2. Git Workflow

   - Create feature branches from `main`
   - Use meaningful commit messages
   - Submit pull requests for review

3. Testing

   - Write unit tests for new features
   - Ensure all tests pass before committing
   - Run `npm run test` or `yarn test` to execute tests

4. Building
   - Use `npm run build` or `yarn build` for production builds
   - Verify the build locally before deployment

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Support

For support, please open an issue in the repository or contact the development team.
