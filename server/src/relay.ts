import type { Server } from 'socket.io'

const RELAY_EVENTS = ['file_start', 'file_chunk', 'file_end', 'transfer_ack', 'clipboard_sync'] as const

export function registerRelay(io: Server) {
  io.on('connection', (socket) => {
    socket.on('join_room', ({ room_id, device_type }: { room_id: string; device_type: string }) => {
      socket.join(room_id)
      socket.data.roomId = room_id

      const room = io.sockets.adapter.rooms.get(room_id)
      socket.emit('room_status', { peer_connected: room ? room.size > 1 : false })
      socket.to(room_id).emit('peer_joined', { device_type })
    })

    for (const event of RELAY_EVENTS) {
      socket.on(event, (data: unknown) => {
        if (socket.data.roomId) {
          socket.to(socket.data.roomId).emit(event, data)
        }
      })
    }

    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('peer_left', {})
      }
    })
  })
}
