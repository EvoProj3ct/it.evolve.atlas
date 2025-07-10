'use client'
import { useRef, useEffect, useState } from 'react'

const shipIcons = ['/ship.svg', '/vercel.svg', '/window.svg']
const alienIcons = [
  '/alien1.svg',
  '/alien2.svg',
  '/alien3.svg',
  '/next.svg',
  '/file.svg',
  '/twitter.svg',
  '/facebook.svg',
  '/instagram.svg',
  '/linkedin.svg',
  '/youtube.svg',
  '/globe.svg',
  '/vercel.svg',
  '/window.svg',
]

export default function Game() {
  const canvasRef = useRef(null)
  const shipImgRef = useRef(null)
  const [shipIcon, setShipIcon] = useState(shipIcons[0])
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(100)
  const [gameHeight, setGameHeight] = useState('100vh')

  const randomizeIcons = () => {
    const next = shipIcons[Math.floor(Math.random() * shipIcons.length)]
    setShipIcon(next)
  }

  useEffect(() => {
    const updateHeight = () => {
      const nav = document.querySelector('.nav')
      const footer = document.querySelector('.footer')
      const navH = nav ? nav.offsetHeight : 0
      const footerH = footer ? footer.offsetHeight : 0
      setGameHeight(`calc(100vh - ${navH + footerH}px)`)
    }
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    if (typeof Image === 'undefined') return
    if (!shipImgRef.current) {
      shipImgRef.current = new Image()
    }
    shipImgRef.current.src = shipIcon
  }, [shipIcon])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let width = canvas.offsetWidth
    let height = canvas.offsetHeight

    const updateDimensions = () => {
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    const shipSize = 30
    const ship = { x: width / 2 - shipSize / 2, y: height - shipSize - 10, width: shipSize, height: shipSize }
    const bullets = []
    const aliens = []
    const rows = []
    const alienSize = 30
    let left = false
    let right = false
    let lastShot = 0
    let shipHitFrames = 0

    const spawnRow = () => {
      const cols = Math.floor(width / (alienSize + 20))
      const gap = (width - cols * alienSize) / (cols + 1)
      const row = {
        aliens: [],
        direction: Math.random() < 0.5 ? -1 : 1,
        stepCount: 0,
        stepLimit: 120 + Math.random() * 180,
      }
      for (let i = 0; i < cols; i++) {
        const img = new Image()
        img.src = alienIcons[Math.floor(Math.random() * alienIcons.length)]
        const alien = {
          x: gap + i * (alienSize + gap),
          y: -alienSize,
          size: alienSize,
          img,
          hit: false,
          hitFrames: 0,
          row,
        }
        row.aliens.push(alien)
        aliens.push(alien)
      }
      rows.push(row)
    }

    spawnRow()
    let spawnInterval = setInterval(spawnRow, 2000)

    const shoot = () => {
      bullets.push({ x: ship.x + ship.width / 2 - 2, y: ship.y, width: 4, height: 10 })
    }

    const handleMouseMove = e => {
      const rect = canvas.getBoundingClientRect()
      ship.x = e.clientX - rect.left - ship.width / 2
    }

    const handleKeyDown = e => {
      if (e.key === 'ArrowLeft') left = true
      if (e.key === 'ArrowRight') right = true
      if (e.key === ' ') {
        const now = performance.now()
        if (now - lastShot >= 200) {
          shoot()
          lastShot = now
        }
      }
    }

    const handleKeyUp = e => {
      if (e.key === 'ArrowLeft') left = false
      if (e.key === 'ArrowRight') right = false
    }

    const handleClick = () => shoot()

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const update = () => {
      if (left) ship.x -= 5
      if (right) ship.x += 5
      ship.x = Math.max(0, Math.min(width - ship.width, ship.x))

      bullets.forEach(b => {
        b.y -= 5
      })

      rows.forEach((row, rIndex) => {
        let needReverse = false
        row.aliens.forEach(a => {
          a.x += row.direction * 1
          a.y += 0.05
          if (a.x < 0 || a.x + a.size > width) needReverse = true
        })
        row.stepCount++
        if (row.stepCount >= row.stepLimit || needReverse) {
          row.direction *= -1
          row.stepCount = 0
          row.stepLimit = 120 + Math.random() * 180
          row.aliens.forEach(a => {
            a.y += 5
          })
        }
      })

      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < -bullets[i].height) bullets.splice(i, 1)
      }

      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i]
        if (a.hit) {
          a.hitFrames++
          if (a.hitFrames > 10) {
            aliens.splice(i, 1)
            const idx = a.row.aliens.indexOf(a)
            if (idx !== -1) a.row.aliens.splice(idx, 1)
            continue
          }
        }
        if (a.y > height) {
          aliens.splice(i, 1)
          const idx = a.row.aliens.indexOf(a)
          if (idx !== -1) a.row.aliens.splice(idx, 1)
        }
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]
        for (let j = aliens.length - 1; j >= 0; j--) {
          const a = aliens[j]
          if (
            !a.hit &&
            b.x < a.x + a.size &&
            b.x + b.width > a.x &&
            b.y < a.y + a.size &&
            b.y + b.height > a.y
          ) {
            bullets.splice(i, 1)
            a.hit = true
            a.hitFrames = 0
            setScore(s => s + 1)
            break
          }
        }
      }

      for (let j = aliens.length - 1; j >= 0; j--) {
        const a = aliens[j]
        if (
          ship.x < a.x + a.size &&
          ship.x + ship.width > a.x &&
          ship.y < a.y + a.size &&
          ship.y + ship.height > a.y
        ) {
          aliens.splice(j, 1)
          const idx = a.row.aliens.indexOf(a)
          if (idx !== -1) a.row.aliens.splice(idx, 1)
          setHealth(h => Math.max(0, h - 5))
          shipHitFrames = 10
        }
      }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      ctx.drawImage(shipImgRef.current, ship.x, ship.y, ship.width, ship.height)
      if (shipHitFrames > 0) {
        ctx.save()
        ctx.globalCompositeOperation = 'source-atop'
        ctx.fillStyle = 'rgba(255,0,0,0.5)'
        ctx.fillRect(ship.x, ship.y, ship.width, ship.height)
        ctx.restore()
        shipHitFrames--
      }

      ctx.fillStyle = '#39FF14'
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height))
      aliens.forEach(a => {
        ctx.drawImage(a.img, a.x, a.y, a.size, a.size)
        if (a.hit) {
          ctx.save()
          ctx.globalCompositeOperation = 'source-atop'
          ctx.fillStyle = 'rgba(255,0,0,0.5)'
          ctx.fillRect(a.x, a.y, a.size, a.size)
          ctx.restore()
        }
      })

      animationId = requestAnimationFrame(update)
    }

    update()

    return () => {
      cancelAnimationFrame(animationId)
      clearInterval(spawnInterval)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  return (
    <div className="game" style={{ height: gameHeight }}>
      <canvas ref={canvasRef} className="game-canvas" />
      <div className="game-overlay">
        <h1 className="title game-title">Game</h1>
        <div className="score">Score: {score}</div>
        <div className="health">
          <div className="health-bar">
            <div className="health-fill" style={{ width: `${health}%` }} />
          </div>
          <span>{health}%</span>
        </div>
        <button onClick={randomizeIcons} className="btn randomize-btn">Randomizza Icone</button>
      </div>
    </div>
  )
}
