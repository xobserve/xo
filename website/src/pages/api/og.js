import { readFileSync } from 'fs'
import { join } from 'path'
import * as cheerio from 'cheerio'
import { https } from 'follow-redirects'
import { Canvas, Image } from '@napi-rs/canvas'
import opentype from 'opentype.js'

const WIDTH = 1200
const HEIGHT = 630
const PADDING = { x: 96, y: 96 }

const fontMedium = opentype.loadSync(resolve('Inter-Medium.otf'))
const fontSemiBold = opentype.loadSync(resolve('Inter-SemiBold.otf'))
const fontExtraBold = opentype.loadSync(resolve('Inter-ExtraBold.otf'))

const colors = {
  sky500: '#0EA5E9',
  slate400: '#94A3B8',
  slate500: '#64748B',
  'slate500/30': 'rgba(100, 116, 139, 0.3)',
}

const charVariants = {
  // https://github.com/rsms/inter/blob/master/src/features/cv02-four.fea
  '\u0034': '\uE06E',
  '\uE075': '\uE07E',
  '\uE142': '\uE14B',
  '\u2783': '\uE12E',

  // https://github.com/rsms/inter/blob/master/src/features/cv03-six.fea
  '\u0036': '\uE06F',
  '\uE077': '\uE07F',
  '\uE144': '\uE14C',
  '\u2785': '\uE12F',

  // https://github.com/rsms/inter/blob/master/src/features/cv04-nine.fea
  '\u0039': '\uE070',
  '\uE07A': '\uE080',
  '\uE147': '\uE14D',
  '\u2788': '\uE130',

  // https://github.com/rsms/inter/blob/master/src/features/cv11-single-storey-a.fea
  '\u0061': '\uE02C',
  '\u00E1': '\uE02D',
  '\u0103': '\uE02E',
  '\u1EAF': '\uE02F',
  '\u1EB7': '\uE030',
  '\u1EB1': '\uE031',
  '\u1EB3': '\uE032',
  '\u1EB5': '\uE033',
  '\u01CE': '\uE034',
  '\u00E2': '\uE035',
  '\u1EA5': '\uE036',
  '\u1EAD': '\uE037',
  '\u1EA7': '\uE038',
  '\u1EA9': '\uE039',
  '\u1EAB': '\uE03A',
  '\u0201': '\uE03B',
  '\u00E4': '\uE03C',
  '\u01DF': '\uE03D',
  '\u0227': '\uE03E',
  '\u1EA1': '\uE03F',
  '\u01E1': '\uE040',
  '\u00E0': '\uE041',
  '\u1EA3': '\uE042',
  '\u0203': '\uE043',
  '\u0101': '\uE044',
  '\u0105': '\uE045',
  '\u1E9A': '\uE046',
  '\u00E5': '\uE047',
  '\u01FB': '\uE048',
  '\u1E01': '\uE049',
  '\u00E3': '\uE04A',
  '\u0430': '\uE02C',
}

function measureText(text, { font, size, letterSpacing }) {
  let path = font.getPath(text, 0, 0, size, { letterSpacing })
  let bb = path.getBoundingBox()
  return bb.x2 - bb.x1
}

function applyInterCharVariants(text) {
  let newText = ''
  for (let i = 0; i < text.length; i++) {
    let char = text[i]
    newText += charVariants[char] ?? char
  }
  return newText
}

function resolve(filename) {
  return join(process.cwd(), 'assets', filename)
}

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = []
        res.on('data', (chunk) => {
          data.push(chunk)
        })
        res.on('end', () => {
          resolve({ data: Buffer.concat(data), statusCode: res.statusCode })
        })
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

function getLines(text, { font, size, maxWidth, letterSpacing = 0 }) {
  let words = text.split(' ')
  let lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    let word = words[i]
    let width = measureText(currentLine + ' ' + word, { font, size, letterSpacing })
    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)

  // prevent widows
  if (
    lines.length > 1 &&
    lines[lines.length - 2].split(' ').length > 1 &&
    lines[lines.length - 1].split(' ').length === 1
  ) {
    lines[lines.length - 1] =
      lines[lines.length - 2].split(' ').pop() + ' ' + lines[lines.length - 1]
    lines[lines.length - 2] = lines[lines.length - 2].split(' ').slice(0, -1).join(' ')
  }

  return lines
}

function truncate(text, { font, size, maxWidth, letterSpacing = 0 }) {
  let suffix = ' …'
  let width = Infinity
  while (true) {
    width = measureText(text + suffix, { font, size, letterSpacing })
    if (width < maxWidth) {
      return text + suffix
    }
    text = text.replace(/ \S*$/, '')
  }
}

