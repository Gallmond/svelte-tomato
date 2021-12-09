
<script>
  import TimeOption from './TimeOption.svelte'
  import { workTimerLength, shortBreakLength, longBreakLength } from './../Stores/Timer'

  let stages = [
    0, // focus
    1, // break
    2  // long break
  ]

  let timeRemainingDisplay = '00:00'
  let currentStage = stages[0]

  console.log('$workTimerLength', $workTimerLength);

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
    <button>Start</button>
  </div>

  <div class="timeOptions">
    {#each stages as stage}
      <TimeOption active={currentStage === stage} time={$workTimerLength} />
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