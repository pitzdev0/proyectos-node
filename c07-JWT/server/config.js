process.loadEnvFile('./server/.env.local')

export const { PORT = 5500, SALT_ROUNDS = 10, JWT_SECRET } = process.env
