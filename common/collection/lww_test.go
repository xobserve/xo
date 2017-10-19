package collection

import (
	"fmt"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestLWWESetAddContains(t *testing.T) {
	testStr := "ABCD"

	lww := NewLWWSet()
	assert.False(t, lww.Contains(testStr))

	lww.Add(testStr)
	assert.True(t, lww.Contains(testStr))

	entry := lww.Set[testStr]
	assert.True(t, entry.IsAdded())
	assert.False(t, entry.IsRemoved())
	assert.False(t, entry.IsZero())
}

func TestLWWESetAddRemoveContains(t *testing.T) {
	lww := NewLWWSet()
	testStr := "object2"

	lww.Add(testStr)
	time.Sleep(1 * time.Millisecond)
	lww.Remove(testStr)

	assert.False(t, lww.Contains(testStr))

	entry := lww.Set[testStr]
	assert.False(t, entry.IsAdded())
	assert.True(t, entry.IsRemoved())
	assert.False(t, entry.IsZero())
}

func TestLWWESetMerge(t *testing.T) {
	var T = func(add, del int64) LWWTime {
		return LWWTime{AddTime: add, DelTime: del}
	}

	type set map[interface{}]LWWTime
	for _, tc := range []struct {
		lww1, lww2, expected, delta *LWWSet
		valid, invalid              []string
	}{
		{
			lww1: &LWWSet{
				Set: set{"A": T(10, 0), "B": T(20, 0)},
			},
			lww2: &LWWSet{
				Set: set{"A": T(0, 20), "B": T(0, 20)},
			},
			expected: &LWWSet{
				Set: set{"A": T(10, 20), "B": T(20, 20)},
			},
			delta: &LWWSet{
				Set: set{"A": T(0, 20), "B": T(0, 20)},
			},
			valid:   []string{"B"},
			invalid: []string{"A"},
		},
		{
			lww1: &LWWSet{
				Set: set{"A": T(10, 0), "B": T(20, 0)},
			},
			lww2: &LWWSet{
				Set: set{"A": T(0, 20), "B": T(10, 0)},
			},
			expected: &LWWSet{
				Set: set{"A": T(10, 20), "B": T(20, 0)},
			},
			delta: &LWWSet{
				Set: set{"A": T(0, 20)},
			},
			valid:   []string{"B"},
			invalid: []string{"A"},
		},
		{
			lww1: &LWWSet{
				Set: set{"A": T(30, 0), "B": T(20, 0)},
			},
			lww2: &LWWSet{
				Set: set{"A": T(20, 0), "B": T(10, 0)},
			},
			expected: &LWWSet{
				Set: set{"A": T(30, 0), "B": T(20, 0)},
			},
			delta: &LWWSet{
				Set: set{},
			},
			valid:   []string{"A", "B"},
			invalid: []string{},
		},
		{
			lww1: &LWWSet{
				Set: set{"A": T(10, 0), "B": T(0, 20)},
			},
			lww2: &LWWSet{
				Set: set{"C": T(10, 0), "D": T(0, 20)},
			},
			expected: &LWWSet{
				Set: set{"A": T(10, 0), "B": T(0, 20), "C": T(10, 0), "D": T(0, 20)},
			},
			delta: &LWWSet{
				Set: set{"C": T(10, 0), "D": T(0, 20)},
			},
			valid:   []string{"A", "C"},
			invalid: []string{"B", "D"},
		},
		{
			lww1: &LWWSet{
				Set: set{"A": T(10, 0), "B": T(30, 0)},
			},
			lww2: &LWWSet{
				Set: set{"A": T(20, 0), "B": T(20, 0)},
			},
			expected: &LWWSet{
				Set: set{"A": T(20, 0), "B": T(30, 0)},
			},
			delta: &LWWSet{
				Set: set{"A": T(20, 0)},
			},
			valid:   []string{"A", "B"},
			invalid: []string{},
		},
		{
			lww1: &LWWSet{
				Set: set{"A": T(0, 10), "B": T(0, 30)},
			},
			lww2: &LWWSet{
				Set: set{"A": T(0, 20), "B": T(0, 20)},
			},
			expected: &LWWSet{
				Set: set{"A": T(0, 20), "B": T(0, 30)},
			},
			delta: &LWWSet{
				Set: set{"A": T(0, 20)},
			},
			valid:   []string{},
			invalid: []string{"A", "B"},
		},
	} {

		tc.lww1.Merge(tc.lww2)
		assert.Equal(t, tc.expected, tc.lww1, "Merged set is not the same")
		assert.Equal(t, tc.delta, tc.lww2, "Delta set is not the same")

		for _, obj := range tc.valid {
			assert.True(t, tc.lww1.Contains(obj), fmt.Sprintf("expected merged set to contain %v", obj))
		}

		for _, obj := range tc.invalid {
			assert.False(t, tc.lww1.Contains(obj), fmt.Sprintf("expected merged set to NOT contain %v", obj))
		}
	}
}

func TestLWWESetAll(t *testing.T) {
	lww := NewLWWSet()
	lww.Add("ABC")

	all := lww.All()
	assert.Equal(t, 1, len(all))
}
