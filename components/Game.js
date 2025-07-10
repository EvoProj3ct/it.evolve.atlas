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
    const alienSize = 30
    let direction = 1
    let stepCount = 0
    let stepLimit = 60
    let left = false
    let right = false

    const spawnRow = () => {
      const cols = Math.floor(width / (alienSize + 20))
      const gap = (width - cols * alienSize) / (cols + 1)
      for (let i = 0; i < cols; i++) {
        const img = new Image()
        img.src = alienIcons[Math.floor(Math.random() * alienIcons.length)]
        aliens.push({
          x: gap + i * (alienSize + gap),
          y: -alienSize,
          size: alienSize,
          img,
          hit: false,
          hitFrames: 0,
        })
      }
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
      if (e.key === ' ') shoot()
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

      let reverse = false
      aliens.forEach(a => {
        a.x += direction * 1
        a.y += 0.05
        if (a.x < 0 || a.x + a.size > width) reverse = true
      })
      stepCount++
      if (stepCount >= stepLimit || reverse) {
        direction *= -1
        stepCount = 0
        stepLimit = direction === 1 ? 60 : 240
        aliens.forEach(a => {
          a.y += 5
        })
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < -bullets[i].height) bullets.splice(i, 1)
      }

      for (let i = aliens.length - 1; i >= 0; i--) {
        const a = aliens[i]
        if (a.hit) {
          a.hitFrames++
          if (a.hitFrames > 10) {
            aliens.splice(i, 1)
            continue
          }
        }
        if (a.y > height) aliens.splice(i, 1)
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
          setHealth(h => Math.max(0, h - 5))
        }
      }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      ctx.drawImage(shipImgRef.current, ship.x, ship.y, ship.width, ship.height)

      ctx.fillStyle = '#39FF14'
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height))
      aliens.forEach(a => {
        if (a.hit) {
          ctx.fillStyle = 'red'
          ctx.fillRect(a.x, a.y, a.size, a.size)
          ctx.fillStyle = '#39FF14'
        } else {
          ctx.drawImage(a.img, a.x, a.y, a.size, a.size)
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
