const fastify = require("fastify")({ logger: true });
const bme280 = require("bme280");
const config = require("../config.json");

const round = num => {
    return +(Math.round(num + "e+2") + "e-2");
}

fastify.get("/", async (request, reply) => {
    try {
        const sensor = await bme280.open({ i2cAddress: parseInt(config.bmeAddress, 16) });
        const data = await sensor.read();
        await sensor.close();
        data.temperature = round(data.temperature);
        data.humidity = round(data.humidity);
        data.pressure = round(data.pressure);
        return { status: 200, data };
    }
    catch (err) {
        fastify.log.error(err);
        reply.code(500);
        return {
            "message": "Error processing request", status: 500, error: err, data: {
                temperature: "0",
                humidity: "0",
                pressure: "0",
            }
        }
    }
});


const start = async () => {
    try {
        await fastify.listen({ port: config.port, host: config.listenAddress });
        console.log(`Application Online on ${config.listenAddress}:${config.port}/`);

    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
