import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new Schema({
	username: String,
	email: String,
	password: String
})

userSchema.methods.encryptPassword = async (password) => {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(password, salt)
}

userSchema.methods.validatePassword = async function (password) {
	return await bcrypt.compare(password, this.password)
}

const userModel = model('User', userSchema)

export default userModel
