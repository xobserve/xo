// Copyright 2023 xObserve.io Team

export const isNodeGraphData = (data: any): boolean => {
  return data && data.nodes && data.edges
}
