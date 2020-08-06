package utils

import (
	"errors"
	"io"
	"net"
	"os"
	"strings"
	"time"
)

// 判断一个error是否是io.EOF
func IsEOF(err error) bool {
	if err == nil {
		return false
	} else if err == io.EOF {
		return true
	} else if oerr, ok := err.(*net.OpError); ok {
		if oerr.Err.Error() == "use of closed network connection" {
			return true
		}
	} else {
		if err.Error() == "use of closed network connection" {
			return true
		}
	}

	return false
}

// 获取本机ip
func LocalIP() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}

	return filterIP(addrs)
}

func TransfarIP() string {
	l, err := net.Interfaces()
	if err != nil {
		return ""
	}

	for _, i := range l {
		l, _ := i.Addrs()
		switch i.Name {
		case "br0", "eth0", "en0":
			ip := filterIP(l)
			if ip == "" {
				continue
			} else {
				return ip
			}
		default:

		}
	}

	for _, i := range l {
		l, _ := i.Addrs()
		if strings.HasPrefix(i.Name, "eth") {
			ip := filterIP(l)
			if ip == "" {
				continue
			} else {
				return ip
			}
		}
	}

	return ""
}

func filterIP(addrs []net.Addr) string {
	for _, a := range addrs {
		if ipnet, ok := a.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				// if !strings.Contains(ipnet.IP.String(), "192.168") {
				return ipnet.IP.String()
				// }
			}
		}
	}

	return ""
}

func ReadFull(conn net.Conn, b []byte, t int) (int, error) {
	var total int
	for {
		if t != 0 {
			conn.SetReadDeadline(time.Now().Add(time.Duration(t) * time.Second))
		}
		n, err := conn.Read(b[total:])
		if err != nil {
			return total, err
		}
		total += n
		if total == len(b) {
			return total, nil
		}
	}
}

func HardwareAddr() (string, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "", err
	}
	for _, iface := range ifaces {
		if s := iface.HardwareAddr.String(); s != "" {
			return s, nil
		}
	}

	return "", errors.New("no hardware interface")
}

func Hostname() (string, error) {
	hostname, err := os.Hostname()
	if err != nil {
		return "", err
	}
	return hostname, nil
}

func PrivateIPv4() (net.IP, error) {
	as, err := net.InterfaceAddrs()
	if err != nil {
		return nil, err
	}

	for _, a := range as {
		ipnet, ok := a.(*net.IPNet)
		if !ok || ipnet.IP.IsLoopback() {
			continue
		}

		ip := ipnet.IP.To4()
		if isPrivateIPv4(ip) {
			return ip, nil
		}
	}
	return nil, errors.New("no private ip address")
}

func isPrivateIPv4(ip net.IP) bool {
	return ip != nil &&
		(ip[0] == 10 || ip[0] == 172 && (ip[1] >= 16 && ip[1] < 32) || ip[0] == 192 && ip[1] == 168)
}
