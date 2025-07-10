'use client'
import { useRef, useEffect, useState } from 'react'

const shipIcons = ['/ship.svg', '/vercel.svg', '/window.svg']
const alienIcons = ['/alien1.svg', '/alien2.svg', '/alien3.svg', '/next.svg', '/file.svg']

export default function Game() {
  const canvasRef = useRef(null)
  const shipImgRef = useRef(new Image())
  const [shipIcon, setShipIcon] = useState(shipIcons[0])
  const [score, setScore] = useState(0)

  const randomizeIcons = () => {
    const next = shipIcons[Math.floor(Math.random() * shipIcons.length)]
    setShipIcon(next)
  }

  useEffect(() => {
    shipImgRef.current.src = shipIcon
  }, [shipIcon])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    const width = (canvas.width = canvas.offsetWidth)
    const height = (canvas.height = canvas.offsetHeight)

    const ship = { x: width / 2 - 20, y: height - 40, width: 40, height: 40 }
    const bullets = []
    const aliens = []
    let left = false
    let right = false

    const spawnAlien = () => {
      const img = new Image()
      img.src = alienIcons[Math.floor(Math.random() * alienIcons.length)]
      aliens.push({ x: Math.random() * (width - 40), y: -40, size: 40, img })
    }

    let spawnInterval = setInterval(spawnAlien, 1000)

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
        b.y -= 8
      })
      aliens.forEach(a => {
        a.y += 2
      })

      for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].y < -bullets[i].height) bullets.splice(i, 1)
      }

      for (let i = aliens.length - 1; i >= 0; i--) {
        if (aliens[i].y > height) aliens.splice(i, 1)
      }

      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i]
        for (let j = aliens.length - 1; j >= 0; j--) {
          const a = aliens[j]
          if (
            b.x < a.x + a.size &&
            b.x + b.width > a.x &&
            b.y < a.y + a.size &&
            b.y + b.height > a.y
          ) {
            bullets.splice(i, 1)
            aliens.splice(j, 1)
            setScore(s => s + 1)
            break
          }
        }
      }

      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      ctx.drawImage(shipImgRef.current, ship.x, ship.y, ship.width, ship.height)

      ctx.fillStyle = '#39FF14'
      bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height))
      aliens.forEach(a => ctx.drawImage(a.img, a.x, a.y, a.size, a.size))

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
    }
  }, [])

  return (
    <div className="game">
      <h1 className="title">Game</h1>
      <div>Score: {score}</div>
      <canvas ref={canvasRef} className="game-canvas" />
      <button onClick={randomizeIcons} className="btn randomize-btn">Randomizza Icone</button>
    </div>
  )
}
