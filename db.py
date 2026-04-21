# =============================================================================
# DATABASE MODULE — PostgreSQL connection and table setup
# =============================================================================
import os
import psycopg2
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
DATABASE_URL = os.getenv("DATABASE_URL")

# ---------------------------------------------------------------------------
# Connection Pool — efficient, reusable connections
# ---------------------------------------------------------------------------
_pool = None


def get_pool():
    """Get or create the connection pool (lazy singleton)."""
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.SimpleConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL,
        )
        print("✅ PostgreSQL connection pool created")
    return _pool


def get_conn():
    """Get a connection from the pool."""
    return get_pool().getconn()


def put_conn(conn):
    """Return a connection to the pool."""
    get_pool().putconn(conn)


# ---------------------------------------------------------------------------
# Table Creation — Safe, idempotent (IF NOT EXISTS)
# ---------------------------------------------------------------------------
def init_db():
    """Create all required tables if they don't exist."""
    conn = get_conn()
    try:
        cur = conn.cursor()

        # ---- Users table ----
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id          SERIAL PRIMARY KEY,
                username    VARCHAR(80) NOT NULL,
                email       VARCHAR(120) NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW()
            );
        """)

        # ---- Saved Startups table (future-ready) ----
        cur.execute("""
            CREATE TABLE IF NOT EXISTS saved_startups (
                id           SERIAL PRIMARY KEY,
                user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                startup_name VARCHAR(255) NOT NULL,
                created_at   TIMESTAMP DEFAULT NOW()
            );
        """)

        conn.commit()
        cur.close()
        print("✅ Database tables initialized")
    except Exception as e:
        conn.rollback()
        print(f"❌ Database init failed: {e}")
    finally:
        put_conn(conn)


# ---------------------------------------------------------------------------
# Run init on module import IF called directly (also safe to call from app.py)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    init_db()
    print("Database setup complete.")
