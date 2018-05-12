package service

type Group struct {
	ID   []byte
	sess []Sess
}
type Sess struct {
	Addr string
	Cid  uint64
}
