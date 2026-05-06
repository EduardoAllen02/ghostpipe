import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { io, type Socket } from 'socket.io-client'

// Empty string = same origin (works in production + via Vite proxy in dev)
// Set VITE_SERVER_URL when building the APK
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? ''
const ROOM_KEY = 'ghostpipe_room_id'

function getOrCreateRoomId(): string {
  let id = localStorage.getItem(ROOM_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ROOM_KEY, id)
  }
  return id
}

export type PeerState = 'disconnected' | 'server_connected' | 'peer_online'

interface SocketContextValue {
  socket: Socket | null
  peerState: PeerState
  roomId: string
  setRoomId: (id: string) => void
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  peerState: 'disconnected',
  roomId: '',
  setRoomId: () => {},
})

function detectDeviceType(): 'pc' | 'mobile' {
  return /Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobile' : 'pc'
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomIdState] = useState(getOrCreateRoomId)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [peerState, setPeerState] = useState<PeerState>('disconnected')

  const setRoomId = (id: string) => {
    localStorage.setItem(ROOM_KEY, id)
    setRoomIdState(id)
  }

  useEffect(() => {
    const s = io(SERVER_URL, {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    })

    s.on('connect', () => {
      setPeerState('server_connected')
      s.emit('join_room', { room_id: roomId, device_type: detectDeviceType() })
    })
    s.on('room_status', ({ peer_connected }: { peer_connected: boolean }) => {
      setPeerState(peer_connected ? 'peer_online' : 'server_connected')
    })
    s.on('peer_joined', () => setPeerState('peer_online'))
    s.on('peer_left', () => setPeerState('server_connected'))
    s.on('disconnect', () => setPeerState('disconnected'))

    setSocket(s)
    return () => {
      s.disconnect()
    }
  }, [roomId])

  return (
    <SocketContext.Provider value={{ socket, peerState, roomId, setRoomId }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocketContext = () => useContext(SocketContext)
