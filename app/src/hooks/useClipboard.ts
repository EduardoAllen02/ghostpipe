import { useEffect, useState, useCallback, useRef } from 'react'
import { useSocketContext } from '../contexts/SocketContext'

export function useClipboard() {
  const { socket } = useSocketContext()
  const [text, setText] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ignoreNextRef = useRef(false)
  const lastTsRef = useRef(0)

  useEffect(() => {
    if (!socket) return
    const onSync = ({ text: incoming, timestamp }: { text: string; timestamp: number }) => {
      if (timestamp > lastTsRef.current) {
        lastTsRef.current = timestamp
        ignoreNextRef.current = true
        setText(incoming)
      }
    }
    socket.on('clipboard_sync', onSync)
    return () => { socket.off('clipboard_sync', onSync) }
  }, [socket])

  const handleChange = useCallback((value: string) => {
    if (ignoreNextRef.current) {
      ignoreNextRef.current = false
      setText(value)
      return
    }
    setText(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const ts = Date.now()
      lastTsRef.current = ts
      socket?.emit('clipboard_sync', { text: value, timestamp: ts })
    }, 400)
  }, [socket])

  const copyToSystem = useCallback(() => {
    if (text) navigator.clipboard.writeText(text).catch(() => {})
  }, [text])

  return { text, handleChange, copyToSystem }
}
