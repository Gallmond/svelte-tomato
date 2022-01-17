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


export const getNotificationPermission = async () => {
  if(Notification.permission === 'granted') return true;
  const permission = await Notification.requestPermission();
  return permission === 'granted'
}

export const sendNotification = async (text, notificationSounds = true) => {
  
  if(!await getNotificationPermission()) return;

  const notification = new Notification(text);
  if(notificationSounds){
    notification._audio = new Audio('/sound/bell-sound.mp3');
    notification._audio.play();
  }
  notification.onclick = (e) => {
    notification._audio && notification._audio.pause();
    console.log('notification.onclose', e);
  }
}