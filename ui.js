import artefactFound from './sketch.js';

let shown = -1; //-9: negative values mean it is disabled, 1-9 are values in the array of artefacts corresponding to descriptions etc
let titles = ["Not yet Found","Plastic Usage","Sustainable Fishing","Ocean Products","Reduce Waste","Pollutants","Acidification","Respect Habitats"];
let descriptions = [
"Discover this artefact first to learn more about its impacts and how we can help our oceans!",
"The oceans face a huge threat from plastics. It's estimated over 17 billion pounds of plastic leaks into the ocean environment from the land every year, only by reducing our use of plastic based products will companies stop producing the waste. Save oceans and demand plastic-free alternatives, such as paper straws and bags instead of plastic, or even better bring your own reusable items along with you so you don’t have to buy disposable items that you will only get rid of later!",
"With global food consumption only growing, some fisheries resort to overfishing and tipping the ecosystem balance. Try to buy organic seafood and consider adding small, oily fish such as anchovies and sardines to your diet that are not only packed with protein but are more sustainable and in abundance in the wild, unlike the heavily in demand salmon which must now be farmed. If fishing yourself, consider the ‘catch and release’ approach to keep the fish population alive and bustling!",
"Many products are directly linked to unsustainable fishing methods and pollution that all harm endangered species and the ocean as a whole. A few examples of contributors are cosmetic manufacturers that use shark squalene in products, or souvenir manufacturers that use conch, turtle shells and especially coral for jewellery and decoration. Try to be vocal in spreading awareness to your community and encourage friends and family to adopt similar changes lifestyle and purchasing habits!",
"Coastlines are becoming an increasingly prime location for tourists to gather and be merry, but as the crowds grow, so does their waste. When out at the beach and just in general, pay careful attention to leave no waste behind that might blow into the oceans or be taken away by the tide, as it will end up directly harming the oceans and poisoning fish, the same fish that we may end up eating. It’s important to keep in mind that what effects the ocean will come back around and affect our lifestyle!",
"Pollution already has a huge effect on the environment as a whole, having both direct and indirect effects on Ocean life. Try to use non-toxic detergents around the house or dispose of toxic cleaning products properly and safely so they don’t end up polluting the waters. What might seem unsuspecting can be deadly to wildlife, such as plastic microbeads found in toothpaste and facial scrubs which are designed to wash down the drain but have been found ending up inside fish from the Arctic!",
"The oceans acid levels rise with the amount of carbon dioxide in the atmosphere due to a chemical reaction from the air with the seawater. Much of the ocean wildlife is unable to survive in conditions too acidic, including making plankton and coral unable grow and even can dissolve shells of existing creatures. Try to reduce your carbon footprint by supporting cleaner energy sources and using less electricity and fuel. A few easy tips are to use public transport and check your home is well insulated!",
"While the oceans may seem infinitely huge and resilient, many areas and habitats are formed around a fine balance where the wildlife can only survive in specific conditions and temperatures. If exploring around wildlife be careful not to disturb the area, and if boating make sure to anchor in sandy areas far from coral and sea grasses, by adhering to ‘no wake’ zones. Consider volunteering in your local area for beach clean-ups if you want to get involved in making a positive impact!"
];



let imgurls = ["assets/iconNotFound.jpg","assets/artefacts/a1.png","assets/artefacts/a2.png","assets/artefacts/a3.png","assets/artefacts/a4.png","assets/artefacts/a5.png","assets/artefacts/a6.png","assets/artefacts/a7.png"];
let artefactLength = artefactFound.artefactFound.length;



function openMenu() {
    if (shown < 0) {
        document.getElementById("menu").style = "display: block;";
        shown = shown*-1;
        updatePage(1);
        
    }
    else if (shown >= 0) {
        document.getElementById("menu").style = "display: none;";
        shown = shown*-1;
    }
}

function updatePage(pageIncrement) {
    
    for (let i = 1; i <= artefactLength; i++) {
        document.getElementById("art"+i).style.width = "";
        document.getElementById("art"+i).style.filter = "sepia(100%)";
        if (artefactFound.artefactFound[i-1] == 1) {
            //document.getElementById("art"+i).src = imgurls[i];
            document.getElementById("art"+i).style.filter = "sepia(0%)";
        }
    }

    document.getElementById("art"+pageIncrement).style.width = "22%";
    if (artefactFound.artefactFound[pageIncrement-1] == 0) {
        document.getElementById("title").innerHTML = titles[0];
        document.getElementById("description").innerHTML = descriptions[0];
    } else {
        document.getElementById("title").innerHTML = titles[pageIncrement];
        document.getElementById("description").innerHTML = descriptions[pageIncrement];
    }
}

document.getElementById('menuOpener').addEventListener("click", function() {openMenu()}, false);
document.getElementById('art1').addEventListener("click", function() {updatePage(1)}, false);
document.getElementById('art2').addEventListener("click", function() {updatePage(2)}, false);
document.getElementById('art3').addEventListener("click", function() {updatePage(3)}, false);
document.getElementById('art4').addEventListener("click", function() {updatePage(4)}, false);
document.getElementById('art5').addEventListener("click", function() {updatePage(5)}, false);
document.getElementById('art6').addEventListener("click", function() {updatePage(6)}, false);
document.getElementById('art7').addEventListener("click", function() {updatePage(7)}, false);

