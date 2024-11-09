import express from 'express'
import router from './controllers/authController.js'

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // entender datos de formularios
app.use(router)

export default app
