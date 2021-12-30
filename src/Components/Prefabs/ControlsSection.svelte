<script>
  import Button from './Button.svelte';

  export let buttonClicked = ()=>{};
  export let runningState = 0;
  export let stopTimer = 0;
  export let onSkip = 0;

</script>


<div>

  <Button onClick={buttonClicked}>
    {#if runningState === 0 || runningState === 2}
      Start
    {:else if runningState === 1}
      Pause
    {/if}
  </Button>

  <Button onClick={stopTimer}>Reset</Button>
</div>

<div>
  <Button onClick={onSkip}>Skip</Button>
</div>