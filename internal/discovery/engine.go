// Package discovery implements the system discovery engine for KATHAL OS
package discovery

import (
	"context"
	"fmt"
	"runtime"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
)

// DiscoveryEngine automatically detects system infrastructure
type DiscoveryEngine struct {
	mu          sync.RWMutex
	inventory   *SystemInventory
	lastScan    time.Time
	scanTimeout time.Duration
}

// SystemInventory represents the complete system inventory
type SystemInventory struct {
	OS         *OSInfo         `json:"os"`
	Hardware   *HardwareInfo   `json:"hardware"`
	Docker     *DockerInfo     `json:"docker"`
	WSL        *WSLInfo        `json:"wsl"`
	Runtimes   []RuntimeInfo   `json:"runtimes"`
	Databases  []DatabaseInfo  `json:"databases"`
	Networks   []NetworkInfo   `json:"networks"`
	Cloudflare *CloudflareInfo `json:"cloudflare"`
	Projects   []ProjectInfo   `json:"projects"`
	GPU        *GPUInfo        `json:"gpu"`
	ScannedAt  time.Time       `json:"scanned_at"`
}

// OSInfo represents operating system information
type OSInfo struct {
	Platform        string `json:"platform"`
	PlatformFamily  string `json:"platform_family"`
	PlatformVersion string `json:"platform_version"`
	KernelVersion   string `json:"kernel_version"`
	KernelArch      string `json:"kernel_arch"`
	Hostname        string `json:"hostname"`
	Uptime          uint64 `json:"uptime"`
	BootTime        uint64 `json:"boot_time"`
	Procs           uint64 `json:"procs"`
}

// HardwareInfo represents hardware information
type HardwareInfo struct {
	CPU     CPUInfo            `json:"cpu"`
	Memory  MemoryInfo         `json:"memory"`
	Disk    []DiskInfo         `json:"disk"`
	Network []NetworkInterface `json:"network"`
	GPU     GPUInfo            `json:"gpu"`
}

// CPUInfo represents CPU information
type CPUInfo struct {
	Cores     int      `json:"cores"`
	Threads   int      `json:"threads"`
	ModelName string   `json:"model_name"`
	MHz       float64  `json:"mhz"`
	CacheSize int      `json:"cache_size"`
	VendorID  string   `json:"vendor_id"`
	Family    string   `json:"family"`
	Flags     []string `json:"flags"`
}

// MemoryInfo represents memory information
type MemoryInfo struct {
	Total     uint64 `json:"total"`
	Available uint64 `json:"available"`
	Used      uint64 `json:"used"`
	Free      uint64 `json:"free"`
	SwapTotal uint64 `json:"swap_total"`
	SwapFree  uint64 `json:"swap_free"`
	SwapUsed  uint64 `json:"swap_used"`
}

// DiskInfo represents disk information
type DiskInfo struct {
	Device      string  `json:"device"`
	Mountpoint  string  `json:"mountpoint"`
	Fstype      string  `json:"fstype"`
	Total       uint64  `json:"total"`
	Free        uint64  `json:"free"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"used_percent"`
}

// NetworkInterface represents a network interface
type NetworkInterface struct {
	Name         string   `json:"name"`
	HardwareAddr string   `json:"hardware_addr"`
	Addrs        []string `json:"addrs"`
	Flags        []string `json:"flags"`
	MTU          int      `json:"mtu"`
}

// DockerInfo represents Docker engine information
type DockerInfo struct {
	Installed       bool     `json:"installed"`
	Version         string   `json:"version"`
	APIVersion      string   `json:"api_version"`
	Running         bool     `json:"running"`
	RootDir         string   `json:"root_dir"`
	Driver          string   `json:"driver"`
	CgroupDriver    string   `json:"cgroup_driver"`
	CgroupVersion   string   `json:"cgroup_version"`
	KernelVersion   string   `json:"kernel_version"`
	OperatingSystem string   `json:"operating_system"`
	OSType          string   `json:"os_type"`
	Architecture    string   `json:"architecture"`
	CPUs            int      `json:"cpus"`
	TotalMemory     int64    `json:"total_memory"`
	DockerRootDir   string   `json:"docker_root_dir"`
	RegistryConfig  []string `json:"registry_config"`
	Containers      int      `json:"containers"`
	Images          int      `json:"images"`
	BuildkitVersion string   `json:"buildkit_version"`
	Experimental    bool     `json:"experimental"`
}

