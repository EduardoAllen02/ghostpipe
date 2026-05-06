import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import path from 'path'
import { registerRelay } from './relay'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  maxHttpBufferSize: 10 * 1024 * 1024, // 10 MB — well above 64 KB chunk size
  pingTimeout: 60000,
  pingInterval: 25000,
})

const DIST = path.join(__dirname, '../../app/dist')
app.use(express.static(DIST))
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }))
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))

registerRelay(io)

const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`GhostPipe relay listening on :${PORT}`)
})
