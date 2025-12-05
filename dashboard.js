/** @format */

const CURRENT_MONTHLY_INCOME = 3200; // change this
const ICAL_URL = "/api/calendar"; // Vercel proxy route

function updateLocalDateTime() {
	const now = new Date();
	const dayNames = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const day = dayNames[now.getDay()];
	const dateStr = `${
		monthNames[now.getMonth()]
	} ${now.getDate()}, ${now.getFullYear()}`;
	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	if (hours === 0) hours = 12;
	const timeStr = `${hours}:${minutes} ${ampm}`;
	document.getElementById("day").textContent = day;
	document.getElementById("date").textContent = dateStr;
	document.getElementById("time").textContent = timeStr;
}

function formatTimeInZone(tz) {
	const now = new Date();
	const opt = {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
		timeZone: tz,
	};
	return new Intl.DateTimeFormat("en-CA", opt).format(now);
}

function updateWorldClocks() {
	document.getElementById("time-hamilton").textContent =
		formatTimeInZone("America/Toronto");
	document.getElementById("time-ahmedabad").textContent =
		formatTimeInZone("Asia/Kolkata");
}

async function fetchWeather() {
	const statusEl = document.getElementById("wx-status");
	const hamTempEl = document.getElementById("wx-ham-temp");
	const ahmTempEl = document.getElementById("wx-ahm-temp");
	const hamDescEl = document.getElementById("wx-ham-desc");
	const ahmDescEl = document.getElementById("wx-ahm-desc");
	try {
		statusEl.textContent = "updating weather…";
		const hamRes = await fetch(
			"https://api.open-meteo.com/v1/forecast?latitude=43.255&longitude=-79.871&current_weather=true"
		);
		const hamData = await hamRes.json();
		const ahmRes = await fetch(
			"https://api.open-meteo.com/v1/forecast?latitude=23.0225&longitude=72.5714&current_weather=true"
		);
		const ahmData = await ahmRes.json();
		if (hamData.current_weather) {
			hamTempEl.textContent =
				Math.round(hamData.current_weather.temperature) + "°C";
			hamDescEl.textContent =
				"wind " + hamData.current_weather.windspeed + " km/h";
		} else hamDescEl.textContent = "no data";
		if (ahmData.current_weather) {
			ahmTempEl.textContent =
				Math.round(ahmData.current_weather.temperature) + "°C";
			ahmDescEl.textContent =
				"wind " + ahmData.current_weather.windspeed + " km/h";
		} else ahmDescEl.textContent = "no data";
		statusEl.textContent = "weather: ok • source: open-meteo.com";
	} catch (e) {
		statusEl.textContent = "weather: failed (offline or blocked).";
		hamDescEl.textContent = "check connection";
		ahmDescEl.textContent = "check connection";
	}
}

const permitStart = new Date("2025-10-01T00:00:00");
const permitEnd = new Date("2028-10-01T00:00:00");
const birthDate = new Date("2003-11-22T00:00:00");
const age30Date = new Date("2033-11-22T00:00:00");

function formatCountdown(target) {
	const now = new Date();
	let diff = target - now;
	if (diff < 0) diff = 0;
	let totalSeconds = Math.floor(diff / 1000);
	const seconds = totalSeconds % 60;
	totalSeconds = (totalSeconds - seconds) / 60;
	const minutes = totalSeconds % 60;
	totalSeconds = (totalSeconds - minutes) / 60;
	const hours = totalSeconds % 24;
	const days = (totalSeconds - hours) / 24;
	const years = Math.floor(days / 365);
	const remainingDays = days % 365;
	return {
		years,
		days: remainingDays,
		hours,
		minutes,
		seconds,
		rawDays: days + years * 365,
	};
}

function clampPercent(v) {
	if (isNaN(v)) return 0;
	if (v < 0) return 0;
	if (v > 100) return 100;
	return v;
}