// WSLInfo represents WSL information
type WSLInfo struct {
	Installed     bool     `json:"installed"`
	Version       string   `json:"version"`
	DefaultDistro string   `json:"default_distro"`
	Distros       []string `json:"distros"`
	WSL2          bool     `json:"wsl2"`
}

// RuntimeInfo represents a runtime
type RuntimeInfo struct {
	Type       string `json:"type"`
	Name       string `json:"name"`
	Version    string `json:"version"`
	Installed  bool   `json:"installed"`
	Running    bool   `json:"running"`
	Path       string `json:"path"`
	ConfigPath string `json:"config_path"`
}

// DatabaseInfo represents a database
type DatabaseInfo struct {
	Type       string `json:"type"`
	Name       string `json:"name"`
	Version    string `json:"version"`
	Port       int    `json:"port"`
	Host       string `json:"host"`
	Running    bool   `json:"running"`
	DataDir    string `json:"data_dir"`
	ConfigPath string `json:"config_path"`
}

// NetworkInfo represents a network
type NetworkInfo struct {
	Name       string   `json:"name"`
	Driver     string   `json:"driver"`
	Scope      string   `json:"scope"`
	Subnet     string   `json:"subnet"`
	Gateway    string   `json:"gateway"`
	IPRange    string   `json:"ip_range"`
	Containers []string `json:"containers"`
	Internal   bool     `json:"internal"`
	Attachable bool     `json:"attachable"`
	Ingress    bool     `json:"ingress"`
	Created    string   `json:"created"`
}

// CloudflareInfo represents Cloudflare tunnel information
type CloudflareInfo struct {
	Installed  bool     `json:"installed"`
	Version    string   `json:"version"`
	Tunnels    []string `json:"tunnels"`
	ConfigPath string   `json:"config_path"`
	Running    bool     `json:"running"`
}

// ProjectInfo represents a project
type ProjectInfo struct {
	Name         string   `json:"name"`
	Path         string   `json:"path"`
	Type         string   `json:"type"`
	Language     string   `json:"language"`
	Framework    string   `json:"framework"`
	HasDocker    bool     `json:"has_docker"`
	HasCompose   bool     `json:"has_compose"`
	HasGit       bool     `json:"has_git"`
	Ports        []int    `json:"ports"`
	Dependencies []string `json:"dependencies"`
}

// GPUInfo represents GPU information
type GPUInfo struct {
	Present bool        `json:"present"`
	Devices []GPUDevice `json:"devices"`
}

// GPUDevice represents a GPU device
type GPUDevice struct {
	Index       int     `json:"index"`
	Name        string  `json:"name"`
	UUID        string  `json:"uuid"`
	MemoryTotal uint64  `json:"memory_total"`
	MemoryUsed  uint64  `json:"memory_used"`
	MemoryFree  uint64  `json:"memory_free"`
	Utilization float64 `json:"utilization"`
	Temperature float64 `json:"temperature"`
	PowerDraw   float64 `json:"power_draw"`
}

// NewDiscoveryEngine creates a new discovery engine
func NewDiscoveryEngine() *DiscoveryEngine {
	return &DiscoveryEngine{
		scanTimeout: 30 * time.Second,
	}
}

