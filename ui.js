import artefactFound from './sketch.js';

let shown = -1; //-9: negative values mean it is disabled, 1-9 are values in the array -1 of artefacts corresponding to descriptions etc
let titles = ["Artefact1","Artefact2","Artefact3","Artefact4","Artefact5","Artefact6"];
let descriptions = [
"description of the type of degradation and how to change lifestyle",
"description of the type of degradation and how to change lifestyle",
"description of the type of degradation and how to change lifestyle",
"description of the type of degradation and how to change lifestyle",
"description of the type of degradation and how to change lifestyle",
"description of the type of degradation and how to change lifestyle"
];

let imgurls = ["assets/icon.jpg","assets/icon.jpg","assets/icon.jpg","assets/icon.jpg","assets/icon.jpg","assets/icon.jpg"];




function openMenu() {
    if (shown < 0) {
        document.getElementById("menu").style = "display: block;";
        shown = shown*-1;
        updatePage(0);
        
    }
    else if (shown >= 0) {
        document.getElementById("menu").style = "display: none;";
        shown = shown*-1;
    }
}

function updatePage(pageIncrement) {
    shown+= pageIncrement;
    if (shown < 1 ) { //loop pages
        shown = artefactFound.artefactFound.length;
    }
    else if (shown > artefactFound.artefactFound.length) { //loop pages
        shown = 1;
    }
    if(shown > 0 && shown < artefactFound.artefactFound.length+1) { //retrieve data
        document.getElementById("title").innerHTML = titles[shown-1];
        document.getElementById("imgurl").src = imgurls[shown-1];
        document.getElementById("description").innerHTML = descriptions[shown-1];
    }
    if (artefactFound[shown-1] == 0){
        document.getElementById("state").innerHTML = "Not found!";
    }
    else {
        document.getElementById("state").innerHTML = "Found!";
    }
    
}



document.getElementById('menuOpener').addEventListener("click", function() {openMenu()}, false);
document.getElementById('menuPrev').addEventListener("click", function() {updatePage(-1)}, false);
document.getElementById('menuNext').addEventListener("click", function() {updatePage(1)}, false);