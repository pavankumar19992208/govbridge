# First stage: Build pip wheels for ultra lean final container
FROM python:3.11-slim AS builder

WORKDIR /app
COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Final stage: Secure, lightweight runtime image
FROM python:3.11-slim

# Create a non-root system user dropping default privileges ensuring strict container security
RUN useradd -m -r appuser
WORKDIR /app

# Copy wheels explicitly bypassing compiler artifacts
COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

# Install pre-compiled wheels cleanly
RUN pip install --no-cache /wheels/*

# Copy backend context code
COPY backend/ ./backend/

# Chown directory contents properly
RUN chown -R appuser:appuser /app

# Demote system control mapping execution layers away from root user
USER appuser

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
