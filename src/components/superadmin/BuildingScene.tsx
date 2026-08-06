import { useRef, useEffect } from 'react'

type Mode = 'login' | 'signup'

interface BuildingSceneProps {
  mode: Mode
  /** Only used in login mode: true once both email + password have text */
  fieldsReady?: boolean
  /** Only used in login mode: set true once to trigger the walk-in + door animation */
  loginClicked?: boolean
  /** Whether the password field currently has focus (drives "cover"/"peek" eyes) */
  passwordFocused?: boolean
  /** Whether the password is currently shown as plain text */
  passwordVisible?: boolean
}

interface Building {
  color: string
  w: number
  h: number
  x: number
  tilt: number
  offY: number
  mouth: 'smile' | 'smirk' | 'happy' | 'open'
  eyeRelX: [number, number]
  eyeRelY: number
  wR: number
  wC: number
  roof: 'antenna' | 'pointed' | 'dome' | 'flat'
  iSY: number
  iD: number
  // runtime state
  introOY: number
  curTilt: number
  curOffY: number
  pupils: { ox: number; oy: number }[]
}

const W = 320
const H = 440
const GROUND_Y = H - 40

function makeBuildings(): Building[] {
  const defs: Omit<Building, 'introOY' | 'curTilt' | 'curOffY' | 'pupils'>[] = [
    { color: '#6c63ff', w: 62, h: 165, x: 28, tilt: 0, offY: 0, mouth: 'smile', eyeRelX: [0.32, 0.68], eyeRelY: 0.18, wR: 5, wC: 3, roof: 'antenna', iSY: -200, iD: 0 },
    { color: '#3a3a5c', w: 54, h: 205, x: 94, tilt: 0, offY: 0, mouth: 'smirk', eyeRelX: [0.33, 0.67], eyeRelY: 0.13, wR: 7, wC: 2, roof: 'pointed', iSY: 0, iD: 0 },
    { color: '#e8763a', w: 72, h: 188, x: 150, tilt: 0, offY: 6, mouth: 'happy', eyeRelX: [0.3, 0.7], eyeRelY: 0.15, wR: 6, wC: 3, roof: 'dome', iSY: -240, iD: 70 },
    { color: '#f0b429', w: 52, h: 108, x: 228, tilt: -4, offY: 10, mouth: 'open', eyeRelX: [0.3, 0.7], eyeRelY: 0.20, wR: 3, wC: 2, roof: 'flat', iSY: 0, iD: 0 },
  ]
  return defs.map(b => ({
    ...b,
    introOY: b.iSY || 0,
    curTilt: b.tilt,
    curOffY: b.offY,
    pupils: b.eyeRelX.map(() => ({ ox: 0, oy: 0 })),
  }))
}

// Orange hotel = BLD[2]
const HOTEL_X = 150
const HOTEL_W = 72
const HOTEL_DOOR_X = HOTEL_X + HOTEL_W / 2
const STOP_X = HOTEL_DOOR_X + 22

const S = 0.52 // character scale
const WALK_SPD = 0.55
const WALK_L = 22
const WALK_R = W - 22
const BSTOPS = [28 + 31, 94 + 27, 150 + 36, 228 + 26]
const GLANCE_INTERVAL = 200
const IDUR = 90

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}
function easeOutBounce(t: number) {
  if (t < 1 / 2.75) return 7.5625 * t * t
  if (t < 2 / 2.75) { t -= 1.5 / 2.75; return 7.5625 * t * t + 0.75 }
  if (t < 2.5 / 2.75) { t -= 2.25 / 2.75; return 7.5625 * t * t + 0.9375 }
  t -= 2.625 / 2.75
  return 7.5625 * t * t + 0.984375
}

type LoginPhase =
  | 'walk' | 'walk_to_stop' | 'stopped' | 'pocket_phone'
  | 'walk_door' | 'at_door' | 'enter' | 'done'
type SignupPhase = 'walk_to' | 'pause_phone' | 'look_up'

interface ManState {
  x: number
  y: number
  phase: LoginPhase | SignupPhase
  phaseT: number
  dir: 1 | -1
  legT: number
  vel: number
  phoneAlpha: number
  phoneAngle: number
  phoneBob: number
  glancing: boolean
  glanceT: number
  scale: number
  alpha: number
  bodyBob: number
  searchIdx: number
}

