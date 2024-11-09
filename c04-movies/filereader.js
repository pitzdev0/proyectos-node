//import movies from './movies.json' with { type: 'json' } // esto no es valida en ESModules y genera problemas || with es experimental

// metodo (1) con fs
// import fs from 'node:fs'
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'))

// metodo (2)
// utilizando el metodo require nativo de NodeJS
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const movies = require('./movies.json')

export default movies
