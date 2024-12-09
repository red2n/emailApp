// FILEPATH: /home/navin/emailApp/apps/orbitHub/src/appLogger.ts
import fastify from "fastify";

/**
 * The `AppLogger` class provides a singleton logger instance for the application using Fastify.
 * This class cannot be instantiated directly.
 */
class AppLogger {
    /**
     * Private constructor to prevent instantiation.
     * @throws {Error} Throws an error if an attempt is made to create an instance of this class.
     */
    constructor() {
        throw new Error('Cannot create an instance of this class');
    }

    /**
     * Holds the Fastify instance for logging.
     * @private
     */
    private static fastifyInstance: fastify.FastifyInstance | null = null;

    /**
     * Formats the service name by adding spaces before capital letters and trimming the result.
     * @param serviceName - The name of the service to format.
     * @returns The formatted service name.
     * @private
     */
    private static formatServiceName(serviceName: string): string {
        return serviceName.replace(/([A-Z])/g, ' $1').trim();
    }

    /**
     * Returns a singleton Fastify logger instance configured with the specified service name.
     * If the logger instance does not already exist, it is created and configured.
     * @param SERVICE_NAME - The name of the service for which the logger is being created.
     * @returns The Fastify logger instance.
     */
    public static getLogger(SERVICE_NAME: string): fastify.FastifyInstance {
        if (!AppLogger.fastifyInstance) {
            const formattedServiceName = AppLogger.formatServiceName(SERVICE_NAME);
            AppLogger.fastifyInstance = fastify({
                logger: {
                    transport: {
                        target: 'pino-pretty',
                        options: {
                            colorize: true,
                            translateTime: 'yyyy-MM-dd HH:MM:ss:tt',
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