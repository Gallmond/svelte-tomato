<script>
  export let active = false;
  export let time = false;

  // turn time into mm:ss
  $: timeDisplay = (()=>{
    if(!time) return '00:00'

    let seconds = (time / 1000) % 60
    let minutes = (time / 1000) / 60

    console.log(`minutes ${minutes} seconds ${seconds}`);

    seconds = seconds.toFixed(0)
    minutes = minutes.toFixed(0)

    seconds = (seconds.length < 2 ? '0' : '') + seconds
    minutes = (minutes.length < 2 ? '0' : '') + minutes

    return `${minutes}:${seconds}`
  })();

</script>

<div class="timeOption">
  {#if active}
    <div>🔴</div>
  {:else}
    <div>⚪</div>
  {/if}
  <input type="text" value={timeDisplay}/>
</div>

<style>
  .timeOption{
    flex:1
  }
  .timeOption > input{
    margin-top: 5px;
  }
</style>