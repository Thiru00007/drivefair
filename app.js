const initialTrips = [
  { id: 1, from: "Home, Brooklyn", to: "Studio, Manhattan", date: "Today · 8:42 AM", miles: 12, score: 94, event: "", kind: "smooth", duration: "28 min" },
  { id: 2, from: "Studio, Manhattan", to: "Market, Williamsburg", date: "Yesterday · 6:18 PM", miles: 8, score: 76, event: "Hard braking", kind: "city", duration: "31 min" },
  { id: 3, from: "Home, Brooklyn", to: "Riverside Park", date: "Oct 18 · 10:05 AM", miles: 16, score: 91, event: "", kind: "smooth", duration: "34 min" },
  { id: 4, from: "Friends, Queens", to: "Home, Brooklyn", date: "Oct 17 · 9:36 PM", miles: 18, score: 83, event: "", kind: "night", duration: "39 min" }
];

const samples = {
  smooth: { from: "Home, Brooklyn", to: "Office, Manhattan", miles: 12, event: "", kind: "smooth", duration: "26 min", date: "Just now", signals: { hardBrakes: 0, rapidAcceleration: 0, sharpTurns: 0, nightDriving: false } },
  mixed: { from: "Market, Williamsburg", to: "Home, Brooklyn", miles: 8, event: "Hard braking", kind: "city", duration: "24 min", date: "Just now", signals: { hardBrakes: 1, rapidAcceleration: 0, sharpTurns: 0, nightDriving: false } },
  night: { from: "Home, Brooklyn", to: "Friends, Queens", miles: 18, event: "", kind: "night", duration: "37 min", date: "Just now", signals: { hardBrakes: 0, rapidAcceleration: 0, sharpTurns: 0, nightDriving: true } }
};

const storageKey = "drivefair-demo-v1";
const defaultState = {
  addedTrips: [],
  claims: [],
  plan: "mile",
  tracking: true,
  preciseLocations: true,
  incidentAssistance: true
};
let storageReadFailed = false;
let state = loadState();
let toastTimer;

function freshDefaultState() {
  return { ...defaultState, addedTrips: [], claims: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return freshDefaultState();
    const parsed = JSON.parse(raw);
    const addedTrips = Array.isArray(parsed.addedTrips) ? parsed.addedTrips
      .filter(trip => trip && Number.isFinite(trip.id) && Number.isFinite(trip.miles) && Number.isFinite(trip.score) &&
        typeof trip.from === "string" && typeof trip.to === "string" && typeof trip.date === "string" &&
        typeof trip.duration === "string" && typeof trip.event === "string")
      .map(trip => ({
        ...trip,
        miles: Math.max(0, trip.miles),
        score: Math.max(0, Math.min(100, trip.score)),
        kind: ["smooth", "city", "night"].includes(trip.kind) ? trip.kind : "smooth"
      })) : [];
    const claims = Array.isArray(parsed.claims) ? parsed.claims
      .filter(claim => claim && typeof claim.id === "string" && typeof claim.date === "string" && claim.status === "Draft")
      .map(claim => ({
        ...claim,
        type: typeof claim.type === "string" ? claim.type : "Incident report",
        details: typeof claim.details === "string" ? claim.details : "",
        tripSummaryIncluded: claim.tripSummaryIncluded === true,
        tripSummary: claim.tripSummary && Number.isFinite(claim.tripSummary.miles) && Number.isFinite(claim.tripSummary.score)
          ? { miles: Math.max(0, claim.tripSummary.miles), score: Math.max(0, Math.min(100, claim.tripSummary.score)), event: typeof claim.tripSummary.event === "string" ? claim.tripSummary.event : "No events" }
          : null
      })) : [];
    return {
      ...freshDefaultState(),
      addedTrips,
      claims,
      plan: ["mile", "journey", "monthly"].includes(parsed.plan) ? parsed.plan : defaultState.plan,
      tracking: typeof parsed.tracking === "boolean" ? parsed.tracking : defaultState.tracking,
      preciseLocations: typeof parsed.preciseLocations === "boolean" ? parsed.preciseLocations : defaultState.preciseLocations,
      incidentAssistance: typeof parsed.incidentAssistance === "boolean" ? parsed.incidentAssistance : defaultState.incidentAssistance
    };
  } catch (error) {
    console.error("Unable to read saved DriveFair demo data.", error);
    storageReadFailed = true;
    return freshDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Unable to save DriveFair demo data.", error);
    showToast("Your browser couldn't save this change. It may not persist after you leave.");
    return false;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3300);
}

