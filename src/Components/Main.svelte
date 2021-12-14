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
    userSettings,
   } from "./../Stores/Timer";

  let runningState = 0; // 0 stopped, 1 running, 2 paused
  let remainingTimeFormatted = "00:00";
  let timerIntervalId = false;

  // ===========================================================================

  // get notification permission
  // sendNotification('foobar', true)

  const getTimerByName = ( timerName ) => {
    let found = false;
    $timers.some( timer => {
      found = timer.name === timerName
        ? timer
        : false;
      return found;
    }) 
    return found;
  }

  // get the currently active timer
  const getActiveTimer = () => {
    for(let i = 0; i < $timers.length; i++){
      if($timers[i].name === $activeTimerName){
        return $timers[i];
      }
    }
    return false;
  }

  /**
   * 
   * @param change name of timer, or -1 | +1
   */
  const timerChange = (change = null) => {
    let names = [];
    $timers.forEach(t => names.push(t.name) );
    
    if(typeof change === 'string' && names.includes( change )){
      
      activeTimerName.set( change )

    }else if(typeof change === 'number'){

      let currentIndex = names.indexOf( $activeTimerName );
      var newIndex = currentIndex + change;
      newIndex = (newIndex < 0 ? names.length -1 : newIndex) % names.length;
      activeTimerName.set( $timers[ newIndex ].name );

    }

  }

  // update the display time
  const updateDisplayTime = (_timers, _activeRunTime) => {
    _timers.some((t) => { 
      if (t.name === $activeTimerName) {
        let remainingMilliseconds = Math.max(0, t.length - _activeRunTime)
        remainingTimeFormatted = msToMinutesSeconds(remainingMilliseconds);
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
  const buttonClicked = () => {
    if(
      runningState === 0 // stopped
      || runningState === 2 // paused
    ){
      startTimer();
    }else if( runningState === 1 ){ // running
      pauseTimer();
    }
  };

  /**
   * ==================== timer controls
   */

    const startTimer = () => {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      activeRunTime.update((v) => (v += 1000));
      if(hasTimerExpired()){
        let text = `Time for ${$activeTimerName} has ended.`
        sendNotification(text, $userSettings.notificationSound)
        $userSettings.pauseBetweenTimers && pauseTimer();
        $userSettings.autoIncrementTimer && timerChange(+1);
      }
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

  // true if the active run time is longer than active timer's length
  const hasTimerExpired = () => {
    return $activeRunTime >= getTimerByName( $activeTimerName ).length
  }

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
