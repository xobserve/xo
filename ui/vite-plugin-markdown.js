import Frontmatter from 'front-matter'
import MarkdownIt from 'markdown-it'
import { parseDOM, DomUtils } from 'htmlparser2'

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

const markdownCompiler = (options) => {
  if (options.markdownIt) {
    if (options.markdownIt instanceof MarkdownIt || (options.markdownIt?.constructor?.name === 'MarkdownIt')) {
      return options.markdownIt
    } else if (typeof options.markdownIt === 'object') {
      return MarkdownIt(options.markdownIt)
    }
  } else if (options.markdown) {
    return { render: options.markdown }
  }
  return MarkdownIt({ html: true, xhtmlOut: false }) // TODO: xhtmlOut should be got rid of in next major update
}

const tf = (code, id, options) => {

  if (!id.endsWith('.md')) return null

  const content = new ExportedContent()
  const fm = Frontmatter(code)
  content.addContext(`const attributes = ${JSON.stringify(fm.attributes)}`)
  content.addExporting('attributes')

  content.addContext(`const markdown = ${JSON.stringify(fm.body)}`)
  content.addExporting('markdown')
  const html = markdownCompiler(options).render(fm.body)
  const root = parseDOM(html)
  const indicies = root.filter(
    rootSibling => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rootSibling.tagName)
  )

  const toc = indicies.map(index => ({
    level: index.tagName.replace('h', ''),
    content: DomUtils.getText(index),
  }))

  content.addContext(`const toc = ${JSON.stringify(toc)}`)
  content.addExporting('toc')

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