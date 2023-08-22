import { highlightCode } from '../../../remark/utils'

/**
 * @typedef {object} CodeSnippet
 * @property {string} lang
 * @property {string} code
 */

/**
 * @param {{code: CodeSnippet|CodeSnippet[]}[]} steps
 * @returns {(string|string[])[]}
 */
export function highlightedCodeSnippets(steps) {
  /**
   * @param {CodeSnippet} code
   * @returns {string}
   */
  function highlight(code) {
    return code.lang && code.lang === 'terminal' ? code.code : highlightCode(code.code, code.lang)
  }

  return steps.map(({ code }) => {
    return Array.isArray(code) ? code.map((code) => highlight(code)) : highlight(code)
  })
}
