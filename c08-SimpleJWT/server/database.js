/* SOLO MANEJA LA CONEXION CON LA BD  */

import mongoose from 'mongoose'

const db = mongoose.connect('mongodb://localhost:27017/simplejwt').then(() => console.log('Database connected'))

export default db
