/**
 * @description      :
 * @author           :
 * @group            :
 * @created          : 28/01/2024 - 07:58:20
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 28/01/2024
 * - Author          :
 * - Modification    :
 **/
import express, { Application } from 'express'
import path from 'path'
import routes from './Routes/index'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'cookie-session'
import 'colors'

const app: Application = express()

app.use(cors())
app.use(morgan('dev'))

app.use(cookieParser())

app.use(express.json({ limit: '10kb' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  session({
    secret: 'MEDONMA',
  }),
)

app.use(routes)

app.use(express.static(path.join(__dirname, 'public')))
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

export default app
