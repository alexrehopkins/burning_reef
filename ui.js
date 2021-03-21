import artefactFound from './sketch.js';

let shown = -1; //-9: negative values mean it is disabled, 1-9 are values in the array of artefacts corresponding to descriptions etc
let titles = ["Not yet Found","Plastic Usage","Sustainable Fishing","Ocean Products","Reduce Waste","Conserve Water","Pollutants","Acidification","Respect Habitats"];
let descriptions = [
"Discover this artefact first to learn more about its impacts and how we can help our oceans!",
"The oceans face a huge threat from plastics. It's estimated over 17 billion pounds of plastic leaks into the ocean environment from the land every year, only by reducing our use of plastic based products will companies stop producing the waste. Save oceans and demand plastic-free alternatives, such as paper straws and bags instead of plastic, or even better bring your own reusable items along with you so you don’t have to buy disposable items that you will only get rid of later!",
"With global food consumption only growing, some fisheries resort to overfishing and tipping the ecosystem balance. Try to buy organic seafood and consider adding small, oily fish such as anchovies and sardines to your diet that are not only packed with protein but are more sustainable and in abundance in the wild, unlike the heavily in demand salmon which must now be farmed. If fishing yourself, consider the ‘catch and release’ approach to keep the fish population alive and bustling!",
"Many products are directly linked to unsustainable fishing methods and pollution that all harm endangered species and the ocean as a whole. A few examples of contributors are cosmetic manufacturers that use shark squalene in products, or souvenir manufacturers that use conch, turtle shells and especially coral for jewellery and decoration. Try to be vocal in spreading awareness to your community and encourage friends and family to adopt similar changes lifestyle and purchasing habits!",
"Coastlines are becoming an increasingly prime location for tourists to gather and be merry, but as the crowds grow, so does their waste. When out at the beach and just in general, pay careful attention to leave no waste behind that might blow into the oceans or be taken away by the tide, as it will end up directly harming the oceans and poisoning fish, the same fish that we may end up eating. It’s important to keep in mind that what effects the ocean will come back around and affect our lifestyle!",
"It already costs a lot of energy to treat, heat and pump water for human use, so reducing usage reduces greenhouse gas emissions, but after use all that water must go somewhere. So be careful what you flush down the toilet and use eco-friendly products that can naturally decompose. Remember what goes down the drains and rivers ends up flowing down into our seas. Consider donating to a local water treatment charity if you want to directly support the development of cleaner water systems!",
"Pollution already has a huge effect on the environment as a whole, having both direct and indirect effects on Ocean life. Try to use non-toxic detergents around the house or dispose of toxic cleaning products properly and safely so they don’t end up polluting the waters. What might seem unsuspecting can be deadly to wildlife, such as plastic microbeads found in toothpaste and facial scrubs which are designed to wash down the drain but have been found ending up inside fish from the Arctic!",
"The oceans acid levels rise with the amount of carbon dioxide in the atmosphere due to a chemical reaction from the air with the seawater. Much of the ocean wildlife is unable to survive in conditions too acidic, including making plankton and coral unable grow and even can dissolve shells of existing creatures. Try to reduce your carbon footprint by supporting cleaner energy sources and using less electricity and fuel. A few easy tips are to use public transport and check your home is well insulated!",
"While the oceans may seem infinitely huge and resilient, many areas and habitats are formed around a fine balance where the wildlife can only survive in specific conditions and temperatures. If exploring around wildlife be careful not to disturb the area, and if boating make sure to anchor in sandy areas far from coral and sea grasses, by adhering to ‘no wake’ zones. Consider volunteering in your local area for beach clean-ups if you want to get involved in making a positive impact!"
];



let imgurls = ["assets/iconNotFound.jpg","assets/icon1.jpg","assets/icon2.jpg","assets/icon3.jpg","assets/icon4.jpg","assets/icon5.jpg","assets/icon6.jpg","assets/icon7.jpg","assets/icon8.jpg"];
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
        document.getElementById("title").innerHTML = titles[shown];
        document.getElementById("imgurl").src = imgurls[shown];
        if (shown==artefactLength){
            document.getElementById("menuNext").src = imgurls[1+shown-artefactLength];
        } else {
            document.getElementById("menuNext").src = imgurls[shown+1];
        }
        if (shown==1){
        document.getElementById("menuPrev").src = imgurls[shown-1+artefactLength];
        }
        else{
            document.getElementById("menuPrev").src = imgurls[shown-1];
        }
        document.getElementById("description").innerHTML = descriptions[shown];
    }
    if (artefactFound.artefactFound[shown-1] == 0){
        document.getElementById("description").innerHTML = descriptions[0];
        document.getElementById("imgurl").src = imgurls[0];
        document.getElementById("title").innerHTML = titles[0];
    }    
}

document.getElementById('menuOpener').addEventListener("click", function() {openMenu()}, false);
document.getElementById('menuPrev').addEventListener("click", function() {updatePage(-1)}, false);
document.getElementById('menuNext').addEventListener("click", function() {updatePage(1)}, false);
