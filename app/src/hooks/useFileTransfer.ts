import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocketContext } from '../contexts/SocketContext'
import { chunkFile, CHUNK_SIZE } from '../lib/chunker'

export interface Transfer {
  id: string
  name: string
  size: number
  direction: 'sending' | 'receiving'
  progress: number
  status: 'active' | 'done' | 'error'
}

interface PendingReceive {
  name: string
  mimeType: string
  totalChunks: number
  chunks: Map<number, ArrayBuffer>
  received: number
}

export function useFileTransfer() {
  const { socket } = useSocketContext()
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const pendingRef = useRef<Map<string, PendingReceive>>(new Map())

  const addTransfer = useCallback((t: Transfer) => {
    setTransfers(prev => [...prev, t])
  }, [])

  const updateTransfer = useCallback((id: string, updates: Partial<Transfer>) => {
    setTransfers(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  useEffect(() => {
    if (!socket) return

    const onStart = ({
      transfer_id, name, size, mime_type, total_chunks,
    }: { transfer_id: string; name: string; size: number; mime_type: string; total_chunks: number }) => {
      pendingRef.current.set(transfer_id, {
        name, mimeType: mime_type, totalChunks: total_chunks,
        chunks: new Map(), received: 0,
      })
      addTransfer({ id: transfer_id, name, size, direction: 'receiving', progress: 0, status: 'active' })
    }

    const onChunk = ({
      transfer_id, chunk_index, data,
    }: { transfer_id: string; chunk_index: number; data: ArrayBuffer }) => {
      const p = pendingRef.current.get(transfer_id)
      if (!p) return
      p.chunks.set(chunk_index, data)
      p.received++
      updateTransfer(transfer_id, { progress: Math.round((p.received / p.totalChunks) * 100) })
    }

    const onEnd = ({ transfer_id }: { transfer_id: string }) => {
      const p = pendingRef.current.get(transfer_id)
      if (!p) return
      const parts: ArrayBuffer[] = []
      for (let i = 0; i < p.totalChunks; i++) {
        const chunk = p.chunks.get(i)
        if (chunk) parts.push(chunk)
      }
      triggerDownload(new Blob(parts, { type: p.mimeType }), p.name)
      pendingRef.current.delete(transfer_id)
      updateTransfer(transfer_id, { progress: 100, status: 'done' })
    }

    socket.on('file_start', onStart)
    socket.on('file_chunk', onChunk)
    socket.on('file_end', onEnd)
    return () => {
      socket.off('file_start', onStart)
      socket.off('file_chunk', onChunk)
      socket.off('file_end', onEnd)
    }
  }, [socket, addTransfer, updateTransfer])

  const sendFiles = useCallback(async (files: FileList | File[]) => {
    if (!socket) return
    for (const file of Array.from(files)) {
      const id = crypto.randomUUID()
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE) || 1
      addTransfer({ id, name: file.name, size: file.size, direction: 'sending', progress: 0, status: 'active' })
      socket.emit('file_start', {
        transfer_id: id,
        name: file.name,
        size: file.size,
        mime_type: file.type || 'application/octet-stream',
        total_chunks: totalChunks,
      })
      let sent = 0
      for await (const { index, data } of chunkFile(file)) {
        socket.emit('file_chunk', { transfer_id: id, chunk_index: index, data })
        sent++
        updateTransfer(id, { progress: Math.round((sent / totalChunks) * 100) })
        // Yield to event loop every 50 chunks to keep UI responsive
        if (sent % 50 === 0) await new Promise<void>(resolve => setTimeout(resolve, 0))
      }
      socket.emit('file_end', { transfer_id: id })
      updateTransfer(id, { progress: 100, status: 'done' })
    }
  }, [socket, addTransfer, updateTransfer])

  return { transfers, sendFiles }
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
