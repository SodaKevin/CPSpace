from flask import Flask, request, jsonify
from flask_cors import CORS

from preprocess import preprocess_user_data

from clustering import ( is_small_dataset, fallback_cluster, kmeans_cluster, hierarchical_cluster )

# -----------------------------
# App setup
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# Health check
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return "AI Personalization service running"

# -----------------------------
# Temporary test endpoint
# -----------------------------
@app.route("/auto-personalize", methods=["POST"])
def auto_personalize():
    data = request.get_json()

    if not data or "diaries" not in data:
        return jsonify({"error": "Missing diary data"}), 400

    features = preprocess_user_data(data["diaries"])

    if features["entries"] < 3:
        cluster = fallback_cluster(features)
        method = "rule-based"
    elif features["entries"] < 10:
        cluster = hierarchical_cluster(features)
        method = "hierarchical"
    else:
        cluster = kmeans_cluster(features)
        method = "kmeans"

    return jsonify({
        "status": "ok",
        "method": method,
        "cluster": cluster,
        "features": features
    })

# -----------------------------
# Run server
# -----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
