package address

import (
	"errors"
	"io/ioutil"
	"math/rand"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

var hardware uint64
var external net.IP

func init() {
	external = initExternal()
	hardware = initHardware()
}

// External gets the external IP address.
func External() net.IP {
	return external
}

// Hardware gets the hardware address.
func Hardware() Fingerprint {
	return Fingerprint(hardware)
}

// getExternal retrieves an external IP address
func getExternal(urls ...string) (net.IP, bool) {
	for _, url := range urls {
		cli := http.Client{Timeout: time.Duration(5 * time.Second)}
		res, err := cli.Get(url)
		if err != nil {
			continue
		}

		// Read the response
		defer res.Body.Close()
		r, err := ioutil.ReadAll(res.Body)
		if err != nil {
			continue
		}

		// Fix and parse
		addr := strings.Replace(string(r), "\n", "", -1)
		ip := net.ParseIP(addr)
		return ip, ip != nil
	}

	return nil, false
}

// Initializes the external ip address
func initExternal() net.IP {
	external, ok := getExternal(
		"http://ipv4.icanhazip.com",
		"http://myexternalip.com/raw",
		"http://www.trackip.net/ip",
		"http://automation.whatismyip.com/n09230945.asp",
		"http://api.ipify.org/",
	)

	// Make sure we have an IP address, otherwise panic
	if !ok || external == nil {
		logging.Logger.Warn("address", zap.Error(errors.New("unable to retrieve external IP address")))
		return net.ParseIP("127.0.0.1")
	}

	return external
}

// Initializes the fingerprint
func initHardware() uint64 {
	var hardwareAddr [6]byte
	interfaces, err := net.Interfaces()
	if err == nil {
		for _, iface := range interfaces {
			if len(iface.HardwareAddr) >= 6 {
				copy(hardwareAddr[:], iface.HardwareAddr)
				return encode(hardwareAddr[:])
			}
		}
	}

	safeRandom(hardwareAddr[:])
	hardwareAddr[0] |= 0x01
	return encode(hardwareAddr[:])
}

func encode(mac net.HardwareAddr) (r uint64) {
	for _, b := range mac {
		r <<= 8
		r |= uint64(b)
	}
	return
}

func safeRandom(dest []byte) {
	if _, err := rand.Read(dest); err != nil {
		panic(err)
	}
}

// Fingerprint represents hardware fingerprint
type Fingerprint uint64

// String encodes PeerName as a string.
func (f Fingerprint) String() string {
	return intmac(uint64(f)).String()
}

// Hex returns the string in hex format.
func (f Fingerprint) Hex() string {
	return strings.Replace(f.String(), ":", "", -1)
}

// Converts int to hardware address
func intmac(key uint64) (r net.HardwareAddr) {
	r = make([]byte, 6)
	for i := 5; i >= 0; i-- {
		r[i] = byte(key)
		key >>= 8
	}
	return
}
