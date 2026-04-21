import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

try:
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    print("✅ DB Connected Successfully")
    conn.close()
except Exception as e:
    print("❌ DB Connection Failed:", e)