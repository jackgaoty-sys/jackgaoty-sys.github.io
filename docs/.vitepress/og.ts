import fs from 'node:fs'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import type { HeadConfig, TransformContext } from 'vitepress'
import { SERIES } from './series'
import { readNo } from './lognum'

// 分享卡片：构建时给每篇文章画一张 1200×630 的 PNG（频道 · 编号 · 标题），
// 其余页面共用一张站点卡片。链接发到微信、推特时显示的就是它。
// 只在 build 时跑（transformHead 是构建钩子），dev 不受影响。
//
// 字体：卡片里的中文靠系统字体渲染。CI 的 Ubuntu 上由 deploy.yml 装 Noto Sans CJK，
// 本机 macOS 用自带的冬青黑体。两边都没有时中文会变成方块 —— 改字体列表前先确认 CI 上装了。

export const SITE_URL = 'https://jackgaoty-sys.github.io'

const SANS = "'Noto Sans CJK SC', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Heiti SC', sans-serif"
const MONO = "'JetBrains Mono', 'DejaVu Sans Mono', Menlo, monospace"

const C = {
  bg: '#0E1116',
  text: '#D7DEE5',
  text2: '#8E9AA6',
  text3: '#7A8691',
  green1: '#3DDC97',
  green2: '#2EA876',
  green3: '#277A5A',
  green4: '#1B4536',
}
const CH_COLOR: Record<string, string> = { trace: '#5CC8FF', dump: '#3DDC97', escape: '#FF9E64' }

interface Article {
  channel: string
  no: number
  title: string
  date: string | null
  series: string | null
}

// ---------------------------------------------------------------- 入口

let siteCard: Promise<void> | null = null

export async function ogHead({ pageData, siteConfig }: TransformContext): Promise<HeadConfig[]> {
  const rel = pageData.relativePath
  const art = articleOf(rel, siteConfig.srcDir, pageData.title, pageData.frontmatter)

  let img: string
  if (art) {
    img = 'og/' + rel.replace(/\.md$/, '.png')
    await writePng(siteConfig.outDir, img, articleSvg(art))
  } else {
    img = 'og/site.png'
    siteCard ??= writePng(siteConfig.outDir, img, siteSvg())
    await siteCard
  }

  const url = SITE_URL + '/' + rel.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  const title = art ? `${art.channel} #${pad(art.no)} | ${art.title}` : pageData.title || '沙箱逃逸.log'
  const desc = pageData.frontmatter.description || pageData.description || siteConfig.site.description
  const image = SITE_URL + '/' + img

  return [
    ['meta', { property: 'og:type', content: art ? 'article' : 'website' }],
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: desc }],
    ['meta', { property: 'og:url', content: url }],
    ['meta', { property: 'og:image', content: image }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: image }],
  ]
}

// trace/ dump/ escape/ 下除总览页以外的 md 才算文章
function articleOf(rel: string, srcDir: string, title: string, fm: Record<string, any>): Article | null {
  const channel = rel.split('/')[0]
  if (!CH_COLOR[channel] || rel.endsWith('index.md')) return null
  const no = readNo(fs.readFileSync(path.join(srcDir, rel), 'utf-8'))
  if (Number.isNaN(no)) return null // 缺号由 log.data.ts 负责报错，这里不重复
  const series = SERIES.find((s) => rel.startsWith(s.dir + '/'))
  const d = fm.date
  return {
    channel,
    no,
    title,
    date: d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : null,
    series: series ? series.title : null,
  }
}

async function writePng(outDir: string, rel: string, svg: string) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans CJK SC' },
  })
    .render()
    .asPng()
  const file = path.join(outDir, rel)
  await fs.promises.mkdir(path.dirname(file), { recursive: true })
  await fs.promises.writeFile(file, png)
}

// ---------------------------------------------------------------- 画面

// 头像里的三格光标（坐标取自头像原图的 1024 画布）
const BLOCKS = `
  <polygon fill="${C.green4}" points="543,445 580,450 574,502 537,497"/>
  <polygon fill="${C.green3}" points="617,347 675,360 656,445 598,432"/>
  <polygon fill="${C.green1}" points="746,189 835,218 793,349 703,320"/>`

const AVATAR = `
  <g fill="none" stroke="${C.green2}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
    <path d="M205 432V357H282M343 357H365M426 357H448M205 495V517M205 578V600M205 660V683M205 745V820H282M343 820H365M426 820H448M508 820H530M595 820H670V745M670 683V660M670 600V578"/>
  </g>
  <path d="M288 530L360 590L288 650" fill="none" stroke="${C.green1}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
  ${BLOCKS}`

