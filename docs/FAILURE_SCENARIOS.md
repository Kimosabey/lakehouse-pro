# ⚔️ Failure Scenarios & Resilience

> "Everything fails, all the time." — Werner Vogels

This document outlines how `Lakehouse Pro` survives common infrastructure failures.

## 1. Component Failures

### 🚨 Scenario A: Kafka Broker Crash
*   **Impact**: Ingestion Service cannot offload messages.
*   **Behavior**:
    *   The Ingestion Service has a small **in-memory circuit breaker**.
    *   If Kafka is unreachable for >500ms, it immediately returns `503 Service Unavailable` to the client (IoT Device).
    *   **Why?**: We prefer dropping data or telling the client to retry later rather than crashing the Ingestion Server with Out-Of-Memory (OOM) errors by buffering indefinitely.

### 🚨 Scenario B: ClickHouse Node Failure
*   **Impact**: Dashboard queries fail, but ingestion continues.
*   **Behavior**:
    *   Kafka acts as a persistent buffer. It will retain messages for 7 days.
    *   Once ClickHouse recovers, the consumer will "catch up" by processing the backlog at high speed.
    *   **Zero Data Loss**: As long as Kafka retention > downtime.

---

## 2. Chaos Testing Results

| Test Case | Method | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **Kill Producer** | `docker stop ingestion` | Zero 500s during restart | Docker Compose restart policy handles it | ✅ PASS |
| **Kill Broker** | `docker stop kafka` | Connection Refused / Retry | KafkaJS retries with exponential backoff | ✅ PASS |
| **Poison Pill** | Send Malformed JSON | Validation Error (400) | Rejected before entering Kafka | ✅ PASS |
