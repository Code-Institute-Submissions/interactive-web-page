/*jshint esversion: 6 */
let game_state = 0; // This is the game_state var it lets me understand what screen to present.

const MapX = 50, MapY = 50; // This is the main control variables for the map gen. Max size
const size_X = 6, size_Y = 6; // size of each tile.

let mouse_x, mouse_y; // empty variables for the mouse position.

let temp = 0; // temp var to cast too.
let x, y, i, CALC_X, CALC_Y, temp_x, temp_y, temp_val, r, diff; // initialize variables that are needed in the script.
let map = [], inv = [], temp_pos = [], zone = []; // initialize the needed arrays
let color = "", selected_item = "", text = ""; // initialize the needed string casts

let time = 0; // initialize the time variable that allows for me to understand a measurement of time.
let night = false, scanned = false; // initialize the night variable and the scanned var. They are vars for time altering and when you have scanned.

let count, active, cooldown; // initialize int variables
let diggable = false; // initialize the diggable boolean, this is to tell the game you have scanned the terrain.

let inventory = []; // Inventory array to hold the items the user obtains from the terrain.

let biome_v = ""; // String for the biome_value of the terrain.

let user = false; // check for user responses
let bool = false; // bool cast, helpful to have an empty castable bool
let select = 1; // Used within the menu to check what the user is currently selected.

let geode = []; // Array for the XY of each geode location
let dig_attempt = []; // previous dig locations
let attempts = 3; // attempts that the user has
let sequence = []; // initialize the sequence.
let SEQUENCE_COMPLETE = false; // initialize boolean that is needed for the sequence comparison.
let sequence_len = 0; // initialize the int value for the max length of the sequence
let response_sequence = []; // initialize the array which is casted too when a user tries to repeat the sequence.
let museum = []; // initialize the array to hold items that have been processed

let item_select = 0; // this allows me to find that item is selected in the inventory.

let tool_belt = ["Pocket Scanner", 1, "Pickaxe", 1, "Shovel", 1]; // tool_belt for the items that the user is using in the game.


// Constants for the different game states.
const AFTER_TUTORIAL = 0.5;
const START_GAME = 1;
const DURING_GAME = 1.1;
const SECOND_GAME = 1.2;
const SEQUENCE_RESPONSE = 1.3;
const ENTER_MUSEUM = 2;
const ITEM_SELECTED = 2.1;
const PROCESS_ITEM_SEQ = 2.2;
const PROCESS_RES_SEQ = 2.3;
const VIEW_INVENTORY = 2.4;
const VIEW_MUSEUM = 2.5;
const INVENTORY = 3;
const UPGRADES = 4;


const LOW_ITEMS = ["Dirt", "Stone", "Gold ore", "Iron ore", "Copper ore", "Sand", "Lapis Lazuli", "Amber"];
const OUTPUT_ITEMS = [["World Map", "Museum", "Inventory", "Upgrade"],["Plains", "Desert", "Forest", "Swamp", "Mountain", "Taiga", "Jungle", "Red Desert", "Savannah", "Marsh"], ["View Items", "Check Museum"], ["Process"]];
const OUTPUT = ["Welcome to DIG UP! This is a game developed by me just to be presented for my course. The game is only going to have some simple little mini-games and will be just a little bit of fun.+<br><br> Press any button to continue.", "Hello. I am your assistant, just call me Alph. I will tell you about the game and how to play.", "W, S and A / Q and E are keys that are used within the quicktime events to allow for you to repeat sequences that will be produced during a series of mini-games.", "Space Bar and Enter will be the confirm button, whilst the ESC and backbutton will allow you to move back out of a menu screen, you can not leave the mini-games though. Spacebar is also used to display the locations of areas of interest on your map so you can find rarer items.", "The W and S keys are also used within the menu screens to allow for navigation and movement.", "There are a series of menus, world map allows you to go out and dig up items within the terrain, whilst museum allows you to process rare items you have found, inventory just displays the items you have found and the upgrade screen will let you upgrade the items in your tool belt."];

// These are different string arrays that are used for different tasks and instances in my script. Maybe unconventional but helpful for me to change the text within the game portably.

