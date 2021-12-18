<script>
  import TimerSection from "./TimerSection.svelte";
  import Button from "./Prefabs/Button.svelte";
  import Settings from "./Settings.svelte";
  import { msToMinutesSeconds, sendNotification } from "../Classes/Util";
  import {
    timers,
    activeTimerName,
    activeRunTime,
    userSettings,
  } from "./../Stores/Timer";

  let runningState = 0; // 0 stopped, 1 running, 2 paused
  let remainingTimeFormatted = "00:00";
  let timerIntervalId = false;

  

  // ===========================================================================

  const getTimerByName = (timerName) => {
    let found = false;
    $timers.some((timer) => {
      found = timer.name === timerName ? timer : false;
      return found;
    });
    return found;
  };

  

  const timerChange = (change = null) => {
    // collect names
    let names = [];
    $timers.forEach((t) => names.push(t.name));

    let newTimerName = "";

    // if we're setting directly
    if (typeof change === "string" && names.includes(change)) {
      newTimerName = change;

      // if we're incrementing
    } else if (typeof change === "number") {
      var newIndex = names.indexOf($activeTimerName) + change;
      newIndex = (newIndex < 0 ? names.length - 1 : newIndex) % names.length;
      newTimerName = $timers[newIndex].name;
    }

    activeRunTime.set(0);
    activeTimerName.set(newTimerName);
  };

  // update the display time
  const updateDisplayTime = (_timers, _activeRunTime) => {
    _timers.some((t) => {
      if (t.name === $activeTimerName) {
        let remainingMilliseconds = Math.max(0, t.length - _activeRunTime);
        remainingTimeFormatted = msToMinutesSeconds(remainingMilliseconds);
      }
    });
  };

  // if a timer changes
  timers.subscribe((dTimers) => {
    updateDisplayTime(dTimers, $activeRunTime);
  });

  // if the run time changes
  activeRunTime.subscribe((dActiveRunTime) => {
    updateDisplayTime($timers, dActiveRunTime);
  });

  // if the selected timer is set
  activeTimerName.subscribe((dActiveTimerName) => {
    updateDisplayTime($timers, $activeRunTime);
  });

  // set initial
  updateDisplayTime($timers, $activeRunTime);

  // handle the start / pause button
  const buttonClicked = () => {
    if (
      runningState === 0 || // stopped
      runningState === 2 // paused
    ) {
      startTimer();
    } else if (runningState === 1) {
      // running
      pauseTimer();
    }
  };

  /**
   * ==================== timer controls
   */

  const startTimer = () => {
    clearInterval(timerIntervalId);
    timerIntervalId = setInterval(() => {
      activeRunTime.update((v) => (v += 1000));
      if (hasTimerExpired()) {
        let text = `Time for ${$activeTimerName} has ended.`;
        sendNotification(text, $userSettings.notificationSound);
        $userSettings.pauseBetweenTimers && pauseTimer();
        $userSettings.autoIncrementTimer && timerChange(+1);
      }
    }, 1000);
    runningState = 1;
  };
  const pauseTimer = () => {
    clearInterval(timerIntervalId);
    runningState = 2;
  };
  const stopTimer = () => {
    clearInterval(timerIntervalId);
    runningState = 0; // set stopped
    activeRunTime.set(0); // reset running time
    activeTimerName.set("focus"); // reset back to default timer
  };

  // true if the active run time is longer than active timer's length
  const hasTimerExpired = () => {
    return $activeRunTime >= getTimerByName($activeTimerName).length;
  };

  // when a TimerOptions is selected as the new timer
  const onSelected = (event) => {
    activeTimerName.set(event.detail.name);
  };

  const onSkip = () => {
    // slipping should _always_ reset the active run time
    activeRunTime.set(0);
    // but it should optionally clear the running interval
    if ($userSettings.pauseBetweenTimers) {
      clearInterval(timerIntervalId);
      runningState = 0; // set stopped
    }
    timerChange(+1);
  };

  $: rotation = `transform: rotate(${($activeRunTime / getTimerByName($activeTimerName).length) * 360}deg);`;

</script>

<div class="outerWrapper">
  <div class="innerWrapper">
    <div>
      <h1 style={rotation} class="icon">🍅</h1>
    </div>

    <div>
      <h2>{remainingTimeFormatted}</h2>
    </div>

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

    <Button onClick={onSkip}>Skip</Button>

    <div class="TimerSections">
      {#each $timers as thisTimer}
        <TimerSection on:selected={onSelected} name={thisTimer.name} />
      {/each}
    </div>

    <hr />

    <Settings />

  </div>
</div>

<style>
  .outerWrapper {
    display: flex;
    justify-content: center;
  }
  .innerWrapper {
    widows: 80%;
  }
  .TimerSections {
    margin-top: 20px;
    display: flex;
    flex-direction: row;
  }
</style>
