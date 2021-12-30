<script>
  import TimerSection from './../TimerSection.svelte' //TODO move this
  import {
    loops,
    userSettings,
    timers
  } from '../../Stores/Timer'

  export let onSelected;

</script>

<div class="LoopLine">
  <p>Loops: {$loops}/{$userSettings.focusRestLoops}</p>
  <hr>
</div>

<div class="TimerSections">
  <TimerSection on:selected={onSelected} name={$timers[0].name} />
  <TimerSection on:selected={onSelected} name={$timers[1].name} />
  <TimerSection on:selected={onSelected} name={$timers[2].name} />
</div>

<hr />

<style>
  .TimerSections {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }
  .LoopLine{
    flex-direction: column;
    display: flex;
    flex:1;
    align-content: flex-start;
  }
  .LoopLine > hr{
    width: 66.66%;
    margin-left: 0;
    margin-right: 0;
  }
  .LoopLine > p{
    width: 66.66%;
    margin-left: 0;
    margin-right: 0;
  }
</style>