function innit() {
    canvas = document.getElementById("Window");
    ctx = canvas.getContext("2d");

    document.addEventListener("keypress", keyPress);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("click", Click);

    document.getElementById("name").innerHTML = "???:";
    document.getElementById("output").innerHTML = [OUTPUT[Math.floor(game_state*10)]];
    setInterval(main, 20);
    setInterval(draw, 20);
    setInterval(alph, 20);
}

function alph() {
    if (user && game_state < AFTER_TUTORIAL) {
        if (game_state == 0.1) {
            document.getElementById("name").innerHTML = "Alph:";
        }
        game_state += 0.1;
        user = false;
    }
    if (game_state < AFTER_TUTORIAL) {
        document.getElementById("output").innerHTML = OUTPUT[Math.floor(game_state*10)];
    }
    if (game_state == AFTER_TUTORIAL) {
        item_select = 0;
        temp = OUTPUT_PRINTOUT(OUTPUT_ITEMS[item_select], select);
        if (user) {
            user = false;
            game_state = select;
            select = 1;
        }
        document.getElementById("output").innerHTML = "What would you like to do?"+temp;
    }
    if (game_state == START_GAME) {
        item_select = 1;
        let available = [];
        for (i = 0; i < range(tool_belt[1], 1, 10); i++) {
            available.push(OUTPUT_ITEMS[item_select][i]);
        }
        temp = OUTPUT_PRINTOUT(available, select);
        if (user) {
            user = false;
            game_state = DURING_GAME;
            biome_v = OUTPUT_ITEMS[1][select-1];
            count = 3+Math.ceil(Math.random()*tool_belt[1]);
            biome(biome_v);
        }
        document.getElementById("output").innerHTML = "What biome would you like to explore?"+temp;
    }
    if (game_state == DURING_GAME) {
        document.getElementById("output").innerHTML = "Now you will have a series of attempts to find the items within the terrian, using spacebar you can see the locations of the items.<br><br>Attempts: "+(attempts-(Math.floor(dig_attempt.length/2)));
    }
    if (game_state == SECOND_GAME) {
        document.getElementById("output").innerHTML = "Now you will be given a sequence of characters which will have to be repeated back to be able to dig up the locations you have chosen. Now can you repeat the sequence that was just produced.<br><br>Sequence: "+sequence;
    }
    if (game_state == SEQUENCE_RESPONSE) {
        document.getElementById("output").innerHTML = "Now can you repeat the sequence that was just produced. You have manageed to find "+inventory[inventory.length-2]+"<br><br>Users Response: "+response_sequence;
    }
    if (game_state == ENTER_MUSEUM) {
        item_select = 2;
        temp = OUTPUT_PRINTOUT(OUTPUT_ITEMS[item_select], select);
        if (user) {
            user = false;
            if (select == 1) {
                game_state = VIEW_INVENTORY;
            }
            if (select == 2) {
                game_state = VIEW_MUSEUM;
            }
            select = 1;
        }
        document.getElementById("output").innerHTML = "This is the Museum, in here you can view items you have recovered or recover an item."+temp;
    }
    if (game_state == VIEW_INVENTORY) {
        inv = castMuseum(inventory);
        temp = OUTPUT_PRINTOUT(inv, select);
        if (user && inventory.indexOf(inv[select-1]) > 0) {
            user = false;
            let itemIndex = inventory.indexOf(inv[select-1]);
            selected_item = inventory[itemIndex];
            game_state = ITEM_SELECTED;
            select = 1;
        } else {
            user = false;
        }
        document.getElementById("output").innerHTML = "Welcome to the Museum, this is where you can process and sell some of the items you have obtained. You can choice to process any items within your inventory or just sell the items. <br>"+temp;
    }
    if (game_state == ITEM_SELECTED) {
        item_select = 2;
        if (user) {
            user = false;
            if (item_select == 2 && select == 1) {
                removeItem(selected_item, 1);
                game_state = PROCESS_ITEM_SEQ;
            }
        }
        document.getElementById("output").innerHTML = "What would you like to do with this "+selected_item+"<br><b>Process?</b>";
    }
    if (game_state == PROCESS_ITEM_SEQ) {
        document.getElementById("output").innerHTML = "You will be given a sequence that you must repeat to process the item you have selected.<br><br>Sequence: "+sequence;
    }
    if (game_state == PROCESS_RES_SEQ) {
        document.getElementById("output").innerHTML = "Can you now repeat the response on which was just generated?<br><br>Users Response: "+response_sequence;
    }
    if (game_state == VIEW_MUSEUM) {
        if (user) {
            user = false;
            game_state = ENTER_MUSEUM;
        }
        document.getElementById("output").innerHTML = "This is the museum, you can see how well you have fixed up items. <br>"+museum;
    }
    if (game_state == INVENTORY) {
        document.getElementById("output").innerHTML = "These are the items that are in your inventory.<br><br>"+displayInv(inventory);
        if (user) {
            game_state = AFTER_TUTORIAL;
            user = false;
        }
    }
    if (game_state == UPGRADES) {
        let array = [];
        for (i = 0; i < tool_belt.length/2; i++) {
            array.push(tool_belt[i*2]+" || Level "+tool_belt[i*2+1]);
        }
        if (select == 1) {
            temp = String("REQUIRES "+tool_belt[1]+" GOLD");
        } else if (select == 2) {
            temp = String("REQUIRES "+tool_belt[3]+" IRON");
        } else {
            temp = String("REQUIRES "+tool_belt[5]+" IRON");
        }
        document.getElementById("output").innerHTML = "This is the upgrade menu, this is where you can upgrade your different devices. Scanner increases potential to locate more geodes, pickaxe and shovel increase the chance to get smaller sequences.<br>"+temp+OUTPUT_PRINTOUT(array, select);
        if (user) {
            user = false;
            if (select == 1 && removeItem("Gold ore", tool_belt[5])) {
                removeItem("Gold ore", tool_belt[1]);
                tool_belt[1] += 1;
            } else if (select == 2 && removeItem("Iron ore", tool_belt[5])) {
                removeItem("Iron ore", tool_belt[3]);
                tool_belt[3] += 1;
            } else if (select == 3 && removeItem("Iron ore", tool_belt[5])) {
                removeItem("Iron ore", tool_belt[5]);
                tool_belt[5] += 1;
            }
        }
    }
}

