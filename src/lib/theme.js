export function hexToRgb(hex) {
  const c = hex.replace('#', '')
  return {
    r: parseInt(c.substring(0, 2), 16),
    g: parseInt(c.substring(2, 4), 16),
    b: parseInt(c.substring(4, 6), 16),
  }
}

export function applyTheme(primaryColor) {
  if (!primaryColor || !primaryColor.startsWith('#')) return
  const { r, g, b } = hexToRgb(primaryColor)
  const lv = v => Math.min(255, Math.round(v + (255 - v) * 0.18))
  const root = document.documentElement
  root.style.setProperty('--accent',        primaryColor)
  root.style.setProperty('--accent-hover',  `rgb(${lv(r)},${lv(g)},${lv(b)})`)
  root.style.setProperty('--accent-dim',    `rgba(${r},${g},${b},0.15)`)
  root.style.setProperty('--accent-glow',   `rgba(${r},${g},${b},0.30)`)
  root.style.setProperty('--border-active', `rgba(${r},${g},${b},0.50)`)
}
