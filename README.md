# DriveFair

DriveFair is a Streamlit hackathon prototype for transparent, usage-based motor insurance. It has account-scoped profiles, an app-owned SQLite database, trip scoring, itemized premium estimates, claim drafts, data export, and light/dark themes.

## Run locally

Use Python 3.11 or newer:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m streamlit run app.py
```

By default, SQLite creates `data/drivefair.db`. Change its location with `DRIVEFAIR_DB_PATH`. The database file, WAL files, virtual environments, and Streamlit secrets are excluded from Git.

## Features

- Create an account and sign in. Passwords are stored as salted PBKDF2 hashes, never plaintext.
- Keep preferences, trips, and claim drafts isolated by account in SQLite.
- Log trips and see the input events behind the illustrative trip score.
- Preview pay-per-mile, pay-per-journey, and monthly coverage with every estimate itemized.
- Create a claim draft only after the safety prompt; optional trip context excludes exact locations.
- Toggle precise-location display, pause trip recording, export account data, and reset demo data.
- Use the sidebar to switch between light and dark mode. The selected theme is saved per account.

## Scoring & pricing (illustrative only)

Trip scores start at 95. The demo deducts 16 points per hard-braking event, 8 per rapid-acceleration event, 10 per sharp turn, and 4 for evening driving. Scores are clamped to 0–100.

```text
estimated monthly premium =
  base coverage + usage charge + score adjustment − safe-driving reward
```

The score adjustment is `(85 − average trip score) × $0.15`, capped from −$4 to +$8. The base, mileage, journey, and reward amounts are sample values—not a quote, policy term, or approved actuarial model.

## Publish on GitHub and Streamlit Community Cloud

1. Push this project to a GitHub repository owned by the Streamlit-connected account.
2. In [Streamlit Community Cloud](https://share.streamlit.io/), choose **Create app**, select the repository and branch, and set the app file to `app.py`.
3. Deploy. Streamlit installs dependencies from `requirements.txt`.

This repository is prepared for the `Thiru00007/drivefair` public repo. Keep `.streamlit/secrets.toml`, `.env`, and `data/drivefair.db` out of Git. No GitHub or Streamlit credentials belong in this project.

## Important database limitation

The app uses SQLite to provide a simple, self-contained database and account-scoped queries. Streamlit Community Cloud does **not** guarantee persistence of files written to the app container: SQLite data can be lost when the app is restarted, rebuilt, or redeployed. Do not use this hosting setup for real insurance or claim data.

For durable multi-user deployment, migrate the repository layer to managed PostgreSQL (for example, Supabase or Neon), configure its connection string using Streamlit secrets, and add production authentication, email verification, rate limiting, backups, audit logging, encryption, retention controls, and a security/privacy review. That production database and its credentials are not configured by this demo.

No real phone sensors, GPS, OEM connectivity, insurer backend, claim submission, or emergency-service integration is active. Scores are feedback, never fault decisions. Premium estimates are not quotes or policies.
