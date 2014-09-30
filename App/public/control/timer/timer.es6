include
	.use('Utils')
	.done((resp, Utils) => {
		var formatTimespan = Utils.date.formatTimespan,
			formatTime = date => mask.$utils.format(date, 'dd-MM-yyyy HH:mm:ss')
		
		mask.registerHandler(':timer', mask.Compo({
			meta: {
				attributes: {
					'?x-timespan': 'number',
					'?x-countdown': 'boolean',
					'?x-clock': 'boolean'
				}
			},
			template: "span > '~[bind: label]'",
			onRenderStart () {
				this.model = {
					label: this.tick()
				};
			},
			onRenderEnd () {
				this.interval = setInterval(
					() => this.model.label = this.tick()
					, 1000
				);
			},
			
			tick () {
				if (this.xClock) 
					return formatTime(new Date);
				
				this.xTimespan += (this.xCountdown ? -1 : 1);
				return formatTimespan(this.xTimespan)
			},
			dispose () {
				clearInterval(this.interval);
			}
		}))
	});