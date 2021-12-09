import { writable } from "svelte/store";

export const timeRemaining = writable(0)
export const timerState = writable(0)

export const workTimerLength = writable(1000 * 60 * 50) // 50 minutes
export const shortBreakLength = writable(1000 * 60 * 10)
export const longBreakLength = writable(1000 * 60 * 20)