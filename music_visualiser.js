let spheres = []; // An empty array to hold Sphere objects.
let spheres2 = []; // An empty array to hold Sphere objects.
let gridWidth = 31; // Initial grid width (number of columns).
let gridHeight = 31; // Initial grid height (number of rows).
let gridW2 = 16; // Initial grid width (number of columns).
let gridH2 = 16; // Initial grid height (number of rows).
let noiseOffsetX = 0; // Initial noise offset for X direction.
let noiseOffsetY = 0; // Initial noise offset for Y direction.
let amplitudeSlider; // A variable that appears to be declared but not used.
let fft; // A variable to store a p5.FFT (Fast Fourier Transform) object.
let backgroundColor;
let startTime;
let fadeEffect = false; // Flag to control the fade effect
fft = new p5.FFT(); // new fft for analysis
let transitionIntensity = 1; // Adjust this value to control the intensity of the transition.
let fadeStartTime;
let fadeDuration = 5; // 5 seconds for the fade effect
let sysadmin;//weird name but its basically for the counter
let drumHistory = []; // An array to store the history of the drum variable.
let maxHistoryLength = 50; // Maximum number of historical data points to display.
let otherHistory = []; // An array to store the history of the drum variable.
let othermaxHistoryLength = 50; // Maximum number of historical data points to display.
let bassHistory = []; // An array to store the history of the drum variable.
let bassmaxHistoryLength = 50; // Maximum number of historical data points to display.
let gridMappr;//var for the grid to change to ba$$

// Function to create Sphere objects in a grid layout.
//the second grid looks janky, but that was for sysresources sake
function createSpheres(width, height, yoffset, width2, height2) {
    spheres = []; // Clear the existing array of spheres.
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            spheres.push(new Sphere(i * 80 - 160, j * 80 - 160 - yoffset));
            //spheres2.push(new Sphere(i * 80 - 160, j * 80 - 160 - 2400));
        }
    }
    for (let i = 0; i < width2; i++) {
        for (let j = 0; j < height2; j++) {
            //spheres.push(new Sphere(i * 80 - 160, j * 80 - 160 - yoffset));
            spheres2.push(new Sphere(i * 80 - 160, j * 80 - 160 - 2400));
        }
    }
}

// add an new data point and shift if over
function addToDrumHistory(value) {
    drumHistory.unshift(value); // //ins new val
    if (drumHistory.length > maxHistoryLength) {
        drumHistory.pop(); // del oldest point
    }
}

// add an new data point and shift if over
function addToOtherHistory(value) {
    otherHistory.unshift(value); // //ins new val
    if (otherHistory.length > othermaxHistoryLength) {
        otherHistory.pop(); // del oldest point
    }
}

// add an new data point and shift if over
function addToBassHistory(value) {
    bassHistory.unshift(value); // //ins new val
    if (bassHistory.length > bassmaxHistoryLength) {
        bassHistory.pop(); // del oldest point
    }
}

//not really visible, but it was visible, and it is for a second, but idk i think ill keep it
function drawBassHistory() {
    let intensityFactor = 5;
    push();
    stroke(255, 0, 0); // Set the stroke color to red
    rotateX(-3);
    translate(200, -2300, 250); // Position to the right of the drum history
    beginShape();
    for (let i = 0; i < bassHistory.length; i++) {
        let bassValue = bassHistory[i];
        let z = map(bassValue, 0, 100, 0, 100) * intensityFactor;
        vertex(0, 0, -z);
        translate(0, 60, z);
    }
    endShape();
    pop();
}

