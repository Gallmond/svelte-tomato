import { writable } from "svelte/store";

export const activeRunTime = writable(0);
export const loops = writable(0);
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
export const userSettings = writable({
  // when a timer ends, scroll to the next one
  autoIncrementTimer: true,
  // if true, timer won't start automatically when the previous one ends.
  pauseBetweenTimers: false,
  // notification popup has a sound
  notificationSound: true,
  // focus-short break loops before long break
  focusRestLoops: 2,
})