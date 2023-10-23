// Copyright 2023 Datav.io Team
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
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"strings"

	"golang.org/x/crypto/pbkdf2"
)

// GetRandomString generate random string by specify chars.
// source: https://github.com/gogits/gogs/blob/9ee80e3e5426821f03a4e99fad34418f5c736413/modules/base/tool.go#L58
func GetRandomString(n int, alphabets ...byte) (string, error) {
	const alphanum = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
	var bytes = make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	for i, b := range bytes {
		if len(alphabets) == 0 {
			bytes[i] = alphanum[b%byte(len(alphanum))]
		} else {
			bytes[i] = alphabets[b%byte(len(alphabets))]
		}
	}
	return string(bytes), nil
}

// EncodePassword encodes a password using PBKDF2.
func EncodePassword(password string, salt string) (string, error) {
	newPasswd := pbkdf2.Key([]byte(password), []byte(salt), 10000, 50, sha256.New)
	return hex.EncodeToString(newPasswd), nil
}

// GetBasicAuthHeader returns a base64 encoded string from user and password.
func GetBasicAuthHeader(user string, password string) string {
	var userAndPass = user + ":" + password
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(userAndPass))
}

// DecodeBasicAuthHeader decodes user and password from a basic auth header.
func DecodeBasicAuthHeader(header string) (string, string, error) {
	var code string
	parts := strings.SplitN(header, " ", 2)
	if len(parts) == 2 && parts[0] == "Basic" {
		code = parts[1]
	}

	decoded, err := base64.StdEncoding.DecodeString(code)
	if err != nil {
		return "", "", err
	}

	userAndPass := strings.SplitN(string(decoded), ":", 2)
	if len(userAndPass) != 2 {
		return "", "", errors.New("Invalid basic auth header")
	}

	return userAndPass[0], userAndPass[1], nil
}

// RandomHex returns a random string from a n seed.
func RandomHex(n int) (string, error) {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
