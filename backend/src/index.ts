import { connectKafka } from './infrastructure/kafka';
import { connectClickHouse } from './infrastructure/clickhouse';
import { startProcessor } from './processor/medallion';
import { startServer } from './gateway/server';

const bootstrap = async () => {
    console.log('🔥 Starting Lakehouse Pro...');

    try {
        await connectKafka();
        await connectClickHouse();

        // Start Consumer Loop
        startProcessor();

        // Start API Gateway
        startServer();

    } catch (error) {
        console.error('Startup Failed:', error);
        process.exit(1);
    }
};

bootstrap();
