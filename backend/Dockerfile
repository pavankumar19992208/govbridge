# ---------- Pillar 1 & 2: Secured Multi-stage Builder ----------
FROM python:3.11-slim AS builder

WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# ---------- Pillar 2: Distroless-inspired Minimal Runtime ----------
FROM python:3.11-slim

# Pillar 2: Zero-Trust Security dropping root privileges
RUN useradd -m -r appuser
WORKDIR /app

# Copy wheels from builder eliminating build-time artifacts (gcc, etc)
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install pre-compiled wheels cleanly
RUN pip install --no-cache /wheels/*

# Copy backend context code
COPY . .

# Pillar 2: Strict ownership enforcement
RUN chown -R appuser:appuser /app

# Pillar 2: Non-root user execution
USER appuser

# Standard 8080 exposure for Cloud Run
EXPOSE 8080

# Pillar 3: Fully asynchronous production server
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8080}"]