package main

import "fmt"
import "math/big"

type state struct {
	write bool
	move, goto0, goto1 int
}

const (
	white = false
	black = true
	movl = -1
	movr = +1
)

var states = []state{
	state{white, movl, 1, 1},
	state{black, movl, 2, 2},
	state{white, movl, 3, 3},
	state{black, movr, 4, 4},
	state{white, movr, 6, 5},
	state{black, movr, 6, 5},
	state{white, movr, 7, 8}, // reject = 7
	state{white, movr, 7, 7},
	state{black, movr, 7, 9},
	state{black, movr, 26, 10}, // check number terminal = 9
	state{black, movl, 11, 11},
	state{white, movl, 12, 13},
	state{white, movl, 12, 13},
	state{black, movl, 14, 15},
	state{white, movl, 14, 15},
	state{black, movl, 21, 16},
	state{black, movr, 17, 17},
	state{white, movr, 18, 19},
	state{white, movr, 18, 19},
	state{black, movr, 20, 9},
	state{white, movr, 20, 9},
	state{white, movl, 22, 22}, // reset counter = 21
	state{white, movr, 23, 23},
	state{white, movr, 24, 24},
	state{black, movr, 25, 19},
	state{black, movr, 25, 19},
	state{white, movl, 27, 27}, // finish division = 26
	state{black, movl, 28, 29},
	state{black, movl, 28, 29},
	state{black, movl, 31, 30},
	state{white, movl, 36, 36}, // edge case
	state{white, movl, 32, 33},
	state{black, movl, 32, 33},
	state{black, movl, 34, 36},
	state{white, movl, 7, 35},
	state{white, movl, 35, 35}, // accept = 35
	state{black, movl, 37, 36},
	state{black, movl, 2, 2},
}

var reject = 7
var accept = 35

// Run using the given input tape until the machine halts.
func simulate(input []bool) (int, bool) {
	// This should always be enough space.
	tape := append(make([]bool, len(input) + 4), input...)
	tape = append(tape, white)
	// Initialize.
	n := 0
	q := 0
	i := len(input) + 3
	// Run until a halt state is reached.
	for (q != accept && q != reject) {
		// Show tape
		/*for _, bit := range tape {
			if bit {
				print("1")
			} else {
				print("0")
			}
		}
		println()
		for j := range tape {
			if j < i {
				print(" ")
			} else {
				println(q)
				break
			}
		}*/

		// Execute step
		qq := states[q]
		tape[i] = qq.write
		i += qq.move
		n += 1
		if tape[i] {
			q = qq.goto1
		} else {
			q = qq.goto0
		}
	}
	return n, q == accept
}

// This implements the minimal primality test Turing machine to check its
// correctness on some numbers, and to count exactly how many steps it takes.
func main() {
	for i := 10; i < 20; i++ {
		input := make([]bool, i);
		for j := range input {
			input[j] = true
		}
		steps, prime := simulate(input)
		fmt.Printf("%v\t%v\t%v\n", i, prime, steps)
		pprime := big.NewInt(int64(i)).ProbablyPrime(0)
		if prime != pprime {
			println("error!")
			return
		}
	}
}
