// Copyright 2023 xObserve.io Team
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

export function trackPageview(url: string) {
    const _window = window as typeof window & { gtag: any }
    try {
      _window.gtag("config", process.env.GA_TRACKING_ID, {
        page_location: url,
        page_title: document.title,
      })
    } catch (err) {
      console.error("Failed sending metrics", err)
    }
  }
  
  type TrackEventOptions = {
    action: any
    category: string
    label: string
    value: string
  }
  
  export function trackEvent(options: TrackEventOptions) {
    const { action, category, label, value } = options
    const _window = window as typeof window & { gtag: any }
    try {
      _window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value,
      })
    } catch (err) {
      console.error("Failed sending metrics", err)
    }
  }
  