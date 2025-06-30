from fastapi import FastAPI
from process_launcher import run_cmrcviewer
from ad_fetcher import get_computers
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

@app.get("/computers")
def list_computers():
    return get_computers()

@app.post("/connect/{ip}")
def connect_to_computer(ip: str):
    return run_cmrcviewer(ip)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
