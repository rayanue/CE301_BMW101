# BMW 101 (CE301)

Coursework project - static BMW topic pages in React (Vite), plus a form that posts to FastAPI and ranks rows from a CSV, and a chat that does RAG over markdown in `backend/data/knowledge/`. Embeddings and chat both go through OpenAI. The vector index is a JSON file on disk so I am not calling embeddings on every request.

## Folders

- `frontend/` - React app
- `backend/` - FastAPI, scoring, RAG, and the script that builds the index

## First-time setup (Windows, I used PowerShell)

From the repo root:

1. `npm install` at root (pulls in `concurrently` for `dev:all`)
2. `npm run install:all` for the frontend deps
3. Python venv (optional, just stops you messing up system Python):
  ```
   py -m venv backendvenv
   backendvenv\Scripts\Activate.ps1
   pip install -r backend\requirements.txt
  ```
4. Env: copy `backend\.env.example` to `backend\.env`, add `OPENAI_API_KEY`
5. Build the index (run again if you change the knowledge markdown):
  ```
   cd backend
   python -m scripts.build_index
  ```

Paths assume you are in the project root. If npm moans about package.json you are in the wrong folder.

## Running it day to day

Still from root:

```
npm run dev:all
```

Frontend on 5173, API on 8000. Use Recommendations for a shortlist. The chat sends the last recommendation's model ids through to the backend so retrieval can lean on those chunks.

Ctrl+C stops everything.

## If it breaks

- Port 8000 busy - change `dev:backend` in root `package.json` or kill the other process
- Chat acting up - check `.env` has a key, index was built, and `OPENAI_CHAT_MODEL` is a model your account can use (default in code is `gpt-4o-mini`)
- One side only - `npm run dev:frontend` or `npm run dev:backend` from root

## Other npm scripts

`npm run build` - production build of the frontend (runs inside `frontend/`).