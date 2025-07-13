import $ from 'jquery';

export class CreateNewInstance {

	constructor(){
	}

	async openSelectDialog () {
		let modal;
		let $body = $(`
			<div class="px2-p">
				TagName: <input type="text" class="px2-input px2-input--block" name="kaleflower-new-child-element-tag-name" value="div" />
			</div>
		`);
		return new Promise((done, fail)=>{
			modal = px2style.modal({
				"title": 'Create New Instance',
				"body": $body,
				"buttons": [
					$('<button class="px2-btn px2-btn--primary">')
						.text('OK')
						.on('click', function(){
							let newChildElementTagName = $body.find(`input[name="kaleflower-new-child-element-tag-name"]`).val();
							done(newChildElementTagName);
							modal.close();
						}),
				],
				"buttonsSecondary": [
					$('<button class="px2-btn">')
						.text('Cancel')
						.on('click', function(){
							fail();
							modal.close();
						}),
				],
			});
		})
		.then((newChildElementTagName)=>{
			return new Promise((done, fail)=>{
				done(newChildElementTagName);
			});
		});
	}

};
