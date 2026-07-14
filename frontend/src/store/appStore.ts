import { create } from 'zustand'

interface Container {
  id: string
  name: string
  image: string
  status: string
  cpu: string
  mem: string
  ports: string
  created: string
  spec?: ContainerSpec
}

interface ContainerSpec {
  Image: string
  Name: string
  Command?: string[]
  Env?: Record<string, string>
  Ports?: PortMapping[]
  Volumes?: VolumeMount[]
  Resources?: ResourceLimits
  Labels?: Record<string, string>
  RestartPolicy?: { Name: string; MaximumRetryCount: number }
}

interface PortMapping {
  ContainerPort: number
  HostPort?: number
  Protocol: string
  HostIP?: string
}

interface VolumeMount {
  Type: string
  Source: string
  Target: string
  ReadOnly: boolean
}

interface ResourceLimits {
  CPUShares?: number
  CPUQuota?: number
  CPUPeriod?: number
  Memory?: number
  MemorySwap?: number
  PidsLimit?: number
}

interface Image {
  id: string
  repo: string
  tag: string
  size: string
  created: string
}

interface SystemInfo {
  hostname: string
  os: string
  kernel: string
  uptime: string
  cpus: number
  memory: { total: number; used: number; unit: string }
  disk: { total: number; used: number; unit: string }
  runtime: string
}

interface Stats {
  containers: { total: number; running: number; stopped: number; paused: number }
  images: { total: number; size: string }
  volumes: { total: number; size: string }
  networks: { total: number }
  cpus: { usage: number }
  memory: { usage: number }
  disk: { usage: number }
  network: { rx: string; tx: string }
}

interface AppState {
  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Data
  containers: Container[]
  setContainers: (containers: Container[]) => void
  addContainer: (container: Container) => void
  updateContainer: (id: string, updates: Partial<Container>) => void
  removeContainer: (id: string) => void
  
  images: Image[]
  setImages: (images: Image[]) => void
  addImage: (image: Image) => void
  removeImage: (id: string) => void
  
  systemInfo: SystemInfo | null
  setSystemInfo: (info: SystemInfo) => void
  
  stats: Stats | null
  setStats: (stats: Stats) => void
  
  // Loading states
  loading: boolean
  setLoading: (loading: boolean) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
  
  // Selected items
  selectedContainer: Container | null
  setSelectedContainer: (container: Container | null) => void
  
  selectedImage: Image | null
  setSelectedImage: (image: Image | null) => void
  
  // Filters
  containerFilter: string
  setContainerFilter: (filter: string) => void
  
  imageFilter: string
  setImageFilter: (filter: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  // UI State
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
  
  // Data
  containers: [],
  setContainers: (containers) => set({ containers }),
  addContainer: (container) => set((state) => ({ containers: [container, ...state.containers] })),
  updateContainer: (id, updates) => set((state) => ({
    containers: state.containers.map((c) => c.id === id ? { ...c, ...updates } : c)
  })),
  removeContainer: (id) => set((state) => ({
    containers: state.containers.filter((c) => c.id !== id)
  })),
  
  images: [],
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [image, ...state.images] })),
  removeImage: (id) => set((state) => ({
    images: state.images.filter((i) => i.id !== id)
  })),
  
  systemInfo: null,
  setSystemInfo: (systemInfo) => set({ systemInfo }),
  
  stats: null,
  setStats: (stats) => set({ stats }),
  
  // Loading states
  loading: false,
  setLoading: (loading) => set({ loading }),
  
  // Error handling
  error: null,
  setError: (error) => set({ error }),
  
  // Selected items
  selectedContainer: null,
  setSelectedContainer: (selectedContainer) => set({ selectedContainer }),
  
  selectedImage: null,
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  
  // Filters
  containerFilter: '',
  setContainerFilter: (containerFilter) => set({ containerFilter }),
  
  imageFilter: '',
  setImageFilter: (imageFilter) => set({ imageFilter }),
}))