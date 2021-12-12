export const msToMinutesSeconds = (ms) => {
  if (!ms) return "00:00";

  let seconds = ((ms / 1000) % 60).toFixed(0);
  let minutes = Math.floor(ms / 60000).toFixed(0);

  seconds = (seconds.length < 2 ? "0" : "") + seconds;
  minutes = (minutes.length < 2 ? "0" : "") + minutes;

  return `${minutes}:${seconds}`
};
