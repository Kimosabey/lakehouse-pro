import { createClient } from '@clickhouse/client';
import { config } from '../config/env';

const client = createClient({
    url: config.clickhouse.host,
    username: config.clickhouse.username,
    password: config.clickhouse.password,
    database: 'default', // Initial connection to default
});

export const connectClickHouse = async () => {
    try {
        // Check connection
        await client.ping();
        console.log('✅ ClickHouse Connected');

        // Initialize Database
        await client.exec({
            query: `CREATE DATABASE IF NOT EXISTS ${config.clickhouse.database}`
        });

        // Initialize Medallion Tables
        // Bronze: Raw ingestion (Log engine for fast append)
        await client.exec({
            query: `
        CREATE TABLE IF NOT EXISTS ${config.clickhouse.database}.bronze_telemetry (
          id UUID,
          device_id String,
          temperature Float32,
          humidity Float32,
          timestamp DateTime,
          raw_payload String
        ) ENGINE = MergeTree()
        ORDER BY timestamp
      `
        });

        // Silver: Cleaned Data (No raw payload, deduped if needed - simplified here)
        await client.exec({
            query: `
        CREATE TABLE IF NOT EXISTS ${config.clickhouse.database}.silver_sensors (
          device_id String,
          temperature Float32,
          humidity Float32,
          timestamp DateTime
        ) ENGINE = MergeTree()
        ORDER BY (device_id, timestamp)
      `
        });

        // Gold: Aggregated Hourly Stats
        await client.exec({
            query: `
        CREATE TABLE IF NOT EXISTS ${config.clickhouse.database}.gold_daily_stats (
          device_id String,
          day Date,
          avg_temp Float32,
          max_temp Float32,
          avg_hum Float32
        ) ENGINE = SummingMergeTree()
        ORDER BY (device_id, day)
      `
        });

        // Materialized View to auto-feed Silver from Bronze
        await client.exec({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS ${config.clickhouse.database}.mv_bronze_to_silver TO ${config.clickhouse.database}.silver_sensors AS
            SELECT 
                device_id,
                temperature,
                humidity,
                timestamp
            FROM ${config.clickhouse.database}.bronze_telemetry
            WHERE temperature > -50 AND temperature < 100 -- Basic data quality check
        `
        });

        // Materialized View to auto-feed Gold from Silver
        await client.exec({
            query: `
            CREATE MATERIALIZED VIEW IF NOT EXISTS ${config.clickhouse.database}.mv_silver_to_gold TO ${config.clickhouse.database}.gold_daily_stats AS
            SELECT 
                device_id,
                toDate(timestamp) as day,
                avg(temperature) as avg_temp,
                max(temperature) as max_temp,
                avg(humidity) as avg_hum
            FROM ${config.clickhouse.database}.silver_sensors
            GROUP BY device_id, day
        `
        });

        console.log('✅ Medallion Tables Initialized');
    } catch (error) {
        console.error('❌ ClickHouse Connection Failed:', error);
        process.exit(1);
    }
};

export const getClickHouseClient = () => client;
