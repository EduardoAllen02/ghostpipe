import { useSocketContext, type PeerState } from '../contexts/SocketContext'

const LABELS: Record<PeerState, string> = {
  disconnected: 'Disconnected',
  server_connected: 'Connected — waiting for peer',
  peer_online: 'Peer online',
}

const DOT_COLORS: Record<PeerState, string> = {
  disconnected: 'bg-red-500',
  server_connected: 'bg-amber-400 animate-pulse',
  peer_online: 'bg-emerald-400',
}

export function ConnectionStatus() {
  const { peerState } = useSocketContext()
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[peerState]}`} />
      <span className="text-xs text-gray-400">{LABELS[peerState]}</span>
    </div>
  )
}
