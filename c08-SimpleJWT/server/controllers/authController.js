/* CONTROLA LA INTERACCION CON LA BD */

import { Router } from 'express'
import userModel from '../models/user.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

const router = Router()

// ------------------------------------------------
router.post('/signup', async (req, res) => {
	const { username, email, password } = req.body

	const newUser = new userModel({ username, email, password })
	newUser.password = await newUser.encryptPassword(newUser.password)
	await newUser.save()

	// JWT el secret de entorno + expiracion
	const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' })

	console.log({ auth: true, token })

	res.json({ message: 'User created' })
})

// ------------------------------------------------
router.get('/dashboard', async (req, res) => {
	const token = req.headers['x-access-token']

	if (!token) return res.status(401).json({ auth: false, message: 'no token provided' })

	const decoded = jwt.verify(token, JWT_SECRET)
	const user = await userModel.findById(decoded.id, { password: 0 })

	if (!user) return res.status(404).json({ auth: false, message: 'User not found' })

	res.json(user)
})

// ------------------------------------------------
router.post('/signin', async (req, res) => {
	const { email, password } = req.body

	const user = await userModel.findOne({ email })
	if (!user) return res.status(404).json({ message: 'User not found' })

	const passwordMatch = await user.validatePassword(password)
	if (!passwordMatch) return res.status(401).json({ autuh: false, token: null })

	const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' })
	res.json({ auth: true, token })
})

export default router
