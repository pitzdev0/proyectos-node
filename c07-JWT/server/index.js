import express from 'express'
import { JWT_SECRET, PORT } from './config.js'
import jwt from 'jsonwebtoken'
import { UserRepository } from './user-repository.js'
import cookieParser from 'cookie-parser'

const app = express()

/* middlewares */
app.disable('x-powered-by')
app.use(express.json())
app.use(cookieParser())

// custom middleware para manejar el auth
app.use((req, res, next) => {
	const token = req.cookies.access_token
	let data = null
	req.session = { user: null } //<-- añade una propiedad a req

	try {
		data = jwt.verify(token, JWT_SECRET)
		req.session.user = data //<-- poblamos nueva propiedad
	} catch (error) {
		console.log(error)
	}

	next() // <- al siguiente paso
})

// configurar sistema de plantillas
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
	const { user } = req.session
	res.render('../views/example', user)
})

/* endpoints  */
app.post('/login', async (req, res) => {
	const { username, password } = req.body

	try {
		const user = await UserRepository.login({ username, password })

		// JWT el secret de entorno + expiracion
		const jwtToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' })

		// TAREA PARA INVESTIGAR
		// const refreshToken = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
		// 	expiresIn: '7d'
		// })

		res
			.cookie('access_token', jwtToken, {
				httpOnly: true, // solo se puede acceder desde server
				secure: process.env.NODE_ENV === 'production', // boolean, para https
				sameSite: 'strict', // solo desde el mismo dominio
				maxAge: 60 * 60 * 1000
			})
			.json(user)
	} catch (error) {
		res.status(400).send(error.message)
	}
})

app.post('/register', async (req, res) => {
	const { username, password } = req.body

	try {
		const id = await UserRepository.create({ username, password })
		res.json({ id })
	} catch (error) {
		// no es buena practica enviar el response del repository
		// no enviar demasiada informacion
		res.status(400).send(error.message)
	}
})

app.post('/logout', (req, res) => {
	res.clearCookie('access_token').json({ message: 'Logout success' }).redirect('/')
})

// endpoints protegidos
app.post('/protected', (req, res) => {
	const { user } = req.session
	if (!user) return res.status(401).send('Unauthorized')
	res.render('protected', user) // <-- payload del token
})

/* habilitar REST APIS  */
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
