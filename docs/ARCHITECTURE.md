# 🚀 Lakehouse Pro - Complete End-to-End Architecture & UI/UX Documentation

## 📊 **End-to-End Data Flow**

![Architecture Diagram](assets/architecture.png)

### **1. DATA GENERATION (Simulation)**
- **Script**: `simulate_traffic.ts` (Generates traffic)
- **Data**: `device_id`, `temperature`, `humidity`, `timestamp`
- **Output**: POST → `http://localhost:3000/api/telemetry`

### **2. INGESTION SERVICE (Node.js/Express)**
- **Role**: High-throughput Ingestion Gateway
- **Actions**:
  - Receives HTTP POST requests
  - Validates telemetry payload schema
  - Publishes to Kafka topic: `sensor-telemetry`
- **Port**: `3001` (Internal), mapped to host

### **3. KAFKA BROKER (Streaming Buffer)**
- **Role**: Decouples ingestion from processing
- **Components**:
  - **Topic**: `sensor-telemetry`
  - **Zookeeper**: Cluster coordination
- **UI**: [Kafka UI](http://localhost:8086)

### **4. STREAM PROCESSOR & STORAGE**
- **Stream Processing**:
  - Consumes from Kafka
  - Implements **Medallion Architecture**:
    - **Bronze**: Raw data landing
    - **Silver**: Validated & Enriched
    - **Gold**: Aggregated metrics
- **Storage: ClickHouse (OLAP)**:
  - Optimized for high-speed writes & aggregations
  - Stores 100k+ events
  - **UI**: [ClickHouse UI](http://localhost:5521) (Port 8124)

### **5. NEXT.JS DASHBOARD (Visualization)**
- **Tech**: Next.js 14, Aceternity UI, Tailwind CSS
- **Features**:
  - **SSR**: Fetches initial state
  - **Polling**: Updates every 2 seconds via `/api/telemetry`
  - **Visuals**: Vortex particle, Glassmorphism
- **Port**: `3000`

![Data Workflow](assets/workflow.png)

---

## 🛠️ **Complete Tech Stack**

### **Backend Infrastructure**
- **Ingestion**: Node.js v20 + Express + TypeScript
- **Message Queue**: Apache Kafka 7.5.0 + Zookeeper
- **Stream Processing**: Node.js Consumer (formerly Go/Netty in legacy versions)
- **Database**: ClickHouse 23.8 (Columnar OLAP)

### **Frontend Stack**
- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4.0
- **UI Components**: 
  - Shadcn/ui (base components)
  - Aceternity UI (Vortex animation)
  - Lucide Icons
- **Animations**: Framer Motion
- **Data Fetching**: React Server Components + Client Polling

### **DevOps**
- **Containerization**: Docker + Docker Compose
- **Version Control**: Git + GitHub
- **Package Manager**: npm

---

## 🎨 **UI/UX Design System**

### **Color Palette (Strictly Enforced)**
```css
--color-white:       #F7F7F7  /* Almost White - Backgrounds */
--color-light-grey:  #EEEEEE  /* Light Grey - Borders, Secondary BG */
--color-dark-coal:   #393E46  /* Dark Charcoal - Primary Text, Icons */
--color-blue-grey:   #929AAB  /* Blue-Grey Cream - Secondary Text */
```

### **Typography**
- **Font Family**: Geist Sans, Geist Mono
- **Headers**: Bold, #393E46, 2xl-4xl
- **Body**: Semibold, #393E46, sm-base
- **Secondary**: Semibold, #929AAB, xs-sm

### **UI Implementation Pillars**
1.  **Visual Hierarchy**: Large headers, clear stat cards, high contrast.
2.  **Consistency**: Uniform borders, shadows, and spacing.
3.  **Feedback**: Hover states, pulsing live indicators, smooth transitions.
4.  **Performance**: GPU-accelerated animations (Vortex), efficient polling.
5.  **Clean Layout**: Generous whitespace, card-based design.

---

## 🌊 **Background Animation: Vortex**

### **Configuration**
```typescript
<Vortex
  backgroundColor="#F7F7F7"     // Matches theme
  rangeY={800}                  // Vertical spread
  particleCount={300}           // Performance optimized
  baseHue={215}                 // Blue-grey matching #929AAB
  baseSpeed={0.1}               // Slow, subtle
  rangeSpeed={0.8}              // Gentle variation
/>
```
**Why?** Adds depth and a premium feel without distracting from the data.

---

## 📈 **Real-Time Features**

- **Polling Interval**: 2 seconds (Balances freshness vs load)
- **Data Display**:
  - **Live Counter**: Formatted with commas
  - **Aggregates**: Real-time averages (Temp, Humidity)
  - **Stream**: Latest 100 events

---

## ✅ **Validation Checklist**

### **Data Flow**
- [x] Simulator generates events (1/minute)
- [x] Ingestion service receives POST requests
- [x] Kafka queues messages
- [x] Stream processor writes to ClickHouse
- [x] Dashboard reads from ClickHouse
- [x] UI updates every 2 seconds

### **UI/UX & Code Quality**
- [x] Color consistency (4-color palette)
- [x] Responsive layout (Mobile to Desktop)
- [x] No console errors
- [x] TypeScript type safety
- [x] Docker containerized

---

## 🔍 **Low-Level Design (LLD)**

### **1. API Contract (Ingestion)**
**Endpoint**: `POST /api/telemetry`
**Content-Type**: `application/json`

```json
{
  "device_id": "sensor-001",    // String (Required)
  "temperature": 25.5,          // Float (Required)
  "humidity": 60,               // Integer (Required)
  "timestamp": "2024-01-01..."  // ISO8601 String (Required)
}
```

### **2. Database Schema (ClickHouse)**

**Bronze Table (Raw)**
```sql
CREATE TABLE lakehouse_pro.bronze_sensors (
    event_id UUID,
    device_id String,
    temperature Float32,
    humidity Float32,
    timestamp DateTime,
    ingested_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY timestamp;
```

**Silver/Gold Views** (Materialized for Performance)
- **`silver_sensors`**: Validated data with deduplication.
- **`gold_metrics`**: Aggregated 1-minute windows (Avg Temp, Max Humidity) for dashboard speed.

---

## 🧠 **Design Decisions & Trade-offs**

### **Why ClickHouse (OLAP) vs PostgreSQL (OLTP)?**
*   **Context**: We need to query aggregations (AVG, MAX) over millions of telemetry rows for the dashboard.
*   **Decision**: Chosen **ClickHouse** because its Columnar storage skips reading unnecessary columns, making analytical queries 100x faster than Postgres row-scans.
*   **Trade-off**: ClickHouse acts as an append-only log; updates/deletes are expensive, which fits our immutable telemetry use case perfectly.

### **Why Node.js/Kafka vs Direct DB Write?**
*   **Context**: Use cases involves bursty IoT traffic (thousands of sensors waking up at once).
*   **Decision**: **Kafka** acts as a "Shock Absorber". If the DB goes down for maintenance, Kafka holds the data (7-day retention).
*   **Why Node.js?**: Its non-blocking Event Loop is ideal for I/O-heavy ingestion, handling thousands of concurrent keep-alive connections on a single thread.
