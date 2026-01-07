import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useGSAP = (animationFn, deps = []) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (animationFn) {
        animationFn(containerRef.current)
      }
    }, containerRef)

    return () => ctx.revert()
  }, deps)

  return containerRef
}

export const usePageTransition = () => {
  useEffect(() => {
    gsap.fromTo(
      'main',
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.3, 
        ease: 'expo.out',
        force3D: true
      }
    )
  }, [])
}

export const useFadeIn = (delay = 0) => {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      gsap.set(ref.current, { willChange: 'transform, opacity' })
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          delay, 
          ease: 'power2.out',
          force3D: true
        }
      )
    }
  }, [delay])

  return ref
}


