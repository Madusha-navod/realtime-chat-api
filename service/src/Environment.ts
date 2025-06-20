import env from 'env-var';

const nodeEnv = env.get('NODE_ENV').required().default('local').asString();
const expressPort = env.get('EXPRESS_PORT').default(9000).asPortNumber();

const dbHost = env.get('DB_HOST').default('localhost').asString();
const dbPort = env.get('DB_PORT').default(3306).asPortNumber();
const dbUsername = env.get('DB_USERNAME').default('root').asString();
const dbPassword = env.get('DB_PASSWORD').default('').asString();
const dbName = env.get('DB_NAME').default('chat').asString();

export { nodeEnv, expressPort, dbHost, dbPort, dbUsername, dbPassword, dbName };
