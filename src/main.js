import App from './App.svelte';
import Timer from './Classes/Timer';


const app = new App({
	target: document.body,
	props: {
		timer: new Timer(),
		name: 'world'
	}
});

export default app;