function OUTPUT_PRINTOUT (items, selected) {
    let temp = "";
    if (selected > items.length) {
        selected = items.length;
    }
    for (x = 0; x < items.length; x++) {
        if (selected-1 == x) {
            temp = String(temp+"<br><b>"+items[x]+"</b>");
        } else {
            temp = String(temp+"<br>"+items[x]);
        }
    }
    return temp;
}

function biome(value) {
    if (value == "Plains") {
        map = new map_Gen(2, 50, 40, MapX, MapY);
    } else if (value =="Desert") {
        map = new map_Gen(2, 95, 85, MapX, MapY);
    } else if (value == "Forest") {
        map = new map_Gen(2, 20, 10, MapX, MapY);
    } else if (value == "Swamp") {
        map = new map_Gen(2, 55, 25, MapX, MapY);
    } else if (value == "Mountain") {
        map = new map_Gen(5, 60, 35, MapX, MapY);
    } else if (value == "Jungle") {
        map = new map_Gen(2, 40, 25, MapX, MapY);
    } else if (value == "Taiga") {
        map = new map_Gen(2, 40, 30, MapX, MapY);
    } else if (value == "Red Desert") {
        map = new map_Gen(2, 90, 80, MapX, MapY);
    } else if (value == "Savannah") {
        map = new map_Gen(2, 80, 70, MapX, MapY);
    } else if (value == "Marsh") {
        map = new map_Gen(2, 40, 25, MapX, MapY);
    }

    attempts = range(3+Math.floor(Math.random()*(tool_belt[3]+tool_belt[5]/3)), 1, 6);
    count = 3;
    count = range((count - (tool_belt[3]/tool_belt[5])), 5, 12);
    geode_Gen();
}

