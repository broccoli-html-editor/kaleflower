/**
 * Color class
 */
export class Color {

	/**
	 * 16進数の色コードからRGB(A)の10進数を得る
	 */
	hex2rgb ( txt_hex ){
		if( this.#isInt( txt_hex ) ){
			let hexStr = txt_hex.toString(16).replace(/\..+$/, '');
			txt_hex = '#' + this.#strPadLeft( hexStr , 6 , '0' );
		}

		const hex = txt_hex.replace( /^#/ , '' );
		let matched;

		if( hex.length === 3 ){
			// #RGB
			matched = hex.match(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i);
			if( !matched ){
				return false;
			}
			matched[1] = matched[1] + matched[1];
			matched[2] = matched[2] + matched[2];
			matched[3] = matched[3] + matched[3];
			return {
				r: parseInt(matched[1], 16),
				g: parseInt(matched[2], 16),
				b: parseInt(matched[3], 16)
			};
		}else if( hex.length === 4 ){
			// #RGBA
			matched = hex.match(/^([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])$/i);
			if( !matched ){
				return false;
			}
			matched[1] = matched[1] + matched[1];
			matched[2] = matched[2] + matched[2];
			matched[3] = matched[3] + matched[3];
			matched[4] = matched[4] + matched[4];
			return {
				r: parseInt(matched[1], 16),
				g: parseInt(matched[2], 16),
				b: parseInt(matched[3], 16),
				a: parseInt(matched[4], 16) / 255
			};
		}else if( hex.length === 6 ){
			// #RRGGBB
			matched = hex.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
			if( !matched ){
				return false;
			}
			return {
				r: parseInt(matched[1], 16),
				g: parseInt(matched[2], 16),
				b: parseInt(matched[3], 16)
			};
		}else if( hex.length === 8 ){
			// #RRGGBBAA
			matched = hex.match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
			if( !matched ){
				return false;
			}
			return {
				r: parseInt(matched[1], 16),
				g: parseInt(matched[2], 16),
				b: parseInt(matched[3], 16),
				a: parseInt(matched[4], 16) / 255
			};
		}else{
			return false;
		}
	}

	/**
	 * RGB(A)の10進数の色コードから16進数を得る
	 */
	rgb2hex ( int_r , int_g , int_b , float_a ){
		var hex_r = this.#intval(int_r).toString(16).replace(/\..+$/, '');
		var hex_g = this.#intval(int_g).toString(16).replace(/\..+$/, '');
		var hex_b = this.#intval(int_b).toString(16).replace(/\..+$/, '');
		if( this.#strlen( hex_r ) > 2 || this.#strlen( hex_g ) > 2 || this.#strlen( hex_b ) > 2 ){
			return	false;
		}
		var rtn = '#';
		rtn += this.#strPadLeft( hex_r , 2 , '0' );
		rtn += this.#strPadLeft( hex_g , 2 , '0' );
		rtn += this.#strPadLeft( hex_b , 2 , '0' );
		if( float_a !== undefined ){
			let alpha = Math.round(Math.max(0, Math.min(1, float_a)) * 255);
			let hex_a = alpha.toString(16);
			rtn += this.#strPadLeft( hex_a , 2 , '0' );
		}
		return	rtn;
	}

	/**
	 * 色相を調べる
	 */
	get_hue ( txt_hex , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var rgb = this.hex2rgb( txt_hex );
		if( rgb === false ){ return false; }

		for( var $key in rgb ){
			rgb[$key] = rgb[$key]/255;
		}

		var $hue = 0;
		if( rgb['r'] == rgb['g'] && rgb['g'] == rgb['b'] ){
			return	0;
		}
		if( rgb['r'] >= rgb['g'] && rgb['g'] >= rgb['b'] ){
			// R>G>B
			$hue = 60 * ( (rgb['g']-rgb['b'])/(rgb['r']-rgb['b']) );

		}else if( rgb['g'] >= rgb['r'] && rgb['r'] >= rgb['b'] ){
			// G>R>B
			$hue = 60 * ( 2-( (rgb['r']-rgb['b'])/(rgb['g']-rgb['b']) ) );

		}else if( rgb['g'] >= rgb['b'] && rgb['b'] >= rgb['r'] ){
			// G>B>R
			$hue = 60 * ( 2+( (rgb['b']-rgb['r'])/(rgb['g']-rgb['r']) ) );

		}else if( rgb['b'] >= rgb['g'] && rgb['g'] >= rgb['r'] ){
			// B>G>R
			$hue = 60 * ( 4-( (rgb['g']-rgb['r'])/(rgb['b']-rgb['r']) ) );

		}else if( rgb['b'] >= rgb['r'] && rgb['r'] >= rgb['g'] ){
			// B>R>G
			$hue = 60 * ( 4+( (rgb['r']-rgb['g'])/(rgb['b']-rgb['g']) ) );

		}else if( rgb['r'] >= rgb['b'] && rgb['b'] >= rgb['g'] ){
			// R>B>G
			$hue = 60 * ( 6-( (rgb['b']-rgb['g'])/(rgb['r']-rgb['g']) ) );

		}else{
			return	0;
		}

		if( int_round ){
			$hue = Number( $hue.toFixed(int_round) );
		}else{
			$hue = this.#intval( $hue );
		}
		return $hue;
	}

	/**
	 * 彩度を調べる
	 */
	get_saturation ( txt_hex , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var rgb = this.hex2rgb( txt_hex );
		if( rgb === false ){ return false; }

		var aryRGB = [rgb['r'], rgb['g'], rgb['b']];
		aryRGB.sort((a, b) => a - b);
		var minval = aryRGB[0];
		var maxval = aryRGB[2];

		if( minval == 0 && maxval == 0 ){
			// 真っ黒だったら
			return	0;
		}

		var saturation = ( 100 - ( minval/maxval * 100 ) );

		if( int_round ){
			saturation = Number( saturation.toFixed(int_round) );
		}else{
			saturation = this.#intval( saturation );
		}
		return saturation;
	}

	/**
	 * 明度を調べる
	 */
	get_brightness ( txt_hex , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var rgb = this.hex2rgb( txt_hex );
		if( rgb === false ){ return false; }

		var aryRGB = [rgb['r'], rgb['g'], rgb['b']];
		aryRGB.sort((a, b) => a - b);
		var maxval = aryRGB[2];

		var $brightness = ( maxval * 100/255 );

		if( int_round ){
			$brightness = Number( $brightness.toFixed(int_round) );
		}else{
			$brightness = this.#intval( $brightness );
		}
		return $brightness;
	}

	/**
	 * 16進数のRGBコードからHSB値を得る
	 */
	hex2hsb ( txt_hex , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var $hsb = {
			'h': this.get_hue( txt_hex , int_round ) ,
			's': this.get_saturation( txt_hex , int_round ) ,
			'b': this.get_brightness( txt_hex , int_round )
		};
		return	$hsb;
	}

	/**
	 * RGB値からHSB値を得る
	 */
	rgb2hsb ( int_r , int_g , int_b , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var txt_hex = this.rgb2hex( int_r , int_g , int_b );
		var $hsb = {
			'h': this.get_hue( txt_hex , int_round ) ,
			's': this.get_saturation( txt_hex , int_round ) ,
			'b': this.get_brightness( txt_hex , int_round )
		};
		return	$hsb;
	}

	/**
	 * HSB値からRGB値を得る
	 */
	hsb2rgb ( int_hue , int_saturation , int_brightness , int_round ){
		var int_round = this.#intval( int_round );
		if( int_round < 0 ){ return false; }

		var int_hue = Number( (int_hue%360).toFixed(3) );
		var int_saturation = Number( int_saturation.toFixed(3) );
		var int_brightness = Number( int_brightness.toFixed(3) );

		var maxval = Number( (int_brightness * ( 255/100 )).toFixed(3) );
		var minval = Number( (maxval - ( maxval * int_saturation/100 )).toFixed(3) );
		var midval = 0;

		var keyname = ['r' , 'g' , 'b'];
		if(      int_hue >=   0 && int_hue <  60 ){
			keyname = ['r' , 'g' , 'b'];
			midval = minval + ( (maxval - minval) * ( (int_hue -  0)/60 ) );
		}else if( int_hue >=  60 && int_hue < 120 ){
			keyname = [ 'g' , 'r' , 'b' ];
			midval = maxval - ( (maxval - minval) * ( (int_hue - 60)/60 ) );
		}else if( int_hue >= 120 && int_hue < 180 ){
			keyname = [ 'g' , 'b' , 'r' ];
			midval = minval + ( (maxval - minval) * ( (int_hue -120)/60 ) );
		}else if( int_hue >= 180 && int_hue < 240 ){
			keyname = [ 'b' , 'g' , 'r' ];
			midval = maxval - ( (maxval - minval) * ( (int_hue -180)/60 ) );
		}else if( int_hue >= 240 && int_hue < 300 ){
			keyname = [ 'b' , 'r' , 'g' ];
			midval = minval + ( (maxval - minval) * ( (int_hue -240)/60 ) );
		}else if( int_hue >= 300 && int_hue < 360 ){
			keyname = [ 'r' , 'b' , 'g' ];
			midval = maxval - ( (maxval - minval) * ( (int_hue -300)/60 ) );
		}

		var tmpRGB = {};
		if( int_round ){
			tmpRGB[keyname[0]] = Number( maxval.toFixed(int_round) );
			tmpRGB[keyname[1]] = Number( midval.toFixed(int_round) );
			tmpRGB[keyname[2]] = Number( minval.toFixed(int_round) );
		}else{
			tmpRGB[keyname[0]] = this.#intval( maxval );
			tmpRGB[keyname[1]] = this.#intval( midval );
			tmpRGB[keyname[2]] = this.#intval( minval );
		}

		var rgb = {
			'r': tmpRGB['r'] ,
			'g': tmpRGB['g'] ,
			'b': tmpRGB['b']
		};

		return	rgb;
	}
	/**
	 * HSB値から16進数のRGBコードを得る
	 */
	hsb2hex ( int_hue , int_saturation , int_brightness , int_round ){
		var rgb = this.hsb2rgb( int_hue , int_saturation , int_brightness , int_round );
		var hex = this.rgb2hex( rgb['r'] , rgb['g'] , rgb['b'] );
		return	hex;
	}

	/**
	 * 文字列を数値に変換
	 */
	#intval (val) {
		var type = typeof(val);
		if( type === typeof(0) ){
			return val;
		}
		if( type === typeof('') ){
			val = val.replace(/[^0-9]/g, '');
			val = val.replace(/^0+/, '');
			if(val === ''){
				return 0;
			}
			return Number(val);
		}
		if( type === typeof([]) ){
			return val.length;
		}
		if( val === true ){
			return 1;
		}
		if( val === false ){
			return 0;
		}
		if( val === undefined ){
			return 0;
		}
		return val;
	}

	/**
	 * 数値かどうか調べる
	 */
	#isInt (val) {
		return Number.isInteger(val);
	}

	/**
	 * 文字列かどうか調べる
	 */
	#isString(val){
		return typeof val === 'string';
	}

	/**
	 * 文字数を調べる
	 */
	#strlen(val){
		return String(val ?? '').length;
	}


	/**
	 * strPadLeft()
	 */
	 #strPadLeft( str, width, strPad ){
		if( strPad === null || strPad === undefined || strPad === '' ){
			strPad = '_';
		}
	 	return String(str).padStart(width, strPad);
	 }


};
