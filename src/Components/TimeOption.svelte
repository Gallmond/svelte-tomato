<script>
  export let active = false;
</script>

<div class="timeOption">
  {#if active}
    <div>🔴</div>
  {:else}
    <div>⚪</div>
  {/if}
  <input type="text"/>
</div>

<style>
  .timeOption{
    flex:1
  }
  .timeOption > input{
    margin-top: 5px;
  }
</style>