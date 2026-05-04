# Smart Ledger

Smart Ledger is an end-to-end financial analytics dashboard that combines data processing, anomaly detection, and natural language querying to help users understand their spending behavior.

The system integrates a FastAPI backend, a React-based frontend, and a hybrid query engine that leverages large language models for intent parsing while maintaining deterministic computation for accuracy.

---

## Overview

Smart Ledger allows users to:

* Analyze total and category-wise spending
* Explore monthly spending trends
* Detect anomalous transactions
* Interactively query financial data using natural language

The system is designed to balance flexibility and correctness by separating language understanding from computation.

---

## Features

### Financial Summary

* Total spending overview
* Top spending category identification

### Data Visualization

* Monthly spending distribution (bar chart)
* Category-wise spending distribution (pie chart)
* Monthly category breakdown (interactive donut chart)

### Transaction Analysis

* Tabular view of transactions
* Highlighted anomalies for unusual spending patterns

### Natural Language Query System

Users can ask questions such as:

* How much did I spend in March?
* Where did I spend the most?
* What is my average spending?
* Show anomalies

The system interprets queries and returns precise answers based on structured data.

---

## System Architecture

Frontend (React)
→ API Calls
→ FastAPI Backend
→ Query Engine (LLM + Rule Logic)
→ Pandas Data Processing
→ Response to Frontend

---

## Tech Stack

### Backend

* Python
* FastAPI
* Pandas
* Requests
* OpenRouter API (LLM integration)

### Frontend

* React.js
* Recharts

### Utilities

* dotenv for environment variables
* REST APIs for communication

---

## How It Works

### Query Processing Pipeline

1. User enters a natural language query
2. LLM parses the query into structured fields:

   * intent
   * category
   * month
3. Backend filters and aggregates data using Pandas
4. A formatted response is returned to the UI

Example:

Query:
How much did I spend in March

Parsed:
{
"intent": "total_spending",
"category": null,
"month": "03"
}

Response:
You spent ₹XXXXX in March

---

## Key Design Decision

The system follows a hybrid approach:

* LLM is used only for understanding user intent
* All numerical computation is performed using structured data processing

This prevents hallucinations and ensures consistent, reliable outputs.

---

## Project Structure

```
SmartLedger/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── summary.py
│   │   │   ├── transactions.py
│   │   │   └── chat.py
│   │   ├── services/
│   │   │   ├── data_loader.py
│   │   │   └── query_engine.py
│   │   └── main.py
│   ├── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── ...
│   ├── public/
│   └── package.json
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

### Backend

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

Create a .env file:

OPENROUTER_API_KEY=your_api_key_here

Run backend:

uvicorn app.main:app --reload

---

### Frontend

cd frontend
npm install
npm start

---

## API Endpoints

### GET /summary

Returns:

* total_spent
* top_category
* category_breakdown
* monthly_trend

---

### GET /transactions

Returns full transaction dataset with:

* categories
* timestamps
* anomaly flags

---

### GET /ask?query=

Returns:

* natural language response based on user query

---

## Limitations

* Limited handling of highly complex or ambiguous queries
* No conversational memory across multiple queries
* Dependence on external LLM API
* Static dataset (no real-time financial integration)

---

## Future Improvements

* Conversational memory and context retention
* Advanced query understanding using embeddings
* Forecasting and predictive analytics
* Deployment using Docker and cloud services
* Multi-user support and authentication

---

## Summary

Smart Ledger demonstrates a practical implementation of combining large language models with structured data systems. It ensures both flexibility in interaction and accuracy in computation, making it suitable for real-world financial analytics use cases.
