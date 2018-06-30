package bytes

import (
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBytesFormat(t *testing.T) {
	// B
	b := Format(0)
	assert.Equal(t, "0", b)
	// B
	b = Format(515)
	assert.Equal(t, "515B", b)

	// KB
	b = Format(31323)
	assert.Equal(t, "30.59KB", b)

	// MB
	b = Format(13231323)
	assert.Equal(t, "12.62MB", b)

	// GB
	b = Format(7323232398)
	assert.Equal(t, "6.82GB", b)

	// TB
	b = Format(7323232398434)
	assert.Equal(t, "6.66TB", b)

	// PB
	b = Format(9923232398434432)
	assert.Equal(t, "8.81PB", b)

	// EB
	b = Format(math.MaxInt64)
	assert.Equal(t, "8.00EB", b)
}

func TestBytesParseErrors(t *testing.T) {
	_, err := Parse("B999")
	if assert.Error(t, err) {
		assert.EqualError(t, err, "error parsing value=B999")
	}
}

func TestFloats(t *testing.T) {
	// From string:
	str := "12.25KB"
	value, err := Parse(str)
	assert.NoError(t, err)
	assert.Equal(t, int64(12544), value)

	str2 := Format(value)
	assert.Equal(t, str, str2)

	// To string:
	val := int64(13233029)
	str = Format(val)
	assert.Equal(t, "12.62MB", str)

	val2, err := Parse(str)
	assert.NoError(t, err)
	assert.Equal(t, val, val2)
}

func TestBytesParse(t *testing.T) {
	// B
	b, err := Parse("999")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(999), b)
	}
	b, err = Parse("-100")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(-100), b)
	}
	b, err = Parse("100.1")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(100), b)
	}
	b, err = Parse("515B")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(515), b)
	}

	// KB
	b, err = Parse("12.25KB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(12544), b)
	}
	b, err = Parse("12KB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(12288), b)
	}
	b, err = Parse("12K")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(12288), b)
	}

	// MB
	b, err = Parse("2MB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(2097152), b)
	}
	b, err = Parse("2M")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(2097152), b)
	}

	// GB
	b, err = Parse("6GB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(6442450944), b)
	}
	b, err = Parse("6G")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(6442450944), b)
	}

	// TB
	b, err = Parse("5TB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(5497558138880), b)
	}
	b, err = Parse("5T")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(5497558138880), b)
	}

	// PB
	b, err = Parse("9PB")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(10133099161583616), b)
	}
	b, err = Parse("9P")
	if assert.NoError(t, err) {
		assert.Equal(t, int64(10133099161583616), b)
	}

	// EB
	b, err = Parse("8EB")
	if assert.NoError(t, err) {
		assert.True(t, math.MaxInt64 == b-1)
	}
	b, err = Parse("8E")
	if assert.NoError(t, err) {
		assert.True(t, math.MaxInt64 == b-1)
	}
}