// Scan performs a full system discovery scan
func (de *DiscoveryEngine) Scan(ctx context.Context) (*SystemInventory, error) {
	ctx, cancel := context.WithTimeout(ctx, de.scanTimeout)
	defer cancel()

	de.mu.Lock()
	defer de.mu.Unlock()

	inventory := &SystemInventory{
		ScannedAt: time.Now(),
	}

	// Run all discovery checks in parallel
	var wg sync.WaitGroup
	errCh := make(chan error, 10)

	wg.Add(1)
	go func() {
		defer wg.Done()
		osInfo, err := de.discoverOS(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.OS = osInfo
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		hwInfo, err := de.discoverHardware(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Hardware = hwInfo
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		dockerInfo, err := de.discoverDocker(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Docker = dockerInfo
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		wslInfo, err := de.discoverWSL(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.WSL = wslInfo
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		runtimes, err := de.discoverRuntimes(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Runtimes = runtimes
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		databases, err := de.discoverDatabases(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Databases = databases
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		networks, err := de.discoverNetworks(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Networks = networks
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		cfInfo, err := de.discoverCloudflare(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Cloudflare = cfInfo
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		projects, err := de.discoverProjects(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.Projects = projects
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		gpuInfo, err := de.discoverGPU(ctx)
		if err != nil {
			errCh <- err
			return
		}
		inventory.GPU = gpuInfo
	}()

	wg.Wait()
	close(errCh)

	// Check for errors
	for err := range errCh {
		if err != nil {
			// Log but don't fail the entire scan
			fmt.Printf("Discovery warning: %v\n", err)
		}
	}

	de.inventory = inventory
	de.lastScan = time.Now()

	return inventory, nil
}

// GetInventory returns the last scanned inventory
func (de *DiscoveryEngine) GetInventory() *SystemInventory {
	de.mu.RLock()
	defer de.mu.RUnlock()
	return de.inventory
}

// discoverOS discovers operating system information
func (de *DiscoveryEngine) discoverOS(ctx context.Context) (*OSInfo, error) {
	info, err := host.InfoWithContext(ctx)
	if err != nil {
		return nil, err
	}

	return &OSInfo{
		Platform:        info.Platform,
		PlatformFamily:  info.PlatformFamily,
		PlatformVersion: info.PlatformVersion,
		KernelVersion:   info.KernelVersion,
		KernelArch:      info.KernelArch,
		Hostname:        info.Hostname,
		Uptime:          info.Uptime,
		BootTime:        info.BootTime,
		Procs:           info.Procs,
	}, nil
}

// discoverHardware discovers hardware information
func (de *DiscoveryEngine) discoverHardware(ctx context.Context) (*HardwareInfo, error) {
	hw := &HardwareInfo{}

	// CPU
	cpuInfo, err := cpu.InfoWithContext(ctx)
	if err == nil && len(cpuInfo) > 0 {
		hw.CPU = CPUInfo{
			Cores:     runtime.NumCPU(),
			Threads:   len(cpuInfo),
			ModelName: cpuInfo[0].ModelName,
			MHz:       cpuInfo[0].Mhz,
			CacheSize: int(cpuInfo[0].CacheSize),
			VendorID:  cpuInfo[0].VendorID,
			Family:    cpuInfo[0].Family,
			Flags:     cpuInfo[0].Flags,
		}
	}

	// Memory
	memInfo, err := mem.VirtualMemoryWithContext(ctx)
	if err == nil {
		hw.Memory = MemoryInfo{
			Total:     memInfo.Total,
			Available: memInfo.Available,
			Used:      memInfo.Used,
			Free:      memInfo.Free,
		}
	}

	swapInfo, err := mem.SwapMemoryWithContext(ctx)
	if err == nil {
		hw.Memory.SwapTotal = swapInfo.Total
		hw.Memory.SwapFree = swapInfo.Free
		hw.Memory.SwapUsed = swapInfo.Used
	}

	// Disk
	diskParts, err := disk.PartitionsWithContext(ctx, false)
	if err == nil {
		for _, part := range diskParts {
			usage, err := disk.UsageWithContext(ctx, part.Mountpoint)
			if err != nil {
				continue
			}
			hw.Disk = append(hw.Disk, DiskInfo{
				Device:      part.Device,
				Mountpoint:  part.Mountpoint,
				Fstype:      part.Fstype,
				Total:       usage.Total,
				Free:        usage.Free,
				Used:        usage.Used,
				UsedPercent: usage.UsedPercent,
			})
		}
	}

	// Network
	interfaces, err := net.InterfacesWithContext(ctx)
	if err == nil {
		for _, iface := range interfaces {
			var addrs []string
			for _, addr := range iface.Addrs {
				addrs = append(addrs, addr.Addr)
			}
			hw.Network = append(hw.Network, NetworkInterface{
				Name:         iface.Name,
				HardwareAddr: iface.HardwareAddr,
				Addrs:        addrs,
				Flags:        iface.Flags,
				MTU:          iface.MTU,
			})
		}
	}

	return hw, nil
}

// discoverDocker discovers Docker engine
func (de *DiscoveryEngine) discoverDocker(ctx context.Context) (*DockerInfo, error) {
	info := &DockerInfo{
		Installed: false,
		Running:   false,
	}

	// Check if Docker is installed
	// This would typically use docker CLI or API
	// For now, return basic info
	return info, nil
}

// discoverWSL discovers WSL
func (de *DiscoveryEngine) discoverWSL(ctx context.Context) (*WSLInfo, error) {
	info := &WSLInfo{
		Installed: false,
	}

	// Check for WSL on Windows
	if runtime.GOOS == "windows" {
		// Check WSL installation
	}

	return info, nil
}

// discoverRuntimes discovers available runtimes
func (de *DiscoveryEngine) discoverRuntimes(ctx context.Context) ([]RuntimeInfo, error) {
	var runtimes []RuntimeInfo

	// Check for Docker
	runtimes = append(runtimes, RuntimeInfo{
		Type:      "docker",
		Name:      "Docker Engine",
		Installed: true, // Would check actual installation
	})

	// Check for Podman
	runtimes = append(runtimes, RuntimeInfo{
		Type:      "podman",
		Name:      "Podman",
		Installed: false,
	})

	// Check for containerd
	runtimes = append(runtimes, RuntimeInfo{
		Type:      "containerd",
		Name:      "containerd",
		Installed: false,
	})

	return runtimes, nil
}

// discoverDatabases discovers databases
func (de *DiscoveryEngine) discoverDatabases(ctx context.Context) ([]DatabaseInfo, error) {
	var databases []DatabaseInfo

	// Check for common databases
	dbTypes := []string{"postgresql", "mysql", "mariadb", "redis", "mongodb", "sqlite"}

	for _, dbType := range dbTypes {
		// Would check actual installation
		databases = append(databases, DatabaseInfo{
			Type:    dbType,
			Running: false,
		})
	}

	return databases, nil
}

// discoverNetworks discovers Docker networks
func (de *DiscoveryEngine) discoverNetworks(ctx context.Context) ([]NetworkInfo, error) {
	// Would use Docker API to list networks
	return []NetworkInfo{}, nil
}

// discoverCloudflare discovers Cloudflare tunnels
func (de *DiscoveryEngine) discoverCloudflare(ctx context.Context) (*CloudflareInfo, error) {
	info := &CloudflareInfo{
		Installed: false,
	}

	// Check for cloudflared
	return info, nil
}

// discoverProjects discovers projects
func (de *DiscoveryEngine) discoverProjects(ctx context.Context) ([]ProjectInfo, error) {
	var projects []ProjectInfo

	// Would scan common project directories
	return projects, nil
}

// discoverGPU discovers GPU information
func (de *DiscoveryEngine) discoverGPU(ctx context.Context) (*GPUInfo, error) {
	info := &GPUInfo{
		Present: false,
	}

	// Would check for NVIDIA, AMD, Intel GPUs
	return info, nil
}
