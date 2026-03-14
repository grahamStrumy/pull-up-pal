export function formatTimer(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`
}

export function notifyRestFinished() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([180, 120, 180])
  }
}
