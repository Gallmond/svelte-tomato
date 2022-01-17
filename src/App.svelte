<script>
  import { onMount } from "svelte";
  import { getNotificationPermission } from "./Classes/Util";
  import Main from "./Components/Main.svelte";

	// when the app is first loaded add a listener for user-triggered events.
	// The Notification Permission has to be called during this
  let permissionChecked = false;
  onMount(() => {
    document.addEventListener("click", (e) => {
      if (!permissionChecked && e.target.classList.contains("user-control")) {
				getNotificationPermission();
			}
    });
  });
	
</script>

<main>
  <Main />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
