var categoryList = ["Water", "Electricity", "Sanitation", "Env. Risk", "Pollution"]; // name of categories

var algorithmCheck = false; //checks if algorithm box is showing

// var pathArray = ['acc2dwat', 'acc2elec', 'acc2sani', 'ere', 'risk']

var background = document.getElementById("background"); // making a title and placing it in the background

var mainTitle = document.createElement('div');
	mainTitle.id = "mainTitle";
	mainTitle.style.width = "300px";
	mainTitle.style.position = "fixed";
	mainTitle.style.left = (window.innerWidth/2 - 150) + "px";
	mainTitle.style.top = window.innerHeight/40 + "px";
	mainTitle.style.textAlign = "center";


var mainTitleText = document.createElement('a');
	mainTitleText.innerHTML = "Environmental Ratings";
	mainTitleText.style.fontSize = "32px";
	mainTitleText.style.fontWeight = "bold";
	mainTitleText.style.color = "#3D7EAA";
	mainTitleText.style.opacity = ".7";


	mainTitle.appendChild(mainTitleText);
	background.appendChild(mainTitle);

var hoverName = document.createElement('div'); // top left, where name is shown when ball is hovered
	
	//styling
	hoverName.id = "countryName";

	//add to body
	document.body.appendChild(hoverName);


var div = document.createElement('div');

	div.id = "menu"; // the housing div for main ui menu


var headerDiv = document.createElement('div');

	headerDiv.id = "headerDiv"; // houses the main title

	var header = document.createElement('a');

		header.id = "uiHeader";
		// header.innerHTML = "Country Factors";
		header.innerHTML = "What Matters to You?"; //main title

	headerDiv.appendChild(header); // add to main title div

div.appendChild(headerDiv); // main title div to main ui menu

//number of countries to show
var howMany = document.createElement('div');
	
	howMany.className = "factor";

	howMany.innerHTML = "<a># to Show</a>";
	howMany.style.color = "#d58b15";

	div.appendChild(howMany);



var newHowManyInput = document.createElement('input'); // slider for category
	newHowManyInput.id = "sliderInputS";
	newHowManyInput.className = "sliderInput";
	newHowManyInput.type = "number";
	newHowManyInput.min = 0;
	newHowManyInput.max = 150;
	newHowManyInput.value = 30;
	newHowManyInput.onchange = changeSValue; //calls a function that updates value input

	howMany.appendChild(newHowManyInput);// add it into the newCategory div

var newHowMany = document.createElement('input'); // value input for category
	newHowMany.id = "sliderS";
	newHowMany.className = "slider";
	newHowMany.type = "range";
	newHowMany.min = 0;
	newHowMany.max = 150;
	newHowMany.value = 30;
	newHowMany.step = 5;
	newHowMany.oninput = showValue; //calls a function that updates slider value

	howMany.appendChild(newHowMany);// add it into the newCategory div



for (var i =0; i < categoryList.length; i++) { // makes category sliders for each category
	
	var newCategory = document.createElement('div');

	newCategory.className = "factor";

	newCategory.innerHTML = "<a>" + categoryList[i] + "</a>"; // name the category factor
	div.appendChild(newCategory); // add it into the main menu ui div


	var newSliderInput = document.createElement('input'); // slider for category
	newSliderInput.id = "sliderInput" + i;
	newSliderInput.className = "sliderInput";
	newSliderInput.type = "number";
	newSliderInput.min = 0;
	newSliderInput.max = 100;
	newSliderInput.value = 100;
	newSliderInput.onchange = changeSValue; //calls a function that updates value input

	newCategory.appendChild(newSliderInput);// add it into the newCategory div

	var newSlider = document.createElement('input'); // value input for category
	newSlider.id = "slider" + i;
	newSlider.className = "slider";
	newSlider.type = "range";
	newSlider.min = 0;
	newSlider.max = 100;
	newSlider.value = 100;
	newSlider.step = 5;
	newSlider.oninput = showValue; //calls a function that updates slider value

	newCategory.appendChild(newSlider);// add it into the newCategory div

}


var leaderboard = document.createElement('div'); //leaderboard to house "best" countries

	leaderboard.id = "leaderboard";


	div.appendChild(leaderboard);// add it into the main menu ui div

var showAlgorithm = document.createElement('button'); // algorithm button

	showAlgorithm.id = "algorithm";
	showAlgorithm.className = "uiButtons";
	showAlgorithm.onclick = showAdjAlgorithm; //function that makes pop up window to show algorithm

		var algInner = document.createElement('a');
		algInner.innerHTML = "Algorithm";
		// algInner.onclick = showAlgorithm;

		showAlgorithm.appendChild(algInner);

	div.appendChild(showAlgorithm);// add it into the main menu ui div

var generateNewSet = document.createElement('button'); // generate new set of balls button

	generateNewSet.id = "generate";
	generateNewSet.className = "uiButtons";
	generateNewSet.onclick = spawnsphere;
	// generateNewSet.innerHTML = "Generate";
		var genInner = document.createElement('a');
		genInner.innerHTML = "Generate";

		generateNewSet.appendChild(genInner);

	div.appendChild(generateNewSet);// add it into the main menu ui div

document.body.appendChild(div);// add main menu ui div to body

function showValue(){ // updates slider value from input value

			var idValue = this.id.slice(0, 6) + "Input" + this.id.slice(6,7);
			var newValue = this.value;
			document.getElementById(idValue).value=newValue;
		}

function changeSValue(){ // updates input value from slider

			var newValue = Math.round(this.value/5) * 5;
			this.value = newValue;
			// document.getElementById("range").innerHTML=newValue;
			var idValue = this.id.slice(0, 6) + this.id.slice(11,12);
			// var newValue = this.value;


			document.getElementById(idValue).value=newValue;
		}

function showAdjAlgorithm(){ // shows algorithm pop up

		var calculations = document.createElement('div');
		calculations.id = "calculations";
		console.log("i'm failing");

			var factoredAlgorithm = document.createElement('a');
			factoredAlgorithm.innerHTML = categoryList[0] + " * " + document.getElementById("sliderInput0").value + " + " + categoryList[1] + " * " + document.getElementById("sliderInput1").value + " + " + categoryList[2] + " * " + document.getElementById("sliderInput2").value + " + " + categoryList[3] + " * " + document.getElementById("sliderInput3").value + " + " + categoryList[4] + " * " + document.getElementById("sliderInput4").value + " = " + "<span style = color:#EDAE49;>EPI Score</span>" ;
			calculations.appendChild(factoredAlgorithm);

		if(algorithmCheck==false){ //checks if a div already exists

			document.body.appendChild(calculations);

			algorithmCheck = true;

		}else if(algorithmCheck==true){ //if there is, remove div

		    document.getElementById("calculations").remove();

			algorithmCheck = false;

		}
}


window.addEventListener('resize', onWindowResize, false); //when the user resizes browser, run function "onWindowResize" - currently set to false until otherwise

    function onWindowResize() {

    	document.getElementById("mainTitle").style.left = (window.innerWidth/2 - 150) + "px";

    }



