import { visit } from 'unist-util-visit'
import { Parser } from 'acorn'
import acornJsx from 'acorn-jsx'

const JsxParser = Parser.extend(acornJsx())

export default () => {
  return (tree) => {
    visit(tree, 'code', (node, nodeIndex, parentNode) => {
      if (node.lang !== 'html') {
        return
      }
      let meta = node.meta?.trim()
      if (!meta) {
        return
      }
      if (!/^{\s*{.*?example:/.test(meta)) {
        return
      }

      node.type = 'mdxJsxFlowElement'
      node.name = 'Example'
      node.children = []

      let next = parentNode.children[nodeIndex + 1]

      node.attributes = [
        {
          type: 'mdxJsxAttribute',
          name: 'containerClassName',
          value: next?.type === 'code' ? 'mt-4 -mb-3' : 'my-6',
        },
        {
          type: 'mdxJsxAttribute',
          name: 'html',
          value: node.value,
        },
      ]

      if (!/\bexample:\s*true/.test(meta)) {
        let props = `...(${meta.slice(1, -1)}).example`
        node.attributes.push({
          type: 'mdxJsxExpressionAttribute',
          value: props,
          data: {
            estree: {
              type: 'Program',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: JsxParser.parseExpressionAt(`{${props}}`, 0, {
                    ecmaVersion: 'latest',
                  }),
                },
              ],
            },
          },
        })
      }
    })
  }
}
