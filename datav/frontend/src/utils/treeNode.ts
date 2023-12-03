// Copyright (c) 2017 Uber Technologies, Inc.
//

export default class TreeNode {
  value
  children
  static iterFunction(fn, depth = 0) {
    return (node) => fn(node.value, node, depth)
  }

  static searchFunction(search) {
    if (typeof search === 'function') {
      return search
    }

    return (value, node) =>
      search instanceof TreeNode ? node === search : value === search
  }

  constructor(value, children = []) {
    this.value = value
    this.children = children
  }

  get depth() {
    return this.children.reduce(
      (depth, child) => Math.max(child.depth + 1, depth),
      1,
    )
  }

  get size() {
    let i = 0
    this.walk(() => i++)
    return i
  }

  addChild(child) {
    this.children.push(child instanceof TreeNode ? child : new TreeNode(child))
    return this
  }

  find(search) {
    const searchFn = TreeNode.iterFunction(TreeNode.searchFunction(search))
    if (searchFn(this)) {
      return this
    }
    for (let i = 0; i < this.children.length; i++) {
      const result = this.children[i].find(search)
      if (result) {
        return result
      }
    }
    return null
  }

  getPath(search) {
    const searchFn = TreeNode.iterFunction(TreeNode.searchFunction(search))

    const findPath = (currentNode, currentPath) => {
      // skip if we already found the result
      const attempt = currentPath.concat([currentNode])
      // base case: return the array when there is a match
      if (searchFn(currentNode)) {
        return attempt
      }
      for (let i = 0; i < currentNode.children.length; i++) {
        const child = currentNode.children[i]
        const match = findPath(child, attempt)
        if (match) {
          return match
        }
      }
      return null
    }

    return findPath(this, [])
  }

  walk(fn, depth = 0) {
    const nodeStack = []
    let actualDepth = depth
    nodeStack.push({ node: this, depth: actualDepth })
    while (nodeStack.length) {
      const { node, depth: nodeDepth } = nodeStack.pop()
      fn(node.value, node, nodeDepth)
      actualDepth = nodeDepth + 1
      let i = node.children.length - 1
      while (i >= 0) {
        nodeStack.push({ node: node.children[i], depth: actualDepth })
        i--
      }
    }
  }

  paths(fn) {
    const stack = []
    stack.push({ node: this, childIndex: 0 })
    const paths = []
    while (stack.length) {
      const { node, childIndex } = stack[stack.length - 1]
      if (node.children.length >= childIndex + 1) {
        stack[stack.length - 1].childIndex++
        stack.push({ node: node.children[childIndex], childIndex: 0 })
      } else {
        if (node.children.length === 0) {
          const path = stack.map((item) => item.node.value)
          fn(path)
        }
        stack.pop()
      }
    }
    return paths
  }
}
