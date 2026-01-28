import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { getProducer } from '../infrastructure/kafka';
import { config } from '../config/env';

const app = express();

app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'lakehouse-ingestion' });
});

app.post('/api/telemetry', async (req, res) => {
    const producer = getProducer();
    const payload = req.body;

    if (!payload.device_id || !payload.temperature) {
        return res.status(400).json({ error: 'Invalid schema' });
    }

    // Add server timestamp if missing
    if (!payload.timestamp) {
        payload.timestamp = new Date().toISOString();
    }

    try {
        await producer.send({
            topic: config.kafka.topic,
            messages: [
                { value: JSON.stringify(payload) }
            ]
        });

        // 202 Accepted - We buffered it, but haven't processed it yet
        res.status(202).json({ status: 'buffered' });
    } catch (error) {
        console.error('Kafka Write Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export const startServer = () => {
    app.listen(config.port, () => {
        console.log(`🚀 Gateway API running on port ${config.port}`);
    });
};
