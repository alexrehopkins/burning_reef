var shown = 0; //0: start and hidden, 1: showing after being clicked

function openMenu() {
    if (shown == 0) {
        document.getElementById("menu").style = "display: block;";
        shown = 1;
    }
    else if (shown == 1) {
        document.getElementById("menu").style = "display: none;";
        shown = 0;
    }
}