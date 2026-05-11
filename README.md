# Linux Command
a man page that tells what command description and option is!

A local web application to explore Linux man pages and tldr examples with a modern UI.

## Features
- Search Linux commands and view structured man page details
- See short description, synopsis, options, and practical examples
- Uses local tldr pages for rich examples when available
- Runs fully offline on Linux and Windows (WSL Ubuntu)
- **Mobile-responsive UI** — automatically switches to a touch-friendly layout on Android, iPhone, iPad, and other mobile devices (no terminal required)

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

---

## Android Installation (via Termux)

You can run this app locally on an Android device using [Termux](https://termux.dev/en/) — a terminal emulator for Android that requires no root.

> **Note:** The mobile UI automatically detects Android and shows a touch-friendly layout. The embedded terminal (`xterm.js` / `node-pty`) is hidden on mobile since Termux provides the terminal natively.

### Prerequisites

Install the following apps on your Android device:
- [Termux](https://f-droid.org/en/packages/com.termux/) (install from F-Droid, **not** the Play Store — the Play Store version is outdated)
- [Termux:API](https://f-droid.org/en/packages/com.termux.api/) (optional, for clipboard support)

### Step 1 — Set up Termux

Open Termux and run:

```sh
pkg update && pkg upgrade -y
pkg install nodejs git -y
```

Verify versions:

```sh
node --version   # should be v18+
git --version
```

### Step 2 — Clone the repository

```sh
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### Step 3 — Install dependencies

```sh
npm install
npm install --prefix client
npm install --prefix server
```

> The `node-pty` native addon (used for the desktop terminal feature) may fail to build on ARM. This is **expected and safe** — the mobile UI does not use it. If the install errors on `node-pty`, skip it:
>
> ```sh
> npm install --prefix server --ignore-scripts
> ```

### Step 4 — Download tldr pages

```sh
npm run tldr:download --prefix server
```

### Step 5 — Start the app

```sh
npm run dev
```

The app will be available at **http://localhost:5173** — open this URL in any Android browser (Chrome, Firefox, etc.).

### Step 6 — Access on the same Wi-Fi network (optional)

If you want to browse from another device on the same network, find your Android IP address:

```sh
ip addr show wlan0 | grep 'inet '
```

Then open `http://<your-android-ip>:5173` on any device connected to the same Wi-Fi.

### Troubleshooting (Android)

| Problem | Fix |
|---|---|
| `npm error command failed` / `tldr:download` error | Run `git pull` to get the latest fix, then retry `npm install` |
| `node-pty` build fails | Run `npm install --prefix server --ignore-scripts` |
| Port already in use | Run `lsof -i :5173` and kill the process |
| `git` not found | Run `pkg install git` |
| Slow first load | tldr index is being built — wait a few seconds |
