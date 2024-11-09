import { Router } from 'express'
import crypto from 'node:crypto'
import { validateMovie, validateForMovieUpdate } from '../schemas/movieSchema.js'

import readJSON from '../utils/filereader.js'
const movies = readJSON('../movies.json')

export const moviesRouter = Router()

// get all movies
moviesRouter.get('/', (req, res) => {
	const { genre } = req.query
	if (genre) {
		const filteredMovies = movies.filter((movie) => movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase()))
		return res.json(filteredMovies)
	}
	res.json(movies)
})

// get movie by id
moviesRouter.get('/:id', (req, res) => {
	const idParam = req.params.id
	const movie = movies.find((movie) => movie.id === idParam)
	if (movie === undefined) {
		res.status(404).send('Movie not found')
		return
	}
	res.json(movie)
})

// PARA POSTEAR: un recurso totalmente nuevo
moviesRouter.post('/', (req, res) => {
	const result = validateMovie(req.body)
	if (result.success === false) {
		return res.status(400).json(result.error)
	}

	// el registro en la bd
	const newMovie = {
		id: crypto.randomUUID(),
		...result.data,
	}

	movies.push(newMovie)
	res.status(201).json(newMovie)
})

// PARA PATCH-update
moviesRouter.patch('/:id', (req, res) => {
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
moviesRouter.delete('/:id', (req, res) => {
	const { id } = req.params
	const movieIx = movies.findIndex((movie) => movie.id === id)
	if (movieIx === -1) {
		res.status(404).send('Movie not found')
		return
	}
	movies.splice(movieIx, 1)
	res.send('Movie deleted')
})
