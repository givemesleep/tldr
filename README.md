# man-local

A local web application to explore Linux man pages and tldr examples with a modern UI.

## Features
- Search Linux commands and view structured man page details
- See short description, synopsis, options, and practical examples
- Uses local tldr pages for rich examples when available
- Runs fully offline on Linux and Windows (WSL Ubuntu)

## Setup

1. Install Node.js (v18+ recommended) and npm
2. On Linux or WSL Ubuntu, ensure `man`, `col`, and common command-line tools are available
3. Clone this repository
4. Run:

    npm install
    npm run dev

- The app will be available at http://localhost:5173
- The backend API runs at http://localhost:3001

## Scripts
- `npm run dev` — Start client and server in development mode
- `npm run build` — Build both client and server
- `npm run start` — Start both in production mode

## Troubleshooting
- If tldr pages are missing, run `npm run tldr:download --prefix server`
- On Windows, use WSL Ubuntu for backend functionality
- Ensure `man` and `col` are installed and available in PATH

## Testing
- Run `npm test --prefix server` to test backend parsing