function getText(text, { font, size, letterSpacing = 0, lineHeight = size, maxLines = Infinity }) {
  text = applyInterCharVariants(text)
  let scale = (1 / font.unitsPerEm) * size
  let height = font.ascender * scale + Math.abs(font.descender * scale)
  let dy = (lineHeight - height) / 2
  let maxWidth = WIDTH - PADDING.x * 2
  let lines = getLines(text, { font, size, maxWidth, letterSpacing })

  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines)
    lines[lines.length - 1] = truncate(lines[lines.length - 1], {
      font,
      size,
      maxWidth,
      letterSpacing,
    })
  }

  return {
    lines: lines.length,
    height: lineHeight * lines.length,
    measureLines: () => lines.map((line) => measureText(line, { font, size, letterSpacing })),
    draw: (ctx, x, y, { color = 'black' } = {}) => {
      for (let i = 0; i < lines.length; i++) {
        let path = font.getPath(
          lines[i],
          x,
          y + font.ascender * scale + dy + lineHeight * i,
          size,
          { letterSpacing }
        )
        path.fill = color
        path.draw(ctx)
      }
    },
  }
}

export default async function handler(req, res) {
  try {
    if (!req.query.path?.startsWith('/') || req.query.path?.startsWith('/api/')) {
      res.statusCode = 400
      return res.end('Error')
    }

    let path = req.query.path.replace(/\/+$/, '')
    if (path === '') path = '/'

    let url = `https://tailwindcss.com${path}`
    let { data, statusCode } = await get(url)
    let body = data.toString()

    if (statusCode === 404) {
      res.statusCode = 404
      return res.end('404')
    }
    if (statusCode !== 200 || !body) {
      res.statusCode = 500
      return res.end('Error')
    }

    let $ = cheerio.load(body)
    let title = $('title')
      .text()
      .replace(/ [-–] Tailwind CSS$/, '')

    if (!title) {
      res.statusCode = 500
      return res.end('Error')
    }

    let canvas = new Canvas(WIDTH, HEIGHT)
    let ctx = canvas.getContext('2d')

    let bgImage = new Image()
    bgImage.src = readFileSync(resolve('og-background.png'))
    bgImage.width = WIDTH
    bgImage.height = HEIGHT
    ctx.drawImage(bgImage, 0, 0, WIDTH, HEIGHT)

    let logoImage = new Image()
    logoImage.src = readFileSync(resolve('logo.svg'))
    logoImage.width = 404
    logoImage.height = 50
    ctx.drawImage(logoImage, PADDING.x, PADDING.y, 404, 50)

    if (path.startsWith('/blog/')) {
      let date = $('article time').attr('datetime')

      let eyebrowText = getText('What’s new', { font: fontSemiBold, size: 28, lineHeight: 48 })
      let titleText = getText(title, {
        font: fontExtraBold,
        size: 48,
        lineHeight: 72,
        letterSpacing: -0.025,
        maxLines: 3,
      })

      titleText.draw(ctx, PADDING.x, HEIGHT - PADDING.y - titleText.height)
      eyebrowText.draw(
        ctx,
        PADDING.x,
        HEIGHT - PADDING.y - titleText.height - 16 - eyebrowText.height,
        { color: colors.sky500 }
      )

      if (date) {
        date = new Date(date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'UTC',
        })
        let dateText = getText(date, { font: fontSemiBold, size: 28, lineHeight: 48 })
        let eyebrowWidth = eyebrowText.measureLines()[0]
        dateText.draw(
          ctx,
          PADDING.x + eyebrowWidth + 54,
          HEIGHT - PADDING.y - titleText.height - 16 - eyebrowText.height,
          { color: colors.slate400 }
        )

        ctx.beginPath()
        ctx.arc(
          PADDING.x + eyebrowWidth + 24 + 3,
          HEIGHT - PADDING.y - titleText.height - 16 - 24,
          3,
          0,
          2 * Math.PI
        )
        ctx.fillStyle = colors['slate500/30']
        ctx.fill()
      }
    } else {
      let eyebrow = $('#nav li[data-active="true"]')
        .parents('li')
        .first()
        .children('h5')
        .first()
        .text()
        .trim()
      let description = $('meta[property="og:description"]').attr('content')

      let eyebrowText = eyebrow
        ? getText(eyebrow, { font: fontSemiBold, size: 28, lineHeight: 48 })
        : null
      let titleText = getText(title, {
        font: fontExtraBold,
        size: 72,
        lineHeight: 80,
        letterSpacing: -0.025,
        maxLines: 3,
      })
      let descriptionText =
        description && titleText.lines < 3
          ? getText(description, {
              font: fontMedium,
              size: 32,
              lineHeight: 56,
              maxLines: titleText.lines === 2 ? 1 : 2,
            })
          : null

      let offset = PADDING.y

      if (descriptionText) {
        descriptionText.draw(ctx, PADDING.x, HEIGHT - offset - descriptionText.height, {
          color: colors.slate500,
        })
        offset += descriptionText.height + 16
      }

      titleText.draw(ctx, PADDING.x, HEIGHT - offset - titleText.height)

      if (eyebrowText) {
        eyebrowText.draw(
          ctx,
          PADDING.x,
          HEIGHT - offset - titleText.height - 16 - eyebrowText.height,
          { color: colors.sky500 }
        )
      }
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'image/png')
    res.setHeader(
      'Cache-Control',
      'public, immutable, no-transform, s-maxage=31536000, max-age=600'
    )
    res.end(canvas.toBuffer('image/png'))
  } catch (e) {
    res.statusCode = 500
    console.error(e)
    res.end('Error')
  }
}
