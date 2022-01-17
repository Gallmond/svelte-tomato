<script>
  export let onClick;

</script>

<button class="user-control" on:click={onClick}><slot>Button text</slot></button>

<style>
  .user-control{
    font-weight: bold;
    border-radius: 5px;
    padding: 5px 20px;
  }
</style>