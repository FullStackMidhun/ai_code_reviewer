# Smart Code Reviewer

Smart Code Reviewer is a small full-stack project that reviews source code with Google's Gemini model and displays the feedback in a cleaner browser UI.

The backend accepts code and a language, sends that prompt to Gemini, and returns a text review. The frontend lets you paste code, run a review, and view the response as structured sections such as bugs, optimization notes, quality improvements, security issues, and rating.

## Project Structure

```text
smart_code_reviewer/
├── backend/
│   ├── main.py
│   ├── prompts.py
│   └── reviewer.py
└── frontend/
    ├── app.js
    ├── index.html
    └── styles.css
```

## Features

- Review code with Gemini using a FastAPI backend
- Paste code directly into a browser UI
- Choose the programming language before review
- Display AI feedback in formatted cards instead of raw plain text only
- Show the original raw feedback as a fallback

## Tech Stack

- Backend: FastAPI, Pydantic, Python
- AI model: `gemini-2.5-flash`
- Frontend: HTML, CSS, JavaScript

## Prerequisites

- Python 3.10+ recommended
- A Google Gemini API key
- A simple static server for the frontend, or an editor extension like Live Server

## Setup

### 1. Clone the project

```bash
git clone <your-repo-url>
cd smart_code_reviewer
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

### 3. Install dependencies

This project uses FastAPI, python-dotenv, and the Google Generative AI client. If you do not already have them installed, run:

```bash
pip install fastapi uvicorn python-dotenv google-generativeai
```

### 4. Add environment variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

## Running the Project

### Start the backend

From the `backend` directory:

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

### Start the frontend

Serve the `frontend` folder with a local static server.

If you use VS Code Live Server, open:

```text
frontend/index.html
```

By default, the backend already allows local frontend origins such as:

- `http://localhost:5500`
- `http://127.0.0.1:5500`

It also permits localhost-style development ports through a regex-based CORS rule.

## API

### `POST /review`

Request body:

```json
{
  "code": "print('Hello, world!')",
  "language": "Python"
}
```

Example response:

```json
{
  "feedback": "1. Bugs or errors: ... 2. Optimization suggestions: ..."
}
```

## How It Works

1. The frontend sends the pasted code and selected language to `POST /review`.
2. The backend builds a prompt in [backend/prompts.py](/home/munnoi/Desktop/smart_code_reviewer/backend/prompts.py).
3. The reviewer logic in [backend/reviewer.py](/home/munnoi/Desktop/smart_code_reviewer/backend/reviewer.py) calls Gemini.
4. The frontend formats the returned `feedback` text into readable sections when possible.

## Notes

- The current backend returns a single `feedback` string, not structured JSON.
- The frontend parses that string heuristically, so formatting depends on how consistent the model response is.
- If the output is less structured, the raw response is still shown.

## Future Improvements

- Return structured JSON from the backend instead of parsing free-form text
- Add file upload support
- Add authentication and rate limiting
- Add review history
- Add unit tests and a `requirements.txt`

## Troubleshooting

### `GEMINI_API_KEY is missing`

Make sure `.env` exists in the project root and contains:

```env
GEMINI_API_KEY=your_api_key_here
```

### Frontend cannot connect to backend

Check that:

- The FastAPI server is running on `http://127.0.0.1:8000`
- The frontend is being served from a local origin allowed by CORS
- Your browser console does not show a network or CORS error

### Feedback layout looks incomplete

That usually means the model response did not follow the expected section pattern closely enough. The raw response is still shown below the structured cards.
