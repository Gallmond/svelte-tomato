
<script>
  import TimeOption from './TimeOption.svelte'
  import { timer, workTimerLength, shortBreakLength, longBreakLength } from './../Stores/Timer'

  $timer.initFromLocalStorage( window.localStorage );

  const timers = $timer.getTimers();

  //TODO how to read current time remaining? this isn't working?
  let currentTimeRemaining;
  timer.subscribe((updatedTimer)=>{
    currentTimeRemaining = updatedTimer.getCurrentTimeRemaining()
  })

</script>

<div>

  <div>
    <h1>🍅</h1>
  </div>

  <div>
    <h2>
      00:00
    </h2>
  </div>

  <div>
    <button on:click={$timer.start()}>Start</button>
  </div>

  <div class="timeOptions">
    {#each timers as timerInfo}
      <TimeOption active={$timer.getCurrentTimer().id === timerInfo.id} time={
        $timer.getState() === 0
          ? timerInfo.time
          : currentTimeRemaining
        } />
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