from __future__ import annotations

import html
import json
import logging
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import pandas as pd
import streamlit as st

from database import KM_PER_MILE, DriveFairDatabase
from localization import LANGUAGES, translate
from scoring import PLAN_NAMES, average_score, estimate_premium, score_trip

logging.basicConfig(level=logging.INFO)
LOGGER = logging.getLogger("drivefair")
INDIA_TZ = ZoneInfo("Asia/Kolkata")


def T(text: str) -> str:
    return translate(text, st.session_state.get("language", "English"))


def to_km(miles: float) -> float:
    return miles * KM_PER_MILE


def india_number(value: float | int, decimals: int = 2) -> str:
    whole, _, fraction = f"{abs(value):.{decimals}f}".partition(".")
    if len(whole) > 3:
        grouped = whole[-3:]
        whole = whole[:-3]
        while whole:
            grouped = whole[-2:] + "," + grouped
            whole = whole[:-2]
        whole = grouped
    sign = "-" if value < 0 else ""
    return f"{sign}{whole}.{fraction}" if decimals else f"{sign}{whole}"


def india_date(now: datetime) -> str:
    if st.session_state.get("language") == "हिन्दी":
        weekdays = ("सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार", "रविवार")
        months = (
            "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
            "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
        )
        return f"{weekdays[now.weekday()]}, {now.day} {months[now.month - 1]} {now.year}"
    return now.strftime("%A, %d %B %Y")


