import env from 'env-var';

const nodeEnv = env.get('NODE_ENV').required().default('local').asString();
const expressPort = env.get('EXPRESS_PORT').default(9000).asPortNumber();

export { nodeEnv, expressPort};
