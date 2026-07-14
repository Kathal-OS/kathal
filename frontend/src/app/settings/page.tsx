'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Settings,
  Server,
  Shield,
  Key,
  Bell,
  Palette,
  Globe,
  Database,
  HardDrive,
  Network,
  Cpu,
  MemoryStick,
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  ChevronDown,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit,
  LogOut,
  User,
  Mail,
  Lock,
  Smartphone,
  QrCode,
  Fingerprint,
  Activity,
  Monitor,
  Wifi,
  Layers,
  Terminal,
  Image,
  Box,
  Database as DatabaseIcon,
} from 'lucide-react'
import { useAppStore } from '@/store/appStore'

export default function SettingsPage() {
  const { theme, setTheme, sidebarOpen, setSidebarOpen } = useAppStore()
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'runtime' | 'network' | 'storage' | 'security' | 'notifications' | 'advanced'>('general')
  const [settings, setSettings] = useState({
    // General
    autoRefresh: true,
    refreshInterval: 30,
    confirmActions: true,
    showTooltips: true,
    language: 'en',
    timezone: 'auto',
    dateFormat: 'ISO 8601',
    // Appearance
    theme: theme,
    compactMode: false,
    animations: true,
    sidebarDefaultOpen: true,
    showRuntimeStatus: true,
    // Runtime
    defaultRuntime: 'docker',
    autoStartContainers: false,
    containerLogLimit: 1000,
    healthCheckInterval: 30,
    selfHealEnabled: true,
    // Network
    defaultNetworkDriver: 'bridge',
    dnsServers: '1.1.1.1, 8.8.8.8',
    proxyEnabled: false,
    proxyUrl: '',
    // Storage
    defaultVolumeDriver: 'local',
    backupRetention: 7,
    autoPrune: true,
    pruneInterval: 24,
    // Security
    tlsEnabled: true,
    tlsVerify: true,
    apiTokenEnabled: false,
    apiToken: '',
    rbacEnabled: false,
    auditLogging: true,
    // Notifications
    emailNotifications: false,
    emailAddress: '',
    webhookEnabled: false,
    webhookUrl: '',
    notifyOnContainerStop: true,
    notifyOnHealthFail: true,
    notifyOnDiskSpace: true,
    diskThreshold: 85,
    // Advanced
    debugMode: false,
    telemetryEnabled: true,
    experimentalFeatures: false,
    logLevel: 'info',
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'runtime', label: 'Runtime', icon: Server },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'storage', label: 'Storage', icon: DatabaseIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Zap },
  ]

  const handleChange = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    if (settings.theme !== theme) {
      setTheme(settings.theme as 'light' | 'dark')
    }
    // In a real app, this would persist to backend
    console.log('Settings saved:', settings)
    alert('Settings saved successfully!')
  }

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      // Reset to defaults
      alert('Settings reset to defaults!')
    }
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kathal-settings.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string)
          setSettings(prev => ({ ...prev, ...imported }))
          alert('Settings imported successfully!')
        } catch {
          alert('Invalid settings file')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-lg font-semibold text-content-primary">Settings</h1>
          <p className="text-body-md text-content-secondary mt-1">
            Configure Kathal OS behavior and appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="btn-secondary btn-sm cursor-pointer">
            <Download className="w-3 h-3" />
            Export
            <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" onClick={(e) => e.stopPropagation()} />
          </label>
          <button onClick={handleReset} className="btn-secondary btn-sm">
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
          <button onClick={handleSave} className="btn-primary btn-sm">
            <Save className="w-3 h-3" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar Tabs */}
        <aside className="w-56 lg:w-64 flex-shrink-0 border-r border-border bg-surface-elevated/50 hidden lg:block">
          <nav className="p-4 space-y-1" aria-label="Settings categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                    : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                )}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-body-sm">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeTab === 'general' && (
            <SettingsSection title="General" description="Basic application behavior">
              <SettingGroup title="Application">
                <SettingRow label="Auto Refresh" description="Automatically refresh data at intervals">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => handleChange('autoRefresh', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Refresh Interval" description="Seconds between automatic refreshes">
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                    className="input w-auto"
                    disabled={!settings.autoRefresh}
                  >
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </SettingRow>
                <SettingRow label="Confirm Destructive Actions" description="Show confirmation dialogs for delete/stop operations">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.confirmActions}
                      onChange={(e) => handleChange('confirmActions', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Show Tooltips" description="Display helpful tooltips throughout the interface">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showTooltips}
                      onChange={(e) => handleChange('showTooltips', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Localization">
                <SettingRow label="Language" description="Interface language">
                  <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)} className="input w-auto">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </SettingRow>
                <SettingRow label="Timezone" description="Timezone for timestamps">
                  <select value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)} className="input w-auto">
                    <option value="auto">Auto-detect</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                    <option value="Asia/Shanghai">Shanghai</option>
                  </select>
                </SettingRow>
                <SettingRow label="Date Format" description="Format for displaying dates and times">
                  <select value={settings.dateFormat} onChange={(e) => handleChange('dateFormat', e.target.value)} className="input w-auto">
                    <option value="ISO 8601">ISO 8601 (2024-01-15 14:30:00)</option>
                    <option value="US">US (01/15/2024 2:30 PM)</option>
                    <option value="EU">EU (15.01.2024 14:30)</option>
                    <option value="Relative">Relative (2 hours ago)</option>
                  </select>
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'appearance' && (
            <SettingsSection title="Appearance" description="Customize the look and feel">
              <SettingGroup title="Theme">
                <SettingRow label="Color Theme" description="Choose light or dark mode">
                  <div className="flex items-center gap-3">
                    {['light', 'dark'].map((t) => (
                      <label key={t} className={cn(
                        'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer',
                        settings.theme === t ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-border hover:border-primary-300'
                      )}>
                        <input
                          type="radio"
                          name="theme"
                          value={t}
                          checked={settings.theme === t}
                          onChange={(e) => handleChange('theme', e.target.value)}
                          className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-body-sm text-content-primary capitalize">{t}</span>
                          <span className="text-xs text-content-tertiary">{t === 'light' ? 'Light backgrounds' : 'Dark backgrounds'}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow label="Compact Mode" description="Reduce spacing for denser information display">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => handleChange('compactMode', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Animations" description="Enable UI transitions and animations">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.animations}
                      onChange={(e) => handleChange('animations', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Layout">
                <SettingRow label="Sidebar Default State" description="Whether sidebar is open by default">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.sidebarDefaultOpen}
                      onChange={(e) => handleChange('sidebarDefaultOpen', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Open by default</span>
                  </label>
                </SettingRow>
                <SettingRow label="Show Runtime Status" description="Display runtime status in sidebar">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showRuntimeStatus}
                      onChange={(e) => handleChange('showRuntimeStatus', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'runtime' && (
            <SettingsSection title="Runtime" description="Configure container runtime behavior">
              <SettingGroup title="Default Runtime">
                <SettingRow label="Default Runtime" description="Primary runtime for new containers">
                  <select value={settings.defaultRuntime} onChange={(e) => handleChange('defaultRuntime', e.target.value)} className="input w-auto">
                    <option value="docker">Docker</option>
                    <option value="containerd">containerd</option>
                    <option value="wasm">WASM (wasmtime)</option>
                    <option value="podman">Podman</option>
                  </select>
                </SettingRow>
                <SettingRow label="Auto-start Containers" description="Automatically start containers on system boot">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoStartContainers}
                      onChange={(e) => handleChange('autoStartContainers', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Container Settings">
                <SettingRow label="Log Limit" description="Maximum log lines to retain per container">
                  <select value={settings.containerLogLimit} onChange={(e) => handleChange('containerLogLimit', parseInt(e.target.value))} className="input w-auto">
                    <option value={100}>100 lines</option>
                    <option value={500}>500 lines</option>
                    <option value={1000}>1,000 lines</option>
                    <option value={5000}>5,000 lines</option>
                    <option value={10000}>10,000 lines</option>
                    <option value={0}>Unlimited</option>
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Health & Self-Healing">
                <SettingRow label="Health Check Interval" description="Seconds between health checks">
                  <select value={settings.healthCheckInterval} onChange={(e) => handleChange('healthCheckInterval', parseInt(e.target.value))} className="input w-auto">
                    <option value={10}>10 seconds</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                    <option value={300}>5 minutes</option>
                  </select>
                </SettingRow>
                <SettingRow label="Self-Healing Engine" description="Automatically detect and fix common issues">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.selfHealEnabled}
                      onChange={(e) => handleChange('selfHealEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'network' && (
            <SettingsSection title="Network" description="Network configuration">
              <SettingGroup title="Default Network">
                <SettingRow label="Default Network Driver" description="Driver for new networks">
                  <select value={settings.defaultNetworkDriver} onChange={(e) => handleChange('defaultNetworkDriver', e.target.value)} className="input w-auto">
                    <option value="bridge">bridge</option>
                    <option value="overlay">overlay</option>
                    <option value="macvlan">macvlan</option>
                    <option value="host">host</option>
                    <option value="none">none</option>
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="DNS & Proxy">
                <SettingRow label="DNS Servers" description="Comma-separated DNS server IPs">
                  <input value={settings.dnsServers} onChange={(e) => handleChange('dnsServers', e.target.value)} className="input" placeholder="1.1.1.1, 8.8.8.8" />
                </SettingRow>
                <SettingRow label="Proxy Enabled" description="Route traffic through proxy">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.proxyEnabled}
                      onChange={(e) => handleChange('proxyEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Proxy URL" description="Proxy server URL (if enabled)">
                  <input value={settings.proxyUrl} onChange={(e) => handleChange('proxyUrl', e.target.value)} className="input" placeholder="http://proxy.example.com:8080" disabled={!settings.proxyEnabled} />
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'storage' && (
            <SettingsSection title="Storage" description="Volume and backup settings">
              <SettingGroup title="Volumes">
                <SettingRow label="Default Volume Driver" description="Driver for new volumes">
                  <select value={settings.defaultVolumeDriver} onChange={(e) => handleChange('defaultVolumeDriver', e.target.value)} className="input w-auto">
                    <option value="local">local</option>
                    <option value="nfs">nfs</option>
                    <option value="tmpfs">tmpfs</option>
                    <option value="aws-ebs">aws-ebs</option>
                    <option value="azure-file">azure-file</option>
                    <option value="gce-pd">gce-pd</option>
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Backups">
                <SettingRow label="Backup Retention" description="Days to keep backups">
                  <select value={settings.backupRetention} onChange={(e) => handleChange('backupRetention', parseInt(e.target.value))} className="input w-auto">
                    <option value={1}>1 day</option>
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </SettingRow>
                <SettingRow label="Auto Prune" description="Automatically remove unused volumes">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoPrune}
                      onChange={(e) => handleChange('autoPrune', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Prune Interval" description="Hours between prune operations">
                  <select value={settings.pruneInterval} onChange={(e) => handleChange('pruneInterval', parseInt(e.target.value))} className="input w-auto">
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                    <option value={48}>48 hours</option>
                    <option value={168}>1 week</option>
                  </select>
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'security' && (
            <SettingsSection title="Security" description="Security and access control">
              <SettingGroup title="TLS Configuration">
                <SettingRow label="TLS Enabled" description="Use TLS for API connections">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tlsEnabled}
                      onChange={(e) => handleChange('tlsEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="TLS Verify" description="Verify TLS certificates">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.tlsVerify}
                      onChange={(e) => handleChange('tlsVerify', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="API Access">
                <SettingRow label="API Token Enabled" description="Require API token for programmatic access">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.apiTokenEnabled}
                      onChange={(e) => handleChange('apiTokenEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="API Token" description="Token for API authentication">
                  <div className="flex items-center gap-2">
                    <input
                      type={settings.apiTokenEnabled ? 'text' : 'password'}
                      value={settings.apiToken}
                      onChange={(e) => handleChange('apiToken', e.target.value)}
                      className="input flex-1 font-mono"
                      placeholder="kth_live_..."
                      disabled={!settings.apiTokenEnabled}
                    />
                    <button className="btn-secondary" onClick={() => handleChange('apiTokenEnabled', !settings.apiTokenEnabled)}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(settings.apiToken)}>
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Access Control">
                <SettingRow label="RBAC Enabled" description="Role-based access control">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.rbacEnabled}
                      onChange={(e) => handleChange('rbacEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Audit Logging" description="Log all administrative actions">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auditLogging}
                      onChange={(e) => handleChange('auditLogging', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'notifications' && (
            <SettingsSection title="Notifications" description="Alert and notification preferences">
              <SettingGroup title="Email Notifications">
                <SettingRow label="Enable Email Alerts" description="Send notifications via email">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Email Address" description="Address to receive notifications">
                  <input value={settings.emailAddress} onChange={(e) => handleChange('emailAddress', e.target.value)} className="input" placeholder="admin@example.com" disabled={!settings.emailNotifications} />
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Webhooks">
                <SettingRow label="Enable Webhooks" description="Send notifications to webhook URL">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.webhookEnabled}
                      onChange={(e) => handleChange('webhookEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Webhook URL" description="URL to receive webhook payloads">
                  <input value={settings.webhookUrl} onChange={(e) => handleChange('webhookUrl', e.target.value)} className="input" placeholder="https://hooks.example.com/kathal" disabled={!settings.webhookEnabled} />
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Alert Rules">
                <SettingRow label="Container Stopped" description="Notify when a container stops unexpectedly">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnContainerStop}
                      onChange={(e) => handleChange('notifyOnContainerStop', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Health Check Failed" description="Notify when health check fails">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnHealthFail}
                      onChange={(e) => handleChange('notifyOnHealthFail', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Low Disk Space" description="Notify when disk space is low">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifyOnDiskSpace}
                      onChange={(e) => handleChange('notifyOnDiskSpace', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Disk Space Threshold" description="Percentage at which to trigger low disk alert">
                  <input
                    type="number"
                    value={settings.diskThreshold}
                    onChange={(e) => handleChange('diskThreshold', parseInt(e.target.value))}
                    className="input w-24"
                    min="10"
                    max="95"
                    disabled={!settings.notifyOnDiskSpace}
                  />
                </SettingRow>
              </SettingGroup>
            </SettingsSection>
          )}

          {activeTab === 'advanced' && (
            <SettingsSection title="Advanced" description="Developer and experimental settings">
              <SettingGroup title="Debugging">
                <SettingRow label="Debug Mode" description="Enable verbose logging and debug features">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.debugMode}
                      onChange={(e) => handleChange('debugMode', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Log Level" description="Minimum log level to output">
                  <select value={settings.logLevel} onChange={(e) => handleChange('logLevel', e.target.value)} className="input w-auto">
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Features">
                <SettingRow label="Telemetry" description="Send anonymous usage data to improve Kathal OS">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.telemetryEnabled}
                      onChange={(e) => handleChange('telemetryEnabled', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
                <SettingRow label="Experimental Features" description="Enable experimental/beta features">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.experimentalFeatures}
                      onChange={(e) => handleChange('experimentalFeatures', e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-body-sm text-content-primary">Enabled</span>
                  </label>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Maintenance">
                <div className="flex items-center gap-3">
                  <button className="btn-danger" onClick={() => { if (confirm('Clear all cached data?')) alert('Cache cleared!') }}>
                    <Trash2 className="w-4 h-4" /> Clear Cache
                  </button>
                  <button className="btn-secondary" onClick={() => alert('Database rebuilt!')}>
                    <RotateCcw className="w-4 h-4" /> Rebuild Index
                  </button>
                  <button className="btn-secondary" onClick={() => handleExport}>
                    <Download className="w-4 h-4" /> Export Settings
                  </button>
                </div>
              </SettingGroup>
            </SettingsSection>
          )}
        </main>
      </div>
    </div>
  )
}

// Helper Components

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="max-w-4xl space-y-6 animate-in">
      <div className="mb-6">
        <h2 className="text-heading-lg font-semibold text-content-primary">{title}</h2>
        <p className="text-body-md text-content-secondary mt-1">{description}</p>
      </div>
      {children}
    </div>
  )
}

function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-5">
      <h3 className="text-heading-sm font-semibold text-content-primary border-b border-border pb-3 mb-4">{title}</h3>
      {children}
    </div>
  )
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 py-4 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <label className="block font-medium text-body-sm text-content-primary mb-1">{label}</label>
        <p className="text-body-sm text-content-secondary">{description}</p>
      </div>
      <div className="flex-shrink-0 w-full sm:w-auto">{children}</div>
    </div>
  )
}