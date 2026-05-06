import type { Transfer } from '../hooks/useFileTransfer'

function fmt(bytes: number): string {
  if (bytes === 0) return '0 B'
  const u = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), u.length - 1)
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${u[i]}`
}

export function TransferList({ transfers }: { transfers: Transfer[] }) {
  if (!transfers.length) return null
  return (
    <div className="flex flex-col gap-2 mt-1">
      <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Recent</p>
      {[...transfers].reverse().map(t => (
        <div key={t.id} className="bg-[#10101a] border border-[#1e1e30] rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-gray-200 truncate">{t.name}</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500">{fmt(t.size)}</span>
              <span className={`text-xs font-bold ${t.direction === 'sending' ? 'text-violet-400' : 'text-cyan-400'}`}>
                {t.direction === 'sending' ? '↑' : '↓'}
              </span>
            </div>
          </div>
          {t.status === 'active' ? (
            <div className="w-full bg-[#1e1e30] rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${t.direction === 'sending' ? 'bg-violet-500' : 'bg-cyan-500'}`}
                style={{ width: `${t.progress}%` }}
              />
            </div>
          ) : (
            <span className="text-[11px] text-emerald-400 font-medium">✓ Done</span>
          )}
        </div>
      ))}
    </div>
  )
}
