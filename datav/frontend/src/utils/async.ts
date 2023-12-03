// Copyright 2023 xObserve.io Team

export async function asyncSleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}