function main() {
    if ((time % 100 == 0 || time == 10 || scanned == false) &&  game_state == DURING_GAME) {
        map_Render(biome_v, MapX, MapY, 0, 0, size_X, size_Y);
        dig_Render();
    }

    if (scanned == true && game_state == DURING_GAME) {
        geode_Render();
    }

    if (time % 20 == 0 && game_state == DURING_GAME) {
        if (dig_attempt.length >= attempts*2) {
            game_state = SECOND_GAME;
        }
    }

    if ((game_state == SECOND_GAME || game_state == SEQUENCE_RESPONSE || game_state == PROCESS_ITEM_SEQ || game_state == PROCESS_RES_SEQ) && time % 25 == 0 ) {
        if (game_state == SECOND_GAME || game_state == SEQUENCE_RESPONSE) {
            clear();
            CALC_X = range(Math.round(dig_attempt[0]/size_X), size_X, zone[0]/size_X-size_X);
            CALC_Y = range(Math.round(dig_attempt[1]/size_Y), size_Y, zone[1]/size_Y-size_Y);
            map_Render(biome_v, CALC_X+size_X,  CALC_Y+size_Y,  CALC_X-size_X, CALC_Y-size_Y, size_X, size_Y);
            draw(1, true, "hsl(0, 0%, 0%)", "", dig_attempt[0]-size_X, dig_attempt[1]-size_Y, size_X*2, size_Y*2);
        }
        
        if (sequence_len == 0) {
            sequence_len = count;
            SEQUENCE_COMPLETE = false;
        }
        
        if (sequence.length != sequence_len && game_state == SECOND_GAME) {
            let r = Math.random();
            if (r > 0.5) {
                sequence.push("Q");
            } else {
                sequence.push("E");
            }
        }

        if (sequence.length != sequence_len && game_state == PROCESS_ITEM_SEQ) {
            let r = Math.random();
            if (r > 0.66) {
                sequence.push("A");
            } else if (r > 0.33) {
                sequence.push("W");
            } else {
                sequence.push("D");
            }
        }

        if (sequence.length == sequence_len && SEQUENCE_COMPLETE == false) {
            SEQUENCE_COMPLETE = true;
        } else if (SEQUENCE_COMPLETE == true && (game_state != SEQUENCE_RESPONSE && game_state != PROCESS_RES_SEQ)) {
            if (game_state == SECOND_GAME) {
                game_state = SEQUENCE_RESPONSE;
            }
            if (game_state == PROCESS_ITEM_SEQ) {
                game_state = PROCESS_RES_SEQ;
            }
            SEQUENCE_COMPLETE = false;
        }
        
        if ((response_sequence.length == sequence_len && sequence_len != 0) && (game_state == SECOND_GAME || game_state == SEQUENCE_RESPONSE)) {
            let item_quality = 100;
            for (i = 0; i < response_sequence.length; i++) {
                if (sequence[i] != response_sequence[i]) {
                    item_quality = Math.round(item_quality-(50/sequence_len));
                }
            }
            bool = false;
            for (i = 0; i < geode.length/2; i++) {
                if (dig_attempt[0] >= geode[i*2]-size_X && dig_attempt[0] <= geode[i*2]+size_X && dig_attempt[1] >= geode[i*2+1]-size_Y && dig_attempt[1] <= geode[i*2+1]+size_Y) {
                    bool = true;
                }
            }
            if (bool) {
                randomItem(biome_v, item_quality);
            } else {
                randomItem(0, item_quality);
            }
            dig_attempt.shift();
            dig_attempt.shift();
            sequence = [];
            response_sequence = [];
            game_state = SECOND_GAME;
            sequence_len = 0;
            user = false;
            select = 1;
        }

        if (dig_attempt.length == 0 && game_state == SECOND_GAME) {
            game_state = AFTER_TUTORIAL;
            clear();
            let item_quality = 100;
            for (i = 0; i < response_sequence.length; i++) {
                if (sequence[i] != response_sequence[i]) {
                    item_quality = Math.round(item_quality-(50/sequence_len));
                }
            }
        }

        if ((response_sequence.length == sequence_len && sequence_len != 0) && (game_state == PROCESS_ITEM_SEQ || game_state == PROCESS_RES_SEQ)) {
            let item_quality = selected_item.split("Q")[1];
            item_quality = parseInt(item_quality);
            for (i = 0; i < response_sequence.length; i++) {
                if (sequence[i] != response_sequence[i]) {
                    item_quality = Math.round(item_quality-(50/sequence_len));
                }
            }
            museum.push(selected_item.split("(")[0]+" (Q"+item_quality+")");
            sequence = [];
            response_sequence = [];
            game_state = ENTER_MUSEUM;
            sequence_len = 0;
            user = false;
            select = 1;
        }
    }

    if (cooldown > 0) {
        cooldown --;
    }

    if (scanned == true && active > 0) {
        active --;
    } else if (active < 100){
        scanned = false;
        active++;
    }

    if (night == true) {
        time -= 1;
    } else {
        time += 1;
    }

    if (time == 1200) {
        night = true;
    } else if (time == 0) {
        night = false;
    }
}

