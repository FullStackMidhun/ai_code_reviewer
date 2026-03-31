from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from reviewer import review_code_logic
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

LOCAL_DEV_ORIGIN_REGEX = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_origin_regex=LOCAL_DEV_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeRequest(BaseModel):
    code: str
    language: str

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/review")
def review_code(request: CodeRequest):
    try:
        feedback = review_code_logic(request.code, request.language)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Review failed: {exc}") from exc

    return {"feedback": feedback}
