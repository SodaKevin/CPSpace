# CPSpace Server (Backend & AI Services)

This directory contains the backend services and AI-related components for the CPSpace system.

The server is implemented in Python and is responsible for:
- AI model training and preprocessing (offline)
- AI inference and content moderation (runtime)
- Exposing HTTP APIs for the frontend to consume

## Technology Stack
- Python
- Flask (API layer)
- Machine Learning / NLP libraries
- Local model storage

## Structure Overview
- `app.py` – Main Flask application entry point
- `ai/` – AI-related scripts (training, preprocessing, models)
- `api/` – API routes and inference logic
- `requirements.txt` – Python dependencies

## Responsibilities
- Load trained AI models
- Process text input from the frontend
- Return prediction or moderation results
- Keep AI logic isolated from frontend concerns

## Notes
- Model training scripts are executed manually during development.
- The frontend does not run Python code directly.
- Communication between client and server occurs via HTTP requests.

This separation ensures maintainability, scalability, and clear system architecture.
