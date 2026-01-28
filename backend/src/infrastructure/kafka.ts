import { Kafka, Producer, Consumer } from 'kafkajs';
import { config } from '../config/env';

const kafka = new Kafka({
    clientId: config.kafka.clientId,
    brokers: config.kafka.brokers
});

let producer: Producer;
let consumer: Consumer;

export const connectKafka = async () => {
    producer = kafka.producer();
    consumer = kafka.consumer({ groupId: 'lakehouse-processor-group' });

    await producer.connect();
    await consumer.connect();

    console.log('✅ Kafka Connected');

    // Create topic if not exists (auto-create usually enabled, but good practice to ensure)
    const admin = kafka.admin();
    await admin.connect();
    const topics = await admin.listTopics();
    if (!topics.includes(config.kafka.topic)) {
        await admin.createTopics({
            topics: [{ topic: config.kafka.topic, numPartitions: 3 }]
        });
        console.log(`Created topic: ${config.kafka.topic}`);
    }
    await admin.disconnect();
};

export const getProducer = () => producer;
export const getConsumer = () => consumer;
