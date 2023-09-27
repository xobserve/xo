import Frontmatter from 'front-matter'

/* 
Allow importing markdown files in vite project
*/


class ExportedContent {
  #exports = []
  #contextCode = ''

  addContext(contextCode) {
    this.#contextCode += `${contextCode}\n`
  }

  addExporting(exported) {
    this.#exports.push(exported)
  }

  export() {
    return [this.#contextCode, `export { ${this.#exports.join(', ')} }`].join('\n')
  }
}

const tf = (code, id, options) => {

  if (!id.endsWith('.md')) return null
 
  const content = new ExportedContent()
  const fm = Frontmatter(code)
  content.addContext(`const attributes = ${JSON.stringify(fm.attributes)}`)
  content.addExporting('attributes')

  if (options.mode?.includes('markdown')) {
    content.addContext(`const markdown = ${JSON.stringify(fm.body)}`)
    content.addExporting('markdown')
  }


  return {
    code: content.export(),
  }
}


export const plugin = (options) => {
  return {
    name: 'vite-plugin-markdown',
    enforce: 'pre',
    transform(code, id) {
      return tf(code, id, options)
    },
  }
}

export default plugin