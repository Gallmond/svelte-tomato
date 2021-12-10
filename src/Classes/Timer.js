class Timer{
	
	// localStoragePrefix = 'tomato.'
	// localStorageKeys = [
	// 	'intervalId',
	// 	'intervalTime',
	// 	'currentTimeRemaining',
	// ]

	states = [
		'stopped', // 0
		'running', // 1
		'paused'   // 2
	]

	constructor(){
		console.log('Timer.constructor()')
		this.intervalId = null
		this.intervalTime = 1000
		this.currentTimeRemaining = 0
		this.currentTimer = 0
		this.currentState = 0

		this.timers = [
			{id: 0, name: 'focus', time: 1000 * 60 * 50},
			{id: 1, name: 'break', time: 1000 * 60 * 10},
			{id: 2, name: 'long break', time: 1000 * 60 * 20},
		]

	}

  initFromLocalStorage( localStorage ){
		console.log('Timer.initFromLocalStorage()')
		//TODO what to store/load?
		// this.localStorageKeys.forEach(key => {
		// 	let stored = localStorage.getItem( `${this.localStoragePrefix}.${key}` )
		// 	if(stored){
		// 		this[ key ] = JSON.parse(stored)
		// 	}
		// })
  }

	start(){
		console.log('Timer.start()')
		clearInterval(this.intervalId)
		this.setCurrentTimeRemaining( this.getCurrentTimer().time )
		this.intervalId = setInterval(() => {
			this.updateCurrentTimeRemaining()
			console.log(`this.currentTimeRemaining ${this.currentTimeRemaining}`)
		}, this.intervalTime);
	}

	stop(){
		console.log('Timer.stop()')
		clearInterval(this.intervalId)
	}

	// getters
	getTimers(){ return this.timers }
	getCurrentTimer(){ return this.timers[this.currentTimer] }
	getCurrentTimeRemaining(){ return this.currentTimeRemaining }
	getState(){ return this.currentState }

	// setters
	setCurrentTimer( id ){ this.currentTimer = id; return this; }
	setCurrentTimeRemaining( time ){ this.currentTimeRemaining = time; return this; }
	setState( id ){ this.currentState = id; return this; }
	updateCurrentTimeRemaining(){
		this.setCurrentTimeRemaining( this.getCurrentTimeRemaining() - this.intervalTime )
	}

}

export default Timer;