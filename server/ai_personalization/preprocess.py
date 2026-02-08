def preprocess_user_data(diaries):
    """
    diaries: list of diary entries from Firestore
    Each entry contains category, feelings, createdAt
    """

    mood_map = {
        "pleasant": 1,
        "neutral": 0,
        "unpleasant": -1
    }

    total_score = 0
    count = 0

    for d in diaries:
        cat = d.get("category")
        if cat in mood_map:
            total_score += mood_map[cat]
            count += 1

    avg_mood = total_score / count if count > 0 else 0

    return {
        "avg_mood": avg_mood,
        "entries": count
    }
