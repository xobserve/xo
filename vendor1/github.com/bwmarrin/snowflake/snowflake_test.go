package snowflake

import (
	"bytes"
	"reflect"
	"testing"
)

func TestMarshalJSON(t *testing.T) {
	id := ID(13587)
	expected := "\"13587\""

	bytes, err := id.MarshalJSON()
	if err != nil {
		t.Error("Unexpected error during MarshalJSON")
	}

	if string(bytes) != expected {
		t.Errorf("Got %s, expected %s", string(bytes), expected)
	}
}

func TestMarshalsIntBytes(t *testing.T) {
	id := ID(13587).IntBytes()
	expected := []byte{0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x35, 0x13}
	if !bytes.Equal(id[:], expected) {
		t.Errorf("Expected ID to be encoded as %v, got %v", expected, id)
	}
}

func TestUnmarshalJSON(t *testing.T) {
	tt := []struct {
		json        string
		expectedId  ID
		expectedErr error
	}{
		{`"13587"`, 13587, nil},
		{`1`, 0, JSONSyntaxError{[]byte(`1`)}},
		{`"invalid`, 0, JSONSyntaxError{[]byte(`"invalid`)}},
	}

	for _, tc := range tt {
		var id ID
		err := id.UnmarshalJSON([]byte(tc.json))
		if !reflect.DeepEqual(err, tc.expectedErr) {
			t.Errorf("Expected to get error '%s' decoding JSON, but got '%s'", tc.expectedErr, err)
		}

		if id != tc.expectedId {
			t.Errorf("Expected to get ID '%s' decoding JSON, but got '%s'", tc.expectedId, id)
		}
	}
}

func TestBase32(t *testing.T) {

	node, _ := NewNode(1)

	for i := 0; i < 100; i++ {

		sf := node.Generate()
		b32i := sf.Base32()
		psf, err := ParseBase32([]byte(b32i))
		if err != nil {
			t.Fatal(err)
		}
		if sf != psf {
			t.Fatal("Parsed does not match String.")
		}
	}
}

func BenchmarkParseBase32(b *testing.B) {

	node, _ := NewNode(1)
	sf := node.Generate()
	b32i := sf.Base32()

	b.ReportAllocs()

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		ParseBase32([]byte(b32i))
	}
}
func BenchmarkBase32(b *testing.B) {

	node, _ := NewNode(1)
	sf := node.Generate()

	b.ReportAllocs()

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		sf.Base32()
	}
}
func TestBase58(t *testing.T) {

	node, _ := NewNode(1)

	for i := 0; i < 10; i++ {

		sf := node.Generate()
		b58 := sf.Base58()
		psf, err := ParseBase58([]byte(b58))
		if err != nil {
			t.Fatal(err)
		}
		if sf != psf {
			t.Fatal("Parsed does not match String.")
		}
	}
}
func BenchmarkParseBase58(b *testing.B) {

	node, _ := NewNode(1)
	sf := node.Generate()
	b58 := sf.Base58()

	b.ReportAllocs()

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		ParseBase58([]byte(b58))
	}
}
func BenchmarkBase58(b *testing.B) {

	node, _ := NewNode(1)
	sf := node.Generate()

	b.ReportAllocs()

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		sf.Base58()
	}
}
func BenchmarkGenerate(b *testing.B) {

	node, _ := NewNode(1)

	b.ReportAllocs()

	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_ = node.Generate()
	}
}

func BenchmarkUnmarshal(b *testing.B) {
	// Generate the ID to unmarshal
	node, _ := NewNode(1)
	id := node.Generate()
	bytes, _ := id.MarshalJSON()

	var id2 ID

	b.ReportAllocs()
	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_ = id2.UnmarshalJSON(bytes)
	}
}

func BenchmarkMarshal(b *testing.B) {
	// Generate the ID to marshal
	node, _ := NewNode(1)
	id := node.Generate()

	b.ReportAllocs()
	b.ResetTimer()
	for n := 0; n < b.N; n++ {
		_, _ = id.MarshalJSON()
	}
}
