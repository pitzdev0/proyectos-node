import dbLocal from 'db-local'
import crypto from 'crypto'
import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from './config.js'

const { Schema } = new dbLocal({ path: './db' })

// esto es como crear la tabla con los campos
const User = Schema('User', {
	_id: { type: String, required: true },
	username: { type: String, required: true },
	password: { type: String, required: true }
})
export class UserRepository {
	// CUANDO LOS METODOS SON STATICOS NO ES NECESARIO INSTANCIARLOS CON "NEW CREATE, LOGIN, ETC"

	static async create({ username, password }) {
		//validacion input (zod, yup)
		validation.username(username)
		validation.password(password)

		// si la BD no genera, podemos hacerlo nosotros.
		// el random UUID es malo para la indexacion de datos en la mayoria de BD
		const id = crypto.randomUUID()

		// 10 es el nivel de seguridad (salt)
		// hashSync bloquea el hilo de ejecucion
		const hashedPwd = await bcrypt.hash(password, SALT_ROUNDS)

		// no es asincrono xq esta en el sistema de archivos
		User.create({ _id: id, username, password: hashedPwd }).save()

		return id
	}
	static async login({ username, password }) {
		validation.username(username)
		validation.password(password)

		const user = User.findOne({ username })
		if (!user) throw new Error('User not found')

		// se encripta la contraseña ingresada para comparar el resultado a ver si es igual
		const isValid = await bcrypt.compare(password, user.password)
		if (!isValid) throw new Error('Invalid password')

		// las mejores practicas indican que construyamos un nuevo objeto sin password
		// si cambia algo en el futuro, podria colarse una variable q no queremos
		const { password: _, ...userData } = user
		return userData
	}
}

class validation {
	static username = (username) => {
		if (typeof username !== 'string') {
			throw new Error('username must be string')
		}
		if (username.length < 2 || username.length > 25) {
			throw new Error('username must be between 2 and 25 characters')
		}
	}
	static password = (password) => {
		if (password.length <= 5 || password.length > 25) {
			throw new Error('password must be between 8 and 25 characters')
		}
	}
}
