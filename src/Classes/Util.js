/**
 * 
 * @param ms milliseconds
 * @param minutesOnly true to only return minutes
 * @param zeroPad true to left-pad single digits with zero
 * @returns minutes or minutes:seconds
 */
export const msToMinutesSeconds = (ms, minutesOnly = false, zeroPad = true) => {
  if (!ms) return "00:00";

  let seconds = ((ms / 1000) % 60).toFixed(0);
  let minutes = Math.floor(ms / 60000).toFixed(0);

  if(zeroPad){
    seconds = (seconds.length < 2 ? "0" : "") + seconds;
    minutes = (minutes.length < 2 ? "0" : "") + minutes;
  }

  return minutesOnly
    ? `${minutes}`
    : `${minutes}:${seconds}`
};

/**
 * 
 * @param minutes Minutes
 * @returns Milliseconds
 */
export const minutesToMs = (minutes) => {
  return minutes * 60 * 1000;
}

class AudioHandler{
  constructor(){
    this.audio = new Audio('/sound/bell-sound.mp3')
  }
  play(){
    console.log('AudioHandler.play();')
    this.audio.play();
  }
  pause(){
    //TODO this is not stopping?
    console.log('AudioHandler.pause();')
    this.audio.pause();
  }
}
const audioHandler = new AudioHandler();
export const sendNotification = (text, ringBell = true) => {
  let notification = new Notification(text);
  ringBell && audioHandler.play()
  notification.onclose = (e) => {
    console.log('notification.onclose', e);
    audioHandler.pause();
  }
}