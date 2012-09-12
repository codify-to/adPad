/*!
 * Based on Add to Homescreen v2.0.1 ~ (c) 2012 Matteo Spinelli, http://cubiq.org, MIT Licensed
 */
var addToHome = (function (w) {
	var nav = w.navigator,
		isIDevice = 'platform' in nav && (/iphone|ipod|ipad/gi).test(nav.platform),
		isIPad,
		isRetina,
		isSafari,
		isStandalone,
		OSVersion,
		startX = 0,
		startY = 0,
		balloon,
		overrideChecks,
		positionInterval,

		options = {
			animationIn: 'drop',		// drop || bubble || fade
			animationOut: 'fade',		// drop || bubble || fade
			startDelay: 500,			// half second from page load before the balloon appears
			bottomOffset: 14			// Distance of the balloon from bottom
		};

	function init () {

		// Preliminary check, prevents all further checks to be performed on iDevices only
		if ( !isIDevice ) return;

		// Merge local with global options
		if (w.addToHomeConfig) {
			for ( i in w.addToHomeConfig ) {
				options[i] = w.addToHomeConfig[i];
			}
		}

		isIPad = (/ipad/gi).test(nav.platform);
		isRetina = w.devicePixelRatio && w.devicePixelRatio > 1;
		isSafari = (/Safari/i).test(nav.appVersion) && !(/CriOS/i).test(nav.appVersion);
		isStandalone = nav.standalone;
		OSVersion = nav.appVersion.match(/OS (\d+_\d+)/i);
		if (OSVersion == null) {
			OSVersion = 0;
		}
		else {
			OSVersion = OSVersion[1] ? +OSVersion[1].replace('_', '.') : 0;
		}
		
		w.addEventListener('load', loaded, false);
	}

	function loaded () {		
		w.removeEventListener('load', loaded, false);

		if ( !overrideChecks && ( !isSafari || isStandalone ) ) return;

		var platform = nav.platform.split(' ')[0],
			language = nav.language.replace('-', '_'),
			i, l;

		balloon = document.createElement('div');
		balloon.id = 'addToHomeScreen';
		balloon.style.cssText += 'left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:' + (OSVersion < 5 ? 'absolute' : 'fixed');
		balloon.className = 'addToHomeIpad';

		if(language == "pt_br"){
			balloon.innerHTML = '<img src="debug/homeScreen-br.png" width="424" height="198">';	
		}
		else {
			balloon.innerHTML = '<img src="debug/homeScreen.png" width="424" height="198">';	
		}
		document.body.appendChild(balloon);

		setTimeout(show, options.startDelay);
	}

	function show() {
		var duration,
			iPadXShift = 268;

		// Set the initial position
		if ( isIPad ) {
			if ( OSVersion < 5 ) {
				startY = w.scrollY;
				startX = w.scrollX;
			} else if ( OSVersion < 6 ) {
				iPadXShift = 220;
			}

			balloon.style.top = startY + options.bottomOffset + 'px';
			balloon.style.left = startX + iPadXShift - Math.round(balloon.offsetWidth / 2) + 'px';

			switch ( options.animationIn ) {
				case 'drop':
					duration = '0.6s';
					balloon.style.webkitTransform = 'translate3d(0,' + -(w.scrollY + options.bottomOffset + balloon.offsetHeight) + 'px,0)';
					break;
				case 'bubble':
					duration = '0.6s';
					balloon.style.opacity = '0';
					balloon.style.webkitTransform = 'translate3d(0,' + (startY + 50) + 'px,0)';
					break;
				default:
					duration = '1s';
					balloon.style.opacity = '0';
			}
		} 

		balloon.offsetHeight;	// repaint trick
		balloon.style.webkitTransitionDuration = duration;
		balloon.style.opacity = '1';
		balloon.style.webkitTransform = 'translate3d(0,0,0)';
		balloon.addEventListener('webkitTransitionEnd', transitionEnd, false);
	}


	function transitionEnd () {
		balloon.removeEventListener('webkitTransitionEnd', transitionEnd, false);

		balloon.style.webkitTransitionProperty = '-webkit-transform';
		balloon.style.webkitTransitionDuration = '0.2s';


		// On iOS 4 we start checking the element position
		if ( OSVersion < 5 ) positionInterval = setInterval(setPosition, options.iterations);
	}

	function setPosition () {
		var matrix = new WebKitCSSMatrix(w.getComputedStyle(balloon, null).webkitTransform),
			posY = isIPad ? w.scrollY - startY : w.scrollY + w.innerHeight - startY,
			posX = isIPad ? w.scrollX - startX : w.scrollX + Math.round((w.innerWidth - balloon.offsetWidth) / 2) - startX;

		// Screen didn't move
		if ( posY == matrix.m42 && posX == matrix.m41 ) return;

		balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
	}

	// Bootstrap!
	init();

})(this);