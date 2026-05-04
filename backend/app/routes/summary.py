from fastapi import APIRouter
from app.services.data_loader import get_data

router = APIRouter()


@router.get("/summary")
def get_summary():
    df = get_data()  # safer: fresh data per request

    # 🔹 Total spending
    total_spent = df['Amount'].sum()

    # 🔹 Category breakdown
    category_spend = df.groupby('llm_category')['Amount'].sum()
    top_category = category_spend.idxmax()

    # 🔹 Monthly trend (THIS WAS MISSING)
    monthly_spend = df.groupby('month')['Amount'].sum()

    return {
        "total_spent": float(total_spent),
        "top_category": top_category,
        "category_breakdown": category_spend.to_dict(),
        "monthly_trend": monthly_spend.to_dict()
    }