function updateTimelines() {
	const now = new Date();

	const totalPermit = permitEnd - permitStart;
	let elapsedPermit = now - permitStart;
	if (elapsedPermit < 0) elapsedPermit = 0;
	if (elapsedPermit > totalPermit) elapsedPermit = totalPermit;
	const permitPercent = clampPercent((elapsedPermit / totalPermit) * 100);
	const permitRemain = formatCountdown(permitEnd);

	document.getElementById("countdown-permit").textContent =
		`${permitRemain.years}y ${permitRemain.days}d ` +
		`${String(permitRemain.hours).padStart(2, "0")}:` +
		`${String(permitRemain.minutes).padStart(2, "0")}:` +
		`${String(permitRemain.seconds).padStart(2, "0")}`;

	document.getElementById("bar-permit").style.width = permitPercent + "%";
	document.getElementById("permit-used").textContent =
		permitPercent.toFixed(1) + "%";
	const daysToPermit = Math.floor((permitEnd - now) / (1000 * 60 * 60 * 24));
	document.getElementById("permit-days").textContent =
		daysToPermit >= 0 ? daysToPermit : 0;

	const totalLifeTo30 = age30Date - birthDate;
	let livedToNow = now - birthDate;
	if (livedToNow < 0) livedToNow = 0;
	if (livedToNow > totalLifeTo30) livedToNow = totalLifeTo30;
	const lifePercent = clampPercent((livedToNow / totalLifeTo30) * 100);
	const ageCountdown = formatCountdown(age30Date);

	document.getElementById("countdown-30").textContent =
		`${ageCountdown.years}y ${ageCountdown.days}d ` +
		`${String(ageCountdown.hours).padStart(2, "0")}:` +
		`${String(ageCountdown.minutes).padStart(2, "0")}:` +
		`${String(ageCountdown.seconds).padStart(2, "0")}`;

	document.getElementById("bar-30").style.width = lifePercent + "%";
	document.getElementById("life-used").textContent =
		lifePercent.toFixed(1) + "%";

	const daysLived = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));
	const daysTo30 = Math.floor((age30Date - now) / (1000 * 60 * 60 * 24));
	document.getElementById("days-lived").textContent =
		daysLived >= 0 ? daysLived : 0;
	document.getElementById("days-to-30").textContent =
		daysTo30 >= 0 ? daysTo30 : 0;
}

function parseICal(icsText) {
	const lines = icsText.split(/\r?\n/);
	const events = [];
	let current = null;
	for (const raw of lines) {
		const line = raw.trim();
		if (line === "BEGIN:VEVENT") {
			current = {};
			continue;
		}
		if (line === "END:VEVENT") {
			if (current) events.push(current);
			current = null;
			continue;
		}
		if (!current) continue;
		const idx = line.indexOf(":");
		if (idx === -1) continue;
		const keyPart = line.slice(0, idx);
		const value = line.slice(idx + 1);
		const key = keyPart.split(";")[0].toUpperCase();
		if (key === "SUMMARY") current.summary = value;
		else if (key === "DESCRIPTION") current.description = value;
		else if (key === "LOCATION") current.location = value;
		else if (key === "DTSTART" || key === "DTSTART;TZID")
			current.dtstart = value;
	}
	return events;
}

function normalizeICalDate(str) {
	if (!str) return null;
	const clean = str.replace(/^.*:/, "");
	if (clean.length === 8) {
		const y = clean.slice(0, 4),
			m = clean.slice(4, 6),
			d = clean.slice(6, 8);
		return new Date(`${y}-${m}-${d}T00:00:00`);
	}
	if (clean.length >= 15) {
		const y = clean.slice(0, 4),
			m = clean.slice(4, 6),
			d = clean.slice(6, 8);
		const hh = clean.slice(9, 11),
			mm = clean.slice(11, 13);
		return new Date(`${y}-${m}-${d}T${hh}:${mm}:00`);
	}
	return new Date(clean);
}

