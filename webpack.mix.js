const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test: /\.txt$/i,
					use: ['raw-loader'],
				},
				{
					test: /\.csv$/i,
					loader: 'csv-loader',
					options: {
						dynamicTyping: true,
						header: false,
						skipEmptyLines: false,
					},
				},
				{
					test:/\.twig$/,
					use:['twig-loader']
				},
				{
					test:/\.xml$/,
					use:['raw-loader']
				},
				{
					test: /\.jsx$/,
					exclude: /(node_modules|bower_components)/,
					use: [{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-react',
								'@babel/preset-env'
							]
						}
					}]
				},
			],
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": false,
			}
		}
	})


	// --------------------------------------
	// kaleflower Script
	.js('src/kaleflower/includes/components/LayoutView/LayoutView_files/src/PreviewContents.js',
		'src/kaleflower/includes/components/LayoutView/LayoutView_files/dist/PreviewContents.js')
	.js('src/kaleflower/kaleflower.jsx', 'dist/')

	// --------------------------------------
	// Fields
	.js('src/fields/image/onload.js', 'src/fields/tmpDist/image.js')

	// --------------------------------------
	// Appearance
	.sass('src/kaleflower/includes/styles/kaleflower--dark.scss', 'src/kaleflower/includes/components/AppearanceStyles/kaleflower--dark.css')
	.sass('src/kaleflower/includes/styles/kaleflower--light.scss', 'src/kaleflower/includes/components/AppearanceStyles/kaleflower--light.css')
;
