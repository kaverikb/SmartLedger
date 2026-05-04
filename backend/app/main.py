from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import summary, transactions, chat

app = FastAPI(title="Smart Ledger API")

# 🔹 CORS (VERY IMPORTANT for React later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev, later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Register routes
app.include_router(summary.router)
app.include_router(transactions.router)
app.include_router(chat.router)


# 🔹 Root check (sanity endpoint)
@app.get("/")
def root():
    return {"message": "Smart Ledger API is running"}