function geode_Render() {
    for (i = 0; i < geode.length/2; i++) {
        draw(1, true, "hsl(0, 0%, 0%)", "", geode[i*2]-size_X, geode[i*2+1]-size_Y, size_X*2, size_Y*2);
    }
}

function dig_Render() {
    for (i = 0; i < dig_attempt.length/2; i++) {
        draw(1, true, "hsl(0, 0%, 50%)", "", dig_attempt[i*2]-size_X, dig_attempt[i*2+1]-size_Y, size_X*2, size_Y*2);
    }
}

function geode_Gen() {
    if (geode.length < count) {
        for (i = geode.length; i < count; i ++) {
            temp_pos = [range(Math.floor(Math.random()*zone[0]), size_X*2, zone[0]-size_X*2), range(Math.floor(Math.random()*zone[1]), size_Y*2, zone[1]-size_Y*2)];
            geode.push(parseInt(temp_pos[0]));
            geode.push(parseInt(temp_pos[1]));
        }
    }
}

function range(c_val, min_val, max_val) {
    if (c_val < min_val) {
        return min_val;
    } else if (c_val > max_val) {
        return max_val;
    } else {
        return c_val;
    }
}

function map_Render(biome, maxX, maxY, cx, cz, size_x, size_z) {
    temp_x = 0;
    temp_y = 0;
    for (x = cx; x < maxX; x++) {
        for (y = cz; y < maxY; y++) {
            temp_val = map[x][y]-time/100;

            if (biome == "Plains") {
                color = "hsl(112, 71%, "+temp_val+"%)";
            } else if (biome == "Desert") {
                color = "hsl(59, 81%, "+temp_val+"%)";
            } else if (biome == "Forest") {
                color = "hsl(115, 64%, "+temp_val+"%)";
            } else if (biome == "Swamp") {
                color = "hsl(115, 64%, "+temp_val+"%)";
            } else if (biome == "Mountain") {
                color = "hsl(115, 0%, "+temp_val+"%)";
            } else if (biome == "Tiaga") {
                color = "hsl(143, 62%, "+temp_val+"%)";
            } else if (biome == "Jungle") {
                color = "hsl(95, 75%, "+temp_val+"%)";
            } else if (biome == "Red Desert") {
                color = "hsl(43, 84%, "+temp_val+"%)";
            } else if (biome == "Savannah") {
                color = "hsl(74, 49%, "+temp_val+"%)";
            } else if (biome == "Marsh" && temp_val > 32) {
                color = "hsl(112, 39%, "+temp_val+"%)";
            } else if (biome == "Marsh") {
                color = "hsl(220, 39%, "+temp_val+"%)";
            } else if (biome == "Sky" && temp_val > 65) {
                color = "hsl(180, 100%, 90%)";
            } else if (biome == "Sky" && temp_val > 50 && temp_val < 65) {
                color = "hsl(180, 100%, 100%)";
            } else if (biome == "Galaxy" && temp_val > 10) {
                color = "hsl(100, 100%, "+100-temp_val+"%)";
            } else if (biome == "Galaxy") {
                color = "hsl(0, 0%, "+temp_val+"%)";
            } 

            draw(1, true, color, "", x*size_x, y*size_z, size_x, size_z);
            temp_y += 1;
        }
        temp_x += 1;
    }
}

