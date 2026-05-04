import pandas as pd
from pathlib import Path

# Get path to CSV (robust, not fragile nonsense)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_PATH = BASE_DIR / "data" / "cleaned_transactions.csv"

# Load once (important)
df = pd.read_csv(DATA_PATH)

# Fix datetime (again, because CSV forgets types)
df['datetime'] = pd.to_datetime(df['datetime'])

# Add month column (useful for queries later)
df['month'] = df['datetime'].dt.to_period('M').astype(str)


def get_data():
    return df