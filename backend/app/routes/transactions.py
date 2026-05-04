from fastapi import APIRouter
from app.services.data_loader import get_data

router = APIRouter()

df = get_data()


@router.get("/transactions")
def get_transactions():
    return df.to_dict(orient="records")