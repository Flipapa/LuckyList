<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8ad61d7a-db70-4230-9a3f-3489559bd362

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deployment

This project is configured with a GitHub Action to automatically deploy to GitHub Pages. 

### How it works:
- Every push to the `main` or `master` branch triggers the workflow defined in `.github/workflows/deploy.yml`.
- The action automatically installs dependencies, builds the Vite application, and deploys the `dist` folder to GitHub Pages.

> **Note**: Be sure to enable GitHub Pages in your repository settings: Settings -> Pages -> Source: GitHub Actions.

## Project Configurations
- **.gitignore**: Pre-configured to exclude `node_modules/`, Build outputs (`dist/`, `build/`), environment files (`.env`), and IDE settings, ensuring no sensitive or unnecessary files are committed.
- **Dependencies**: The `package.json` includes React 19, Vite, Tailwind CSS v4, and other standard libraries for modern web development.
