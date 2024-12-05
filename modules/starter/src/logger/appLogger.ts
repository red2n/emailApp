// FILEPATH: /home/navin/emailApp/apps/orbitHub/src/appLogger.ts
import fastify from "fastify";

class AppLogger {
    constructor() {
        throw new Error('Cannot create an instance of this class');
    }
    private static fastifyInstance: fastify.FastifyInstance | null = null;

    private static formatServiceName(serviceName: string): string {
        return serviceName.replace(/([A-Z])/g, ' $1').trim();
    }

    public static getLogger(SERVICE_NAME: string): fastify.FastifyInstance {
        if (!AppLogger.fastifyInstance) {
            const formattedServiceName = AppLogger.formatServiceName(SERVICE_NAME);
            AppLogger.fastifyInstance = fastify({
                logger: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: true,
                            ignore: 'pid,hostname',
                            messageFormat: `[${formattedServiceName}] - {msg}`,
                        }
                    }
                }
            });
        }
        return AppLogger.fastifyInstance;
    }
}

export default AppLogger;