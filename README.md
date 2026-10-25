# DriveFair

DriveFair is an India-focused Streamlit hackathon prototype for transparent, usage-based motor insurance. It has account-scoped profiles, an app-owned SQLite database, trip scoring, itemized INR estimates, claim drafts, data export, English, Hindi, Tamil, Malayalam, Telugu, Kannada, Spanish, French, and Arabic interface options, and light/dark themes. The standalone HTML dashboard also offers these languages and liquid-glass button styling.

## Run locally

Use Python 3.11 or newer:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m streamlit run app.py --server.address 127.0.0.1 --server.port 8501
```

Open `http://127.0.0.1:8501` in your browser. Stop the local server with `Ctrl+C`.

By default, SQLite creates `data/drivefair.db`. Change its location with `DRIVEFAIR_DB_PATH`. The database file, WAL files, virtual environments, and Streamlit secrets are excluded from Git.

## Features

- Create an account and sign in. Passwords are stored as salted PBKDF2 hashes, never plaintext.
- Keep preferences, trips, and claim drafts isolated by account in SQLite.
- Log trips and see the input events behind the illustrative trip score.
- Preview pay-per-kilometre, pay-per-trip, and monthly coverage with every estimate itemized.
- Use Indian rupees, kilometres, India Standard Time, Chennai sample routes, and switch between English, Hindi, Tamil, Malayalam, Telugu, Kannada, Spanish, French, and Arabic. Common interface labels are translated in the built-in catalogues; copy without a translation falls back to English. Existing accounts receive a backward-compatible language preference defaulting to English.
- See an India-specific safety prompt with emergency number 112 and an explanation that third-party motor insurance is mandatory.
- Create a claim draft only after the safety prompt; optional trip context excludes exact locations.
- Toggle precise-location display, pause trip recording, export account data, and reset demo data.
- Use the sidebar to switch between light and dark mode. The selected theme is saved per account.
- Adjust reading text size in the Streamlit sidebar; in the standalone dashboard, choose light, soft, or dark appearance and adjust text size from the top bar. Standalone appearance settings are saved in this browser.
- Use Anaheim as the main interface typeface with script-specific fallbacks, comfortable spacing, and high-visibility keyboard focus states.
- View all estimates in Indian rupees and distances in kilometres. Existing standalone browser trips saved in miles are converted to kilometres when loaded.
- Use translucent liquid-glass styling on action buttons, with focus-visible and reduced-motion support.

## Scoring & pricing (illustrative only)

Trip scores start at 95. The demo deducts 16 points per hard-braking event, 8 per rapid-acceleration event, 10 per sharp turn, and 4 for evening driving. Scores are clamped to 0–100.

```text
estimated monthly premium =
  base coverage + usage charge + score adjustment − safe-driving reward
```

All amounts are illustrative INR demo values: ₹199 base, ₹1.50/km, ₹20/trip, or ₹699/month, with a ₹50 demo reward. The score adjustment is `(85 − average trip score) × ₹5`, capped from −₹100 to +₹200. These rates are not a quote, policy term, or approved actuarial model.

**India market and compliance notice:** Third-party motor insurance is mandatory in India. This demo neither provides nor verifies any cover and must not be used to meet legal insurance requirements. It is not connected to an insurer or IRDAI systems. Estimates exclude applicable taxes and do not account for vehicle IDV, vehicle class, registration zone, insurer-specific rates, add-ons, or policy terms. Confirm cover and price with a licensed insurer.

## Publish on GitHub and Streamlit Community Cloud

1. Push this project to a GitHub repository owned by the Streamlit-connected account.
2. In [Streamlit Community Cloud](https://share.streamlit.io/), choose **Create app**, select the repository and branch, and set the app file to `app.py`.
3. Deploy. Streamlit installs dependencies from `requirements.txt`.

This repository is prepared for the `Thiru00007/drivefair` public repo. Keep `.streamlit/secrets.toml`, `.env`, and `data/drivefair.db` out of Git. No GitHub or Streamlit credentials belong in this project.

## Important database limitation

The app uses SQLite to provide a simple, self-contained database and account-scoped queries. Streamlit Community Cloud does **not** guarantee persistence of files written to the app container: SQLite data can be lost when the app is restarted, rebuilt, or redeployed. Do not use this hosting setup for real insurance or claim data.

For durable multi-user deployment, migrate the repository layer to managed PostgreSQL (for example, Supabase or Neon), configure its connection string using Streamlit secrets, and add production authentication, email verification, rate limiting, backups, audit logging, encryption, retention controls, and a security/privacy review. That production database and its credentials are not configured by this demo.

No real phone sensors, GPS, OEM connectivity, insurer backend, claim submission, or emergency-service integration is active. The claim page displays India's emergency number (112), but DriveFair cannot contact responders. Scores are feedback, never fault decisions. Premium estimates are not quotes or policies.
