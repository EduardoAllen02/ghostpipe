import { useClipboard } from '../hooks/useClipboard'
import { useSocketContext } from '../contexts/SocketContext'

export function ClipboardBox() {
  const { peerState } = useSocketContext()
  const { text, handleChange, copyToSystem } = useClipboard()
  const disabled = peerState !== 'peer_online'

  return (
    <div className="flex flex-col gap-3 flex-1">
      <textarea
        value={text}
        onChange={e => handleChange(e.target.value)}
        disabled={disabled}
        placeholder={disabled ? 'Waiting for peer…' : 'Paste or type — syncs automatically'}
        className={[
          'flex-1 min-h-[280px] bg-[#10101a] border border-[#1e1e30] rounded-xl p-4',
          'text-sm text-gray-200 placeholder-gray-600 resize-none font-mono leading-relaxed',
          'focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
          'transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        ].join(' ')}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">{text.length > 0 ? `${text.length} chars` : ''}</span>
        <button
          onClick={copyToSystem}
          disabled={!text}
          className="text-xs text-gray-400 hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 border border-[#1e1e30] rounded-lg hover:border-[#2a2a40]"
        >
          Copy to clipboard
        </button>
      </div>
    </div>
  )
}
