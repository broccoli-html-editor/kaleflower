<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Kaleflower TEST</title>
		<style>
			html, body {
				padding: 0;
				margin: 0;
			}
			.container {
				display: flex;
				width: 100%;
				height: calc(100vh - 100px);
				justify-content: stretch;
				align-items: stretch;
			}
		</style>
    </head>
	<body>
		<div class="container">
			<div id="cont-app"></div>
		</div>
		<div>
			<ul>
				<li><button type="button" onclick="save();">SAVE</button></li>
			</ul>
		</div>

		<!-- kaleflower.js -->
		<script src="/dist/kaleflower.js" type="text/javascript" async></script>
		<script>
			// Kaleflower
			let kaleflower;
			window.addEventListener('load', function() {
				const container = document.getElementById('cont-app');
				kaleflower = new Kaleflower(container, {
					"urlLayoutViewPage": "about:blank",
					"scriptReceiverSelector": "[data-kaleflower-receive-message=yes]",
					"contentsAreaSelector": "[data-kaleflower-contents-bowl-name]",
					"contentsContainerNameBy": "data-kaleflower-contents-bowl-name",
					"appearance": <?= json_encode($_GET['appearance'] ?? "light") ?>,
					"lang": <?= json_encode($_GET['lang'] ?? "en") ?>,
				});
				kaleflower.load('../kflows/general.kflow');
			});
		</script>
		<script>
			function save(){
				let data = kaleflower.get();
				console.info(data);
				fetch('./save.php', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ data: data }),
				})
				.then(response => {
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					return response.json();
				})
				.then(data => {
					console.log('Success:', data);
				})
				.catch(error => {
					console.error('There has been a problem with your fetch operation:', error);
				});
			}
		</script>
	</body>
</html>
