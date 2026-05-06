import { useState } from 'react'
import { useSocketContext } from '../contexts/SocketContext'

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { roomId, setRoomId } = useSocketContext()
  const [draft, setDraft] = useState(roomId)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== roomId) setRoomId(trimmed)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-[#10101a] border border-[#1e1e30] rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-gray-100 mb-1">Settings</h2>
        <p className="text-xs text-gray-500 mb-5">
          Both devices must share the same Room ID to connect. Copy it to the other device once — it persists automatically.
        </p>

        <label className="block text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-2">
          Room ID
        </label>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            spellCheck={false}
            className="flex-1 bg-[#08080d] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 text-xs border border-[#2a2a3a] rounded-lg text-gray-400 hover:text-white hover:border-[#3a3a50] transition-colors shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors font-medium"
          >
            Save & reconnect
          </button>
        </div>
      </div>
    </div>
  )
}
