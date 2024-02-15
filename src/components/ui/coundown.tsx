import { useRef, useState, useEffect } from 'react'

import styles from './styles.module.scss'

export const LiveLabel = () => {
  return (
    <div className="text-white flex flex-row items-center px-4">
      <div className="block w-[0.5rem] h-[0.5rem] bg-green-500 rounded-full mr-2"></div>
      <span className="uppercase">Live</span>
    </div>
  )
}

export const CountdownLabel = ({
  message = 'Sales start in',
  target,
  className,
  children,
  show_green_dot = false,
  ...props
}: {
  message?: string
  target: Date
  className?: string
  children?: React.ReactNode
  show_green_dot?: boolean
  [key: string]: any
}) => {
  return (
    <div className="text-white flex flex-row items-center px-4" {...props}>
      {show_green_dot && (
        <div className="block w-[0.5rem] h-[0.5rem] bg-green-500 rounded-full mr-2"></div>
      )}
      {message}&nbsp;
      <Countdown target={target} />
      {children}
    </div>
  )
}

export const Countdown = ({ target }: { target: Date }) => {
  let interval: any = useRef()

  const [timerDays, setTimerDays] = useState('00')
  const [timerHours, setTimerHours] = useState('00')
  const [timerMinutes, setTimerMinutes] = useState('00')
  const [timerSeconds, setTimerSeconds] = useState('00')

  const startTimer = (target: Date) => {
    const countdownDate = new Date(target).getTime()

    interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = countdownDate - now

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (distance < 0) {
        // stop countdown
        clearInterval(interval.current)
      } else {
        setTimerDays(days.toString())
        setTimerHours(hours.toString())
        setTimerMinutes(minutes.toString())
        setTimerSeconds(seconds.toString())
      }
    }, 1000)
  }

  useEffect(() => {
    startTimer(target)

    return () => {
      clearInterval(interval)
    }
  })

  return (
    <span>
      {timerDays}d {timerHours}h {timerMinutes}m {timerSeconds}s
    </span>
  )
}
