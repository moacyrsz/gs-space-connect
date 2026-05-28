import { useEffect, useRef, useState } from 'react'

/**
 * Anima de 0 até `value` em `duration` ms usando easeOutQuint.
 * Reanima quando `value` muda. Mantém precisão decimal se o valor
 * original tiver casas decimais.
 */
export function useCountUp(value, { duration = 600, decimals } = {}) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const startRef = useRef(0)
  const rafRef = useRef(0)

  // detecta casas decimais do valor original se não foi passado
  const inferredDecimals =
    decimals != null ? decimals : (() => {
      const s = String(value)
      const dot = s.indexOf('.')
      return dot === -1 ? 0 : Math.min(s.length - dot - 1, 2)
    })()

  useEffect(() => {
    cancelAnimationFrame(rafRef.current)
    fromRef.current = display
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      // easeOutQuint
      const eased = 1 - Math.pow(1 - t, 5)
      const current = fromRef.current + (Number(value) - fromRef.current) * eased
      setDisplay(current)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return Number(display).toFixed(inferredDecimals)
}
