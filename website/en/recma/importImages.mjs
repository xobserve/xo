import { visit } from 'estree-util-visit'
import { slugifyWithCounter } from '@sindresorhus/slugify'

const slugify = slugifyWithCounter()
const EXTERNAL_URL = /^[a-z]+:\/\//i

export function recmaImportImages({ exportName = 'default', property } = {}) {
  return (tree) => {
    slugify.reset()

    let images = {}

    visit(tree, (node) => {
      if (node.type !== 'CallExpression') return
      if (
        node.callee.name !== '_jsx' &&
        node.callee.name !== '_jsxDEV' &&
        node.callee.name !== '_jsxs'
      )
        return
      if (node.arguments[0].type !== 'MemberExpression') return
      if (node.arguments[0].object.name !== '_components') return
      if (node.arguments[0].property.name !== 'img') return
      if (node.arguments[1].type !== 'ObjectExpression') return
      let srcProp = node.arguments[1].properties.find((prop) => prop.key.name === 'src')
      if (!srcProp?.value.value) return
      let path = srcProp.value.value
      if (EXTERNAL_URL.test(path)) return
      let name =
        images[path] ?? `_${slugify(srcProp.value.value).replace(/-/g, '_')}$recmaImportImages`
      images[path] = name
      if (property) {
        srcProp.value = {
          type: 'MemberExpression',
          object: { type: 'Identifier', name },
          property: { type: 'Identifier', name: property },
        }
      } else {
        srcProp.value = { type: 'Identifier', name }
      }
    })

    tree.body.unshift(
      ...Object.entries(images).map(([path, name]) => ({
        type: 'ImportDeclaration',
        specifiers: [
          {
            type: 'ImportSpecifier',
            imported: { type: 'Identifier', name: exportName },
            local: { type: 'Identifier', name },
          },
        ],
        source: { type: 'Literal', value: path },
      }))
    )
  }
}
