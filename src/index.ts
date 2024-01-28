/**
 * @description      : Index
 * @author           : Sabiya Abraham
 * @group            : Team MEDONMA
 * @created          : 27/01/2024 - 14:29:41
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 27/01/2024
 * - Author          : Sabiya Abraham
 * - Modification    :
 **/
import dotenv from 'dotenv'
import axios from 'axios'
import http from 'http'
import path from 'path'
import { Server } from 'socket.io'
import 'colors'

import { User } from './Models'
import app from './server'

const envPath = path.join(__dirname, '..', 'config.env')
dotenv.config({ path: envPath })

require('./lib/account')
require('@ajayos/nodelog')

const server: http.Server = http.createServer(app)

const io: Server = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
  },
})

const port: number = Number(process.env.PORT) || 3001

server.listen(port, async () => {
  console.log(`App running on port = ${port} ...`.bgBlue.white)

  try {
    // Fetch public IP using an external service
    const {
      data: { ip },
    } = await axios.get('https://api64.ipify.org?format=json')
    console.log(`Public IP Address: ${ip}`)
  } catch (err: any) {
    console.error('Error fetching public IP:', err.message)
  }
})

process.on('uncaughtException', (err) => {
  console.log(err)
  console.log('UNCAUGHT Exception! Shutting down ...')
  // run npm start
  process.exit(1) // Exit Code 1 indicates that a container shut down, either because of an application failure.
})

process.on('unhandledRejection', (err) => {
  console.log(err)
  console.log('UNHANDLED REJECTION! Shutting down ...')
  server.close(() => {
    process.exit(1) // Exit Code 1 indicates that a container shut down, either because of an application failure.
  })
})
