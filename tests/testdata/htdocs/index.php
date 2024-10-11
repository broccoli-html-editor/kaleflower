<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Kaleflower TEST</title>
		<link rel="stylesheet" href="/dist/kaleflower.css" />
    </head>
	<body>
		<div id="cont-app"></div>

		<!-- kaleflower.js -->
		<script src="/dist/kaleflower.js" type="text/javascript"></script>
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