function map_Gen(gradient, MaxV, MinV, MaxX, MaxY) {
    var gen = [];
    var temp_gen = [];

    // Initializer
    for (x = 0; x < MaxX; x++) {
        for (y = 0; y < MaxY; y++) {
            temp_gen.push(MinV);
        }
        gen.push(temp_gen);
        temp_gen = [];
    }

    for (x = 0; x < MaxX; x++) {
            for (y = 0; y < MaxY; y++) {
            r = Math.random()*4;
            diff = 0;
            if (Math.round(r) == 0) {
                diff = gradient * -1;
            }
            if (Math.round(r) == 1) {
                diff = 0;
            }
            if (Math.round(r) == 2) {
                diff = gradient;
            }
            
            if (gen[x][y]+diff < MaxV && gen[x][y]+diff > MinV) {
                gen[x][y] += diff;
            }

            for (time = 0; time < 4; time ++) {
                if (x-1 > 0 && x+1 < MaxX) {
                    if (time == 0 && gen[x-1][y]+diff < MaxV && gen[x-1][y]+diff > MinV) {
                        gen[x-1][y] = Math.round((gen[x][y]+gen[x-1][y])/2);
                        gen[x-1][y] +=diff;
                    }
                    if (time == 1 && gen[x+1][y]+diff < MaxV && gen[x+1][y]+diff > MinV) {
                        gen[x+1][y] = Math.round((gen[x][y]+gen[x+1][y])/2);
                        gen[x+1][y] += diff;
                    }
                }

                if (y-1 > 0 && y+1  < MaxY) {
                    if (time == 2 && gen[x][y-1]+diff < MaxV && gen[x][y-1]+diff > MinV) {
                        gen[x][y-1] = Math.round((gen[x][y]+gen[x][y-1])/2);
                        gen[x][y-1] += diff;
                    }
                    if (time == 3 && gen[x][y+1]+diff < MaxV && gen[x][y+1]+diff > MinV) {
                        gen[x][y+1] = Math.round((gen[x][y]+gen[x][y+1])/2);
                        gen[x][y+1] += diff;
                    }
                }
            }
        }
    }
    return gen;
}

function keyDown() {
    var keyCode = event.keyCode;

    if (game_state >= AFTER_TUTORIAL) {
        if (keyCode == 87 && select > 1 ) {
            select -= 1;
        } else if (keyCode == 83 && (select < OUTPUT_ITEMS[item_select].length || select <= inventory.length/2)) {
            select += 1;
        } else if ((keyCode == 13 || keyCode == 32) && game_state >= AFTER_TUTORIAL) {
            user = true;
        }
    }

    if ((keyCode == 8 || keyCode == 27) && (game_state == START_GAME || game_state == ENTER_MUSEUM || game_state == INVENTORY || game_state == UPGRADES)) {
        game_state = AFTER_TUTORIAL;
    }

    if ((keyCode == 8 || keyCode == 27) && (game_state == ITEM_SELECTED)) {
        game_state = VIEW_INVENTORY;
    }
    if ((keyCode == 8 || keyCode == 27) && (game_state == VIEW_INVENTORY || game_state == VIEW_MUSEUM)) {
        game_state = ENTER_MUSEUM;
    }

    if (response_sequence.length < sequence_len && game_state == SEQUENCE_RESPONSE) {
        if (keyCode == 81) {
            response_sequence.push("Q");
        }
        if (keyCode == 69) {
            response_sequence.push("E");
        }
    }

    if (response_sequence.length < sequence_len && game_state == PROCESS_RES_SEQ) {
        if (keyCode == 87) {
            response_sequence.push("W");
        }
        if (keyCode == 65) {
            response_sequence.push("A");
        }
        if (keyCode == 68) {
            response_sequence.push("D");
        }
    }
}

