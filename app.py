from __future__ import annotations

import html
import json
import logging
from datetime import date, datetime, time
from typing import Any

import streamlit as st

from database import DriveFairDatabase
from scoring import PLAN_NAMES, average_score, estimate_premium, score_trip

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("drivefair")

st.set_page_config(
    page_title="DriveFair | Smart motor cover",
    page_icon="🚘",
    layout="wide",
    initial_sidebar_state="expanded",
)

try:
    db = DriveFairDatabase()
except Exception:
    LOGGER.exception("Could not initialize DriveFair's database.")
    st.error(
        "DriveFair could not open its database. Check that the configured database "
        "location is writable, then restart the app."
    )
    st.stop()


def apply_theme(theme: str) -> None:
    dark = theme == "dark"
    background = "#101713" if dark else "#f5f7f3"
    surface = "#18221c" if dark else "#ffffff"
    elevated = "#202b24" if dark else "#f4f7f2"
    text = "#edf3ee" if dark else "#1b2820"
    muted = "#a1afa5" if dark else "#768279"
    line = "#334239" if dark else "#e3e9e2"
    green = "#8bc59a" if dark else "#286746"
    st.markdown(
        f"""
        <style>
        :root {{
          color-scheme: {"dark" if dark else "light"};
          --df-bg: {background}; --df-surface: {surface}; --df-elevated: {elevated};
          --df-text: {text}; --df-muted: {muted}; --df-line: {line}; --df-green: {green};
        }}
        .stApp {{ background: var(--df-bg); color: var(--df-text); }}
        [data-testid="stHeader"] {{ background: transparent; }}
        [data-testid="stSidebar"] {{ background: var(--df-surface); border-right: 1px solid var(--df-line); }}
        [data-testid="stSidebar"] * {{ color: var(--df-text); }}
        .block-container {{ max-width: 1320px; padding-top: 1.5rem; padding-bottom: 4rem; }}
        h1, h2, h3 {{ color: var(--df-text); letter-spacing: -.035em; }}
        p, label, .stCaption, [data-testid="stMarkdownContainer"] {{ color: var(--df-text); }}
        .df-kicker {{ color: var(--df-muted); font-size: .72rem; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }}
        .df-subtle {{ color: var(--df-muted); }}
        .df-card {{ background: var(--df-surface); border: 1px solid var(--df-line); border-radius: 14px; padding: 1.1rem 1.2rem; min-height: 112px; }}
        .df-card-label {{ color: var(--df-muted); font-size: .76rem; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }}
        .df-card-value {{ color: var(--df-text); font-size: 1.8rem; font-weight: 750; line-height: 1.2; margin-top: .45rem; }}
        .df-card-note {{ color: var(--df-muted); font-size: .82rem; margin-top: .3rem; }}
        .df-panel {{ background: var(--df-surface); border: 1px solid var(--df-line); border-radius: 14px; padding: 1.25rem; }}
        .df-banner {{ background: var(--df-elevated); border: 1px solid var(--df-line); border-left: 4px solid #d39a64; border-radius: 10px; padding: .95rem 1rem; }}
        .df-brand {{ font-size: 1.55rem; font-weight: 800; letter-spacing: -.06em; }}
        .df-brand span {{ color: var(--df-green); }}
        .df-pill {{ background: var(--df-elevated); border: 1px solid var(--df-line); border-radius: 999px; color: var(--df-green); display: inline-block; font-size: .75rem; font-weight: 700; padding: .3rem .65rem; }}
        [data-testid="stMetric"] {{ background: var(--df-surface); border: 1px solid var(--df-line); border-radius: 12px; padding: .9rem 1rem; }}
        [data-testid="stMetricLabel"] {{ color: var(--df-muted); }}
        [data-testid="stMetricValue"] {{ color: var(--df-text); }}
        [data-testid="stDataFrame"], [data-testid="stTable"] {{ border: 1px solid var(--df-line); border-radius: 10px; overflow: hidden; }}
        div[data-baseweb="input"] > div, div[data-baseweb="select"] > div, textarea {{
          background: var(--df-surface) !important; color: var(--df-text) !important; border-color: var(--df-line) !important;
        }}
        .stButton > button, .stDownloadButton > button {{ border-radius: 8px; border-color: var(--df-line); }}
        .stButton > button[kind="primary"] {{ background: #286746; border-color: #286746; color: white; }}
        hr {{ border-color: var(--df-line); }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def money(value: float | int) -> str:
    return f"${value:,.2f}"


def signed_money(value: float | int) -> str:
    if value < 0:
        return f"−{money(abs(value))}"
    if value > 0:
        return f"+{money(value)}"
    return money(0)


def show_heading(kicker: str, title: str, description: str = "") -> None:
    st.markdown(f'<div class="df-kicker">{html.escape(kicker)}</div>', unsafe_allow_html=True)
    st.title(title)
    if description:
        st.caption(description)


def navigate_to(page: str) -> None:
    st.session_state["page"] = page


def sign_out() -> None:
    st.session_state.pop("account", None)
    st.session_state.pop("dark_mode", None)
    st.session_state.pop("dark-mode-toggle", None)
    st.session_state.pop("page", None)


def trip_explanation(trip: dict[str, Any]) -> str:
    signals = trip["signals"]
    factors: list[str] = []
    for key, label, penalty in (
        ("hard_brakes", "hard braking", 16),
        ("rapid_acceleration", "rapid acceleration", 8),
        ("sharp_turns", "sharp turns", 10),
    ):
        count = int(signals.get(key, 0))
        if count:
            factors.append(f"{count} {label} (−{count * penalty})")
    if signals.get("night_driving"):
        factors.append("evening driving (−4)")
    return ", ".join(factors) if factors else "No modeled events (95-point starting score)"


def render_login() -> None:
    apply_theme("light")
    left, center, right = st.columns([1, 1.25, 1])
    with center:
        st.markdown('<div class="df-brand">drivefair<span>.</span></div>', unsafe_allow_html=True)
        st.caption("Insurance that moves with you.")
        st.info(
            "Hackathon demo only. Do not enter real claim details or reuse an important password."
        )
        login_tab, register_tab = st.tabs(["Sign in", "Create account"])
        with login_tab:
            with st.form("login-form"):
                email = st.text_input("Email address", autocomplete="email")
                password = st.text_input("Password", type="password", autocomplete="current-password")
                submitted = st.form_submit_button("Sign in", type="primary", width="stretch")
            if submitted:
                account = db.authenticate(email, password)
                if account is None:
                    st.error("Email or password is incorrect.")
                else:
                    st.session_state["account"] = account
                    st.rerun()
        with register_tab:
            st.caption("Create a demo account. Use an address you control only if you want; verification email is not sent.")
            with st.form("register-form"):
                email = st.text_input("Email address", key="register-email", autocomplete="email")
                password = st.text_input(
                    "Password (12+ characters)",
                    type="password",
                    key="register-password",
                    autocomplete="new-password",
                )
                confirmation = st.text_input(
                    "Confirm password",
                    type="password",
                    key="register-confirmation",
                    autocomplete="new-password",
                )
                submitted = st.form_submit_button(
                    "Create demo account", type="primary", width="stretch"
                )
            if submitted:
                if password != confirmation:
                    st.error("The passwords do not match.")
                else:
                    try:
                        db.create_user(email, password)
                        st.success("Account created. Sign in to open your dashboard.")
                    except ValueError as error:
                        st.error(str(error))
                    except Exception:
                        LOGGER.exception("Account registration failed.")
                        st.error("Account creation failed. Please try again.")


def render_score_card(score: int) -> None:
    st.markdown(
        f"""
        <div class="df-panel">
          <div class="df-kicker">YOUR DRIVE SCORE</div>
          <div style="font-size:2.4rem;font-weight:800;color:var(--df-green);margin:.2rem 0">{score}<span style="font-size:.95rem;font-weight:500;color:var(--df-muted)"> / 100</span></div>
          <div class="df-subtle">Feedback and rewards only — never a fault decision.</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_overview(
    user_id: int,
    preferences: dict[str, Any],
    trips: list[dict[str, Any]],
    metrics: dict[str, float | int],
) -> None:
    show_heading(
        "MONDAY, OCTOBER 20, 2026",
        "Your driving, your data, your deal.",
        "A clear view of your journeys, coverage estimate, and choices.",
    )
    score = average_score(trips)
    pricing = estimate_premium(
        preferences["plan"],
        float(metrics["miles"]),
        int(metrics["trip_count"]),
        score,
    )
    summary, score_column = st.columns([2, 1])
    with summary:
        columns = st.columns(3)
        with columns[0]:
            st.metric("Miles this month", f'{metrics["miles"]:,.0f} mi')
        with columns[1]:
            st.metric("Trips this month", f'{metrics["trip_count"]:,}')
        with columns[2]:
            st.metric("Driving events", f'{metrics["event_count"]:,}')
        st.subheader("Estimated monthly premium")
        st.metric(pricing["plan"], money(float(pricing["total"])), "Illustrative demo estimate")
        rows = [
            {"Premium component": "Base coverage", "Estimate": money(float(pricing["base"]))},
            {"Premium component": str(pricing["usage_label"]), "Estimate": money(float(pricing["usage"]))},
            {
                "Premium component": f'Trip-score adjustment · average {pricing["average_score"]}/100',
                "Estimate": signed_money(float(pricing["score_adjustment"])),
            },
            {"Premium component": "Safe-driving reward", "Estimate": f'−{money(float(pricing["reward"]))}'},
        ]
        st.dataframe(rows, hide_index=True, width="stretch")
        st.caption("Estimate is not a quote or a policy change. Review the full itemization in My coverage.")
    with score_column:
        render_score_card(score)
        st.markdown("#### Recent journeys")
        for trip in trips[:3]:
            route = (
                f'{trip["origin"]} → {trip["destination"]}'
                if preferences["precise_locations"]
                else "Private trip · distance and score only"
            )
            st.markdown(
                f'<div class="df-card" style="margin-bottom:.65rem;min-height:auto">'
                f'<b>{html.escape(route)}</b><br>'
                f'<span class="df-subtle">{trip["miles"]:g} mi · score {trip["score"]}</span>'
                f"</div>",
                unsafe_allow_html=True,
            )
        st.button(
            "View all trips",
            width="stretch",
            on_click=navigate_to,
            args=("My trips",),
        )


def render_trips(
    user_id: int,
    preferences: dict[str, Any],
    trips: list[dict[str, Any]],
    metrics: dict[str, float | int],
) -> None:
    show_heading("YOUR JOURNEYS", "Every trip tells a story.", "Your trip history is private to your account.")
    columns = st.columns(3)
    columns[0].metric("Distance this month", f'{metrics["miles"]:,.0f} mi')
    columns[1].metric("Trips this month", f'{metrics["trip_count"]:,}')
    columns[2].metric("Average trip score", f"{average_score(trips)} / 100")

    with st.expander("＋ Log a sample trip", expanded=False):
        if not preferences["tracking"]:
            st.warning("Trip recording is paused. Turn it on in Privacy & data before logging a sample trip.")
        else:
            with st.form("add-trip-form"):
                c1, c2 = st.columns(2)
                origin = c1.text_input("Start", value="Home, Brooklyn")
                destination = c2.text_input("Destination", value="Office, Manhattan")
                c3, c4 = st.columns(2)
                miles = c3.number_input("Distance (miles)", min_value=0.1, max_value=1_000.0, value=12.0, step=0.5)
                duration = c4.number_input("Duration (minutes)", min_value=1, max_value=1_440, value=28)
                signal_columns = st.columns(3)
                hard_brakes = signal_columns[0].number_input("Hard brakes", min_value=0, max_value=20, value=0)
                rapid_acceleration = signal_columns[1].number_input("Rapid acceleration", min_value=0, max_value=20, value=0)
                sharp_turns = signal_columns[2].number_input("Sharp turns", min_value=0, max_value=20, value=0)
                night_driving = st.checkbox("Evening driving")
                submitted = st.form_submit_button("Save sample trip", type="primary")
            if submitted:
                signals = {
                    "hard_brakes": int(hard_brakes),
                    "rapid_acceleration": int(rapid_acceleration),
                    "sharp_turns": int(sharp_turns),
                    "night_driving": night_driving,
                }
                events = []
                if hard_brakes:
                    events.append("Hard braking")
                if rapid_acceleration:
                    events.append("Rapid acceleration")
                if sharp_turns:
                    events.append("Sharp turns")
                try:
                    db.add_trip(
                        user_id,
                        origin=origin,
                        destination=destination,
                        started_at=datetime.now().isoformat(timespec="minutes"),
                        miles=float(miles),
                        duration=f"{int(duration)} min",
                        signals=signals,
                        event=", ".join(events),
                    )
                    st.session_state["flash_message"] = (
                        f"Trip saved · illustrative score {score_trip(signals)}/100."
                    )
                    st.rerun()
                except ValueError as error:
                    st.error(str(error))

    st.subheader("Trip history")
    filters = st.columns([1, 2])
    selected_filter = filters[0].selectbox("Filter", ["All trips", "Careful trips", "Trips with events"])
    visible = trips
    if selected_filter == "Careful trips":
        visible = [trip for trip in trips if trip["score"] >= 85]
    elif selected_filter == "Trips with events":
        visible = [trip for trip in trips if trip["event"]]
    if not visible:
        st.info("No trips match this filter.")
        return

    rows = []
    for trip in visible:
        route = (
            f'{trip["origin"]} → {trip["destination"]}'
            if preferences["precise_locations"]
            else "Private trip"
        )
        rows.append(
            {
                "Journey": route,
                "Date": str(trip["started_at"]).replace("T", " ")[:16],
                "Distance": f'{trip["miles"]:g} mi',
                "Duration": trip["duration"],
                "Score": trip["score"],
                "Events": trip["event"] or "None",
            }
        )
    st.dataframe(rows, hide_index=True, width="stretch")
    st.caption("Trip scores are illustrative driving feedback, not a measure of responsibility or fault.")
    with st.expander("How the demo score is calculated"):
        st.markdown(
            "Trips start at **95 points**. The demo subtracts 16 per hard-braking event, "
            "8 per rapid-acceleration event, 10 per sharp turn, and 4 for evening driving. "
            "Scores are clamped to 0–100. Sensor confidence, road context, and fairness "
            "validation are not modeled."
        )
        for trip in visible:
            route = (
                f'{trip["origin"]} → {trip["destination"]}'
                if preferences["precise_locations"]
                else "Private trip"
            )
            st.write(f'**{route} · {trip["score"]}/100:** {trip_explanation(trip)}')


def render_claims(
    user_id: int,
    trips: list[dict[str, Any]],
) -> None:
    show_heading("HERE TO HELP", "Claims, made simpler.", "Start a private draft and review it before anything is sent.")
    st.markdown(
        '<div class="df-banner"><b>First, make sure everyone is safe.</b><br>'
        'If anyone is hurt or in immediate danger, call your local emergency number. '
        'DriveFair is not an emergency service and cannot contact responders.</div>',
        unsafe_allow_html=True,
    )
    st.subheader("Start a claim draft")
    with st.form("claim-form"):
        c1, c2 = st.columns(2)
        incident_date = c1.date_input("When did it happen?", value=date.today())
        incident_time = c2.time_input("Approximate time", value=datetime.now().time().replace(second=0, microsecond=0))
        incident_type = st.selectbox(
            "Incident type", ["Collision", "Vehicle damage", "Theft or break-in", "Other"]
        )
        description = st.text_area(
            "Briefly describe what happened",
            max_chars=1_000,
            placeholder="Share only what you are comfortable saving in this demo.",
        )
        include_trip = st.checkbox(
            "Include the latest trip summary (distance, score, and event only; no exact locations)",
            disabled=not bool(trips),
        )
        submitted = st.form_submit_button("Save claim draft", type="primary")
    if submitted:
        if not description.strip():
            st.error("Add a short description before saving the draft.")
        else:
            summary = None
            if include_trip and trips:
                latest = trips[0]
                summary = {
                    "miles": latest["miles"],
                    "score": latest["score"],
                    "event": latest["event"] or "No detected events",
                }
            incident_at = datetime.combine(incident_date, incident_time).isoformat(timespec="minutes")
            try:
                reference = db.create_claim(
                    user_id,
                    incident_date=incident_at,
                    incident_type=incident_type,
                    description=description,
                    trip_summary=summary,
                )
                st.session_state["flash_message"] = (
                    f"Draft {reference} saved locally. It has not been submitted."
                )
                st.rerun()
            except ValueError as error:
                st.error(str(error))

    st.subheader("Your claim drafts")
    claims = db.list_claims(user_id)
    if not claims:
        st.info("No claim drafts yet.")
        return
    for claim in claims:
        with st.expander(f'{claim["claim_ref"]} · {claim["incident_type"]} · {claim["status"]}'):
            st.write(f'**Incident date:** {claim["incident_date"].replace("T", " ")}')
            st.write(f'**Description:** {claim["description"]}')
            if claim["trip_summary"]:
                summary = claim["trip_summary"]
                st.write(
                    f'**Optional trip summary:** {summary["miles"]:g} mi · '
                    f'score {summary["score"]}/100 · {summary["event"]}'
                )
            st.caption("A real claim would be reviewed by a claims specialist; this draft is not submitted.")


def render_coverage(
    user_id: int,
    preferences: dict[str, Any],
    metrics: dict[str, float | int],
    trips: list[dict[str, Any]],
) -> None:
    show_heading("COVER THAT FITS YOUR LIFE", "Choose how you pay.", "Plan selection changes this demo estimate only.")
    selected = st.selectbox(
        "Usage-based plan",
        options=list(PLAN_NAMES),
        format_func=lambda plan: PLAN_NAMES[plan],
        index=list(PLAN_NAMES).index(preferences["plan"]),
        key="coverage-plan",
    )
    if selected != preferences["plan"]:
        db.update_preferences(user_id, plan=selected)
        preferences["plan"] = selected
    pricing = estimate_premium(
        selected,
        float(metrics["miles"]),
        int(metrics["trip_count"]),
        average_score(trips),
    )
    c1, c2 = st.columns([1, 1.4])
    with c1:
        st.metric("Estimated monthly total", money(float(pricing["total"])))
        st.caption(f'Current plan · {pricing["plan"]}')
    with c2:
        rows = [
            {"Component": "Base coverage", "Estimate": money(float(pricing["base"]))},
            {"Component": str(pricing["usage_label"]), "Estimate": money(float(pricing["usage"]))},
            {
                "Component": f'Trip-score adjustment · avg {pricing["average_score"]}/100',
                "Estimate": signed_money(float(pricing["score_adjustment"])),
            },
            {"Component": "Safe-driving reward", "Estimate": f'−{money(float(pricing["reward"]))}'},
            {"Component": "Monthly estimate", "Estimate": money(float(pricing["total"]))},
        ]
        st.dataframe(rows, hide_index=True, width="stretch")
    st.subheader("Plan options")
    cards = st.columns(3)
    rates = [
        ("mile", "5.9¢ / mile", "A base rate plus miles driven."),
        ("journey", "From $1.20 / trip", "A flat amount per trip plus a clear score adjustment."),
        ("monthly", "$79 / month", "A steady base with the same transparent score adjustment."),
    ]
    for column, (plan, rate, description) in zip(cards, rates, strict=True):
        with column:
            st.markdown(
                f'<div class="df-card"><div class="df-card-label">{html.escape(PLAN_NAMES[plan])}</div>'
                f'<div class="df-card-value">{html.escape(rate)}</div>'
                f'<div class="df-card-note">{html.escape(description)}</div></div>',
                unsafe_allow_html=True,
            )
    st.caption(
        "Demo adjustment: (85 − average trip score) × $0.15, capped at −$4 to +$8. "
        "Rates are illustrative—not a quote, policy, or approved actuarial calculation."
    )


def render_privacy(
    user_id: int,
    preferences: dict[str, Any],
) -> None:
    show_heading("YOUR DATA, YOUR CALL", "Privacy, in your hands.", "Control sample data collection and export your demo profile.")
    st.info(
        "This app uses simulated trips only. It does not access phone sensors, live location, "
        "OEM connectivity, insurer systems, or emergency services."
    )
    st.subheader("Data & permissions")
    controls = [
        ("tracking", "Trip tracking", "Allow simulated sample trips to be added.", "tracking-toggle"),
        ("precise_locations", "Precise locations", "Show trip start and end points in the app and exports.", "location-toggle"),
        ("incident_assistance", "Incident assistance alerts", "Possible-incident alerts are not active in this demo. Claims can always be started manually.", "incident-toggle"),
    ]
    for key, title, help_text, widget_key in controls:
        value = st.toggle(title, value=preferences[key], help=help_text, key=widget_key)
        if value != preferences[key]:
            db.update_preferences(user_id, **{key: value})
            preferences[key] = value
            st.rerun()

    st.markdown("**Vehicle connectivity**  \nNot connected. No vehicle data is accessed.")
    st.subheader("Your local data")
    export_data = db.export_user_data(user_id)
    if not preferences["precise_locations"]:
        export_data["trips"] = [
            {key: trip[key] for key in ("id", "started_at", "miles", "duration", "score", "event")}
            for trip in export_data["trips"]
        ]
    st.download_button(
        "↓ Export my data",
        data=json.dumps(export_data, indent=2, ensure_ascii=False),
        file_name="drivefair-demo-data.json",
        mime="application/json",
        width="content",
    )
    with st.expander("Clear account demo data"):
        st.warning(
            "This removes your saved trips and claim drafts, and resets preferences. "
            "The account remains available."
        )
        confirm = st.checkbox("I understand this cannot be undone.", key="confirm-clear")
        if st.button("Clear my demo data", disabled=not confirm, type="secondary"):
            db.clear_user_demo_data(user_id)
            st.success("Your demo data was cleared and the sample starting view restored.")
            st.rerun()
    st.caption(
        "Demo only. A real insurance product needs durable managed storage, access controls, "
        "security review, retention policies, and regulatory validation."
    )


def run_app() -> None:
    account = st.session_state.get("account")
    if not account:
        render_login()
        return

    user_id = int(account["id"])
    preferences = db.get_preferences(user_id)
    st.session_state.setdefault("dark_mode", preferences["theme"] == "dark")
    apply_theme("dark" if st.session_state["dark_mode"] else "light")

    with st.sidebar:
        st.markdown('<div class="df-brand">drivefair<span>.</span></div>', unsafe_allow_html=True)
        st.caption("Smart motor cover · Demo")
        dark_mode = st.toggle("Dark mode", value=st.session_state["dark_mode"], key="dark-mode-toggle")
        if dark_mode != st.session_state["dark_mode"]:
            st.session_state["dark_mode"] = dark_mode
            theme = "dark" if dark_mode else "light"
            db.update_preferences(user_id, theme=theme)
            st.rerun()
        st.markdown("---")
        page = st.radio(
            "Your space",
            ["Overview", "My trips", "Claims", "My coverage", "Privacy & data"],
            key="page",
            label_visibility="collapsed",
        )
        st.markdown("---")
        st.caption(f'Signed in as {account["email"]}')
        st.button("Sign out", width="stretch", on_click=sign_out)

    try:
        flash_message = st.session_state.pop("flash_message", None)
        if flash_message:
            st.success(flash_message)
        trips = db.list_trips(user_id)
        metrics = db.monthly_totals(user_id)
        if page == "Overview":
            render_overview(user_id, preferences, trips, metrics)
        elif page == "My trips":
            render_trips(user_id, preferences, trips, metrics)
        elif page == "Claims":
            render_claims(user_id, trips)
        elif page == "My coverage":
            render_coverage(user_id, preferences, metrics, trips)
        else:
            render_privacy(user_id, preferences)
    except Exception:
        LOGGER.exception("DriveFair page failed for account id %s.", user_id)
        st.error("This page could not load. Your existing data has not been intentionally changed.")

    st.divider()
    st.caption(
        "DriveFair is a hackathon prototype. Scores are illustrative guidance, not fault "
        "assessments. Premiums are estimates, not quotes or policies."
    )


run_app()
