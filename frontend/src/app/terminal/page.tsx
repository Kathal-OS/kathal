'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Terminal as TerminalIcon,
  X,
  Maximize2,
  Minimize2,
  Copy,
  Trash2,
  Download,
  Search,
  Filter,
  RefreshCw,
  Send,
  ChevronUp,
  ChevronDown,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

const mockHistory = [
  { type: 'output', content: 'Welcome to Kathal OS Terminal', timestamp: Date.now() - 10000 },
  { type: 'output', content: 'Type \'help\' for available commands', timestamp: Date.now() - 9000 },
  { type: 'prompt', content: 'kathal@server:~$ ', timestamp: Date.now() - 8000 },
  { type: 'input', content: 'help', timestamp: Date.now() - 7000 },
  { type: 'output', content: `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  sysinfo       - Show system information
  containers    - List containers
  images        - List images
  volumes       - List volumes
  networks      - List networks
  logs <name>   - Show container logs
  exec <name>   - Execute command in container
  stats         - Show resource usage
  version       - Show Kathal OS version`, timestamp: Date.now() - 6000 },
  { type: 'prompt', content: 'kathal@server:~$ ', timestamp: Date.now() - 5000 },
]

const commands = {
  help: () => `Available commands:
  help          - Show this help message
  clear         - Clear terminal
  sysinfo       - Show system information
  containers    - List containers
  images        - List images
  volumes       - List volumes
  networks      - List networks
  logs <name>   - Show container logs
  exec <name>   - Execute command in container
  stats         - Show resource usage
  version       - Show Kathal OS version
  history       - Show command history
  exit          - Close terminal`,

  clear: () => '__CLEAR__',

  sysinfo: () => `System Information:
  Hostname: kathal-server-01
  OS: Ubuntu 22.04.3 LTS
  Kernel: 6.5.0-15-generic
  Uptime: 14 days, 6 hours
  CPUs: 16 cores
  Memory: 64 GB (28 GB used)
  Disk: 2 TB (847 GB used)
  Runtime: Docker 24.0.7
  Containerd: 1.7.2
  Kubernetes: v1.28.4`,

  containers: () => `CONTAINER ID   NAME              IMAGE                    STATUS    CPU %    MEM     PORTS
  a1b2c3d4e5f6   nginx-proxy       nginx:alpine             running   2.1%     45MB    80,443
  e5f6g7h8i9j0   postgres-primary  postgres:15              running   5.3%     1.2GB   5432
  k1l2m3n4o5p6   redis-cache       redis:7-alpine           running   0.8%     89MB    6379
  q7r8s9t0u1v2   grafana           grafana/grafana:10.2     running   1.2%     156MB   3000
  w3x4y5z6a7b8   prometheus        prom/prometheus:v2.48    running   3.4%     2.1GB   9090
  c9d0e1f2g3h4   portainer         portainer/portainer-ce:2.21 stopped   0%       0MB     9000`,

  images: () => `REPOSITORY                    TAG         IMAGE ID       SIZE      CREATED
  nginx                         alpine      abc123def456   42MB      2 days ago
  postgres                      15          def456ghi789   412MB     1 week ago
  redis                         7-alpine    ghi789jkl012   33MB      2 weeks ago
  grafana/grafana               10.2        jkl012mno345   287MB     3 days ago
  prom/prometheus               v2.48       mno345pqr678   189MB     1 week ago
  portainer/portainer-ce        2.21        pqr678stu901   215MB     5 days ago`,

  volumes: () => `VOLUME NAME           DRIVER    MOUNTPOINT                                            SIZE      CONTAINERS
  nginx-logs           local     /var/lib/docker/volumes/nginx-logs/_data              156MB     2
  postgres-data        local     /var/lib/docker/volumes/postgres-data/_data           2.4GB     1
  redis-data           local     /var/lib/docker/volumes/redis-data/_data              89MB      1
  grafana-data         local     /var/lib/docker/volumes/grafana-data/_data            234MB     1
  prometheus-data      local     /var/lib/docker/volumes/prometheus-data/_data         4.1GB     1`,

  networks: () => `NETWORK ID     NAME              DRIVER    SCOPE     SUBNET              CONTAINERS
  net-bridge     bridge            bridge    local     172.17.0.0/16       8
  net-host       host              host      local     N/A                 2
  net-none       none              null      local     N/A                 1
  net-web        web-network       bridge    local     172.20.0.0/16       4
  net-db         database-network  bridge    local     172.25.0.0/16       3
  net-mon        monitoring-net    bridge    local     172.30.0.0/16       5`,

  stats: () => `Resource Usage:
  CPU: 23.4% (16 cores)
  Memory: 43.8% (28 GB / 64 GB)
  Disk: 42.3% (847 GB / 2 TB)
  Network RX: 2.4 GB
  Network TX: 1.8 GB

  Container Stats:
  NAME              CPU %     MEM %     NET I/O     BLOCK I/O   PIDS
  nginx-proxy       2.1%      0.07%     1.2MB/800KB 50MB/10MB   5
  postgres-primary  5.3%      1.9%      500MB/200MB 2GB/500MB   12
  redis-cache       0.8%      0.14%     50MB/50MB   100MB/10MB  3
  grafana           1.2%      0.24%     10MB/5MB    200MB/50MB  8
  prometheus        3.4%      3.3%      1GB/500MB   5GB/1GB     15`,

  version: () => `Kathal OS v0.1.0
  Build: 2024-01-15T10:30:00Z
  Runtime: Docker 24.0.7, containerd 1.7.2, WASM 18.0.0
  Kernel: 6.5.0-15-generic
  Go: 1.22.0`,

  history: (history: string[]) => {
    if (history.length === 0) return 'No command history'
    return history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n')
  },

  exit: () => '__EXIT__',
}

