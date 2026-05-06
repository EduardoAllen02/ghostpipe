import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react'
import { useSocketContext } from '../contexts/SocketContext'

interface Props {
  onFiles: (files: FileList | File[]) => void
}

export function FileDropZone({ onFiles }: Props) {
  const { peerState } = useSocketContext()
  const [dragging, setDragging] = useState(false)
  const disabled = peerState !== 'peer_online'

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
  }, [disabled, onFiles])

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setDragging(true)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFiles(e.target.files)
      e.target.value = ''
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      className={[
        'relative border-2 border-dashed rounded-xl p-10 text-center transition-all',
        dragging
          ? 'border-violet-400 bg-violet-500/10'
          : disabled
          ? 'border-[#1e1e30] opacity-40 cursor-not-allowed'
          : 'border-[#2a2a3a] hover:border-violet-500/60 hover:bg-violet-500/5 cursor-pointer',
      ].join(' ')}
    >
      <input
        type="file"
        multiple
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 disabled:cursor-not-allowed cursor-pointer"
      />
      <div className="pointer-events-none flex flex-col items-center gap-3">
        <svg
          className={`w-10 h-10 ${disabled ? 'text-gray-700' : 'text-gray-500'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className={`text-sm font-medium ${disabled ? 'text-gray-600' : 'text-gray-300'}`}>
          {disabled ? 'Waiting for peer…' : 'Drop files here or click to select'}
        </p>
        {!disabled && <p className="text-xs text-gray-600">Any file type · Any size</p>}
      </div>
    </div>
  )
}
