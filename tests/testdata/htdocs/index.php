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
				<li><button type="button" onclick="console.info(kaleflower.get());">get</button></li>
			</ul>
		</div>

		<!-- kaleflower.js -->
		<script src="/dist/kaleflower.js" type="text/javascript" async></script>
		<script>
			// Kaleflower
			let kaleflower;
			window.addEventListener('load', function() {
				const container = document.getElementById('cont-app');
				kaleflower = new Kaleflower(container, {});
				kaleflower.load('../kflows/general.kflow');
			});
		</script>
	</body>
</html>