function draw_one_frame(words, vocal, drum, bass, other, counter) {
    //put the bass history first to make it drive the other stuff
    addToBassHistory(map(bass, 0, 100, 0, 100));
    let intensityFactor = 3;
    let bassH = bassHistory.length;
    //setup intsfct

    //setup the camera, and call orbitctrl after, so that you can move hte screen round
    camSetup();
    orbitControl(1.1);
    //change the p5.lightfalloff, docukemta
    lightFalloff(0, 0, 0);

    //set def colours for ligths and grid
    //lights kind of drive the colour for the rest of the 3d elements so 
    let plCol = color('#0dc7ffff');
    let GRIDCOL = color(47, 140, 163);
    //weird var name, again, but it worked so eh
    sysadmin = counter;
    if (sysadmin >= 2850) {
        if (!fadeEffect) {
            fadeEffect = true;
            fadeStartTime = millis();
        }//init the start time
        let elapsedMillis = millis() - fadeStartTime;
        let fadeAmount = map(elapsedMillis, 0, fadeDuration * 1000, 0, 1);
        transitionIntensity = lerp(transitionIntensity, 0.4, fadeAmount);
        backgroundColor = lerpColor(color('#021318'), color('#e2e2bb'), fadeAmount);
        gridMappr = bass;//basically just fade thru all the stuff
        plCol = lerpColor(color('#0dc7ffff'), color('#e2e2bb'), fadeAmount);
        GRIDCOL = lerpColor(color(47, 140, 163), color('#031120'), fadeAmount);
    } else {
        //def mode, in the first half
        fadeEffect = false;
        backgroundColor = color('#021318');
        transitionIntensity = 0.8;
        gridMappr = vocal;
        plCol = color('#0dc7ffff');
        GRIDCOL = color(47, 140, 163);
    }

    //setup the lights after
    pointLight(plCol, 0, -300, -920000);
    pointLight(plCol, 0, -600, -103000);
    //setup bg col
    background(backgroundColor);

    //start of the grid drawing, split into 2
    push();
    rotateX(87);
    translate(-1050, 0, 0);
    scale(1, 1.5);
    noiseOffsetX += 0.02;
    noiseOffsetY += 0.02;
    //didnt use but autofill so eh
    let spectrum = fft.analyze();
    let energy = fft.getEnergy("bass");
    //used an fft just to amplify the effect a bit, but it sill is mainly the provided vars that are used
    let vocalAmplitude = map(other, 0, 100, 0, 100);
    //here and elsewhere, i just used a map in case i wanted to truncate
    let amplitude = (vocalAmplitude + energy) / 2;
    //obvi set strk
    stroke(GRIDCOL);
    strokeWeight(4);
    //basically adjust the z height of the spheres so that it looks like the grid is reacting
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            let index = i + j * gridWidth;
            let vocalHeight = map(gridMappr, 0, 100, -amplitude, amplitude);
            vocalHeight *= transitionIntensity;
            spheres[index].updateHeight(vocalHeight);
            spheres[index].show();
        }
    }
    //draw the lines between the spheres, i tried to use drawstrip but it was too intensive
    //plus this just looks better because it has points instead of flat tops imo
    for (let i = 0; i < gridWidth; i++) {
        for (let j = 0; j < gridHeight; j++) {
            let index = i + j * gridWidth;
            if (i < gridWidth - 1) {
                line(spheres[index].x, spheres[index].y, spheres[index].z, spheres[index + 1].x, spheres[index + 1].y, spheres[index + 1].z);
            }//kind of convoluted way to do it but it works so why not
            if (j < gridHeight - 1) {
                line(spheres[index].x, spheres[index].y, spheres[index].z, spheres[index + gridWidth].x, spheres[index + gridWidth].y, spheres[index + gridWidth].z);
            }
        }
    }
    pop();

    // Call the function again for the second array (spheres2)
    drawSpheres(spheres2, vocal, other, GRIDCOL);//basiclly the same thing
    //it didnt work when doubling it in here
    //plus i dont think we get marks for code waulity so enjoy the spaghetti

    push();
    translate(-1350, -1000, -5000); // Move the origin to a specific position
    rotateX(-90); // Rotate the scene around the X-axis to look from above
    // Rotate the scene based on a cosine function
    scale(3);//a lot of these comments were just copilot so theyre suyper formal
    // Draw drum history
    addToOtherHistory(map(other, 0, 80, 0, 100)); //truncated, it didnt help much but oh well
    push();
    noStroke();
    //strokeWeight(4);
    //stroke(47, 140, 163);
    rotateX(-3);
    translate(900, -2300, 250);
    ///basically just draw a histogram, the data was kinda fudgy but meh
    for (let i = 0; i < drumHistory.length; i++) {
        let drumValue = drumHistory[i];
        let fillcol = bassHistory[i]; // Define color 'c'
        let z = map(drumValue, 0, 100, 0, 100) * intensityFactor; // Increase intensity
        // Translate half of the box's height before drawing
        translate(0, 0, -z / 2);
        let gradientColor = lerpColor(color(255, 255, 255, 100), color(fillcol), bassH / 100);
        specularMaterial(gradientColor);
        //spec mat first scene
        box(50, 50, z);
        // Translate back by half of the box's height and move to the next position
        translate(0, 60, z / 2);
    }
    pop();
    //coulve made this a method, but again, time/benefit
    // Draw drum history
    addToDrumHistory(map(drum, 0, 80, 0, 100));
    push();
    noStroke();
    rotateX(-3);
    translate(0, -2300, 250);
    for (let i = 0; i < otherHistory.length; i++) {
        let otherValue = otherHistory[i];
        let fillcol = bassHistory[i]; // Define color 'c'
        let z = map(otherValue, 0, 100, 0, 100) * intensityFactor; // Increase intensity
        // Translate half of the box's height before drawing
        translate(0, 0, -z / 2);
        // Create a gradient color, this is more apparent with different lighting
        let gradientColor = lerpColor(color(255, 255, 255, 100), color(fillcol), bassH / 100);
        specularMaterial(gradientColor);
        box(50, 50, z);
        // Translate back by half of the box's height and move to the next position
        translate(0, 60, z / 2);
    }
    pop();
    drawBassHistory();
    pop();
    //once again weird naming
    nouvelle(words, vocal, drum, bass, other, counter);
}