function isSameDay(a, b) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function formatTimeHM(date) {
	let h = date.getHours();
	const m = String(date.getMinutes()).padStart(2, "0");
	const ampm = h >= 12 ? "PM" : "AM";
	h = h % 12;
	if (h === 0) h = 12;
	return `${h}:${m} ${ampm}`;
}

async function refreshSchedule() {
	const status = document.getElementById("schedule-status");
	const eventsList = document.getElementById("events-list");
	const tasksList = document.getElementById("tasks-list");

	eventsList.innerHTML = '<li class="event-item event-empty">loading…</li>';
	tasksList.innerHTML = '<li class="event-item event-empty">loading…</li>';

	try {
		status.textContent = "calendar: fetching from proxy…";
		const res = await fetch(ICAL_URL);
		if (!res.ok) {
			status.textContent = "calendar: failed to load (bad response).";
			return;
		}
		const text = await res.text();
		const events = parseICal(text);
		const today = new Date();

		const todays = events
			.filter((ev) => {
				const d = normalizeICalDate(ev.dtstart);
				if (!d) return false;
				return isSameDay(d, today);
			})
			.sort(
				(a, b) =>
					normalizeICalDate(a.dtstart) - normalizeICalDate(b.dtstart)
			);

		const realEvents = [];
		const tasks = [];

		for (const ev of todays) {
			const title = ev.summary || "(no title)";
			const isTask = /\[TASK\]/i.test(title);
			const cleanTitle =
				title.replace(/\[TASK\]/gi, "").trim() || "(task)";
			const dateObj = normalizeICalDate(ev.dtstart);
			const timeStr = dateObj ? formatTimeHM(dateObj) : "all day";
			const metaParts = [];
			if (ev.location) metaParts.push(ev.location);
			if (ev.description)
				metaParts.push(ev.description.replace(/\\n/g, " "));
			const meta = metaParts.join(" • ");
			const item = { time: timeStr, title: cleanTitle, meta };
			if (isTask) tasks.push(item);
			else realEvents.push(item);
		}

		function renderList(listEl, items, emptyText) {
			if (!items.length) {
				listEl.innerHTML = `<li class="event-item event-empty">${emptyText}</li>`;
				return;
			}
			listEl.innerHTML = "";
			for (const item of items) {
				const li = document.createElement("li");
				li.className = "event-item";
				li.innerHTML =
					`<div class="event-time">${item.time}</div>` +
					`<div class="event-title">${item.title}</div>` +
					(item.meta
						? `<div class="event-meta">${item.meta}</div>`
						: "");
				listEl.appendChild(li);
			}
		}

		renderList(eventsList, realEvents, "no events today");
		renderList(tasksList, tasks, "no tasks tagged [TASK]");
		status.textContent = `calendar: today → ${realEvents.length} events • ${tasks.length} tasks`;
	} catch (e) {
		status.textContent =
			"calendar: failed to load (CORS, bad URL, or offline).";
	}
}

function initIncome() {
	const el = document.getElementById("income-amount");
	el.textContent = `CAD ${CURRENT_MONTHLY_INCOME.toLocaleString(
		"en-CA"
	)}/month`;
}

// ---- INIT ----
updateLocalDateTime();
updateWorldClocks();
fetchWeather();
updateTimelines();
initIncome();
refreshSchedule();

setInterval(updateLocalDateTime, 1000);
setInterval(updateWorldClocks, 1000);
setInterval(fetchWeather, 15 * 60 * 1000);
setInterval(updateTimelines, 1000);
setInterval(refreshSchedule, 10 * 60 * 1000);

// Auto-reload the whole page every 5 minutes
window.addEventListener("load", () => {
	const FIVE_MIN = 5 * 60 * 1000;
	setInterval(() => {
		window.location.reload();
	}, FIVE_MIN);
});
