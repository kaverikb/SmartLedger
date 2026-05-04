from app.services.data_loader import get_data
import requests
import json
import os
from dotenv import load_dotenv

df = get_data()

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

BASE_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "tencent/hy3-preview:free"

query_cache = {}

# 🔹 month normalization
MONTH_NAME_TO_NUM = {
    "january": "01", "february": "02", "march": "03",
    "april": "04", "may": "05", "june": "06",
    "july": "07", "august": "08", "september": "09",
    "october": "10", "november": "11", "december": "12"
}

MONTH_NUM_TO_NAME = {v: k.capitalize() for k, v in MONTH_NAME_TO_NUM.items()}


# -------------------------
# 🧠 LLM PARSER
# -------------------------

def parse_query_with_llm(query):

    if query in query_cache:
        return query_cache[query]

    categories = df['llm_category'].unique().tolist()

    prompt = f"""
You are a STRICT financial query parser.

Return ONLY valid JSON.

Rules:
- month MUST be "01" to "12"
- category must match EXACTLY from list
- no explanation

Fields:
intent: [total_spending, max_category, max_month, min_month, average_spending, anomalies]
category: one of {categories} OR null
month: "01"-"12" OR null

Query: "{query}"
"""

    try:
        response = requests.post(
            BASE_URL,
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0
            },
            timeout=10
        )

        result = response.json()
        text = result["choices"][0]["message"]["content"].strip()

        start = text.find("{")
        end = text.rfind("}") + 1
        parsed = json.loads(text[start:end])

        query_cache[query] = parsed
        return parsed

    except Exception as e:
        print("⚠️ LLM fallback:", e)
        return {"intent": "total_spending", "category": None, "month": None}


# -------------------------
# ⚙️ MAIN ENGINE
# -------------------------

def answer_query(query):

    parsed = parse_query_with_llm(query)

    intent = parsed.get("intent")
    category = parsed.get("category")
    month = parsed.get("month")

    # normalize month if needed
    if isinstance(month, str):
        m = month.lower()
        if m in MONTH_NAME_TO_NUM:
            month = MONTH_NAME_TO_NUM[m]

    data = df.copy()

    if category:
        data = data[data['llm_category'] == category]

    if month:
        data = data[data['month'].str.endswith(month)]

    def format_month(m):
        return MONTH_NUM_TO_NAME.get(m, m)

    # -------------------------
    # TOTAL
    # -------------------------
    if intent == "total_spending":

        total = data['Amount'].sum()
        answer = f"You spent ₹{total:.2f}"

        if category:
            answer += f" on {category}"
        if month:
            answer += f" in {format_month(month)}"

        return {"answer": answer}

    # -------------------------
    # MAX CATEGORY (FIXED)
    # -------------------------
    if intent == "max_category":

        grouped = data.groupby('llm_category')['Amount'].sum()

        cat = grouped.idxmax()
        amt = grouped.max()

        answer = f"You spent the most on {cat}: ₹{amt:.2f}"

        if month:
            answer += f" in {format_month(month)}"

        return {"answer": answer}

    # -------------------------
    # MAX MONTH (FIXED)
    # -------------------------
    if intent == "max_month":

        grouped = data.groupby('month')['Amount'].sum()

        m = grouped.idxmax()
        amt = grouped.max()

        return {
            "answer": f"You spent the most in {format_month(m[-2:])}: ₹{amt:.2f}"
        }

    # -------------------------
    # MIN MONTH (FIXED)
    # -------------------------
    if intent == "min_month":

        grouped = data.groupby('month')['Amount'].sum()

        m = grouped.idxmin()
        amt = grouped.min()

        return {
            "answer": f"You spent the least in {format_month(m[-2:])}: ₹{amt:.2f}"
        }

    # -------------------------
    # AVERAGE
    # -------------------------
    if intent == "average_spending":

        avg = data['Amount'].mean()
        answer = f"Your average spending is ₹{avg:.2f}"

        if month:
            answer += f" in {format_month(month)}"

        return {"answer": answer}

    # -------------------------
    # ANOMALIES
    # -------------------------
    if intent == "anomalies":

        anomalies = data[data['anomaly'] == True]

        if anomalies.empty:
            return {"answer": "No anomalies detected."}

        return {
            "answer": f"Found {len(anomalies)} anomalies totaling ₹{anomalies['Amount'].sum():.2f}"
        }

    return {
        "answer": "I couldn't understand that. Try asking about spending, categories, or months."
    }