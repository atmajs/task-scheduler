include
	.use('Utils')
	.done((resp, Utils) => {
		var format = Utils.date.formatTimespan;
		mask.registerHandler(':timer', mask.Compo({
			meta: {
				attributes: {
					'x-timespan': 'number',
					'?x-countdown': 'boolean'
				}
			},
			template: "span > '~[bind: timespan]'",
			onRenderStart () {
				this.model = {
					timespan: format(this.xTimespan)
				};
			},
			onRenderEnd () {
				this.interval = setInterval(
					() => {
						this.xTimespan += (this.xCountdown ? -1 : 1);
						this.model.timespan = format(this.xTimespan)
					}
					, 1000
				);
			},
			dispose () {
				clearInterval(this.interval);
			}
		}))
	});