// resvg 在同一个 <text> 里混排中文和等宽字时，会把等宽那段也换成中文字体。
// 所以等宽部分一律单独起一个 <text>，x 坐标按字宽算：等宽 0.6em，中文 1em。
const MONO_ADV = 0.6

// 「沙箱逃逸.log」：中文与 .log 分成两段画
function brand(x: number, y: number, size: number) {
  return `<text x="${x}" y="${y}" font-family="${SANS}" font-size="${size}" font-weight="700" fill="${C.text}">沙箱逃逸</text>
  <text x="${x + 4 * size}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${C.green1}">.log</text>`
}

function articleSvg(a: Article) {
  const color = CH_COLOR[a.channel]
  // 标题避开右上角的光标块，宽度收到 740；两行放不下就把字号降一档再排。
  // 「01 · 意图识别」里的间隔号在线上用的 Noto 里是全角宽，再带两边的空格就显得很散，去掉空格。
  // （本机预览用的冬青黑体里它是半角，会显得挤一点，以线上为准）
  const title = a.title.replace(/\s*·\s*/g, '·')
  let size = 64
  let lines = wrap(title, 740, size, 3)
  if (lines.length > 2) {
    size = 54
    lines = wrap(title, 740, size, 3)
  }
  const lh = Math.round(size * 1.3)
  // 标签 + 标题当成一块，在框内上下居中：标题一行时不至于下半张卡全空着
  const blockH = 34 + 36 + lines.length * lh
  const labelY = Math.round(70 + (430 - blockH) / 2 + 34)
  const titleY = labelY + 36 + size
  const tag = `${a.channel} #${pad(a.no)}`
  const seriesX = 100 + Math.round(tag.length * MONO_ADV * 34) + 16

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <path d="M1150 250V590H50V40H760" fill="none" stroke="${C.green2}" stroke-opacity="0.5" stroke-width="5" stroke-linecap="round" stroke-dasharray="18 22"/>
  <g transform="translate(434 -128) scale(0.8)">${BLOCKS}</g>

  <text x="100" y="${labelY}" font-family="${MONO}" font-size="34"><tspan fill="${color}">${a.channel}</tspan><tspan fill="${C.text}"> #${pad(a.no)}</tspan></text>
  ${a.series ? `<text x="${seriesX}" y="${labelY}" font-family="${SANS}" font-size="30" fill="${C.text3}">· ${esc(a.series)}</text>` : ''}

  <text font-family="${SANS}" font-size="${size}" font-weight="700" fill="${C.text}">
    ${lines.map((l, i) => `<tspan x="100" y="${titleY + i * lh}">${esc(l)}</tspan>`).join('')}
  </text>

  ${brand(100, 548, 30)}
  ${a.date ? `<text x="1100" y="548" text-anchor="end" font-family="${MONO}" font-size="26" fill="${C.text3}">${a.date}</text>` : ''}
</svg>`
}

function siteSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.bg}"/>
  <g transform="translate(40 35) scale(0.5)">${AVATAR}</g>
  ${brand(520, 300, 88)}
  <text x="524" y="372" font-family="${SANS}" font-size="32" fill="${C.text2}">给 Agent 造沙箱的人，偶尔也想按一下 Esc。</text>
  <text x="524" y="440" font-family="${MONO}" font-size="24" fill="${C.text3}"><tspan fill="${CH_COLOR.trace}">trace/</tspan>  <tspan fill="${CH_COLOR.dump}">dump/</tspan>  <tspan fill="${CH_COLOR.escape}">escape/</tspan></text>
</svg>`
}

// ---------------------------------------------------------------- 工具

const pad = (n: number) => String(n).padStart(3, '0')

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// SVG 不会自己折行：按字宽估算手动断行。中文按 1 个字宽，拉丁字母按半个多；
// 英文单词整词换行。超过 maxLines 行就截断加省略号。
function wrap(text: string, maxWidth: number, fontSize: number, maxLines: number): string[] {
  const widthOf = (s: string) =>
    [...s].reduce((w, ch) => w + (/[⺀-鿿　-〿＀-￯]/.test(ch) ? 1 : /[A-Z0-9]/.test(ch) ? 0.62 : 0.52), 0) *
    fontSize
  const tokens = text.match(/[A-Za-z0-9_.\-/]+\s*|\s+|./gu) ?? []
  const lines: string[] = []
  let cur = ''
  for (const t of tokens) {
    if (cur && widthOf(cur + t) > maxWidth) {
      lines.push(cur.trimEnd())
      cur = t.trimStart()
    } else cur += t
  }
  if (cur) lines.push(cur.trimEnd())
  if (lines.length <= maxLines) return lines
  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1]
  while (last && widthOf(last + '…') > maxWidth) last = [...last].slice(0, -1).join('')
  kept[maxLines - 1] = last + '…'
  return kept
}
