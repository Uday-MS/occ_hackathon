# =============================================================================
# AUTH MODULE — Authentication routes (Blueprint)
# =============================================================================
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_conn, put_conn

auth_bp = Blueprint("auth", __name__)


# ---------------------------------------------------------------------------
# SIGNUP — POST /signup
# ---------------------------------------------------------------------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    """Create a new user account."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    # --- Validation ---
    errors = []
    if not username or len(username) < 2:
        errors.append("Username must be at least 2 characters")
    if not email or "@" not in email:
        errors.append("Valid email is required")
    if not password or len(password) < 6:
        errors.append("Password must be at least 6 characters")

    if errors:
        return jsonify({"error": "; ".join(errors)}), 400

    # --- Store in DB ---
    conn = get_conn()
    try:
        cur = conn.cursor()

        # Check for duplicate email
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "An account with this email already exists"}), 409

        # Hash password and insert
        pw_hash = generate_password_hash(password, method="pbkdf2:sha256")
        cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, email, pw_hash),
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()

        # Set session
        session["user_id"] = user_id
        session["username"] = username

        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "user": {"id": user_id, "username": username, "email": email},
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        put_conn(conn)


# ---------------------------------------------------------------------------
# LOGIN — POST /login
# ---------------------------------------------------------------------------
@auth_bp.route("/login", methods=["POST"])
def login():
    """Authenticate an existing user."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    email = (data.get("email") or "").strip().lower()
    password = (data.get("password") or "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, username, password_hash FROM users WHERE email = %s",
            (email,),
        )
        row = cur.fetchone()
        cur.close()

        if not row:
            return jsonify({"error": "No account found with this email"}), 401

        user_id, username, pw_hash = row

        if not check_password_hash(pw_hash, password):
            return jsonify({"error": "Incorrect password"}), 401

        # Set session
        session["user_id"] = user_id
        session["username"] = username

        return jsonify({
            "success": True,
            "message": f"Welcome back, {username}!",
            "user": {"id": user_id, "username": username, "email": email},
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        put_conn(conn)


# ---------------------------------------------------------------------------
# LOGOUT — GET /logout
# ---------------------------------------------------------------------------
@auth_bp.route("/logout")
def logout():
    """Clear session and log the user out."""
    session.clear()
    return jsonify({"success": True, "message": "Logged out successfully"})


# ---------------------------------------------------------------------------
# AUTH STATUS — GET /auth/status
# ---------------------------------------------------------------------------
@auth_bp.route("/auth/status")
def auth_status():
    """Check if the user is currently logged in."""
    if "user_id" in session:
        return jsonify({
            "logged_in": True,
            "user": {
                "id": session["user_id"],
                "username": session["username"],
            },
        })
    return jsonify({"logged_in": False})


# ---------------------------------------------------------------------------
# GOOGLE AUTH — GET /auth/google (placeholder)
# ---------------------------------------------------------------------------
@auth_bp.route("/auth/google")
def google_auth():
    """Placeholder for Google OAuth — not yet implemented."""
    return jsonify({
        "success": False,
        "message": "Google authentication is coming soon! This feature is not yet implemented.",
    }), 501


# ---------------------------------------------------------------------------
# SAVE STARTUP — POST /api/save-startup
# ---------------------------------------------------------------------------
@auth_bp.route("/api/save-startup", methods=["POST"])
def save_startup():
    """Save a startup to the user's collection. Requires login."""
    if "user_id" not in session:
        return jsonify({"error": "Login required to save startups"}), 401

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    startup_name = (data.get("startup_name") or "").strip()
    if not startup_name:
        return jsonify({"error": "Startup name is required"}), 400

    user_id = session["user_id"]

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Check for duplicate
        cur.execute(
            "SELECT id FROM saved_startups WHERE user_id = %s AND startup_name = %s",
            (user_id, startup_name),
        )
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "Startup already saved"}), 409

        cur.execute(
            "INSERT INTO saved_startups (user_id, startup_name) VALUES (%s, %s) RETURNING id",
            (user_id, startup_name),
        )
        saved_id = cur.fetchone()[0]
        conn.commit()
        cur.close()

        return jsonify({
            "success": True,
            "message": f"'{startup_name}' saved successfully",
            "id": saved_id,
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        put_conn(conn)


# ---------------------------------------------------------------------------
# GET SAVED STARTUPS — GET /api/saved-startups
# ---------------------------------------------------------------------------
@auth_bp.route("/api/saved-startups")
def get_saved_startups():
    """Return the logged-in user's saved startups."""
    if "user_id" not in session:
        return jsonify({"error": "Login required"}), 401

    user_id = session["user_id"]

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, startup_name, created_at FROM saved_startups WHERE user_id = %s ORDER BY created_at DESC",
            (user_id,),
        )
        rows = cur.fetchall()
        cur.close()

        startups = [
            {"id": r[0], "startup_name": r[1], "saved_at": r[2].isoformat() if r[2] else None}
            for r in rows
        ]

        return jsonify({"startups": startups})

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        put_conn(conn)


# ---------------------------------------------------------------------------
# DELETE SAVED STARTUP — DELETE /api/save-startup/<id>
# ---------------------------------------------------------------------------
@auth_bp.route("/api/save-startup/<int:startup_id>", methods=["DELETE"])
def delete_saved_startup(startup_id):
    """Remove a saved startup. Requires login + ownership."""
    if "user_id" not in session:
        return jsonify({"error": "Login required"}), 401

    user_id = session["user_id"]

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM saved_startups WHERE id = %s AND user_id = %s",
            (startup_id, user_id),
        )
        deleted = cur.rowcount
        conn.commit()
        cur.close()

        if deleted == 0:
            return jsonify({"error": "Startup not found or not yours"}), 404

        return jsonify({"success": True, "message": "Startup removed"})

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    finally:
        put_conn(conn)
