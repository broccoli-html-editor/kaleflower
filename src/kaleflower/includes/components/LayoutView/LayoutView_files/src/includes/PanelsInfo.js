export class PanelsInfo {
	#$;

	/**
	 * Constructor
	 */
	constructor($){
		this.#$ = $;
	}

	#isLayer (elm) {
		const $ = this.#$;
		const $elm = $(elm);
		const position = $elm.css('position');
		const top = $elm.css('top');
		const right = $elm.css('right');
		const bottom = $elm.css('bottom');
		const left = $elm.css('left');

		switch (position) {
			case 'static':
				break;
			case 'relative':
				if (top != '0px' || right != '0px' || bottom != '0px' || left != '0px') {
					return true;
				}
				break;
			case 'absolute':
			case 'fixed':
			case 'sticky':
				return true;
				break;
		}
		return false;
	}

	/**
	 * Get the instance
	 */
	collectInstance(){
		const $ = this.#$;
		const rtn = [];
		const layers = [];
		$("[data-kaleflower-instance-id]").each((index, elm) => {
			const $this = $(elm);
			const $next = $this.next();
			const instanceId = $this.attr('data-kaleflower-instance-id');
			const $parent = $this.parent();
			const data = {
				'instanceId': instanceId,
				'currentLayer': null,
				'parentLayer': null,
				'parent': {
					'display': $parent.css('display'),
					'flex-direction': $parent.css('flex-direction'),
					'isLayer': this.#isLayer($parent.get(0)),
					'width': $parent.outerWidth(),
					'height': $parent.outerHeight(),
				},

				'display': $this.css('display'),
				'flex-direction': $this.css('flex-direction'),

				'offsetTop': $this.offset().top,
				'offsetLeft': $this.offset().left,
				'width': $this.outerWidth(),
				'height': $this.outerHeight(),
				'isLayer': this.#isLayer(elm),

				'nextOffsetTop': ($next.length ? $next.offset().top : null),
				'nextOffsetLeft': ($next.length ? $next.offset().left : null),
			};
			rtn.push(data);
			if(data.isLayer){
				for(let i = layers.length - 1; i >= 0; i--) {
					const husCurrentLayer = $this.closest(`[data-kaleflower-instance-id="${layers[i]}"]`).length;
					if (husCurrentLayer) {
						data.parentLayer = layers[i];
						break;
					}
				}
				layers.push(instanceId);
				data.currentLayer = instanceId;

			}else if(layers.length){
				for(let i = layers.length - 1; i >= 0; i--) {
					const husCurrentLayer = $this.closest(`[data-kaleflower-instance-id="${layers[i]}"]`).length;
					if (husCurrentLayer) {
						data.currentLayer = layers[i];
						break;
					}
				}
			}
			return;
		});
		return rtn;
	}
};