export default function BuildingScene({
  mode,
  fieldsReady = false,
  loginClicked = false,
  passwordFocused = false,
  passwordVisible = false,
}: BuildingSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)

  // mutable refs so the render loop always sees latest values without re-subscribing
  const fieldsReadyRef = useRef(fieldsReady)
  const loginClickedRef = useRef(loginClicked)
  const pwFocusRef = useRef(passwordFocused)
  const pwVisibleRef = useRef(passwordVisible)
  const modeRef = useRef(mode)

  const mouseRef = useRef({ x: W / 2, y: H / 2 })
  const bldRef = useRef<Building[]>(makeBuildings())
  const doorRef = useRef({ angle: 0, target: 0 })
  const introRef = useRef({ t: 0, active: false })
  const loginGlanceTimerRef = useRef(120)

  const manRef = useRef<ManState>({
    x: W + 20, y: GROUND_Y, phase: 'walk', phaseT: 0, dir: -1, legT: 0, vel: 0,
    phoneAlpha: 1, phoneAngle: 0.35, phoneBob: 0, glancing: false, glanceT: 0,
    scale: 1, alpha: 1, bodyBob: 0, searchIdx: 0,
  })

  fieldsReadyRef.current = fieldsReady
  loginClickedRef.current = loginClicked
  pwFocusRef.current = passwordFocused
  pwVisibleRef.current = passwordVisible

  // reset scene state whenever mode changes
  useEffect(() => {
    modeRef.current = mode
    const BLD = bldRef.current
    const man = manRef.current
    const door = doorRef.current

    if (mode === 'login') {
      man.x = W + 20; man.y = GROUND_Y
      man.phase = 'walk'; man.phaseT = 0
      man.dir = -1; man.legT = 0; man.vel = WALK_SPD
      man.phoneAlpha = 1; man.phoneAngle = 0.35; man.phoneBob = 0
      man.glancing = false; man.glanceT = 0
      man.scale = 1; man.alpha = 1; man.bodyBob = 0
      door.angle = 0; door.target = 0
      loginGlanceTimerRef.current = 120
    } else {
      man.x = -16; man.y = GROUND_Y
      man.phase = 'walk_to'; man.phaseT = 0
      man.dir = 1; man.legT = 0; man.vel = 0
      man.phoneAlpha = 1; man.phoneAngle = 0.35
      man.glancing = false; man.glanceT = 0
      man.scale = 1; man.alpha = 1; man.bodyBob = 0
      man.searchIdx = 0
      door.angle = 0; door.target = 0
    }

    // restart building drop-in intro
    introRef.current.t = 0
    introRef.current.active = true
    BLD.forEach(b => {
      b.introOY = b.iSY || 0
      b.curTilt = b.iSY < 0 ? -7 : b.tilt
    })
  }, [mode])

  // reset "loginClicked" driven re-entry handled by phase machine itself (see step function)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const maybeCtx = canvas.getContext('2d')
    if (!maybeCtx) return
    // `ctx` is now typed as CanvasRenderingContext2D (never null) for every
    // function defined below, instead of CanvasRenderingContext2D | null.
    const ctx: CanvasRenderingContext2D = maybeCtx
    canvas.width = W
    canvas.height = H

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
    }
    document.addEventListener('mousemove', handleMouseMove)

    function stepIntro() {
      const intro = introRef.current
      intro.t++
      let done = true
      bldRef.current.forEach(b => {
        const t = Math.max(0, intro.t - (b.iD || 0))
        const p = Math.min(1, t / IDUR)
        if (p < 1) done = false
        if (b.iSY < 0) {
          b.introOY = b.iSY * (1 - easeOutBounce(p))
          b.curTilt = lerp(-7, b.tilt, easeOutBounce(p))
        }
      })
      if (done) {
        intro.active = false
        bldRef.current.forEach(b => { b.introOY = 0; b.curTilt = b.tilt })
      }
    }

    function getEyeState(): 'open' | 'closed' {
      return pwVisibleRef.current ? 'open' : 'closed'
    }

    function updatePupils() {
      const state = getEyeState()
      if (state === 'closed') return
      const rect = canvas!.getBoundingClientRect()


      const panelRect = panelRef.current?.getBoundingClientRect()

      if (!panelRect) return
      const sx = rect.width / W
      const sy = rect.height / H
      const mx = (mouseRef.current.x - panelRect.left) / sx
      const my = (mouseRef.current.y - panelRect.top) / sy
      bldRef.current.forEach(b => {
        const gy = GROUND_Y + (b.curOffY || 0) + (b.introOY || 0)
        b.eyeRelX.forEach((rx, i) => {
          const ex = b.x + b.w * rx
          const ey = gy - b.h + b.h * b.eyeRelY
          const dx = mx - ex
          const dy = my - ey
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          b.pupils[i].ox = (dx / dist) * 2.5
          b.pupils[i].oy = (dy / dist) * Math.min(2.5, dist / 25)
        })
      })
    }

    function stepManLogin() {
      const man = manRef.current
      const door = doorRef.current
      man.phaseT++

      if (man.phase === 'walk') {
        man.vel = Math.min(WALK_SPD, man.vel + 0.012)
        man.x += man.dir * man.vel
        man.legT += man.vel * 0.22
        man.bodyBob = Math.sin(man.legT) * 0.9
        man.phoneBob = Math.sin(man.legT * 0.9) * 0.05
        man.phoneAngle = 0.33 + man.phoneBob
        man.phoneAlpha = man.glancing
          ? lerp(man.phoneAlpha, 0.15, 0.08)
          : lerp(man.phoneAlpha, 1, 0.08)

        if (man.x <= WALK_L) { man.x = WALK_L; man.dir = 1 }
        if (man.x >= WALK_R) { man.x = WALK_R; man.dir = -1 }

        loginGlanceTimerRef.current++
        if (!man.glancing && loginGlanceTimerRef.current > GLANCE_INTERVAL) {
          man.glancing = true; man.glanceT = 0; loginGlanceTimerRef.current = 0
        }
        if (man.glancing) {
          man.glanceT++
          if (man.glanceT > 70) man.glancing = false
        }

        if (fieldsReadyRef.current) {
          man.phase = 'walk_to_stop'; man.phaseT = 0
          man.glancing = false
        }
      } else if (man.phase === 'walk_to_stop') {
        const dist = STOP_X - man.x
        man.dir = dist >= 0 ? 1 : -1
        const absDist = Math.abs(dist)
        man.vel = absDist < 40
          ? Math.max(0.06, absDist * 0.022 + 0.06)
          : Math.min(WALK_SPD, man.vel + 0.012)

        man.x += man.dir * man.vel
        man.legT += man.vel * 0.22
        man.bodyBob = Math.sin(man.legT) * (man.vel / WALK_SPD) * 0.9
        man.phoneBob = Math.sin(man.legT * 0.9) * 0.04 * (man.vel / WALK_SPD)
        man.phoneAngle = 0.33 + man.phoneBob
        man.phoneAlpha = lerp(man.phoneAlpha, 1, 0.05)

        if (absDist < 1) {
          man.x = STOP_X; man.vel = 0; man.legT = 0; man.bodyBob = 0
          man.dir = -1
          man.phase = 'stopped'; man.phaseT = 0
        }
        if (!fieldsReadyRef.current) {
          man.phase = 'walk'; man.phaseT = 0
          man.dir = man.x > W / 2 ? -1 : 1
        }
      } else if (man.phase === 'stopped') {
        man.vel = 0; man.bodyBob = 0; man.dir = -1
        man.phoneAlpha = lerp(man.phoneAlpha, 0.9, 0.03)
        man.phoneAngle = lerp(man.phoneAngle, 0.3, 0.03)

        if (!fieldsReadyRef.current) {
          man.phase = 'walk'; man.phaseT = 0; man.vel = 0.1
          man.dir = 1
        }
        if (loginClickedRef.current) {
          man.phase = 'pocket_phone'; man.phaseT = 0
        }
      } else if (man.phase === 'pocket_phone') {
        man.phoneAlpha = Math.max(0, man.phoneAlpha - 0.055)
        man.bodyBob = Math.sin(man.phaseT * 0.25) * 0.6
        if (man.phaseT > 22) { man.phase = 'walk_door'; man.phaseT = 0; man.vel = 0 }
      } else if (man.phase === 'walk_door') {
        man.dir = -1
        man.vel = Math.min(WALK_SPD * 0.85, man.vel + 0.011)
        man.x -= man.vel
        man.legT += man.vel * 0.22
        man.bodyBob = Math.sin(man.legT) * 0.75
        man.phoneAlpha = 0
        if (man.x <= HOTEL_DOOR_X + 2) {
          man.x = HOTEL_DOOR_X + 2
          man.phase = 'at_door'; man.phaseT = 0
          door.target = 68
        }
      } else if (man.phase === 'at_door') {
        man.vel = 0; man.bodyBob = lerp(man.bodyBob, 0, 0.1)
        door.angle = lerp(door.angle, door.target, 0.07)
        if (door.angle >= 52) { man.phase = 'enter'; man.phaseT = 0 }
      } else if (man.phase === 'enter') {
        door.angle = lerp(door.angle, door.target, 0.06)
        man.x -= 0.45
        man.legT += 0.09
        man.scale = Math.max(0.05, 1 - man.phaseT / 45)
        man.alpha = Math.max(0, 1 - man.phaseT / 38)
        if (man.phaseT > 40) { man.phase = 'done'; door.target = 0 }
      } else if (man.phase === 'done') {
        door.angle = lerp(door.angle, 0, 0.05)
      }
    }

    function stepManSignup() {
      const man = manRef.current
      man.phaseT++
      if (man.phase === 'walk_to') {
        const tx = BSTOPS[man.searchIdx % BSTOPS.length]
        const dist = tx - man.x
        man.dir = dist >= 0 ? 1 : -1
        man.vel = Math.min(WALK_SPD, man.vel + 0.01)
        if (Math.abs(dist) < 35) man.vel = Math.max(0.07, Math.abs(dist) * 0.03 + 0.07)
        if (Math.abs(dist) < 2) {
          man.x = tx; man.vel = 0
          man.phase = 'pause_phone'; man.phaseT = 0
        } else {
          man.x += man.dir * man.vel
          man.legT += man.vel * 0.22
        }
        man.bodyBob = Math.sin(man.legT) * 0.8
        man.phoneAlpha = lerp(man.phoneAlpha, 0.5, 0.05)
        man.phoneAngle = lerp(man.phoneAngle, 0.5, 0.05)
        man.glancing = false
        man.x = Math.max(14, Math.min(W - 14, man.x))
      } else if (man.phase === 'pause_phone') {
        man.vel = 0; man.bodyBob = 0; man.legT = 0
        man.phoneAlpha = lerp(man.phoneAlpha, 1, 0.08)
        man.phoneAngle = lerp(man.phoneAngle, 0.28, 0.07)
        man.glancing = false
        if (man.phaseT > 60) { man.phase = 'look_up'; man.phaseT = 0 }
      } else if (man.phase === 'look_up') {
        man.vel = 0; man.bodyBob = 0
        man.phoneAlpha = lerp(man.phoneAlpha, 0.05, 0.07)
        man.glancing = true
        if (man.phaseT > 50) {
          man.glancing = false
          man.searchIdx++
          if (man.searchIdx >= BSTOPS.length) man.searchIdx = 0
          man.phase = 'walk_to'; man.phaseT = 0; man.vel = 0
        }
      }
    }

    function drawMan() {
      const man = manRef.current
      if (man.phase === 'done') return
      ctx.save()
      ctx.globalAlpha = man.alpha
      ctx.translate(man.x, man.y)
      ctx.scale(S, S)

      const d = man.dir
      const isMoving = ['walk', 'walk_to_stop', 'walk_door', 'walk_to', 'enter'].includes(man.phase)
      const leg = man.legT
      const lookUp = man.glancing
      const showPhone = man.phoneAlpha > 0.02
      const bob = man.bodyBob || 0

      // shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.beginPath(); ctx.ellipse(0, 3, 11, 4, 0, 0, Math.PI * 2); ctx.fill()

      // legs
      const ls = isMoving ? Math.sin(leg) * 18 : 0
      const rs = isMoving ? -Math.sin(leg) * 18 : 0
      ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 5; ctx.lineCap = 'round'
      ctx.save(); ctx.rotate((ls * Math.PI) / 180)
      ctx.beginPath(); ctx.moveTo(-4, -1 + bob); ctx.lineTo(-3, 9); ctx.lineTo(-5, 18); ctx.stroke()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(-5 + d * 2, 18, 6, 3, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      ctx.save(); ctx.rotate((rs * Math.PI) / 180)
      ctx.beginPath(); ctx.moveTo(4, -1 + bob); ctx.lineTo(3, 9); ctx.lineTo(5, 18); ctx.stroke()
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(5 + d * 2, 18, 6, 3, 0, 0, Math.PI * 2); ctx.fill()
      ctx.restore()

      const by = bob
      // suit jacket
      ctx.fillStyle = '#1a237e'
      ctx.beginPath(); ctx.roundRect(-10, -26 + by, 20, 26, 3); ctx.fill()
      ctx.fillStyle = 'rgba(0,0,0,0.16)'
      if (d > 0) { ctx.beginPath(); ctx.roundRect(2, -26 + by, 8, 26, 3); ctx.fill() }
      else { ctx.beginPath(); ctx.roundRect(-10, -26 + by, 8, 26, 3); ctx.fill() }
      // lapels
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.moveTo(0, -26 + by); ctx.lineTo(-6, -15 + by); ctx.lineTo(0, -18 + by); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(0, -26 + by); ctx.lineTo(6, -15 + by); ctx.lineTo(0, -18 + by); ctx.closePath(); ctx.fill()
      // tie
      ctx.fillStyle = '#c62828'
      ctx.beginPath(); ctx.moveTo(-2, -25 + by); ctx.lineTo(2, -25 + by); ctx.lineTo(3, -13 + by); ctx.lineTo(0, -10 + by); ctx.lineTo(-3, -13 + by); ctx.closePath(); ctx.fill()
      ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.ellipse(0, -25 + by, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill()

      // arms
      ctx.strokeStyle = '#1a237e'; ctx.lineWidth = 4.5; ctx.lineCap = 'round'
      const as = isMoving ? Math.sin(leg) * 12 : 0

      ctx.save()
      if (!(showPhone && !lookUp)) ctx.rotate((-as * Math.PI) / 180)
      ctx.beginPath(); ctx.moveTo(-8, -22 + by); ctx.lineTo(-11, -10 + by); ctx.stroke()
      if (showPhone) {
        ctx.save()
        ctx.globalAlpha *= man.phoneAlpha
        ctx.translate(-11, -12 + by)
        const ptilt = lookUp ? 0.05 : man.phoneAngle
        ctx.rotate(-ptilt * d)
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.roundRect(-4, -10, 9, 16, 2); ctx.fill()
        ctx.fillStyle = '#4fc3f7'; ctx.beginPath(); ctx.roundRect(-3, -9, 7, 13, 1); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillRect(-2, -7, 4, 1.2); ctx.fillRect(-2, -5, 5, 1.2); ctx.fillRect(-2, -3, 3, 1.2)
        if (man.phase === 'stopped' || man.phase === 'pause_phone') {
          ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(3.5, -9, 2.2, 0, Math.PI * 2); ctx.fill()
        }
        ctx.restore()
      } else {
        ctx.beginPath(); ctx.moveTo(-8, -22 + by); ctx.lineTo(-11 + as * 0.4, -10 + by); ctx.stroke()
      }
      ctx.restore()

      // right arm + briefcase
      ctx.save(); ctx.rotate((as * Math.PI) / 180)
      ctx.beginPath(); ctx.moveTo(8, -22 + by); ctx.lineTo(11, -10 + by); ctx.stroke()
      ctx.fillStyle = '#6d4c41'; ctx.beginPath(); ctx.roundRect(9, -12 + by, 14, 10, 2); ctx.fill()
      ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.roundRect(10, -11 + by, 12, 8, 1); ctx.fill()
      ctx.strokeStyle = '#4e342e'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(13, -12 + by); ctx.lineTo(13, -14 + by); ctx.lineTo(19, -14 + by); ctx.lineTo(19, -12 + by); ctx.stroke()
      ctx.restore()

      // neck
      ctx.fillStyle = '#f5cba7'; ctx.beginPath(); ctx.roundRect(-3, -30 + by, 6, 6, 1); ctx.fill()

      const headTilt = lookUp ? -d * 0.22 : 0
      const headY = -44 + by
      ctx.save()
      ctx.translate(0, headY + 10); ctx.rotate(headTilt); ctx.translate(0, -(headY + 10))

      ctx.fillStyle = '#e0a87a'
      if (d > 0) { ctx.beginPath(); ctx.roundRect(2, headY, 7, 20, 4); ctx.fill() }
      else { ctx.beginPath(); ctx.roundRect(-9, headY, 7, 20, 4); ctx.fill() }
      ctx.fillStyle = '#f5cba7'; ctx.beginPath(); ctx.roundRect(-9, headY, 18, 21, 5); ctx.fill()
      ctx.fillStyle = '#3e2723'
      ctx.beginPath(); ctx.roundRect(-9, headY, 18, 7, [5, 5, 0, 0]); ctx.fill()
      ctx.fillStyle = '#e8b48a'; ctx.beginPath(); ctx.ellipse(-d * 9, headY + 11, 3, 4, 0, 0, Math.PI * 2); ctx.fill()

      const eyeShiftY = lookUp ? -2 : 0
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(d * 3, headY + 9 + eyeShiftY, 4.5, 3.5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1a237e'; ctx.beginPath(); ctx.ellipse(d * 3.8, headY + 9 + eyeShiftY, 2.5, 2.5, 0, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(d * 4.6, headY + 8 + eyeShiftY, 1, 0, Math.PI * 2); ctx.fill()

      ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'
      const browRaise = lookUp ? -2 : 0
      ctx.beginPath(); ctx.moveTo(d * 0.5, headY + 4.5 + browRaise); ctx.lineTo(d * 7, headY + 5 + browRaise); ctx.stroke()

      ctx.strokeStyle = '#c0785a'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'
      const mx2 = d * 2.5, my2 = headY + 15
      const onPhone2 = showPhone && !lookUp && ['walk', 'walk_to_stop', 'stopped', 'pause_phone'].includes(man.phase)
      if (lookUp) {
        ctx.fillStyle = 'rgba(160,80,50,0.3)'
        ctx.beginPath(); ctx.ellipse(mx2, my2, 4, 3, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(mx2, my2, 4, 3, 0, 0, Math.PI * 2); ctx.stroke()
      } else if (onPhone2) {
        ctx.beginPath(); ctx.moveTo(mx2 - 2, my2); ctx.lineTo(mx2 + 4, my2); ctx.stroke()
      } else {
        ctx.beginPath(); ctx.arc(mx2, my2 - 1, 3.5, 0.25, Math.PI - 0.25); ctx.stroke()
      }
      ctx.restore()
      ctx.restore()
    }

    function drawDoor() {
      const door = doorRef.current
      const b = bldRef.current[2]
      const oy = b.introOY || 0
      const bh = b.h
      const by2 = GROUND_Y - bh + (b.curOffY || 0) + oy
      const dw = 20, dh = 30
      const dx = b.x + b.w / 2 - 10
      const dy = by2 + bh - dh
      ctx.fillStyle = '#5d4037'
      ctx.beginPath(); ctx.roundRect(dx - 2, dy - 2, dw + 4, dh + 2, 2); ctx.fill()
      ctx.save()
      ctx.translate(dx, dy)
      ctx.transform(Math.cos((door.angle * Math.PI) / 180), 0, 0, 1, 0, 0)
      ctx.fillStyle = '#a1887f'; ctx.fillRect(0, 0, dw, dh)
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.fillRect(2, 3, dw - 4, dh / 2 - 5); ctx.fillRect(2, dh / 2 + 1, dw - 4, dh / 2 - 4)
      ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(dw - 5, dh / 2, 2.5, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
    }

    function drawSky() {
      ctx.fillStyle = '#cdd0e3'; ctx.fillRect(0, 0, W, H)
      ;[[55, 52, 17], [195, 38, 13], [268, 75, 11], [128, 88, 9]].forEach(([x, y, r]) => {
        ctx.fillStyle = 'rgba(175,180,205,0.48)'
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.7, r, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(x + r * 0.5, y - r * 0.35, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.ellipse(x - r * 0.6, y - r * 0.2, r * 0.8, r * 0.6, 0, 0, Math.PI * 2); ctx.fill()
      })
      ctx.fillStyle = '#b8bcce'; ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y)
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, GROUND_Y, W, 2)
      for (let i = 0; i < 7; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(18 + i * 40, GROUND_Y + 15, 24, 5)
      }
    }

    function drawBuilding(b: Building) {
      const oy = b.introOY || 0
      ctx.save()
      ctx.translate(b.x + b.w / 2, GROUND_Y + (b.curOffY || 0) + oy)
      ctx.rotate((b.curTilt || 0) * Math.PI / 180)
      ctx.translate(-b.w / 2, -b.h)
      const bw = b.w, bh = b.h
      ctx.fillStyle = b.color
      ctx.beginPath(); ctx.roundRect(0, 0, bw, bh, 4); ctx.fill()

      if (b.roof === 'pointed') {
        ctx.fillStyle = b.color
        ctx.beginPath(); ctx.moveTo(bw / 2, 0); ctx.lineTo(bw / 2 - 10, -22); ctx.lineTo(bw / 2 + 10, -22); ctx.closePath(); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(bw / 2 - 1, -22, 2, 22)
      } else if (b.roof === 'dome') {
        ctx.fillStyle = b.color
        ctx.beginPath(); ctx.ellipse(bw / 2, -2, bw * 0.38, 14, 0, Math.PI, 0); ctx.fill()
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.beginPath(); ctx.roundRect(bw / 2 - 11, bh - 30, 22, 30, 3); ctx.fill()
      } else if (b.roof === 'antenna') {
        ctx.fillStyle = b.color; ctx.fillRect(bw / 2 - 1, -18, 2, 18)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.beginPath(); ctx.arc(bw / 2, -18, 4, 0, Math.PI * 2); ctx.fill()
      }

      const wSY = bh * 0.42, wAH = bh * 0.5, ww = 8, wh = 10
      const xGap = (bw - b.wC * ww) / (b.wC + 1)
      const yGap = (wAH - b.wR * wh) / (b.wR + 1)
      for (let r = 0; r < b.wR; r++) {
        for (let c = 0; c < b.wC; c++) {
          const lit = (r + c + b.color.charCodeAt(1)) % 3 !== 0
          ctx.fillStyle = lit ? 'rgba(255,245,160,0.4)' : 'rgba(0,0,0,0.15)'
          ctx.beginPath()
          ctx.roundRect(xGap + (xGap + ww) * c, wSY + yGap + (yGap + wh) * r, ww, wh, 2)
          ctx.fill()
        }
      }

      const eyeY = bh * b.eyeRelY
      const state = getEyeState()
      b.eyeRelX.forEach((rx, i) => {
        const ex = bw * rx, ey = eyeY, p = b.pupils[i]
        if (state === 'closed') {
          ctx.fillStyle = b.color
          ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 2; ctx.lineCap = 'round'
          ctx.beginPath(); ctx.moveTo(ex - 4, ey - 1); ctx.quadraticCurveTo(ex, ey + 2, ex + 4, ey - 1); ctx.stroke()
        } else {
          ctx.fillStyle = 'white'
          ctx.beginPath(); ctx.arc(ex, ey, 6, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#1a1a2e'
          ctx.beginPath(); ctx.arc(ex + p.ox, ey + p.oy, 3, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = 'white'
          ctx.beginPath(); ctx.arc(ex + p.ox + 1.5, ey + p.oy - 1.5, 1, 0, Math.PI * 2); ctx.fill()
        }
      })

      const mx2 = bw / 2, my2 = bh * b.eyeRelY + 16
      ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'
      if (b.mouth === 'smile') {
        ctx.beginPath(); ctx.arc(mx2, my2 - 2, 7, 0.3, Math.PI - 0.3); ctx.stroke()
      } else if (b.mouth === 'smirk') {
        ctx.beginPath(); ctx.moveTo(mx2 - 5, my2); ctx.quadraticCurveTo(mx2 + 2, my2 + 4, mx2 + 6, my2 - 1); ctx.stroke()
      } else if (b.mouth === 'happy') {
        ctx.beginPath(); ctx.arc(mx2, my2 - 3, 8, 0.2, Math.PI - 0.2); ctx.stroke()
        ctx.fillStyle = 'rgba(255,255,255,0.12)'
        ctx.beginPath(); ctx.arc(mx2, my2 - 3, 8, 0.2, Math.PI - 0.2); ctx.fill()
      } else if (b.mouth === 'open') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)'
        ctx.beginPath(); ctx.ellipse(mx2, my2, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      }
      ctx.restore()
    }

    function render() {
      ctx.clearRect(0, 0, W, H)
      drawSky()
      if (introRef.current.active) stepIntro()
      updatePupils()
      ;[1, 3, 0, 2].forEach(i => drawBuilding(bldRef.current[i]))
      drawDoor()
      if (modeRef.current === 'login') stepManLogin()
      else stepManSignup()
      drawMan()
      rafRef.current = requestAnimationFrame(render)
    }
    render()

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div ref={panelRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />
    </div>
  )
}
