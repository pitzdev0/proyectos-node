import z from 'zod'

const movieSchema = z.object({
	title: z.string({ required_error: 'El título es obligatorio' }).min(2).max(25),
	year: z.number().int().min(1900).max(2024),
	director: z.string({ required_error: 'El director es obligatorio' }),
	duration: z.number().int().min(0).max(300),
	poster: z.string().url(),
	genre: z.array(z.enum(['Action', 'Crime', 'Drama', 'Sci-Fi', 'Policial', 'Adventure', 'Fantasy'])),
	rate: z.number().min(0).max(10),
})

// los valores pueden ser por default, lo q quiere decir q su envio seria opcional

export function validateMovie(movie) {
	return movieSchema.safeParse(movie)
} // safeParse() retorna un objeto resolve y un error

export function validateForMovieUpdate(movie) {
	return movieSchema.partial().safeParse(movie)
}
