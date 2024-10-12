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

		<!-- kaleflower.js -->
		<script src="/dist/kaleflower.js" type="text/javascript" async></script>
		<script>
			// Kaleflower
			window.addEventListener('load', function() {
				const container = document.getElementById('cont-app');
				var kaleflower = new Kaleflower(container, {});
				kaleflower.init();
			});
		</script>
	</body>
</html>
