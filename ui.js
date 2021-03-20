import artefactFound from './sketch.js';

let shown = -1; //-9: negative values mean it is disabled, 1-9 are values in the array -1 of artefacts corresponding to descriptions etc
let titles = ["Artefact1","Artefact2","Artefact3","Artefact4","Artefact5","Artefact6"];
let descriptions = [
"description of the type of degradation1 and how to change lifestyle",
"description of the type of degradation2 and how to change lifestyle",
"description of the type of degradation3 and how to change lifestyle",
"description of the type of degradation4 and how to change lifestyle",
"description of the type of degradation5 and how to change lifestyle",
"description of the type of degradation6 and how to change lifestyle"
];

let imgurls = ["assets/icon1.jpg","assets/icon2.jpg","assets/icon3.jpg","assets/icon4.jpg","assets/icon5.jpg","assets/icon6.jpg"];
let artefactLength = artefactFound.artefactFound.length;



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
        shown += artefactLength;
    }
    else if (shown > artefactLength) { //loop pages
        shown -= artefactLength;
    }
    if(shown > 0 && shown < artefactLength+1) { //retrieve data
        document.getElementById("title").innerHTML = titles[shown-1];
        document.getElementById("imgurl").src = imgurls[shown-1];
        if (shown==artefactLength){
            document.getElementById("menuNext").src = imgurls[shown-artefactLength];
        } else {
            document.getElementById("menuNext").src = imgurls[shown];
        }
        if (shown==1){
        document.getElementById("menuPrev").src = imgurls[shown-2+artefactLength];
        }
        else{
            document.getElementById("menuPrev").src = imgurls[shown-2];
        }
        document.getElementById("description").innerHTML = descriptions[shown-1];
    }
    if (artefactFound.artefactFound[shown-1] == 0){
        document.getElementById("state").innerHTML = "Not found!";
    }
    else {
        document.getElementById("state").innerHTML = "Found!";
    }
    
}

document.getElementById('menuOpener').addEventListener("click", function() {openMenu()}, false);
document.getElementById('menuPrev').addEventListener("click", function() {updatePage(-1)}, false);
document.getElementById('menuNext').addEventListener("click", function() {updatePage(1)}, false);
