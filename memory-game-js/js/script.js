(function(){
	var cards = [];
	var flippedCards = [];
	var matchedPairs = 0;
	var canFlip = true;
	var cardImages = [];
	var tentativas = 0;
	var tempo = 0;
	var timerId = null;
	var audioCtx = null;

	startGame();

	function startGame(){
		cards = [];
		flippedCards = [];
		matchedPairs = 0;
		canFlip = true;
		cardImages = [];
		tentativas = 0;
		tempo = 0;

		document.getElementById("tentativas").textContent = tentativas;
		document.getElementById("tempo").textContent = tempo;
		document.getElementById("tentativas-finais").textContent = tentativas;
		document.getElementById("tempo-final").textContent = tempo;
		document.getElementById("popup-final").classList.add("oculto");

		clearInterval(timerId);
		timerId = setInterval(function(){
			tempo++;
			document.getElementById("tempo").textContent = tempo;
		}, 1000);

		for(var i = 0; i < 16; i++){
			var card = document.querySelector("#card" + i);
			card.classList.remove('flipped');
			card.style.left = (i % 8 === 0) ? 5 + "px" : (i % 8) * 165 + 5 + "px";
			card.style.top = i < 8 ? 100 + "px" : 375 + "px";
			card.querySelector('.back').style.backgroundImage = 'url("img/verso.jpg?ts=' + Date.now() + '")';
			cards.push(card);

			card.removeEventListener("click", flipCard);
			card.addEventListener("click", flipCard);
		}

		var images = [];
		for(var j = 0; j < 8; j++){
			images.push(j, j);
		}

		shuffle(images);
		cardImages = images;

		for(var k = 0; k < 16; k++){
			var front = cards[k].querySelector(".front");
			front.style.backgroundImage = 'url("img/' + images[k] + '.jpg")';
		}
	}

	function shuffle(array){
		for(var i = array.length - 1; i > 0; i--){
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	function playSound(type){
		if(!window.AudioContext && !window.webkitAudioContext) return;
		audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
		if(audioCtx.state === 'suspended') audioCtx.resume();

		var osc = audioCtx.createOscillator();
		var gain = audioCtx.createGain();
	
		osc.connect(gain);
		gain.connect(audioCtx.destination);

		var duration = 0.1;
		switch(type){
			case 'flip':
				osc.frequency.value = 700;
				gain.gain.value = 0.05;
				duration = 0.08;
				break;
			case 'match':
				osc.frequency.value = 880;
				gain.gain.value = 0.08;
				duration = 0.18;
				break;
			case 'mismatch':
				osc.frequency.value = 260;
				gain.gain.value = 0.08;
				duration = 0.16;
				break;
			case 'win':
				osc.frequency.value = 1040;
				gain.gain.value = 0.09;
				duration = 0.25;
				break;
			default:
				osc.frequency.value = 440;
				gain.gain.value = 0.05;
		}

		osc.type = 'sine';
		osc.start();
		osc.stop(audioCtx.currentTime + duration);

		gain.gain.setValueAtTime(gain.gain.value, audioCtx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
	}

	function flipCard(){
		if(!canFlip || this.classList.contains("flipped") || flippedCards.length >= 2){
			return;
		}

		this.classList.add("flipped");
		flippedCards.push(this);
		playSound('flip');

		if(flippedCards.length === 2){
			tentativas++;
			document.getElementById("tentativas").textContent = tentativas;

			canFlip = false;
			setTimeout(checkMatch, 1000);
		}
	}

	function checkMatch(){
		var card1 = flippedCards[0];
		var card2 = flippedCards[1];

		var id1 = parseInt(card1.id.replace("card", ""));
		var id2 = parseInt(card2.id.replace("card", ""));

		if(cardImages[id1] === cardImages[id2]){
			matchedPairs++;
			playSound('match');

			if(matchedPairs === 8){
				clearInterval(timerId);
				document.getElementById("tentativas-finais").textContent = tentativas;
				document.getElementById("tempo-final").textContent = tempo;
				document.getElementById("popup-final").classList.remove("oculto");
				playSound('win');
			}
		}else{
			playSound('mismatch');
			card1.classList.remove("flipped");
			card2.classList.remove("flipped");
		}

		flippedCards = [];
		canFlip = true;
	}

	window.reiniciarJogo = function(){
		startGame();
	};
})();
