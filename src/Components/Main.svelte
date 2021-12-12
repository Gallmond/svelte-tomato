
<script>
  import TimeOption from './TimeOption.svelte'
  import { msToMinutesSeconds } from './../Classes/Util'
  import { timers, activeTimerName, activeRunTime } from './../Stores/Timer'

  let runningState = 0; // 0 stopped, 1 running, 2 paused
  let remainingTimeFormatted = '00:00';

  // ======================

  const updateDisplayTime = (_timers, _activeRunTime) => {
    _timers.some( t => {
      if(t.name === $activeTimerName){
        remainingTimeFormatted = msToMinutesSeconds(t.length - _activeRunTime);
      }
    })
  }

  // if a timer changes
  timers.subscribe(dTimers => {
    updateDisplayTime(dTimers, $activeRunTime);
  })

  // if the run time changes
  activeRunTime.subscribe( dActiveRunTime => {
    updateDisplayTime($timers, dActiveRunTime);
  })

  // if the selected timer is set
  activeTimerName.subscribe( dActiveTimerName => {
    updateDisplayTime($timers, $activeRunTime);  
  })

  // set initial
  updateDisplayTime($timers, $activeRunTime);

  // handle the start / pause button
  let buttonClicked = () => {
    
    switch (runningState) {
      case 0:
        startTimer()
        break;
      case 1:
        pauseTimer()
        break;
      default:
        break;
    }

  }

  //TODO change state ids
  // - suss out stopped / reset logic?

  let timerIntervalId = false;
  const startTimer = () => {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => { activeRunTime.update(v => v += 1000) }, 1000);
    runningState = 1;
  }
  const pauseTimer = () => {
    clearInterval(timerIntervalId);
    runningState = 0;
  }
  const stopTimer = () => {
    clearInterval(timerIntervalId);
    runningState = 2
  }

  // when a TimerOptions is selected as the new timer
  const onSelected = (event) => {
    activeTimerName.set( event.detail.name )
  }

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
      {#if runningState === 0 }
      Start
      {:else if runningState === 1 }
      Pause
      {/if}
    </button>
  </div>

  <div class="timeOptions">
    {#each $timers as thisTimer }
    <TimeOption
      on:selected={onSelected}
      name={thisTimer.name}
    />
    {/each}
  </div>
</div>

<style>
  .timeOptions{
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }
  


</style>