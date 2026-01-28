import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    kafka: {
        clientId: 'lakehouse-pro-client',
        brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        topic: 'telemetry-raw'
    },
    clickhouse: {
        host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
        username: process.env.CLICKHOUSE_USER || 'default',
        password: process.env.CLICKHOUSE_PASSWORD || '',
        database: 'lakehouse_pro'
    }
};
