import { writable } from "svelte/store";

// ============= new here =============
export const notificationPermission = writable(null);
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
export const userSettings = writable({
  // when a timer ends, scroll to the next one
  autoIncrementTimer: true,
  // if true, timer won't start automatically when the previous one ends.
  pauseBetweenTimers: false,
  // how many cycles of 'focus'-'rest' before 'break'
  loopsBeforeLongBreak: 4,
  // when a full cycle ('focus'-'rest')+'break' stop the timers.
  endAfterFullCycle: false,
  // notification popup has a sound
  notificationSound: true,
})