//the second drawspheres, just bc 'twas too long
// Function to draw spheres in an array
function drawSpheres(sphereArray, vocal, other, GRIDCOL) {
    push();
    rotateX(87);
    translate(-890, 5200, 0);
    //longer to make the compute count
    scale(2, 4);
    noiseOffsetX += 0.02;
    noiseOffsetY += 0.02;
    let spectrum = fft.analyze();
    let energy = fft.getEnergy("bass");
    let vocalAmplitude = map(other, 0, 100, 0, 100);
    let amplitude = (vocalAmplitude + energy) / 2;
    stroke(GRIDCOL);
    strokeWeight(6); //
    for (let i = 0; i < gridW2; i++) {
        for (let j = 0; j < gridH2; j++) {
            let index = i + j * gridW2;
            let vocalHeight = map(vocal, 0, 100, -amplitude, amplitude);
            vocalHeight *= transitionIntensity;
            sphereArray[index].updateHeight(vocalHeight);
            sphereArray[index].show();
        }
    }
    for (let i = 0; i < gridW2; i++) {
        for (let j = 0; j < gridH2; j++) {
            let index = i + j * gridW2;
            if (i < gridW2 - 1) {
                line(sphereArray[index].x, sphereArray[index].y, sphereArray[index].z, sphereArray[index + 1].x, sphereArray[index + 1].y, sphereArray[index + 1].z);
            }
            if (j < gridH2 - 1) {
                line(sphereArray[index].x, sphereArray[index].y, sphereArray[index].z, sphereArray[index + gridW2].x, sphereArray[index + gridW2].y, sphereArray[index + gridW2].z);
            }
        }
    }
    pop();
}
// Define a class for Sphere objects.
class Sphere {
    constructor(x, y) {
        this.x = x;
        //j a cnstrct for the spheres
        this.y = y;
        this.z = 0;
    }
    // Update the height of the sphere based on amplitude.
    updateHeight(amplitude) {
        //this is where the magic happens, the nosie fits quite well in this config
        let noiseValue = noise(this.x * 0.01 + noiseOffsetX, this.y * 0.01 + noiseOffsetY);
        this.z = map(noiseValue, 0, 1, -amplitude, amplitude);
    }

    // Display the sphere.
    //this was just for debug obvi
    show() {
        fill(255); // Set the fill color to white.
        push(); // Save the current transformation matrix.
        translate(this.x, this.y, this.z); // Translate to the sphere's position.
        //sphere(10); // Display a sphere (0 is not a valid size, this should be a non-zero value).
        pop(); // Restore the previous transformation matrix.
    }
}

// Function to change the grid size (number of columns and rows).
//kidn of redundant but still ig
function changeGridSize(newWidth, newHeight) {
    gridWidth = newWidth; // Update the grid width.
    gridHeight = newHeight; // Update the grid height.
    createSpheres(gridWidth, gridHeight); // Recreate the spheres based on the new grid size.
}

