import express from 'express'
import logger from 'morgan'

import { Server } from 'socket.io'
import { createServer } from 'node:http' // para poder crear servidores http

const PORT = process.env.PORT ?? 5500
process.loadEnvFile('./server/.env.local')

/* turso data base */
import { createClient } from '@libsql/client'

const turso = createClient({
	url: process.env.TURSO_DB_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
})

await turso.execute(`CREATE TABLE IF NOT EXISTS messages 
	(id INTEGER PRIMARY KEY AUTOINCREMENT, 
	messageContent TEXT,
	username TEXT
	) `)
/* ----------------- */

const app = express()
const server = createServer(app)
const io = new Server(server, {
	connectionStateRecovery: {},
})

io.on('connection', async (socket) => {
	console.log('Un cliente se ha conectado')

	socket.on('disconnect', () => {
		console.log('Un cliente se ha desconectado')
	})

	// el nombre del evento y la accion
	socket.on('chat message', async (msg) => {
		let result
		//	la forma de comunicar con la BD en (:myMessage) para evitar SQL Injection
		const username = socket.handshake.auth.username ?? 'Anon'
		try {
			result = await turso.execute({
				sql: 'INSERT INTO messages (messageContent, username) VALUES (:myMessage, :userName)',
				args: { myMessage: msg, userName: username },
			})
		} catch (error) {
			console.log(error)
			return
		}

		// se puede refactorizar en objetos para mas eficiencia
		io.emit('chat message', msg, result.lastInsertRowid.toString(), username)
	})

	if (!socket.recovered) {
		// no pudimos recuperar los mensajes
		try {
			const results = await turso.execute({
				sql: 'SELECT id, messageContent, username FROM messages WHERE id > ?',
				args: [socket.handshake.auth.serverOffset ?? 0],
			})

			results.rows.forEach((el) => {
				socket.emit('chat message', el.messageContent, el.id.toString())
			})
		} catch (error) {
			console.log(error)
		}
	}
})

app.use(logger('dev'))

app.get('/', (req, res) => {
	res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(PORT, () => {
	console.log('Server running on http://localhost:' + PORT)
})
