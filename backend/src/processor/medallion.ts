import { getConsumer } from '../infrastructure/kafka';
import { getClickHouseClient } from '../infrastructure/clickhouse';
import { config } from '../config/env';
import { v4 as uuidv4 } from 'uuid';

const BATCH_SIZE = 1000;
const BATCH_TIMEOUT_MS = 1000;

interface TelemetryEvent {
    device_id: string;
    temperature: number;
    humidity: number;
    timestamp: string;
}

export const startProcessor = async () => {
    const consumer = getConsumer();
    const clickhouse = getClickHouseClient();

    await consumer.subscribe({ topic: config.kafka.topic, fromBeginning: false });

    let batch: any[] = [];
    let timer: NodeJS.Timeout | null = null;

    console.log('🔄 Processor Started: Kafka -> ClickHouse (Bronze)');

    const flushBatch = async () => {
        if (batch.length === 0) return;

        const currentBatch = [...batch];
        batch = [];
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }

        try {
            await clickhouse.insert({
                table: `${config.clickhouse.database}.bronze_telemetry`,
                values: currentBatch,
                format: 'JSONEachRow'
            });
            console.log(`💾 Flushed ${currentBatch.length} events to ClickHouse`);
        } catch (error) {
            console.error('❌ Failed to insert batch:', error);
            // In prod: Implementation specific DLQ logic or retry
        }
    };

    await consumer.run({
        eachMessage: async ({ message }) => {
            if (!message.value) return;

            try {
                const payload = JSON.parse(message.value.toString());
                // Transform for Bronze Table
                const row = {
                    id: uuidv4(),
                    device_id: payload.device_id,
                    temperature: payload.temperature,
                    humidity: payload.humidity,
                    timestamp: payload.timestamp.slice(0, 19).replace('T', ' '),
                    raw_payload: message.value.toString()
                };

                batch.push(row);

                if (batch.length >= BATCH_SIZE) {
                    await flushBatch();
                } else if (!timer) {
                    timer = setTimeout(flushBatch, BATCH_TIMEOUT_MS);
                }

            } catch (err) {
                console.error('Error processing message', err);
            }
        }
    });
};