export default function TerminalPage() {
  const [history, setHistory] = useState<{ type: string; content: string; timestamp: number }[]>(mockHistory)
  const [input, setInput] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isConnected, setIsConnected] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [history])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addOutput = (content: string, type: 'output' | 'error' = 'output') => {
    setHistory(prev => [...prev, { type, content, timestamp: Date.now() }])
  }

  const addPrompt = () => {
    setHistory(prev => [...prev, { type: 'prompt', content: 'kathal@server:~$ ', timestamp: Date.now() }])
  }

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed) {
      addPrompt()
      return
    }

    setHistory(prev => [...prev, { type: 'input', content: trimmed, timestamp: Date.now() }])
    setCommandHistory(prev => [trimmed, ...prev.slice(0, 99)])
    setHistoryIndex(-1)

    const [command, ...args] = trimmed.split(' ')
    const handler = commands[command as keyof typeof commands]

    if (handler) {
      try {
        const result = handler(args.join(' '), commandHistory)
        if (result === '__CLEAR__') {
          setHistory([])
          addPrompt()
        } else if (result === '__EXIT__') {
          addOutput('Connection closed. Refresh to reconnect.', 'error')
          setIsConnected(false)
        } else if (result) {
          addOutput(result)
          addPrompt()
        } else {
          addPrompt()
        }
      } catch (error) {
        addOutput(`Error: ${error}`, 'error')
        addPrompt()
      }
    } else {
      addOutput(`Command not found: ${command}. Type 'help' for available commands.`, 'error')
      addPrompt()
    }

    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(commandHistory[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for known commands
      const knownCommands = Object.keys(commands)
      const matches = knownCommands.filter(cmd => cmd.startsWith(input.toLowerCase()))
      if (matches.length === 1) {
        setInput(matches[0] + ' ')
      } else if (matches.length > 1) {
        addOutput(matches.join('  '))
        addPrompt()
        setInput(input)
      }
    }
  }

  const handleSearch = () => {
    // Filter history display
  }

  const clearTerminal = () => {
    setHistory([])
    addPrompt()
  }

  const copyOutput = () => {
    const output = history.filter(h => h.type !== 'prompt').map(h => h.content).join('\n')
    navigator.clipboard.writeText(output)
  }

  const downloadOutput = () => {
    const output = history.filter(h => h.type !== 'prompt').map(h => h.content).join('\n')
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kathal-terminal-${Date.now()}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredHistory = history.filter(h => 
    !searchQuery || h.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-content-secondary" />
            <span className="font-medium text-body-sm text-content-primary">Kathal OS Terminal</span>
            <span className={cn('w-2 h-2 rounded-full', isConnected ? 'bg-green-500' : 'bg-red-500')} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-content-tertiary" />
            <input
              type="search"
              placeholder="Search output..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 py-1.5 bg-surface-hover border border-border rounded-lg text-body-sm text-content-primary placeholder:text-content-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all w-48"
            />
          </div>
          <button onClick={copyOutput} className="p-2 rounded-lg hover:bg-surface-hover transition-colors" title="Copy output">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={downloadOutput} className="p-2 rounded-lg hover:bg-surface-hover transition-colors" title="Download log">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clearTerminal} className="p-2 rounded-lg hover:bg-surface-hover transition-colors" title="Clear terminal">
            <Trash2 className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-surface-hover transition-colors" title="Maximize">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div 
        ref={terminalRef} 
        className="flex-1 overflow-y-auto p-4 font-mono text-body-sm bg-slate-950 text-slate-100"
        style={{ fontFamily: 'JetBrains Mono, Fira Code, monospace' }}
      >
        {filteredHistory.map((entry, index) => (
          <div key={index} className={cn('whitespace-pre-wrap break-words', {
            'text-green-400': entry.type === 'output',
            'text-red-400': entry.type === 'error',
            'text-yellow-400': entry.type === 'input',
            'text-blue-400': entry.type === 'prompt',
          })}>
            {entry.type === 'prompt' && <span className="text-green-400">kathal@server:~$ </span>}
            {entry.content}
          </div>
        ))}
        {!isConnected && (
          <div className="text-center py-8 text-red-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Connection lost. Refresh the page to reconnect.</p>
          </div>
        )}
      </div>

      {/* Input Line */}
      <div className="flex items-center px-4 py-3 border-t border-border bg-surface-elevated/50">
        <span className="text-green-400 font-medium mr-2 select-none">kathal@server:~$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder:text-slate-500 text-body-sm font-mono"
          placeholder="Type a command (help for list)..."
          autoComplete="off"
          spellCheck={false}
          disabled={!isConnected}
        />
        <button 
          onClick={() => executeCommand(input)} 
          disabled={!input.trim() || !isConnected}
          className="ml-2 p-2 rounded-lg hover:bg-surface-hover transition-colors text-slate-400 hover:text-slate-100 disabled:opacity-50"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Command Palette Hint */}
      <div className="px-4 py-2 text-center text-xs text-slate-500 border-t border-border/50 bg-slate-900/50">
        <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Tab</kbd> Complete  •  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">↑/↓</kbd> History  •  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Enter</kbd> Execute  •  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">Ctrl+L</kbd> Clear
      </div>
    </div>
  )
}