//just cam stuff
function camSetup() {
    // Set up the camera to look at the grid.
    let camX = 0; // Camera X position
    let camY = 0; // Camera Y position
    let camZ = 3500; // Camera Z position (distance from the grid)
    let targetX = 0; // Target X position (center of the grid)
    let targetY = 0; // Target Y position (center of the grid)
    let targetZ = 0; // Target Z position (height of the grid)
    // Set the camera position and target point.
    camera(camX, camY, camZ, targetX, targetY, targetZ, 0, 1, 0);
}

let sysdef;//couldve called inside byut oh well
function nouvelle(words, vocal, drum, bass, other, counter) {
    let nvCol = color('#09c7ae34');
    let nvColLerp = color('#f8f8f8a9');
    push();
    sysdef = counter;
    if (sysdef < 2850) { //shd be 2850
        // Translate and rotate the 3D scene
        //xzy
        translate(-1350, -1000, -5000); // Move the origin to a specific position
        rotateX(-90); // Rotate the scene around the X-axis to look from above
        // Rotate the scene based on a cosine function
        scale(3);
        // rotateY(map(sin(counter / 4), -1, 1, -30, 30));  // Optionally rotate around the Y-axis
        // Use FFT to get frequency data
        //this part is kind of messed up bc i copy pasted a lot of stuff and commented it out so
        nvCol = nvCol;
    } else {
        // translate(-1350, -2200, 2000);
        //translate(-1350, -1250, 2500);
        let rotdun = false;
        if (rotdun = false) {
            let timeMap = map(sysdef, 2850, 3000, 0, 1);
            let YLerp = lerp(-1000, -2500, timeMap);
            translate(-1350, YLerp, -5000);
            let rotX = 0;
            let ecn = lerp(-90, 0, timeMap);
            rotateX(ecn);
            scale(3);
            nvCol = lerpColor(nvCol, nvColLerp, timeMap);
            if (timeMap == 0) {
                rotdun = true;
            }
        } else {
            let timeMap = map(sysdef, 2850, 5100, 0, 1);
            let XLerp = lerp(-5000, -0, timeMap);
            translate(-1350, -2500, XLerp);
            rotateX(0);
            scale(3);
            nvCol = nvColLerp;
            //i liked this look bette so i keopt it
        }
    }

    //the actual big circle thing
    let spectrum = fft.analyze();
    let energy = fft.getEnergy("bass");
    // Set the canvas size and grid parameters
    let cirSize = 900;
    let gridSize = 20;
    let numCols = cirSize / gridSize;
    let numRows = cirSize / gridSize;
    // Adjust the center point based on audio values
    let centerAmplitude = map(drum, 0, 100, 0, cirSize / 2);
    //wanted to do this but it looked better when i didnt
    let centerX = cirSize / 2;
    let centerY = cirSize / 2;
    // Loop through the grid

    //comments were autogen for this part, but it was basically just a grid, with a dist applied
    //bigger histogram, the whole program relies on that basically
    for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numRows; j++) {
            let x = i * gridSize;
            let y = j * gridSize;
            // Calculate the distance from the center
            let distance = dist(x, y, centerX, centerY);
            // Use FFT data to adjust grid element height
            let index = Math.floor(map(distance, 0, cirSize / 2, 0, spectrum.length - 1));
            let amplitude = spectrum[index];
            // Constrain the height based on the counter value
            let maxAllowedHeight = 50; // Change this value to your desired maximum height
            if (sysdef < 120) {
                height = map(amplitude, 0, 255, 10, maxAllowedHeight);
            } else {
                height = map(amplitude, 0, 255, 10, 500); // Default height calculation
            }
            // Draw a rectangle at the grid position with dynamic height
            push();
            translate(x, y, 0);
            let bouncecol = color('#1eff0000'); // Define color 'c'
            fill(bouncecol); // Use color variable 'c' as fill color
            specularMaterial(nvCol);
            // Check if the height is greater than a threshold and add stroke
            if (height > 10) {
                //stroke(47, 140, 163);
                noStroke();
                strokeWeight(4);
            } else {
                noStroke(); // No stroke for elements with height less than 10
                fill(bouncecol);
            }
            box(gridSize, gridSize, height);
            pop();
        }
    }
    pop();
}
