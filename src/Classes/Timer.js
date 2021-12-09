class Timer{
	
	constructor(){
		this.intervalId = null
		this.swing = false

	}

  initFromLocalStorage( localStorage ){

    //TODO continue here

  }

	start(){
		clearInterval(this.intervalId)
		this.intervalId = setInterval(() => {
			console.log(this.swing ? 'tick' : 'tock')
			this.swing = !this.swing
		}, 1000);
	}

	stop(){
		clearInterval(this.intervalId)
	}

}

export default Timer;