function keyPress() {
    var keyCode = event.keyCode;

    if (game_state == INVENTORY) {
        user = true;
    }

    if (keyCode == 32 && game_state >= START_GAME && game_state <= DURING_GAME) {
        if (scanned == false && active > 0 && cooldown == 0) {
            cooldown = 100;
            scanned = true;
            geode_Render();
        } else {
            scanned = false;
        }
    }
}

function getMousePos(e, canvas) {
    var rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    zone = [Math.round(rect.width * scaleX), Math.round(rect.height * scaleY)];

    mouse_x = Math.round(range((e.clientX - rect.left) * scaleX, 0, rect.width * scaleX));
    mouse_y = Math.round(range((e.clientY - rect.top) * scaleY, 0, rect.height * scaleY));
}

function addItem(item, quantity, quality) {
    if (inventory.includes(item)) {
        for (i = 0; i < inventory.length/2; i++) {
            if (inventory[i*2] == String(item+" (Q"+quality+")") && quality != 0) {
                inventory[i*2+1] += 1;
            } else if (inventory[i*2] == item) {
                inventory[i*2+1] += 1;
            }
        }
    } else if (quality > 0){
        inventory.push(item+" (Q"+quality+")");
        inventory.push(quantity);
    } else {
        inventory.push(item);
        inventory.push(quantity);
    }
}

function removeItem(item, quantity) {
    if (inventory.includes(item)) {
        for (i = 0; i < inventory.length/2; i++) {
            if (inventory[i*2] == item && inventory[i*2+1] > quantity) {
                inventory[i*2+1] = inventory[i*2+1]-quantity;
                return true;
            } else if (inventory[i*2] == item && inventory[i*2+1] == quantity) {
                inventory.splice(i*2, 2);
                return true;
            }
        }
    }
    return false;
}

function randomItem(itemC, quality) {
    // 0 - Fall catagory, the bad rewards
    if (itemC == 0) {
        r = Math.random();
        if (r > 0.5) {
            addItem("Dirt", 1, 0);
        } else if (r > 0.4) {
            addItem("Copper ore", 1, 0);
        } else if (r > 0.2) {
            addItem("Stone", 1, 0);
        } else if (r > 0.1) {
            addItem("Sand", 1, 0);
        } else if (r > 0.8) {
            addItem("Iron ore", 1, 0);
        } else if (r > 0.7) {
            addItem("Gold ore", 1, 0);
        }
    }
    if (itemC == "Plains") {
        r = Math.random();
        if (r > 0.5) {
            addItem("Geode", 1, quality);
        } else if (r > 0.4) {
            addItem("Copper ore", 1, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        }else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }
    }
    if (itemC == "Desert") {
        r = Math.random();
        if (r > 0.5) {
            addItem("Fossil", 1, quality);
        } else if (r > 0.4) {
            addItem("Copper ore", 1, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        }else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }
    }
    if (itemC == "Forest") {
        r = Math.random();
        if (r > 0.6) {
            addItem("Ruby", 1, quality);
        } else if (r > 0.5) {
            addItem("Lapis Lazuli", 1, 0);
        } else if (r > 0.4) {
            addItem("Copper ore", 1, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        }else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }
    }
    if (itemC == "Swamp") {
        r = Math.random();
        if (r > 0.6) {
            addItem("Amber", 1, quality);
        } else if (r > 0.5) {
            addItem("Lapis Lazuli", 2, 0);
        } else if (r > 0.4) {
            addItem("Copper ore", 2, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        } else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }  else if (r > 0.03) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.0) {
            addItem("Gold ore", 2, 0);
        }
    }
    if (itemC == "Mountain") {
        r = Math.random();
        if (r > 0.6) {
            addItem("Emerald", 1, quality);
        } else if (r > 0.5) {
            addItem("Sapphire", 2, 0);
        } else if (r > 0.4) {
            addItem("Geode", 2, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        } else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }  else if (r > 0.05) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.0) {
            addItem("Gold ore", 2, 0);
        }
    }
    if (itemC == "Taiga") {
        r = Math.random();
        if (r > 0.6) {
            addItem("Emerald", 1, quality);
        } else if (r > 0.5) {
            addItem("Sapphire", 2, 0);
        } else if (r > 0.4) {
            addItem("Copper ore", 2, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 1, 0);
        } else if (r > 0.1) {
            addItem("Gold ore", 1, 0);
        }  else if (r > 0.05) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.0) {
            addItem("Gold ore", 2, 0);
        }
    }
    if (itemC == "Jungle") {
        r = Math.random();
        if (r > 0.7) {
            addItem("Geode", 1, quality);
        } else if (r > 0.6) {
            addItem("Sapphire", 1, 0);
        } else if (r > 0.5) {
            addItem("Emerald", 1, 0);
        } else if (r > 0.4) {
            addItem("Ruby", 1, 0);
        } else if (r > 0.3) {
            addItem("Iron ore", 1, 0);
        }  else if (r > 0.25) {
            addItem("Gold ore", 2, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.19) {
            addItem("Iron ore", 3, 0);
        } else if (r > 0.185) {
            addItem("Gold ore", 3, 0);
        } else if (r > 0.15) {
            addItem("Fossil", 2, 0);
        } else if (r > 0.2) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.04) {
            addItem("Amber", 2, 0);
        } else if (r > 0.0) {
            addItem("Diamond", 2, 0);
        }
    }
    if (itemC == "Red Desert" || itemC == "Savannah" || itemC == "Marsh") {
        r = Math.random();
        if (r > 0.6) {
            addItem("Geode", 2, quality);
        } else if (r > 0.1) {
            addItem("Fossil", 2, 0);
        } else if (r > 0.08) {
            addItem("Iron ore", 2, 0);
        } else if (r > 0.06) {
            addItem("Gold ore", 2, 0);
        } else if (r > 0.04) {
            addItem("Diamond", 2, 0);
        }  else if (r > 0.02) {
            addItem("Emerald", 2, 0);
        } else if (r > 0.0) {
            addItem("Topaz", 2, 0);
        }
    }
}

