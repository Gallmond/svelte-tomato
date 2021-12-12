import { readable, writable } from "svelte/store";

// export const timeRemaining = writable(0)
// export const timerState = writable(0)

// export const workTimerLength = writable(1000 * 60 * 50) // 50 minutes
// export const shortBreakLength = writable(1000 * 60 * 10)
// export const longBreakLength = writable(1000 * 60 * 20)

// export const timer = readable(new Timer())

// ============= new here =============
export const activeRunTime = writable(0);
export const activeTimerName = writable("focus");
export const timers = writable([
  {
    name: "focus",
    length: 1000 * 60 * 50,
  },
  {
    name: "rest",
    length: 1000 * 60 * 10,
  },
  {
    name: "break",
    length: 1000 * 60 * 20,
  },
]);
