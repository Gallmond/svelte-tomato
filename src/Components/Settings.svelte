<script lang="ts"> 
  import Switch from './Prefabs/Switch.svelte'

  import { 
    userSettings,
   } from '../Stores/Timer'
</script>


<div>
  <dl>
    <dt>Move to the next timer automatically</dt>
    <!-- svelte-ignore missing-declaration -->
    <dd><Switch bind:checked={$userSettings.autoIncrementTimer} /></dd>

    <dt>Pause when the next timer starts</dt>
    <!-- svelte-ignore missing-declaration -->
    <dd><Switch bind:checked={$userSettings.pauseBetweenTimers} /></dd>

    <dt>Browser notification plays sound</dt>
    <!-- svelte-ignore missing-declaration -->
    <dd><Switch bind:checked={$userSettings.notificationSound} /></dd>

    <dt>Focus-Short break loops before long break</dt>
    <!-- svelte-ignore missing-declaration -->
    <dd><input type="number" bind:value={$userSettings.focusShortBreakLoops}></dd>
  </dl>
</div>

<style>
  dd{
    margin-top: 5px;
    margin-bottom: 20px;
  }
</style>