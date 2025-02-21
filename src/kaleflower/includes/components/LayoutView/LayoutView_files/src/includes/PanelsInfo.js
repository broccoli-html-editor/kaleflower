export class PanelsInfo {
	#$;

	/**
	 * Constructor
	 */
	constructor($){
		this.#$ = $;
	}

	/**
	 * Get the instance
	 */
	collectInstance(){
		const $ = this.#$;
		const rtn = [];
		$("[data-kaleflower-instance-id]").each(function(index, elm){
			var $this = $(elm);
			var $next = $this.next();
			var instanceId = $this.attr('data-kaleflower-instance-id');
			var $parent = $this.parent();
			const data = {
				'instanceId': instanceId,
				'parent': {
					'display': $parent.css('display'),
					'flex-direction': $parent.css('flex-direction'),
				},
				'display': $this.css('display'),
				'flex-direction': $this.css('flex-direction'),
				'offsetTop': $this.offset().top,
				'offsetLeft': $this.offset().left,
				'width': $this.outerWidth(),
				'height': $this.outerHeight(),
				'nextOffsetTop': ($next.length ? $next.offset().top : null),
				'nextOffsetLeft': ($next.length ? $next.offset().left : null),
			};
			rtn.push(data);
			return;
		});
		return rtn;
	}
};
