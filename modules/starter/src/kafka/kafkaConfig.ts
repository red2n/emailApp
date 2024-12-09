/**
 * Configuration settings for Kafka.
 * 
 * @typedef {Object} KafkaConfig
 * @property {string} clientId - The client ID for the Kafka client.
 * @property {string[]} brokers - An array of broker addresses.
 * @property {string} groupId - The group ID for the Kafka consumer group.
 */
export type KafkaConfig =
    { clientId: string; brokers: string[]; groupId: string }