def preprocess_user_data(diaries):
    mood_map = {
        "pleasant": 1,
        "neutral": 0,
        "unpleasant": -1
    }

    X = []

    for d in diaries:
        cat = d.get("category")
        if cat in mood_map:
            X.append([mood_map[cat]])

    count = len(X)

    # Also compute average for fallback usage
    avg_mood = sum(v[0] for v in X) / count if count > 0 else 0

    return {
        "X": X,               # list of samples
        "entries": count,
        "avg_mood": avg_mood
    }