function displayInv(array) {
    text = "";
    for (i = 0; i < array.length/2; i ++) {
        if (array[i*2+1] == 1) {
            text = String(text+" "+array[i*2]);
        } else {
            text = String(text+" "+array[i*2+1]+" "+array[i*2]);
        }
        if (array.length-1 != i*2+1) {
            text = text+",";
        }
    }
    return text;
}

function castMuseum(array) {
    text = [];
    for (i = 0; i < array.length/2; i ++) {
        if (LOW_ITEMS.includes(array[i*2]) == false) {
            text.push(array[i*2]);
        }
    }
    return text;
}

function Click() {

    if (game_state < AFTER_TUTORIAL || game_state == INVENTORY) {
        user = true;
    }

    if (game_state >= DURING_GAME && game_state < SECOND_GAME && dig_attempt.length < attempts*2) {
        if (dig_attempt.length > 2) {
            diggable = true;
            for (i = 0; i < dig_attempt.length; i++) {
                if (mouse_x >= dig_attempt[i*2]-size_X*2 && mouse_x <= dig_attempt[i*2]+size_X*2 && mouse_y >= dig_attempt[i*2+1]-size_Y*2 && mouse_y <= dig_attempt[i*2+1]+size_Y*2) {
                    diggable = false;
                }
            }
        } else if (dig_attempt.length == 2) {
            if (mouse_x >= dig_attempt[0]-size_X*2 && mouse_x <= dig_attempt[0]+size_X*2 && mouse_y >= dig_attempt[1]-size_Y*2 && mouse_y <= dig_attempt[1]+size_Y*2) {
                diggable = false;
            } else {
                diggable = true;
            }
        } else {
            diggable = true;
        }

        if (diggable) {
            dig_attempt.push(mouse_x);
            dig_attempt.push(mouse_y);
        }
    }
}
function draw(type, fill, color, s_color, x, y, size_x, size_y) {
    ctx.beginPath();

    if (type == 1 && fill == false) {
        ctx.rect(x, y, size_x, size_y);
    }

    if (color != "") {
        if (type == 1 && fill == true) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, size_x, size_y);
        }
    }


    if (fill == true && color == "") {
        ctx.fill();
    }

    ctx.stroke();
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}