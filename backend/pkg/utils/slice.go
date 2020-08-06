package utils

/*--------------------------Slice tricks--------------------------------*/

// AppendVector

// a = append(a, b...)
// Copy

// b = make([]T, len(a))
// copy(b, a)
// // or
// b = append([]T(nil), a...)
// Cut

// a = append(a[:i], a[j:]...)
// Delete

// a = append(a[:i], a[i+1:]...)
// // or
// a = a[:i+copy(a[i:], a[i+1:])]
// Delete without preserving order

// a[i] = a[len(a)-1]
// a = a[:len(a)-1]
// NOTE If the type of the element is a pointer or a struct with pointer fields, which need to be garbage collected, the above implementations of Cut and Delete have a potential memory leak problem: some elements with values are still referenced by slice a and thus can not be collected. The following code can fix this problem:

// Cut
// copy(a[i:], a[j:])
// for k, n := len(a)-j+i, len(a); k < n; k++ {
// 	a[k] = nil // or the zero value of T
// }
// a = a[:len(a)-j+i]
// Delete
// copy(a[i:], a[i+1:])
// a[len(a)-1] = nil // or the zero value of T
// a = a[:len(a)-1]
// Delete without preserving order
// a[i] = a[len(a)-1]
// a[len(a)-1] = nil
// a = a[:len(a)-1]
// Expand

// a = append(a[:i], append(make([]T, j), a[i:]...)...)
// Extend

// a = append(a, make([]T, j)...)
// Insert

// a = append(a[:i], append([]T{x}, a[i:]...)...)
// NOTE The second append creates a new slice with its own underlying storage and copies elements in a[i:] to that slice, and these elements are then copied back to slice a (by the first append). The creation of the new slice (and thus memory garbage) and the second copy can be avoided by using an alternative way:

// Insert
// s = append(s, 0)
// copy(s[i+1:], s[i:])
// s[i] = x
// InsertVector

// a = append(a[:i], append(b, a[i:]...)...)
// Pop/Shift

// x, a = a[0], a[1:]
// Pop Back

// x, a = a[len(a)-1], a[:len(a)-1]
// Push

// a = append(a, x)
// Push Front/Unshift

// a = append([]T{x}, a...)
// Additional Tricks

// Filtering without allocating

// This trick uses the fact that a slice shares the same backing array and capacity as the original, so the storage is reused for the filtered slice. Of course, the original contents are modified.

// b := a[:0]
// for _, x := range a {
// 	if f(x) {
// 		b = append(b, x)
// 	}
// }
// Reversing

// To replace the contents of a slice with the same elements but in reverse order:

// for i := len(a)/2-1; i >= 0; i-- {
// 	opp := len(a)-1-i
// 	a[i], a[opp] = a[opp], a[i]
// }
// The same thing, except with two indices:

// for left, right := 0, len(a)-1; left < right; left, right = left+1, right-1 {
// 	a[left], a[right] = a[right], a[left]
// }
// Shuffling

// Fisher–Yates algorithm:

// Since go1.10, this is available at math/rand.Shuffle
// for i := len(a) - 1; i > 0; i-- {
//     j := rand.Intn(i + 1)
//     a[i], a[j] = a[j], a[i]
// }
