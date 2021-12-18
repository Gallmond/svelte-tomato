<script>
  export let onClick;

</script>

<button class="button" on:click={onClick}><slot>Button text</slot></button>

<style>
  .button{
    font-weight: bold;
    border-radius: 5px;
    padding: 5px 20px;
  }
</style>