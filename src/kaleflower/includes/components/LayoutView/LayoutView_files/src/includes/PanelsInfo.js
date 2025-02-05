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
			var instanceId = $this.attr('data-kaleflower-instance-id');
			const data = {
				'instanceId': instanceId,
				'offsetTop': $this.offset().top,
				'offsetLeft': $this.offset().left,
				'width': $this.outerWidth(),
				'height': $this.outerHeight(),
			};
			rtn.push(data);
			return;
		});
		return rtn;
	}
};
