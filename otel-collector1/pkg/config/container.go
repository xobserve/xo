package config

import "os"

const (
	EnvKeyRunInContainer = "RUN_IN_CONTAINER"
	EnvValTrue           = "True"
)

// IsRunningInContainer checks EnvKeyRunInContainer (i.e. RUN_IN_CONTAINER) to determine
// if the collector is running as a container.
//
// Following behaviour changes when running in container:
// - log writes to stderr instead of rotate in local file under /opt/aws #339
// - switch user based on config is ignored
func IsRunningInContainer() bool {
	return os.Getenv(EnvKeyRunInContainer) == EnvValTrue
}
