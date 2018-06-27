
A MQTT protocol package(V3.1.1)
------------

### Connect to a mqtt server
```go
conn, err := net.Dial("tcp", host)
if err != nil {
	panic(err)
}

// connect to server
cp := mqtt.Connect{}
cp.Username = []byte("sunface")
cp.UsernameFlag = true
if _, err := cp.EncodeTo(conn); err != nil {
	...
}
```

### Subscribe
```go
sp := mqtt.Subscribe{
	MessageID:     1,
	Subscriptions: []mqtt.TopicQOSTuple{mqtt.TopicQOSTuple{1, topic}},
}
sp.EncodeTo(conn)
```

### Publish
```go
msg := mqtt.Publish{
	Header: &mqtt.StaticHeader{
		QOS: 0,
	},
	Payload: []byte("hello world"),
}
_, err := msg.EncodeTo(conn)
```


