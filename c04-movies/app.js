import express, { json } from 'express'
import crypto from 'node:crypto'
import movies from './filereader.js'
import cors from 'cors'

import { validateMovie, validateForMovieUpdate } from './schemas/movieSchema.js'

const app = express()
app.use(json()) // ---> para poder postear datos en la api, necesitamos el middleware json

app.disable('x-powered-by')

const ACCEPTED_ORIGINS = [
	'http://localhost:8080',
	'https://localhost:8080',
	'http://localhost:1234',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	'http://localhost:5000',
]

// OPCION 1 PARA MANEJO DE CORS : a traves de las opciones con funcion callback
// ----------------------------
// const corsOptions = {
// 	origin: (origin, callback) => {
// 		if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
// 			callback(null, true)
// 		} else {
// 			callback(new Error('Not allowed by CORS'))
// 		}
// 	},
// }

// app.use(cors(corsOptions))

// OPCION 2 PARA MANEJO DE CORS: mas limpio agregando directo a la configuracion
// ----------------------------
app.use(cors({ origin: ACCEPTED_ORIGINS }))

// get all movies
app.get('/movies', (req, res) => {
	// 	res.header('Access-Control-Allow-Origin', '*') // esto permite que desde cualquier lugar pueda acceder a la api

	// 	manejando cors con una lista de origins permitidos o si no existe
	// 	esta es la forma sin el middleware de CORS
	// const origin = req.headers.origin
	// if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
	// 	res.header('Access-Control-Allow-Origin', origin)
	// }

	const { genre } = req.query
	if (genre) {
		// const filteredMovies = movies.filter((movie) => movie.genre.includes(genre))
		const filteredMovies = movies.filter((movie) => movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()))
		return res.json(filteredMovies)
	}
	res.json(movies)
})

// get movie by id
app.get('/movies/:id', (req, res) => {
	const idParam = req.params.id
	const movie = movies.find((movie) => movie.id === idParam)
	if (movie === undefined) {
		res.status(404).send('Movie not found')
		return
	}
	res.json(movie)
})

// PARA POSTEAR: un recurso totalmente nuevo
// -------------------------------------------------------
app.post('/movies', (req, res) => {
	const { title, year, director, duration, poster, genre, rate } = req.body

	// AQUI ES DONDE ESTARIA EL ENVIO A LA BASE DE DATOS

	const result = validateMovie(req.body)
	if (result.success === false) {
		return res.status(400).json(result.error)
	}

	// aqui llega la informacion ya parseada y validada
	const newMovie = {
		id: crypto.randomUUID(), // genera un id aleatorio con una libreria nativa de express
		...result.data, // importante no usar req.body para evitar inyecciones
		// title,
		// year,
		// director,
		// duration,
		// poster,
		// genre,
		// rate,
	}

	movies.push(newMovie)
	res.status(201).json(newMovie) // aqui tu decides qué devolver
})

// PARA PATCH
// -------------------------------------------------------
app.patch('/movies/:id', (req, res) => {
	const result = validateForMovieUpdate(req.body)

	if (!result.success) {
		return res.status(400).json(result.error)
	}

	const { id } = req.params
	const movieIx = movies.findIndex((movie) => movie.id === id)
	if (movieIx === -1) {
		res.status(404).send('Movie not found')
		return
	}

	const updatedMovie = {
		...movies[movieIx],
		...result.data,
	}

	movies[movieIx] = updatedMovie
	return res.json(updatedMovie)
})

// PARA DELETE
// -------------------------------------------------------
app.delete('/movies/:id', (req, res) => {
	const { id } = req.params
	const movieIx = movies.findIndex((movie) => movie.id === id)
	if (movieIx === -1) {
		res.status(404).send('Movie not found')
		return
	}
	movies.splice(movieIx, 1)
	res.send('Movie deleted')
})

// SERVIDOR ESCUCHANDO
// -------------------------------------------------------
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
