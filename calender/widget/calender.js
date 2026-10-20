// Calender widget for Scriptable (iOS / iPadOS / macOS).
// 1. Install Scriptable, create a new script, paste this file.
// 2. Optional: in Calender › Settings, export "Widget data" and save
//    calender-private.json into iCloud Drive › Scriptable (birthdays and events).
// 3. Add a Scriptable widget to the Home Screen and pick this script.

const FEED = 'https://vasoyasagar.github.io/calender/feeds/panchang.json'
const PRIVATE_FILE = 'calender-private.json'
const CACHE_FILE = 'calender-panchang-cache.json'

const pad = (n) => String(n).padStart(2, '0')
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

async function loadPanchang() {
  const fm = FileManager.local()
  const cache = fm.joinPath(fm.documentsDirectory(), CACHE_FILE)
  try {
    const data = await new Request(FEED).loadJSON()
    fm.writeString(cache, JSON.stringify(data))
    return data
  } catch (e) {
    return fm.fileExists(cache) ? JSON.parse(fm.readString(cache)) : { days: [] }
  }
}

async function loadPrivate() {
  try {
    const fm = FileManager.iCloud()
    const path = fm.joinPath(fm.documentsDirectory(), PRIVATE_FILE)
    if (!fm.fileExists(path)) return { people: [], events: [] }
    await fm.downloadFileFromiCloud(path)
    return JSON.parse(fm.readString(path))
  } catch (e) {
    return { people: [], events: [] }
  }
}

function daysUntil(key, todayKey) {
  const a = new Date(`${todayKey}T00:00:00`)
  const b = new Date(`${key}T00:00:00`)
  const n = Math.round((b - a) / 86400000)
  return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `in ${n}d`
}

function text(stack, str, size, opts = {}) {
  const t = stack.addText(str)
  t.font = opts.bold ? Font.boldSystemFont(size) : Font.systemFont(size)
  t.textColor = new Color(opts.color || '#ffffff', opts.alpha ?? 1)
  t.lineLimit = opts.lines || 1
  t.minimumScaleFactor = 0.7
  return t
}

async function build() {
  const now = new Date()
  const today = keyOf(now)
  const [panchang, priv] = await Promise.all([loadPanchang(), loadPrivate()])
  const day = panchang.days.find((d) => d.key === today)
  const family = config.widgetFamily || 'medium'

  const w = new ListWidget()
  const g = new LinearGradient()
  g.colors = [new Color('#ff7a59'), new Color('#e2366b')]
  g.locations = [0, 1]
  g.startPoint = new Point(0, 0)
  g.endPoint = new Point(1, 1)
  w.backgroundGradient = g
  w.setPadding(14, 14, 14, 14)
  w.url = 'https://vasoyasagar.github.io/calender/'
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 1, 0, 0)
  w.refreshAfterDate = tomorrow

  const row = w.addStack()
  row.layoutHorizontally()
  const left = row.addStack()
  left.layoutVertically()

  const df = new DateFormatter()
  df.dateFormat = 'EEE d MMM'
  text(left, df.string(now).toUpperCase(), 11, { bold: true, alpha: 0.85 })
  text(left, day ? day.gu : '—', family === 'small' ? 20 : 22, { bold: true })
  if (day) text(left, `${day.en} · ${day.samvat}`, 11, { alpha: 0.9 })
  left.addSpacer(6)
  for (const f of (day?.festivals || []).slice(0, 2)) text(left, `${f.emoji} ${f.gu}`, 13, { bold: true })

  const upcoming = [
    ...(priv.events || [])
      .filter((e) => keyOf(new Date(e.start)) === today && (e.allDay || e.end > now.getTime()))
      .map((e) => ({ when: e.allDay ? 'All day' : new Date(e.start).toTimeString().slice(0, 5), label: `${e.emoji ? `${e.emoji} ` : ''}${e.title}` })),
    ...(priv.people || [])
      .filter((p) => p.key >= today)
      .slice(0, 4)
      .map((p) => ({ when: daysUntil(p.key, today), label: `${p.emoji} ${p.title}` })),
  ]
  const fest = panchang.days.filter((d) => d.key > today && d.festivals.some((f) => f.kind === 'festival' || f.kind === 'ekadashi')).slice(0, 4)

  if (family === 'small') {
    left.addSpacer()
    if (upcoming[0]) text(left, `${upcoming[0].when} · ${upcoming[0].label}`, 11, { alpha: 0.95, lines: 2 })
    else if (fest[0]) text(left, `${daysUntil(fest[0].key, today)} · ${fest[0].festivals[0].emoji} ${fest[0].festivals[0].gu}`, 11, { alpha: 0.95, lines: 2 })
  } else {
    row.addSpacer(12)
    const right = row.addStack()
    right.layoutVertically()
    right.size = new Size(family === 'large' ? 150 : 140, 0)
    text(right, 'UP NEXT', 10, { bold: true, alpha: 0.75 })
    right.addSpacer(4)
    const list = [...upcoming, ...fest.map((d) => ({ when: daysUntil(d.key, today), label: `${d.festivals[0].emoji} ${d.festivals[0].gu}` }))]
    for (const it of list.slice(0, family === 'large' ? 9 : 4)) {
      text(right, it.label, 12, { bold: true })
      text(right, it.when, 10, { alpha: 0.8 })
      right.addSpacer(3)
    }
  }
  return w
}

const widget = await build()
if (config.runsInWidget) Script.setWidget(widget)
else await widget.presentMedium()
Script.complete()