function allTrips() {
  return [...state.addedTrips, ...initialTrips];
}

function scoreTrip(signals) {
  const penalties = signals.hardBrakes * 16 + signals.rapidAcceleration * 8 + signals.sharpTurns * 10 + (signals.nightDriving ? 4 : 0);
  return Math.max(0, Math.min(100, 95 - penalties));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function explainTripScore(trip) {
  if (!trip.factors) return `${trip.event || "No events"} noted in the sample trip record.`;
  const { hardBrakes, rapidAcceleration, sharpTurns, nightDriving } = trip.factors;
  const deductions = [];
  if (hardBrakes) deductions.push(`${hardBrakes} hard braking × −16`);
  if (rapidAcceleration) deductions.push(`${rapidAcceleration} rapid acceleration × −8`);
  if (sharpTurns) deductions.push(`${sharpTurns} sharp turns × −10`);
  if (nightDriving) deductions.push("evening driving −4");
  return deductions.length ? deductions.join(", ") : "No modeled events; 95-point starting score.";
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function formatAdjustment(value) {
  if (value < 0) return `−${formatMoney(Math.abs(value))}`;
  if (value > 0) return `+${formatMoney(value)}`;
  return formatMoney(0);
}

function getEstimate(plan = state.plan) {
  const trips = allTrips();
  const miles = 386 + state.addedTrips.reduce((sum, trip) => sum + trip.miles, 0);
  const tripCount = 24 + state.addedTrips.length;
  const averageScore = Math.round(trips.reduce((sum, trip) => sum + trip.score, 0) / trips.length);
  const scoreAdjustment = Math.max(-4, Math.min(8, (85 - averageScore) * 0.15));
  const reward = 6;
  const adjustmentLine = { scoreAdjustment, averageScore };
  if (plan === "journey") return { total: Math.max(0, 48 + tripCount * 1.2 + scoreAdjustment - reward), base: 48, usage: tripCount * 1.2, usageLabel: `${tripCount} trips × $1.20`, reward, name: "Pay per journey", desc: "A base rate plus a clear price for each journey.", ...adjustmentLine };
  if (plan === "monthly") return { total: Math.max(0, 79 + scoreAdjustment - reward), base: 79, usage: 0, usageLabel: "Included in monthly rate", reward, name: "Predictable monthly", desc: "One steady monthly price, with rewards for safer driving.", ...adjustmentLine };
  return { total: Math.max(0, 48 + miles * 0.059 + scoreAdjustment - reward), base: 48, usage: miles * 0.059, usageLabel: `${miles} mi × $0.059`, reward, name: "Pay per mile", desc: "A base rate plus the miles you actually drive.", ...adjustmentLine };
}

function renderTrip(trip, compact = false) {
  const location = state.preciseLocations ? `${escapeHtml(trip.from)} <span>→</span> ${escapeHtml(trip.to)}` : "Private trip · distance and score only";
  const safeClass = trip.score < 80 ? "mid" : "";
  const event = trip.event ? `<span class="event-badge">${escapeHtml(trip.event)}</span>` : '<span class="event-badge event-clear">No events</span>';
  return `<div class="trip-row" data-trip-id="${trip.id}">
    <div class="trip-place"><span class="trip-route-icon ${trip.kind === "city" ? "city" : ""} ${trip.kind === "night" ? "night" : ""}">⌁</span><div><strong>${location}</strong><span>${escapeHtml(trip.date)}</span></div></div>
    <span class="trip-meta">${escapeHtml(trip.duration)}</span>
    <span class="trip-score ${safeClass}">${trip.score}</span>
    ${compact ? `<span class="trip-distance">${trip.miles} mi</span>` : `<span>${event}</span><span class="trip-distance">${trip.miles} mi</span>`}
    <button class="trip-detail-button" data-trip-detail="${trip.id}" aria-label="Trip details">→</button>
  </div>`;
}

function renderTrips() {
  const trips = allTrips();
  const recent = document.getElementById("recent-trips");
  const allList = document.getElementById("all-trips");
  recent.innerHTML = trips.slice(0, 3).map(trip => renderTrip(trip, true)).join("");
  const filter = document.getElementById("trip-filter").value;
  const visible = trips.filter(trip => {
    if (filter === "careful") return trip.score >= 85;
    if (filter === "events") return Boolean(trip.event);
    return true;
  });
  allList.innerHTML = '<div class="trip-row trip-table-head"><span>JOURNEY</span><span>DURATION</span><span>SCORE</span><span>EVENTS</span><span>DISTANCE</span></div>' +
    (visible.length ? visible.map(trip => renderTrip(trip)).join("") : '<div class="empty-state">No trips match this filter. Try another view.</div>');
  document.getElementById("miles-stat").innerHTML = `${386 + state.addedTrips.reduce((sum, trip) => sum + trip.miles, 0)} <small>mi</small>`;
  document.getElementById("trip-count").textContent = 24 + state.addedTrips.length;
  document.getElementById("trip-miles-summary").textContent = `${386 + state.addedTrips.reduce((sum, trip) => sum + trip.miles, 0)} mi`;
  document.getElementById("trip-number-summary").textContent = `${24 + state.addedTrips.length} trips`;
  document.getElementById("event-count").textContent = 2 + state.addedTrips.filter(trip => trip.event).length;
  const averageScore = Math.round(trips.reduce((sum, trip) => sum + trip.score, 0) / trips.length);
  document.getElementById("average-score-summary").textContent = `${averageScore} / 100`;
  document.getElementById("drive-score").textContent = averageScore;
  document.querySelector(".score-ring").setAttribute("aria-label", `Driving score ${averageScore} out of 100`);
  document.querySelector(".score-ring").style.setProperty("--score-angle", `${averageScore * 3.6}deg`);
  document.querySelector(".score-track span").style.width = `${averageScore}%`;
  renderPremium();
}

function renderPremium() {
  const estimate = getEstimate();
  const [whole, cents] = estimate.total.toFixed(2).split(".");
  document.getElementById("premium-total").textContent = whole;
  document.querySelector(".amount-cents").textContent = `.${cents}`;
  document.getElementById("pricing-total").textContent = formatMoney(estimate.total);
  document.getElementById("selected-plan-name").textContent = estimate.name;
  document.getElementById("selected-plan-desc").textContent = estimate.desc;
  document.querySelector(".mini-breakdown").innerHTML = `<div><span>Base coverage</span><strong>${formatMoney(estimate.base)}</strong></div>
    <div><span>Driving & distance</span><strong>${formatMoney(estimate.usage)}</strong></div>
    <div><span>Trip score adjustment · avg ${estimate.averageScore}</span><strong>${formatAdjustment(estimate.scoreAdjustment)}</strong></div>
    <div class="discount-row"><span>Safe driver reward</span><strong>−${formatMoney(estimate.reward)}</strong></div>`;
  const breakdown = document.querySelector(".pricing-breakdown");
  breakdown.innerHTML = `<div><span>Base coverage</span><strong>${formatMoney(estimate.base)}</strong></div>
    <div><span>${estimate.usageLabel}</span><strong>${formatMoney(estimate.usage)}</strong></div>
    <div><span>Trip score adjustment · avg ${estimate.averageScore}/100</span><strong>${formatAdjustment(estimate.scoreAdjustment)}</strong></div>
    <div><span>Safe driver reward</span><strong class="green-text">−${formatMoney(estimate.reward)}</strong></div>
    <div class="breakdown-total"><span>Estimated monthly total</span><strong>${formatMoney(estimate.total)}</strong></div>`;
  document.querySelectorAll(".plan-card").forEach(card => {
    const selected = card.dataset.plan === state.plan;
    card.classList.toggle("selected", selected);
    card.querySelector(".plan-select-button").textContent = selected ? "Current plan" : "See this plan";
  });
}

function renderClaims() {
  const count = state.claims.filter(claim => claim.status === "Draft").length;
  document.getElementById("claim-count").textContent = count || "";
  const list = document.getElementById("claim-list");
  if (!state.claims.length) {
    list.innerHTML = '<div class="claim-list-empty"><span class="claim-empty-icon">✓</span><div><strong>No claims in progress</strong><p>If something happens, start a claim when you feel ready. We’ll guide you through it.</p></div></div>';
    return;
  }
  list.innerHTML = state.claims.map(claim => {
    const summary = claim.tripSummary
      ? ` · Trip summary: ${claim.tripSummary.miles} mi, score ${claim.tripSummary.score}/100, ${escapeHtml(claim.tripSummary.event)}`
      : "";
    return `<div class="claim-entry"><span class="claim-status-icon">▤</span><div class="claim-entry-details"><strong>${escapeHtml(claim.id)} · ${escapeHtml(claim.type)}</strong><p>${escapeHtml(claim.date)} · ${escapeHtml(claim.details || "Draft saved for your review")}${summary}</p></div><span class="claim-status">Draft</span></div>`;
  }).join("");
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(section => section.classList.toggle("active", section.id === `page-${page}`));
  document.querySelectorAll(".nav-item[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const pageNames = { overview: "Overview", trips: "My trips", claims: "Claims", pricing: "My coverage", privacy: "Privacy & data" };
  document.getElementById("breadcrumb-current").textContent = pageNames[page] || "Overview";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function addSampleTrip(kind) {
  if (!state.tracking) {
    document.getElementById("trip-dialog").close();
    showToast("Trip tracking is paused. Turn it on in Privacy & data to log a sample trip.");
    return;
  }
  const sample = samples[kind];
  const trip = { ...sample, score: scoreTrip(sample.signals), factors: sample.signals, id: Date.now() };
  state.addedTrips.unshift(trip);
  if (!saveState()) {
    state.addedTrips.shift();
    return;
  }
  renderTrips();
  document.getElementById("trip-dialog").close();
  showToast(`Trip added · Drive score ${trip.score}. ${trip.event ? `${trip.event} affected the score.` : "Smooth driving, no events detected."}`);
}

function startClaim() {
  const dialog = document.getElementById("claim-dialog");
  document.getElementById("claim-details").reset();
  document.getElementById("incident-description").setCustomValidity("");
  document.getElementById("incident-date").value = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById("claim-details").hidden = true;
  document.getElementById("claim-success").hidden = true;
  dialog.querySelector(".claim-modal > .eyebrow").textContent = "INCIDENT SUPPORT";
  dialog.querySelector(".claim-modal > h2").textContent = "Let's start with safety.";
  dialog.querySelector(".claim-modal > .modal-description").textContent = "Are you and everyone involved safe right now?";
  dialog.querySelector(".safety-actions").hidden = false;
  dialog.querySelector(".modal-footnote").hidden = false;
  dialog.showModal();
}

document.querySelectorAll(".nav-item[data-page]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});
document.querySelectorAll("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
document.getElementById("new-trip-button").addEventListener("click", () => document.getElementById("trip-dialog").showModal());
document.getElementById("trips-log-button").addEventListener("click", () => document.getElementById("trip-dialog").showModal());
document.querySelectorAll("[data-sample]").forEach(button => button.addEventListener("click", () => addSampleTrip(button.dataset.sample)));
document.getElementById("trip-filter").addEventListener("change", renderTrips);
document.querySelectorAll("[data-select-plan]").forEach(button => button.addEventListener("click", () => {
  const previousPlan = state.plan;
  state.plan = button.dataset.selectPlan;
  if (!saveState()) {
    state.plan = previousPlan;
    renderPremium();
    return;
  }
  renderPremium();
  showToast(`Plan preview updated to ${getEstimate().name}. This is a demo estimate, not a policy change.`);
}));
document.getElementById("start-claim-button").addEventListener("click", startClaim);
document.getElementById("safe-button").addEventListener("click", () => {
  document.querySelector(".safety-actions").hidden = true;
  document.querySelector(".claim-modal > .modal-footnote").hidden = true;
  document.getElementById("claim-details").hidden = false;
});
document.getElementById("incident-description").addEventListener("input", event => event.currentTarget.setCustomValidity(""));
document.getElementById("claim-details").addEventListener("submit", event => {
  event.preventDefault();
  const description = document.getElementById("incident-description");
  description.setCustomValidity("");
  if (!description.value.trim()) {
    description.setCustomValidity("Please add a short description, or enter 'Not sure yet'.");
    description.reportValidity();
    return;
  }
  const nextNumber = state.claims.length + 1;
  const incidentDate = new Date(document.getElementById("incident-date").value);
  const date = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(incidentDate);
  const tripSummaryIncluded = document.getElementById("include-trip-summary").checked;
  const latestTrip = allTrips()[0];
  const claim = {
    id: `DF-DRAFT-${String(nextNumber).padStart(3, "0")}`,
    date,
    type: document.getElementById("incident-type").value,
    details: description.value.trim(),
    tripSummaryIncluded,
    tripSummary: tripSummaryIncluded ? {
      miles: latestTrip.miles,
      score: latestTrip.score,
      event: latestTrip.event || "No detected events"
    } : null,
    status: "Draft"
  };
  state.claims.unshift(claim);
  if (!saveState()) {
    state.claims.shift();
    renderClaims();
    return;
  }
  renderClaims();
  document.querySelector(".claim-modal > .eyebrow").textContent = "DRAFT SAVED";
  document.querySelector(".claim-modal > h2").textContent = "You're in control from here.";
  document.querySelector(".claim-modal > .modal-description").textContent = "Your claim draft is ready. It has not been submitted.";
  document.getElementById("claim-details").hidden = true;
  document.getElementById("claim-success-copy").textContent = claim.tripSummaryIncluded
    ? "Your draft and optional trip summary are saved locally. Nothing has been sent to an insurer."
    : "Your draft is saved locally. No trip summary was attached, and nothing has been sent to an insurer.";
  document.getElementById("claim-success").hidden = false;
});
document.getElementById("emergency-button").addEventListener("click", () => {
  showToast("Please call your local emergency number now. DriveFair cannot contact emergency services.");
});
document.getElementById("finish-claim-button").addEventListener("click", () => {
  document.getElementById("claim-dialog").close();
  navigate("claims");
});
document.getElementById("help-button").addEventListener("click", () => showToast("Support demo: a real insurer would connect you with its support team here."));
document.querySelector(".notification-button").addEventListener("click", () => showToast("You're all caught up. No new notifications."));
document.getElementById("tracking-toggle").addEventListener("change", event => {
  const previous = state.tracking;
  state.tracking = event.target.checked;
  if (!saveState()) {
    state.tracking = previous;
    event.target.checked = previous;
    return;
  }
  showToast(state.tracking ? "Trip tracking is on." : "Trip tracking is paused. You can still browse your saved trips.");
});
document.getElementById("location-toggle").addEventListener("change", event => {
  const previous = state.preciseLocations;
  state.preciseLocations = event.target.checked;
  if (!saveState()) {
    state.preciseLocations = previous;
    event.target.checked = previous;
    return;
  }
  renderTrips();
  showToast(state.preciseLocations ? "Precise trip locations are visible in this demo." : "Trip locations hidden. Distance and scores remain visible.");
});
document.getElementById("incident-toggle").addEventListener("change", event => {
  const previous = state.incidentAssistance;
  state.incidentAssistance = event.target.checked;
  if (!saveState()) {
    state.incidentAssistance = previous;
    event.target.checked = previous;
    return;
  }
  showToast(state.incidentAssistance ? "Incident assistance is on." : "Incident assistance is off. You can still start a claim manually.");
});
document.getElementById("export-button").addEventListener("click", () => {
  const trips = state.preciseLocations
    ? allTrips()
    : allTrips().map(trip => ({ miles: trip.miles, score: trip.score }));
  const exportData = { exportedAt: new Date().toISOString(), note: "DriveFair hackathon demo data; not an insurance record.", preferences: { tracking: state.tracking, preciseLocations: state.preciseLocations, incidentAssistance: state.incidentAssistance }, plan: state.plan, trips, claims: state.claims };
  const file = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "drivefair-demo-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
  showToast("Your demo data export has been downloaded.");
});
document.getElementById("delete-button").addEventListener("click", () => {
  if (!window.confirm("Clear locally saved demo trips, claim drafts, and preferences? This restores the sample starting view.")) return;
  const previousState = state;
  state = freshDefaultState();
  if (!saveState()) {
    state = previousState;
    return;
  }
  document.getElementById("tracking-toggle").checked = true;
  document.getElementById("location-toggle").checked = true;
  document.getElementById("incident-toggle").checked = true;
  renderTrips();
  renderClaims();
  storageReadFailed = false;
  showToast("Your saved demo changes were cleared. Sample starting data is still shown.");
});
document.getElementById("all-trips").addEventListener("click", event => {
  const button = event.target.closest("[data-trip-detail]");
  if (!button) return;
  const trip = allTrips().find(item => String(item.id) === button.dataset.tripDetail);
  if (trip) showToast(`${trip.miles} miles · ${trip.duration} · score ${trip.score}/100 · ${explainTripScore(trip)}. Guidance only, not a fault assessment.`);
});
document.getElementById("recent-trips").addEventListener("click", event => {
  const button = event.target.closest("[data-trip-detail]");
  if (!button) return;
  const trip = allTrips().find(item => String(item.id) === button.dataset.tripDetail);
  if (trip) showToast(`${trip.miles} miles · ${trip.duration} · score ${trip.score}/100 · ${explainTripScore(trip)}. Guidance only, not a fault assessment.`);
});

document.getElementById("tracking-toggle").checked = state.tracking;
document.getElementById("location-toggle").checked = state.preciseLocations;
document.getElementById("incident-toggle").checked = state.incidentAssistance;
renderTrips();
renderClaims();
