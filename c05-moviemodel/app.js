import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { moviesRouter } from './routes/movies.js'

const app = express()
app.disable('x-powered-by')

// ----------------------------
app.use(json())
app.use(corsMiddleware())
app.use('/movies', moviesRouter)

// SERVIDOR ESCUCHANDO
// -------------------------------------------------------
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
