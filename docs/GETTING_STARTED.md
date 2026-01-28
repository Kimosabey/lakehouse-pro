# 🚀 Getting Started with Lakehouse Pro

## 1. Prerequisites

Before running the system, ensure you have the following installed:

| Tool | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `20+` | Application Runtime |
| **Docker** | `24.0+` | Container Platform |
| **Docker Compose** | `2.20+` | Orchestration |
| **DBeaver** | *Latest* | Recommended for querying ClickHouse |

---

## 2. Installation & Setup

### A. Clone Repository
```bash
git clone https://github.com/Kimosabey/lakehouse-pro.git
cd lakehouse-pro
```

### B. Start Infrastructure & App
This will spin up Zookeeper, Kafka, ClickHouse, ch-ui, and the Ingestion Service.
```bash
docker-compose up -d --build
```
*Wait ~30 seconds for Kafka and ClickHouse to initialize.*

---

## 3. Environment Variables (.env)

The application uses `src/config/env.ts`. You can override defaults in `docker-compose.yml`:

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | API Port |
| `KAFKA_BROKERS` | `kafka:29092` | Kafka Broker URL |
| `CLICKHOUSE_HOST` | `http://clickhouse:8123` | Analytics DB connection |
| `CLICKHOUSE_USER` | `default` | DB User |

---

## 4. Verification

### A. Check Services
Ensure all containers are running:
```bash
docker-compose ps
```

### B. Simulate Traffic
This script generates realistic IoT telemetry and sends it to the API.
```bash
# Install dependencies
npm install

# Run Simulation
npm run simulate
```

### C. Manual cURL Test
```bash
curl -X POST http://localhost:3000/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "manual-test-01", 
    "temperature": 25.5, 
    "humidity": 60,
    "timestamp": "2026-01-18T10:00:00Z"
  }'
```

### D. Visual Querying
Open your browser at `http://localhost:5521` to access the **ClickHouse UI (ch-ui)**.
It is pre-configured to connect to your local ClickHouse instance.

**Login Credentials:**
*   **URL**: `http://localhost:8124`
*   **Username**: `default`
*   **Password**: *(Leave Empty)*

---

## 5. Running Tests

### Unit Tests
```bash
npm test
```
