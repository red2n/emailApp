export const getConnectionString = (): string => {
  const connectionString = process.env.MONGO_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error('MONGO_CONNECTION_STRING is not defined in .env file');
  }
  return connectionString;
};