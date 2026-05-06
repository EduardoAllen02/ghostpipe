import { useState } from 'react'
import { SocketProvider } from './contexts/SocketContext'
import { ConnectionStatus } from './components/ConnectionStatus'
import { FileDropZone } from './components/FileDropZone'
import { ClipboardBox } from './components/ClipboardBox'
import { TransferList } from './components/TransferList'
import { SettingsModal } from './components/SettingsModal'
import { useFileTransfer } from './hooks/useFileTransfer'

function PipeApp() {
  const [showSettings, setShowSettings] = useState(false)
  const { transfers, sendFiles } = useFileTransfer()

  return (
    <div className="min-h-screen bg-[#08080d] text-gray-100 flex flex-col select-none">
      {/* Header */}
      <header className="border-b border-[#1a1a28] px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-violet-400 font-semibold tracking-tight">⬡ GhostPipe</span>
        </div>
        <div className="flex items-center gap-5">
          <ConnectionStatus />
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Settings
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 md:divide-x divide-[#1a1a28] overflow-auto">
        {/* Files */}
        <section className="p-6 flex flex-col gap-4">
          <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Files</p>
          <FileDropZone onFiles={sendFiles} />
          <TransferList transfers={transfers} />
        </section>

        {/* Clipboard */}
        <section className="p-6 flex flex-col gap-4 border-t border-[#1a1a28] md:border-t-0">
          <p className="text-[10px] font-semibold tracking-widest text-gray-600 uppercase">Clipboard</p>
          <ClipboardBox />
        </section>
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <SocketProvider>
      <PipeApp />
    </SocketProvider>
  )
}
