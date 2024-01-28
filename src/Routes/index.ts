import { Router } from 'express'
import userRouter from './userRoute'
import authRouter from './authRoute'

const router = Router()

router.use('/api/v1/user', userRouter)

router.use('/api/v1/auth', authRouter)

router.get('/test', (req, res) => {
  res.send('Hello World')
})

export default router
