import cors from 'cors'

const ACCEPTED_ORIGINS = [
	'http://localhost:8080',
	'https://localhost:8080',
	'http://localhost:1234',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	'http://localhost:5000',
]

export const corsMiddleware = () =>
	cors({
		origin: ACCEPTED_ORIGINS,
	})
