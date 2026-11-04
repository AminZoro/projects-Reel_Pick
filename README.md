# Reel Pick

A movie suggester web app. Pick genres, a maximum length and a minimum rating, and it returns one film at a time from The Movie Database (TMDB) API. Save picks to a watchlist that persists between visits.

Built with HTML, CSS and vanilla JavaScript (no frameworks).

## Run it locally

1. Create a free account at https://www.themoviedb.org and request an API key (Settings > API).
2. Copy `config.js` to your machine and replace `YOUR_TMDB_API_KEY` with your key.
3. In VS Code, install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.

`config.js` is listed in `.gitignore` so your key is not committed. If you add it to GitHub, commit a `config.example.js` with the placeholder instead.

## Features

- Multi-genre filter, length filter and minimum rating filter
- Random suggestions that never repeat within a session
- Watchlist saved in `localStorage`
- Loading, empty and error states
- Responsive layout, keyboard focus styles, reduced-motion support
- API data 

## Ideas to extend it

- Deploy to GitHub Pages or Netlify and link it from your resume
- Move the API call behind a small Node/Express proxy so the key is never exposed in the browser
- Add a "where to watch" lookup using TMDB's watch providers endpoint
- Rewrite the UI in React or add TypeScript

## Resume bullets (edit to match what you build)

- Built a responsive movie recommendation web app in JavaScript that queries the TMDB REST API with genre, runtime and rating filters.
- Implemented asynchronous fetching with error handling, duplicate-suggestion prevention and a persistent watchlist using `localStorage`.
- Followed accessibility basics (semantic HTML, ARIA live regions, keyboard focus, reduced-motion support).