st.set_page_config(
    page_title="DriveFair | India motor cover",
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
        [data-testid="stSelectbox"] [role="group"] {{
          background: var(--df-surface) !important; border: 1px solid var(--df-line) !important;
        }}
        [data-testid="stSelectbox"] input[role="combobox"] {{ color: var(--df-text) !important; }}
        [role="listbox"] {{ background: var(--df-surface) !important; }}
        [role="option"] {{ color: var(--df-text) !important; }}
        .stButton > button, .stDownloadButton > button {{
          background: var(--df-surface); color: var(--df-text);
          border-radius: 8px; border-color: var(--df-line);
        }}
        .stButton > button:hover, .stDownloadButton > button:hover {{
          background: var(--df-elevated); color: var(--df-text); border-color: var(--df-line);
        }}
        .stButton > button[kind="primary"] {{ background: #286746; border-color: #286746; color: white; }}
        hr {{ border-color: var(--df-line); }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_table(rows: list[dict[str, Any]]) -> None:
    dark = st.session_state.get("dark_mode", False)
    surface = "#18221c" if dark else "#ffffff"
    elevated = "#202b24" if dark else "#f4f7f2"
    text = "#edf3ee" if dark else "#1b2820"
    styled_rows = pd.DataFrame(rows).style.set_properties(
        **{"background-color": surface, "color": text}
    )
    st.dataframe(styled_rows, hide_index=True, width="stretch")


def money(value: float | int) -> str:
    return f"₹{india_number(value)}"


def signed_money(value: float | int) -> str:
    if value < 0:
        return f"−{money(abs(value))}"
    if value > 0:
        return f"+{money(value)}"
    return money(0)


def show_heading(kicker: str, title: str, description: str = "") -> None:
    st.markdown(f'<div class="df-kicker">{html.escape(T(kicker))}</div>', unsafe_allow_html=True)
    st.title(T(title))
    if description:
        st.caption(T(description))


def navigate_to(page: str) -> None:
    st.session_state["page"] = page


def sign_out() -> None:
    st.session_state.pop("account", None)
    st.session_state.pop("dark_mode", None)
    st.session_state.pop("dark-mode-toggle", None)
    st.session_state.pop("language", None)
    st.session_state.pop("app-language", None)
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
            factors.append(f"{count} {T(label)} (−{count * penalty})")
    if signals.get("night_driving"):
            factors.append(f"{T('evening driving')} (−4)")
    return ", ".join(factors) if factors else T("No modeled events (95-point starting score)")


def render_login() -> None:
    apply_theme("light")
    left, center, right = st.columns([1, 1.25, 1])
    with center:
        language = st.selectbox(
            T("Language / भाषा"),
            LANGUAGES,
            key="language",
            label_visibility="collapsed",
        )
        st.markdown('<div class="df-brand">drivefair<span>.</span></div>', unsafe_allow_html=True)
        st.caption(T("Insurance that moves with you."))
        st.info(
            T("India-focused hackathon demo only. Do not enter real claim details or reuse an important password.")
        )
        login_tab, register_tab = st.tabs([T("Sign in"), T("Create account")])
        with login_tab:
            with st.form("login-form"):
                email = st.text_input(T("Email address"), autocomplete="email")
                password = st.text_input(T("Password"), type="password", autocomplete="current-password")
                submitted = st.form_submit_button(T("Sign in"), type="primary", width="stretch")
            if submitted:
                account = db.authenticate(email, password)
                if account is None:
                    st.error(T("Email or password is incorrect."))
                else:
                    db.update_preferences(
                        int(account["id"]),
                        language=st.session_state.get("language", "English"),
                    )
                    st.session_state["account"] = account
                    st.rerun()
        with register_tab:
            st.caption(T("Create a demo account. Use an address you control only if you want; verification email is not sent."))
            with st.form("register-form"):
                email = st.text_input(T("Email address"), key="register-email", autocomplete="email")
                password = st.text_input(
                    T("Password (12+ characters)"),
                    type="password",
                    key="register-password",
                    autocomplete="new-password",
                )
                confirmation = st.text_input(
                    T("Confirm password"),
                    type="password",
                    key="register-confirmation",
                    autocomplete="new-password",
                )
                submitted = st.form_submit_button(
                    T("Create demo account"), type="primary", width="stretch"
                )
            if submitted:
                if password != confirmation:
                    st.error(T("The passwords do not match."))
                else:
                    try:
                        user_id = db.create_user(email, password)
                        db.update_preferences(
                            user_id,
                            language=st.session_state.get("language", "English"),
                        )
                        st.success(T("Account created. Sign in to open your dashboard."))
                    except ValueError as error:
                        st.error(str(error))
                    except Exception:
                        LOGGER.exception("Account registration failed.")
                        st.error(T("Account creation failed. Please try again."))


def render_score_card(score: int) -> None:
    st.markdown(
        f"""
        <div class="df-panel">
          <div class="df-kicker">{html.escape(T("YOUR DRIVE SCORE"))}</div>
          <div style="font-size:2.4rem;font-weight:800;color:var(--df-green);margin:.2rem 0">{score}<span style="font-size:.95rem;font-weight:500;color:var(--df-muted)"> / 100</span></div>
          <div class="df-subtle">{html.escape(T("Feedback and rewards only — never a fault decision."))}</div>
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
        india_date(datetime.now(INDIA_TZ)),
        "Your driving, your data, your deal.",
        "A clear view of your journeys, coverage estimate, and choices.",
    )
    score = average_score(trips)
    pricing = estimate_premium(
        preferences["plan"],
        to_km(float(metrics["miles"])),
        int(metrics["trip_count"]),
        score,
    )
    summary, score_column = st.columns([2, 1])
    with summary:
        columns = st.columns(3)
        with columns[0]:
            st.metric(T("Distance this month"), f'{india_number(to_km(float(metrics["miles"])), 0)} km')
        with columns[1]:
            st.metric(T("Trips this month"), f'{metrics["trip_count"]:,}')
        with columns[2]:
            st.metric(T("Driving events"), f'{metrics["event_count"]:,}')
        st.subheader(T("Estimated monthly premium"))
        st.metric(T(str(pricing["plan"])), money(float(pricing["total"])), T("Illustrative demo estimate"))
        rows = [
            {T("Premium component"): T("Base coverage"), T("Estimate"): money(float(pricing["base"]))},
            {T("Premium component"): T(str(pricing["usage_label"])), T("Estimate"): money(float(pricing["usage"]))},
            {
                T("Premium component"): f'{T("Trip-score adjustment")} · {T("average")} {pricing["average_score"]}/100',
                T("Estimate"): signed_money(float(pricing["score_adjustment"])),
            },
            {T("Premium component"): T("Safe-driving reward"), T("Estimate"): f'−{money(float(pricing["reward"]))}'},
        ]
        render_table(rows)
        st.caption(T("Estimate is not a quote or a policy change. Review the full itemization in My coverage."))
    with score_column:
        render_score_card(score)
        st.markdown(f"#### {T('Recent journeys')}")
        for trip in trips[:3]:
            route = (
                f'{trip["origin"]} → {trip["destination"]}'
                if preferences["precise_locations"]
                else T("Private trip · distance and score only")
            )
            st.markdown(
                f'<div class="df-card" style="margin-bottom:.65rem;min-height:auto">'
                f'<b>{html.escape(route)}</b><br>'
                f'<span class="df-subtle">{to_km(float(trip["miles"])):g} km · {T("Score")} {trip["score"]}</span>'
                f"</div>",
                unsafe_allow_html=True,
            )
        st.button(
            T("View all trips"),
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
    columns[0].metric(T("Distance this month"), f'{india_number(to_km(float(metrics["miles"])), 0)} km')
    columns[1].metric(T("Trips this month"), f'{metrics["trip_count"]:,}')
    columns[2].metric(T("Average trip score"), f"{average_score(trips)} / 100")

    with st.expander(f"＋ {T('Log a sample trip')}", expanded=False):
        if not preferences["tracking"]:
            st.warning(T("Trip recording is paused. Turn it on in Privacy & data before logging a sample trip."))
        else:
            with st.form("add-trip-form"):
                c1, c2 = st.columns(2)
                origin = c1.text_input(T("Start"), value="Velachery, Chennai")
                destination = c2.text_input(T("Destination"), value="Guindy, Chennai")
                c3, c4 = st.columns(2)
                distance_km = c3.number_input(T("Distance (km)"), min_value=0.1, max_value=1_000.0, value=12.0, step=1.0)
                duration = c4.number_input(T("Duration (minutes)"), min_value=1, max_value=1_440, value=28)
                signal_columns = st.columns(3)
                hard_brakes = signal_columns[0].number_input(T("Hard brakes"), min_value=0, max_value=20, value=0)
                rapid_acceleration = signal_columns[1].number_input(T("Rapid acceleration"), min_value=0, max_value=20, value=0)
                sharp_turns = signal_columns[2].number_input(T("Sharp turns"), min_value=0, max_value=20, value=0)
                night_driving = st.checkbox(T("Evening driving"))
                submitted = st.form_submit_button(T("Save sample trip"), type="primary")
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
                        started_at=datetime.now(INDIA_TZ).isoformat(timespec="minutes"),
                        miles=float(distance_km) / KM_PER_MILE,
                        duration=f"{int(duration)} min",
                        signals=signals,
                        event=", ".join(events),
                    )
                    st.session_state["flash_message"] = (
                        f'{T("Trip saved · illustrative score")} {score_trip(signals)}/100.'
                    )
                    st.rerun()
                except ValueError as error:
                    st.error(str(error))

    st.subheader(T("Trip history"))
    filters = st.columns([1, 2])
    selected_filter = filters[0].selectbox(
        T("Filter"),
        ["All trips", "Careful trips", "Trips with events"],
        format_func=T,
    )
    visible = trips
    if selected_filter == "Careful trips":
        visible = [trip for trip in trips if trip["score"] >= 85]
    elif selected_filter == "Trips with events":
        visible = [trip for trip in trips if trip["event"]]
    if not visible:
        st.info(T("No trips match this filter."))
        return

    rows = []
    for trip in visible:
        route = (
            f'{trip["origin"]} → {trip["destination"]}'
            if preferences["precise_locations"]
            else T("Private trip")
        )
        rows.append(
            {
                T("Journey"): route,
                T("Date"): str(trip["started_at"]).replace("T", " ")[:16],
                T("Distance"): f'{to_km(float(trip["miles"])):g} km',
                T("Duration"): trip["duration"],
                T("Score"): trip["score"],
                T("Events"): trip["event"] or T("None"),
            }
        )
    render_table(rows)
    st.caption(T("Trip scores are illustrative driving feedback, not a measure of responsibility or fault."))
    with st.expander(T("How the demo score is calculated")):
        st.markdown(T(
            "Trip scores start at **95 points**. The demo subtracts 16 per hard-braking event, "
            "8 per rapid-acceleration event, 10 per sharp turn, and 4 for evening driving. "
            "Scores are clamped to 0–100. Sensor confidence, road context, and fairness "
            "validation are not modeled."
        ))
        for trip in visible:
            route = (
                f'{trip["origin"]} → {trip["destination"]}'
                if preferences["precise_locations"]
                else T("Private trip")
            )
            st.write(f'**{route} · {trip["score"]}/100:** {trip_explanation(trip)}')


def render_claims(
    user_id: int,
    trips: list[dict[str, Any]],
) -> None:
    show_heading("HERE TO HELP", "Claims, made simpler.", "Start a private draft and review it before anything is sent.")
    st.markdown(
        f'<div class="df-banner"><b>{html.escape(T("First, make sure everyone is safe."))}</b><br>'
        f'{html.escape(T("If anyone is hurt or in immediate danger, call 112. DriveFair is not an emergency service and cannot contact responders."))}</div>',
        unsafe_allow_html=True,
    )
    st.caption(
        T("After safety is handled, note the time and place and contact your insurer promptly. "
          "Required documents vary by insurer and policy. This demo does not submit claims.")
    )
    st.subheader(T("Start a claim draft"))
    with st.form("claim-form"):
        c1, c2 = st.columns(2)
        incident_date = c1.date_input(T("When did it happen?"), value=datetime.now(INDIA_TZ).date())
        incident_time = c2.time_input(T("Approximate time (IST)"), value=datetime.now(INDIA_TZ).time().replace(second=0, microsecond=0))
        incident_type = st.selectbox(
            T("Incident type"), ["Collision", "Vehicle damage", "Theft or break-in", "Other"],
            format_func=T,
        )
        description = st.text_area(
            T("Briefly describe what happened"),
            max_chars=1_000,
            placeholder=T("Share only what you are comfortable saving in this demo."),
        )
        include_trip = st.checkbox(
            T("Include the latest trip summary (distance, score, and event only; no exact locations)"),
            disabled=not bool(trips),
        )
        submitted = st.form_submit_button(T("Save claim draft"), type="primary")
    if submitted:
        if not description.strip():
            st.error(T("Add a short description before saving the draft."))
        else:
            summary = None
            if include_trip and trips:
                latest = trips[0]
                summary = {
                    "miles": latest["miles"],
                    "distance_km": to_km(float(latest["miles"])),
                    "score": latest["score"],
                    "event": latest["event"] or T("No detected events"),
                }
            incident_at = datetime.combine(incident_date, incident_time, tzinfo=INDIA_TZ).isoformat(timespec="minutes")
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

    st.subheader(T("Your claim drafts"))
    claims = db.list_claims(user_id)
    if not claims:
        st.info(T("No claim drafts yet."))
        return
    for claim in claims:
        with st.expander(f'{claim["claim_ref"]} · {claim["incident_type"]} · {claim["status"]}'):
            st.write(f'**Incident date:** {claim["incident_date"].replace("T", " ")}')
            st.write(f'**Description:** {claim["description"]}')
            if claim["trip_summary"]:
                summary = claim["trip_summary"]
                distance_km = summary.get(
                    "distance_km", to_km(float(summary.get("miles", 0)))
                )
                st.write(
                    f'**{T("Optional trip summary")}:** {distance_km:g} km · '
                    f'score {summary["score"]}/100 · {summary["event"]}'
                )
            st.caption(T("A real claim would be reviewed by a claims specialist; this draft is not submitted."))


def render_coverage(
    user_id: int,
    preferences: dict[str, Any],
    metrics: dict[str, float | int],
    trips: list[dict[str, Any]],
) -> None:
    show_heading("COVER THAT FITS YOUR LIFE", "Choose how you pay.", "Plan selection changes this demo estimate only.")
    selected = st.selectbox(
        T("Usage-based plan"),
        options=list(PLAN_NAMES),
        format_func=lambda plan: T(PLAN_NAMES[plan]),
        index=list(PLAN_NAMES).index(preferences["plan"]),
        key="coverage-plan",
    )
    if selected != preferences["plan"]:
        db.update_preferences(user_id, plan=selected)
        preferences["plan"] = selected
    pricing = estimate_premium(
        selected,
        to_km(float(metrics["miles"])),
        int(metrics["trip_count"]),
        average_score(trips),
    )
    c1, c2 = st.columns([1, 1.4])
    with c1:
        st.metric(T("Estimated monthly total"), money(float(pricing["total"])))
        st.caption(f'{T("Current plan")} · {T(str(pricing["plan"]))}')
    with c2:
        rows = [
            {T("Component"): T("Base coverage"), T("Estimate"): money(float(pricing["base"]))},
            {T("Component"): T(str(pricing["usage_label"])), T("Estimate"): money(float(pricing["usage"]))},
            {
                T("Component"): f'{T("Trip-score adjustment")} · {T("avg")} {pricing["average_score"]}/100',
                T("Estimate"): signed_money(float(pricing["score_adjustment"])),
            },
            {T("Component"): T("Safe-driving reward"), T("Estimate"): f'−{money(float(pricing["reward"]))}'},
            {T("Component"): T("Monthly estimate"), T("Estimate"): money(float(pricing["total"]))},
        ]
        render_table(rows)
    st.subheader(T("Plan options"))
    cards = st.columns(3)
    rates = [
        ("mile", "₹1.50 / km", "A base rate plus distance driven."),
        ("journey", "From ₹20 / trip", "A flat amount per trip plus a clear score adjustment."),
        ("monthly", "₹699 / month", "A steady base with the same transparent score adjustment."),
    ]
    for column, (plan, rate, description) in zip(cards, rates, strict=True):
        with column:
            st.markdown(
                f'<div class="df-card"><div class="df-card-label">{html.escape(T(PLAN_NAMES[plan]))}</div>'
                f'<div class="df-card-value">{html.escape(rate)}</div>'
                f'<div class="df-card-note">{html.escape(T(description))}</div></div>',
                unsafe_allow_html=True,
            )
    st.caption(T(
        "Demo adjustment: (85 − average trip score) × ₹5, capped at −₹100 to +₹200. "
        "Rates are illustrative—not a quote, policy, or approved actuarial calculation."
    ))
    st.info(
        T("In India, third-party motor insurance is mandatory. This demo does not provide or verify "
          "insurance cover. Estimates are fictional, exclude applicable taxes, and do not account "
          "for vehicle IDV, vehicle class, location/zone, insurer, add-ons, or policy terms. "
          "Confirm cover and price directly with a licensed insurer.")
    )


def render_privacy(
    user_id: int,
    preferences: dict[str, Any],
) -> None:
    show_heading("YOUR DATA, YOUR CALL", "Privacy, in your hands.", "Control sample data collection and export your demo profile.")
    st.info(
        T("This app uses simulated trips only. It does not access phone sensors, live location, "
          "OEM connectivity, insurer systems, or emergency services.")
    )
    st.subheader(T("Data & permissions"))
    controls = [
        ("tracking", "Trip tracking", "Allow simulated sample trips to be added.", "tracking-toggle"),
        ("precise_locations", "Precise locations", "Show trip start and end points in the app and exports.", "location-toggle"),
        ("incident_assistance", "Incident assistance alerts", "Possible-incident alerts are not active in this demo. Claims can always be started manually.", "incident-toggle"),
    ]
    for key, title, help_text, widget_key in controls:
        value = st.toggle(T(title), value=preferences[key], help=T(help_text), key=widget_key)
        if value != preferences[key]:
            db.update_preferences(user_id, **{key: value})
            preferences[key] = value
            st.rerun()

    st.markdown(f'**{T("Vehicle connectivity")}**  \n{T("Not connected. No vehicle data is accessed.")}')
    st.subheader(T("Your local data"))
    export_data = db.export_user_data(user_id)
    for trip in export_data["trips"]:
        trip["distance_km"] = to_km(float(trip.pop("miles")))
    export_data["distance_unit"] = "km"
    if not preferences["precise_locations"]:
        export_data["trips"] = [
            {key: trip[key] for key in ("id", "started_at", "distance_km", "duration", "score", "event")}
            for trip in export_data["trips"]
        ]
    st.download_button(
        T("↓ Export my data"),
        data=json.dumps(export_data, indent=2, ensure_ascii=False),
        file_name="drivefair-demo-data.json",
        mime="application/json",
        width="content",
    )
    with st.expander(T("Clear account demo data")):
        st.warning(
            T("This removes your saved trips and claim drafts, and resets preferences. "
              "The account remains available.")
        )
        confirm = st.checkbox(T("I understand this cannot be undone."), key="confirm-clear")
        if st.button(T("Clear my demo data"), disabled=not confirm, type="secondary"):
            db.clear_user_demo_data(user_id)
            st.success(T("Your demo data was cleared and the sample starting view restored."))
            st.rerun()
    st.caption(
        T("Demo only. A real insurance product needs durable managed storage, access controls, "
          "security review, retention policies, and regulatory validation.")
    )


def run_app() -> None:
    account = st.session_state.get("account")
    if not account:
        render_login()
        return

    user_id = int(account["id"])
    preferences = db.get_preferences(user_id)
    st.session_state.setdefault("language", preferences["language"])
    st.session_state.setdefault("dark_mode", preferences["theme"] == "dark")
    apply_theme("dark" if st.session_state["dark_mode"] else "light")

    with st.sidebar:
        st.markdown('<div class="df-brand">drivefair<span>.</span></div>', unsafe_allow_html=True)
        st.caption(T("India motor cover · Demo"))
        language = st.selectbox(
            T("Language / भाषा"),
            LANGUAGES,
            index=LANGUAGES.index(preferences["language"]),
            key="app-language",
        )
        if language != preferences["language"]:
            db.update_preferences(user_id, language=language)
            preferences["language"] = language
            st.session_state["language"] = language
            st.rerun()
        dark_mode = st.toggle(T("Dark mode"), value=st.session_state["dark_mode"], key="dark-mode-toggle")
        if dark_mode != st.session_state["dark_mode"]:
            st.session_state["dark_mode"] = dark_mode
            theme = "dark" if dark_mode else "light"
            db.update_preferences(user_id, theme=theme)
            st.rerun()
        st.markdown("---")
        page = st.radio(
            T("Your space"),
            ["Overview", "My trips", "Claims", "My coverage", "Privacy & data"],
            format_func=T,
            key="page",
            label_visibility="collapsed",
        )
        st.markdown("---")
        st.caption(f'{T("Signed in as")} {account["email"]}')
        st.button(T("Sign out"), width="stretch", on_click=sign_out)

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
        st.error(T("This page could not load. Your existing data has not been intentionally changed."))

    st.divider()
    st.caption(
        T("DriveFair is a hackathon prototype. Scores are illustrative guidance, not fault "
          "assessments. Premiums are estimates, not quotes or policies.")
    )


run_app()
