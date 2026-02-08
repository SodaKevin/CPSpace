from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# --------------------------------
# App setup
# --------------------------------
app = Flask(__name__)
CORS(app)

# --------------------------------
# Load model ONCE at startup
# --------------------------------
MODEL_PATH = "./model/trained_distilbert_sentiment"

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

# Label mapping (MUST match training)
LABEL_MAP = {
    0: "Negative",
    1: "Neutral",
    2: "Positive"
}

# --------------------------------
# Health check endpoint
# --------------------------------
@app.route("/", methods=["GET"])
def home():
    return "CPSpace server is running"

# --------------------------------
# Prediction endpoint
# --------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    if not data or "text" not in data:
        return jsonify({"error": "Missing 'text' field"}), 400

    text = data["text"]

    # Tokenize
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=256
    )

    # Inference
    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)

    # Get prediction
    confidence, predicted_class = torch.max(probs, dim=1)

    return jsonify({
        "label": LABEL_MAP[predicted_class.item()],
        "confidence": round(confidence.item(), 4),
        "probabilities": {
            "negative": round(probs[0][0].item(), 4),
            "neutral": round(probs[0][1].item(), 4),
            "positive": round(probs[0][2].item(), 4)
        }
    })

# --------------------------------
# Run server
# --------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)