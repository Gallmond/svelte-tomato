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
