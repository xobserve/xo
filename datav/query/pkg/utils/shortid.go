// Copyright 2023 observex.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package utils

import (
	"regexp"

	"github.com/teris-io/shortid"
)

var allowedChars = shortid.DefaultABC

var validUIDPattern = regexp.MustCompile(`^[a-zA-Z0-9\-\_]*$`).MatchString

func init() {
	gen, _ := shortid.New(1, allowedChars, 1)
	shortid.SetDefault(gen)
}

// IsValidShortUID checks if short unique identifier contains valid characters
func IsValidShortUID(uid string) bool {
	return validUIDPattern(uid)
}

// GenerateShortUID generates a short unique identifier.
func GenerateShortUID() string {
	return shortid.MustGenerate()
}
