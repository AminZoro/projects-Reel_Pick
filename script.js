const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

// TMDB genre IDs
const GENRES = {
  Action: 28, Comedy: 35, Drama: 18, Horror: 27, "Sci-Fi": 878,
  Romance: 10749, Thriller: 53, Animation: 16, Crime: 80, Documentary: 99,
};

const selectedGenres = new Set();
const seen = new Set(); // movie IDs already suggested this session
let current = null;
let watchlist = loadWatchlist();

const genresEl = document.getElementById("genres");
const resultEl = document.getElementById("result");
const watchlistEl = document.getElementById("watchlist");
const runtimeEl = document.getElementById("runtime");
const ratingEl = document.getElementById("rating");

/* ---------- Setup ---------- */
Object.entries(GENRES).forEach(([name, id]) => {
  const btn = document.createElement("button");
  btn.className = "chip";
  btn.type = "button";
  btn.textContent = name;
  btn.setAttribute("aria-pressed", "false");
  btn.addEventListener("click", () => {
    const on = selectedGenres.has(id);
    on ? selectedGenres.delete(id) : selectedGenres.add(id);
    btn.setAttribute("aria-pressed", String(!on));
  });
  genresEl.appendChild(btn);
});

document.getElementById("suggest").addEventListener("click", suggest);
renderWatchlist();

/* ---------- Fetching ---------- */
async function fetchPage(page) {
  const params = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    sort_by: "popularity.desc",
    include_adult: "false",
    "vote_count.gte": "300",
    "vote_average.gte": ratingEl.value,
    page: String(page),
  });
  if (selectedGenres.size) params.set("with_genres", [...selectedGenres].join("|")); // "|" = any of
  if (runtimeEl.value) params.set("with_runtime.lte", runtimeEl.value);

  const res = await fetch(`${API}/discover/movie?${params}`);
  if (!res.ok) throw new Error(`TMDB request failed (${res.status}). Check your API key in config.js.`);
  const data = await res.json();
  return data.results.filter((m) => !seen.has(m.id));
}

async function suggest() {
  showMessage("Finding a movie…");
  try {
    // Try a random page first, then fall back to page 1 for narrow filters
    const randomPage = Math.ceil(Math.random() * 5);
    let pool = await fetchPage(randomPage);
    if (!pool.length && randomPage !== 1) pool = await fetchPage(1);

    if (!pool.length) {
      showMessage("No new matches. Try fewer filters or a lower minimum rating.");
      return;
    }
    current = pool[Math.floor(Math.random() * pool.length)];
    seen.add(current.id);
    renderMovie(current);
  } catch (err) {
    showMessage(err.message, true);
  }
}

/* ---------- Rendering (textContent only, so API data is never parsed as HTML) ---------- */
function showMessage(text, isError = false) {
  resultEl.replaceChildren();
  const p = document.createElement("p");
  p.className = "message" + (isError ? " error" : "");
  p.textContent = text;
  resultEl.appendChild(p);
}

function renderMovie(m) {
  const card = document.createElement("article");
  card.className = "movie";

  const img = document.createElement("img");
  img.alt = m.poster_path ? `Poster for ${m.title}` : "";
  if (m.poster_path) img.src = IMG + m.poster_path;

  const body = document.createElement("div");

  const title = document.createElement("h2");
  title.className = "title";
  title.textContent = m.title;

  const meta = document.createElement("p");
  meta.className = "meta";
  const year = m.release_date ? m.release_date.slice(0, 4) : "Year unknown";
  meta.textContent = `${year}  |  ${m.vote_average.toFixed(1)} / 10`;

  const overview = document.createElement("p");
  overview.textContent = m.overview || "No description available.";

  const actions = document.createElement("div");
  actions.className = "actions";

  const another = document.createElement("button");
  another.className = "primary";
  another.textContent = "Pick another";
  another.addEventListener("click", suggest);

  const save = document.createElement("button");
  save.className = "ghost";
  save.textContent = "Save to watchlist";
  save.addEventListener("click", () => addToWatchlist(m));

  actions.append(another, save);
  body.append(title, meta, overview, actions);
  card.append(img, body);
  resultEl.replaceChildren(card);
}

/* ---------- Watchlist (localStorage) ---------- */
function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem("watchlist")) || [];
  } catch {
    return [];
  }
}

function saveWatchlist() {
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
}

function addToWatchlist(m) {
  if (watchlist.some((w) => w.id === m.id)) return;
  watchlist.push({ id: m.id, title: m.title, year: (m.release_date || "").slice(0, 4) });
  saveWatchlist();
  renderWatchlist();
}

function removeFromWatchlist(id) {
  watchlist = watchlist.filter((w) => w.id !== id);
  saveWatchlist();
  renderWatchlist();
}

function renderWatchlist() {
  watchlistEl.replaceChildren();
  if (!watchlist.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "Nothing saved yet. Save a pick to see it here.";
    watchlistEl.appendChild(li);
    return;
  }
  watchlist.forEach((w) => {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = w.year ? `${w.title} (${w.year})` : w.title;
    const remove = document.createElement("button");
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeFromWatchlist(w.id));
    li.append(label, remove);
    watchlistEl.appendChild(li);
  });
}
