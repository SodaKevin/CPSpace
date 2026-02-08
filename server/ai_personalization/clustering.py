import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering

# -----------------------------
# Dataset size decision
# -----------------------------
def is_small_dataset(count):
    return count < 5

# -----------------------------
# Fallback clustering
# -----------------------------
def fallback_cluster(features):
    """
    Rule-based fallback when data is insufficient
    """
    avg = features["avg_mood"]

    if avg > 0.3:
        return 2   # positive cluster
    elif avg < -0.3:
        return 0   # negative cluster
    else:
        return 1   # neutral cluster
# -----------------------------
# K-means clustering
# -----------------------------
def kmeans_cluster(features):
    X = np.array([[features["avg_mood"]]])

    model = KMeans(n_clusters=3, n_init=10, random_state=42)
    label = model.fit_predict(X)[0]

    return int(label)
