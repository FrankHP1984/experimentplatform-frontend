import { useEffect, useRef } from 'react'
import styles from './ParticleCanvas.module.css'

/**
 * ParticleCanvas — animated particle background for public/error screens.
 * Uses a plain <canvas> — no external libs.
 */
export default function ParticleCanvas({ count = 60 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let w, h, particles, animId

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth
      h = canvas.height = canvas.offsetHeight
    }

    const rand = (min, max) => Math.random() * (max - min) + min

    const init = () => {
      resize()
      particles = Array.from({ length: count }, () => ({
        x:    rand(0, w),
        y:    rand(0, h),
        r:    rand(1, 2.5),
        vx:   rand(-0.3, 0.3),
        vy:   rand(-0.3, 0.3),
        alpha: rand(0.2, 0.7),
        // Randomly pick violet or cyan tint
        color: Math.random() > 0.5 ? '108,77,230' : '0,212,170',
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      particles.forEach((p) => {
        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap around edges
        if (p.x < 0) p.x = w
        if (p.x > w) p.x = 0
        if (p.y < 0) p.y = h
        if (p.y > h) p.y = 0

        // Draw dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`
        ctx.fill()
      })

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(108,77,230,${0.12 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
    }
  }, [count])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
