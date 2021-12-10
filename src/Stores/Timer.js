import { readable, writable } from "svelte/store";
import Timer from "../Classes/Timer";

export const timeRemaining = writable(0)
export const timerState = writable(0)

export const workTimerLength = writable(1000 * 60 * 50) // 50 minutes
export const shortBreakLength = writable(1000 * 60 * 10)
export const longBreakLength = writable(1000 * 60 * 20)

export const timer = readable(new Timer())