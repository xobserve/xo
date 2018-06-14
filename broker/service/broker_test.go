//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package service

import (
	"testing"
	"time"
)

func TestPubAndSubOnline(t *testing.T) {
	// start the two nodes in cluster
	// first node
	go testServer("8901", "00:00:00:00:00:01", "8911", "", "localhost:8921")
	go testServer("8902", "00:00:00:00:00:02", "8912", "localhost:8911", "localhost:8922")

	// give some starup time to the two nodes
	time.Sleep(2 * time.Second)

	// sub to the second node

	// pub to the first node

}

func TestClusterPubAndSub(t *testing.T) {

}

func testServer(bport string, chaddr string, cport string, cseed string, adminAddr string) {

}
