<script>
  import { msToMinutesSeconds } from './../Classes/Util'
  import { timers, activeTimerName } from './../Stores/Timer'
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let name;

  let active;
  let thisTimerLength = 0;
  let thisTimerLengthFormatted = '';

  activeTimerName.subscribe(val => {
    active = name === val
  })

  timers.subscribe( dTimers => {
    dTimers.some( dTimer => {
      if(dTimer.name === name){
        thisTimerLength = dTimer.length;
        thisTimerLengthFormatted = msToMinutesSeconds(dTimer.length);
        return true;
      }
    })
  })

  let keyUpTimeout = false;
  const thisTimerLengthChanged = (e)=>{
    clearTimeout(keyUpTimeout);
    keyUpTimeout = setTimeout(() => {
      timers.update(dTimers => {
        for(let i = 0, l = dTimers.length; i < l; i++){
          if(dTimers[i].name === name) dTimers[i].length = parseInt(e.target.value)
        }
        return dTimers;
      })
    }, 1000 / 3);
  }

  const iconClicked = (e) => {
    activeTimerName.set( name )
    dispatch('selected', {name:name});
  }

</script>

<div class="timeOption">
  <div on:click={iconClicked}>
    {#if active}
      <div>🔴</div>
    {:else}
      <div>⚪</div>
    {/if}  
  </div>
  <h3>{name}</h3>
  <input value={thisTimerLengthFormatted} readonly=true />
  <input type="text" on:keyup={thisTimerLengthChanged} value={thisTimerLength}/>
</div>

<style>
  .timeOption{
    flex:1
  }
  .timeOption > input{
    margin-top: 5px;
  }
</style>