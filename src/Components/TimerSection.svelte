<script>
  import { msToMinutesSeconds, minutesToMs } from "../Classes/Util";
  import { timers, activeTimerName } from "./../Stores/Timer";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let name;

  let active;
  let thisTimerLength = 0;
  let thisTimerLengthFormatted;

  // ===========================================================================

  // is this timer active
  activeTimerName.subscribe((val) => {
    active = name === val;
  });

  // if a timer is updated, recalculate the length and formatted length display
  timers.subscribe((dTimers) => {
    dTimers.some((dTimer) => {
      if (dTimer.name === name) {
        thisTimerLength = dTimer.length;
        thisTimerLengthFormatted = msToMinutesSeconds(
          dTimer.length,
          true,
          false
        );
        return true;
      }
    });
  });

  // handle keyups on the timer length change. After a third of a second update
  // the appropriate timer's length
  let keyUpTimeout = false;
  const thisTimerLengthChanged = (e) => {
    clearTimeout(keyUpTimeout);
    keyUpTimeout = setTimeout(() => {
      timers.update((dTimers) => {
        for (let i = 0, l = dTimers.length; i < l; i++) {
          if (dTimers[i].name === name)
            dTimers[i].length = minutesToMs(parseInt(e.target.value));
        }
        return dTimers;
      });
    }, 1000 / 3);
  };

  // when the icon is clicked, dispatch the 'selected' event with this timer's
  // name
  const iconClicked = (e) => {
    activeTimerName.set(name);
    dispatch("selected", { name: name });
  };
</script>

<div class="timeOption">
  <div on:click={iconClicked}>
    <div>
      {#if active}
        🔴
      {:else}
        ⚪
      {/if}
    </div>
  </div>

  <h3>{name}</h3>

  <!-- <input value={thisTimerLengthFormatted} readonly="true" /> -->

  <label for="{name}-timerLengthInput">Timer length (minutes)</label>
  <input
    id="{name}-timerLengthInput"
    type="text"
    on:keyup={thisTimerLengthChanged}
    value={msToMinutesSeconds(thisTimerLength, true, false)}
  />
</div>

<style>
  .timeOption {
    flex: 1;
  }
  .timeOption > input {
    margin-top: 5px;
    width:80%;
    border-radius: 5px;
  }
</style>
