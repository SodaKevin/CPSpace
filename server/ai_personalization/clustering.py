import numpy as np
from sklearn.cluster import KMeans, AgglomerativeClustering

# -----------------------------
# Dataset size decision
# -----------------------------
def is_small_dataset(count):
    return count < 3

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
# Hierarchical clustering
# -----------------------------
def hierarchical_cluster(features):
    X = np.array(features["X"])

    if len(X) < 3:
        return fallback_cluster(features)

    model = AgglomerativeClustering(n_clusters=3)
    labels = model.fit_predict(X)

    unique, counts = np.unique(labels, return_counts=True)
    dominant_cluster = unique[np.argmax(counts)]

    cluster_means = {}

    for label in np.unique(labels):
        cluster_means[label] = np.mean(X[labels == label])

    sorted_labels = sorted(cluster_means, key=lambda x: cluster_means[x])

    cluster_map = {
        sorted_labels[0]: 0,
        sorted_labels[1]: 1,
        sorted_labels[2]: 2
    }

    return cluster_map[dominant_cluster]

# -----------------------------
# K-means clustering
# -----------------------------
def kmeans_cluster(features):
    X = np.array(features["X"])

    # If insufficient samples, fallback
    if len(X) < 3:
        return fallback_cluster(features)

    model = KMeans(n_clusters=3, n_init=10, random_state=42)
    labels = model.fit_predict(X)

    # Determine dominant cluster
    unique, counts = np.unique(labels, return_counts=True)
    dominant_cluster = unique[np.argmax(counts)]

    centroids = model.cluster_centers_.flatten()

    # Sort centroids: negative → neutral → positive
    sorted_indices = np.argsort(centroids)

    # Map cluster label to emotion meaning
    cluster_map = {
        sorted_indices[0]: 0,  # negative
        sorted_indices[1]: 1,  # neutral
        sorted_indices[2]: 2   # positive
    }

    return cluster_map[dominant_cluster]