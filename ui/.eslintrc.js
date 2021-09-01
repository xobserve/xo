// Copyright (c) 2019 Uber Technologies, Inc.
//
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

module.exports = {
  "rules": {
    "no-restricted-imports": ["error", { "patterns": ["@grafana/runtime", "@grafana/data/*", "@grafana/ui", "@grafana/e2e"] }]
  },
  "overrides": [
    {
      "files": ["**/*.{test,story}.{ts,tsx}"],
      "rules": {
        "no-restricted-imports": "off",
        "react/prop-types": "off",
        "import/imports-first": [ "warn", "DISABLE-absolute-first" ],
      }
    }
  ]
}

  