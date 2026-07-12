# ---- Build stage ----
FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git ca-certificates

WORKDIR /src

# Cache dependencies.
COPY go.mod go.sum ./
RUN go mod download

# Copy source.
COPY . .

# Build a statically-linked binary.
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /bin/kathal ./cmd/kathal

# ---- Runtime stage ----
FROM gcr.io/distroless/static-debian12

COPY --from=builder /bin/kathal /kathal

# Copy web assets (built separately).
COPY web/dist /web/dist

# Default data directory.
VOLUME /data

ENV KATHAL_HTTP_ADDR=:8080
ENV KATHAL_DB_PATH=/data/kathal.db

EXPOSE 8080

ENTRYPOINT ["/kathal"]
