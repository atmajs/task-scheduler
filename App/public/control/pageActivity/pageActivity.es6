include 
	.load('pageActivity.mask::Template') 
	.css('pageActivity.less') 
	.done(function(resp){

		mask.registerHandler(':pageActivity', Compo({
			template: resp.load.Template,
			slots : {
				domInsert () {
					var await = this.await.bind(this, null),
						resolve = this.resolve.bind(this)
					Class.Remote.onBefore(await);
					Class.Remote.onAfter(resolve, resolve);
				}
			},
			onRenderEnd: function(){
				this.els = this.$.children();
			},
			await: function (dfr) {
				if (dfr != null) 
					dfr.always(this.resolve.bind(this));
				
				this._awaitCount++;
				if (this._timer == null) 
					this._start();
			},
			resolve: function(){
				logger.log('after'.cyan, this._awaitCount);
				if (--this._awaitCount < 1) {
					this._stop();
					this._awaitCount = 0;
				}
			},
			_start: function(){
				if (this._timer) 
					return;
				
				this._animateSelf({
					model: 'display | > block',
					next : 'transform | translateY(-100%) > translateY(0%) | 200ms'
				});
				this._animateNext();
				this._timer = setInterval(this._animateNext.bind(this), 700);
			},
			_stop: function(){
				this._animateSelf({
					model: 'transform | translateY(0%) > translateY(-100%) | 200ms',
					next: 'display | none'
				});
				this.dispose();
			},
			dispose: function(){
				clearInterval(this._timer);
				this._timer = null;
			},
			
			_timer: null,
			_index: -1,
			_zIndex: 1,
			_awaitCount: 0,
			
			_animateNext: function(){
				if (this.els.length === ++this._index) 
					this._index = 0;
				
				var el = this.els[this._index];
				
				el.style.zIndex = ++this._zIndex;
				mask.animate(el, 'width | 0% > 100% | 2s ease-out');
			},
			_animateSelf (model) {
				mask.animate(this.$.get(0), model);
			}
		}));


	});
