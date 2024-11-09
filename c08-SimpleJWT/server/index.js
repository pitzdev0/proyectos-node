import app from './app.js'
import './database.js'

async function init() {
	const PORT = 3000
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`)
	})
}

init()
