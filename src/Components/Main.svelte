<script>
  import TimerSection from "./TimerSection.svelte";
  import { 
    msToMinutesSeconds,
    sendNotification
  } from "../Classes/Util";
  import { 
    timers,
    activeTimerName,
    activeRunTime,
    notificationPermission
   } from "./../Stores/Timer";

  let runningState = 0; // 0 stopped, 1 running, 2 paused
  let remainingTimeFormatted = "00:00";
  let timerIntervalId = false;

  // ===========================================================================

  // get notification permission
  if(Notification.permission === 'granted'){
    console.log('Notification.permission', Notification.permission);
    notificationPermission.set(Notification.permission)
    sendNotification('TEST');
    const audio = new Audio('/sound/bell-sound.mp3')
    audio.play();
  } else {
    Notification.requestPermission().then(permission => {
      console.log(`notification permission ${permission}`);
      notificationPermission.set(permission)
    })
  }

  const updateDisplayTime = (_timers, _activeRunTime) => {
    _timers.some((t) => { 
      if (t.name === $activeTimerName) {
        remainingTimeFormatted = msToMinutesSeconds(t.length - _activeRunTime);
      }
    });
  };

  // if a timer changes
  timers.subscribe((dTimers) => {
    updateDisplayTime(dTimers, $activeRunTime);
  });

  // if the run time changes
  activeRunTime.subscribe((dActiveRunTime) => {
    updateDisplayTime($timers, dActiveRunTime);
  });

  // if the selected timer is set
  activeTimerName.subscribe((dActiveTimerName) => {
    updateDisplayTime($timers, $activeRunTime);
  });

  // set initial
  updateDisplayTime($timers, $activeRunTime);

  // handle the start / pause button
  let buttonClicked = () => {
    if(
      runningState === 0 // stopped
      || runningState === 2 // paused
    ){
      startTimer();
    }else if( runningState === 1 ){ // running
      pauseTimer();
    }
  };

  const startTimer = () => {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      activeRunTime.update((v) => (v += 1000));
    }, 1000);
    runningState = 1;
  };
  const pauseTimer = () => {
    clearInterval(timerIntervalId);
    runningState = 2;
  };
  const stopTimer = () => {
    clearInterval(timerIntervalId)
    runningState = 0 // set stopped
    activeRunTime.set(0) // reset running time 
    activeTimerName.set('focus') // reset back to default timer
  };

  // when a TimerOptions is selected as the new timer
  const onSelected = (event) => {
    activeTimerName.set(event.detail.name);
  };
</script>

<div>

  <div>
    <h1>🍅</h1>
  </div>

  <div>
    <h2>
      {remainingTimeFormatted}
    </h2>
  </div>

  <div>
    <button on:click={buttonClicked}>
      {#if runningState === 0 || runningState === 2}
        Start
      {:else if runningState === 1}
        Pause
      {/if}
    </button>
    <button on:click={stopTimer}>Reset</button>
  </div>

  <div class="TimerSections">
    {#each $timers as thisTimer}
      <TimerSection on:selected={onSelected} name={thisTimer.name} />
    {/each}
  </div>
</div>

<style>
  .TimerSections {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }
</style>
