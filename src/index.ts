import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import hpp from 'hpp'
import { createServer } from 'http'
import router from '@/router'
import errorHandler from '@/middlewares/errorHandler'
import * as authentication from '@/utils/authentication'
import * as database from '@/utils/database'
import * as websocket from '@/utils/websocket'

authentication.initialize()

const app = express()

app.use(helmet())

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    allowedHeaders: ['accept', 'content-type', 'x-csrf-token'],
    credentials: true,
  })
)

app.use(cookieParser())

app.use(express.json())

app.use(hpp())

app.set('trust proxy', 1) // troubleshoot proxy issue on rate limit

app.use('/', router)

app.use(errorHandler)

const server = createServer(app)

websocket.connect(server)

const port = process.env.APP_PORT ?? 3000

database
  .connect()
  .then(() =>
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    )
  )
