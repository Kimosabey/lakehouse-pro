# 🎙️ Interview Q&A: Lakehouse Pro

## 1. The "Elevator Pitch"
> **Q: "Tell me about this project."**

**A:** "Lakehouse Pro is an enterprise-grade ingestion pipeline designed to handle heavy write loads (100k+ events/sec) for IoT telemetry. It uses a **Node.js/Express** gateway for high-throughput ingestion, buffers data into **Kafka** for durability, and continuously streams it into **ClickHouse** for real-time OLAP. It follows a **Medallion Architecture** pattern, allowing us to serve sub-second analytics on dashboards while maintaining a raw data lake for auditability."

---

## 2. Technical Decisions
> **Q: "Why did you use ClickHouse instead of Postgres?"**

**A:** "Postgres is row-oriented. If I want to calculate the average temperature across 1 billion rows, Postgres has to scan every single page on disk. ClickHouse is column-oriented; it only reads the `temperature` column file. This makes aggregations 100-1000x faster. We perform heavy reads on the dashboard, so OLAP was the only viable choice over OLTP."

> **Q: "Why Node.js for Ingestion over Python/Flask?"**

**A:** "For a high-throughput ingestion gateway, I/O performance is king. Node.js uses an Event Loop (libuv) which handles thousands of concurrent connections on a single thread without the overhead of context switching found in thread-per-request models. This allows us to handle massive spikes in IoT traffic with minimal resource footprint compared to blocking Python workers."

---

## 3. The "Senior Signal"
> **Q: "What was the hardest challenge?"**

**A:** "The hardest part was implementing **Backpressure** and handling **Network Partitions**. Initially, if ClickHouse slowed down, the Kafka Consumer would keep refreshing metadata and crashing. I had to tune the `heartbeat.interval.ms` and `session.timeout.ms` in KafkaJS to ensure the consumer remained stable during heavy processing loads, effectively decoupling the ingestion rate from the processing rate."
