import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:3001/api/telemetry';
const TOTAL_DEVICES = 100;
const DEVICES = Array.from({ length: TOTAL_DEVICES }, (_, i) => `device-${String(i).padStart(3, '0')}`);

// Scenarios
const SCENARIOS = {
    NORMAL: 0.8,
    HIGH_TEMP: 0.1,
    BAD_DATA: 0.05, // 5% corrupt data
    LATENCY_SPIKE: 0.05
};

const stats = {
    sent: 0,
    failed: 0,
    accepted: 0,
    startTime: Date.now()
};

const generatePayload = () => {
    const rand = Math.random();
    const deviceId = DEVICES[Math.floor(Math.random() * DEVICES.length)];
    const basePayload = {
        device_id: deviceId,
        timestamp: new Date().toISOString()
    };

    // Case 1: Bad Data (Missing Temp)
    if (rand < SCENARIOS.BAD_DATA) {
        return {
            ...basePayload,
            humidity: 50 // Missing temperature!
        };
    }

    // Case 2: High Temp Alert
    if (rand < SCENARIOS.BAD_DATA + SCENARIOS.HIGH_TEMP) {
        return {
            ...basePayload,
            temperature: 80 + Math.random() * 20, // >100C is dangerous
            humidity: 10
        };
    }

    // Case 3: Normal
    return {
        ...basePayload,
        temperature: 20 + Math.random() * 10,
        humidity: 40 + Math.random() * 30
    };
};

const sendRequest = async () => {
    const payload = generatePayload();
    try {
        const start = Date.now();
        await axios.post(API_URL, payload);
        const duration = Date.now() - start;

        stats.sent++;
        stats.accepted++;

        // Visual feedback for slow requests
        if (duration > 200) process.stdout.write('⚠️ ');

    } catch (error: any) {
        stats.sent++;
        stats.failed++;
        // Expected failure for Bad Data
        const p = payload as any;
        if (!p.temperature && error.response?.status === 400) {
            // Correct rejection, this is good!
            // process.stdout.write('🛡️ ');
        } else {
            // Check for connection errors
            if (error.code === 'ECONNREFUSED') {
                process.stdout.write('❌ (Connection Refused) ');
            } else {
                process.stdout.write(`❌ (${error.message}) `);
            }
        }
    }
};

const startSimulation = async () => {
    console.log(`
🚀 STARTING ADVANCED TRAFFIC SIMULATION
---------------------------------------
🎯 Target: ${API_URL}
📱 Devices: ${TOTAL_DEVICES}
⚡ Rate: Adaptive (Aiming for 50 req/sec)
---------------------------------------
`);

    const interval = setInterval(async () => {
        // High frequency traffic: 20 req/sec
        sendRequest();

        // Log stats every 100 requests to avoid spamming console
        if (stats.sent % 100 === 0 && stats.sent > 0) {
            const elapsed = (Date.now() - stats.startTime) / 1000;
            const rps = (stats.sent / elapsed).toFixed(2);
            process.stdout.write(`\n📊 Status: ${stats.sent} sent | ${stats.accepted} accepted | ${stats.failed} rejected | ${rps} req/sec `);
        }
    }, 50); // 50ms = 20 req/sec

    // Stop after 1 hour
    setTimeout(() => {
        clearInterval(interval);
        console.log('\n✅ Simulation Complete.');
        console.log(stats);
    }, 3600000);
};

startSimulation();
