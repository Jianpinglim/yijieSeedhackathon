import { FilesetResolver, ImageClassifier } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

let imageClassifier;
let videoElement = document.getElementById('video');

const recyclableItems = {
    "plastic bottle": true,
    "water bottle": true,
    "glass bottle": true,
    "aluminum can": true,
    "cardboard": true,
    "paper": true,
    "food waste": false,
    "plastic bag": false,
    "styrofoam": false,
    "metal can": true,
    "tin can": true,
    "milk carton": true,
    "juice box": true,
    "plastic container": true,
    "plastic milk jug": true,
    "plastic food container": true,
    "glass jar": true,
    "aluminum foil": true,
    "newspaper": true,
    "magazines": true,
    "office paper": true,
    "brochures": true,
    "cardboard boxes": true,
    "glass food container": true,
    "steel can": true,
    "empty aerosol can": true,
    "plastic yogurt container": true,
    "plastic wrap": false,
    "plastic straws": false,
    "egg cartons": true,
    "toilet paper rolls": true,
    "aluminum beverage can": true,
    "paper towel rolls": true,
    "cans": true,
    "bottle caps": true,
    "wine bottle": true
};

async function createImageClassifier() {
    console.log("Creating image classifier...");
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    imageClassifier = await ImageClassifier.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite"
        },
        maxResults: 1
    });
    console.log("Image classifier created successfully");
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

// Capture a frame from the video and classify it
async function detectFromVideoFrame() {
    if (!imageClassifier) {
        console.error("Image classifier not initialized");
        return;
    }

    try {
        const results = await imageClassifier.classify(videoElement);
        displayResults(results);
    } catch (error) {
        console.error("Error during classification:", error);
    }
}


function displayResults(results) {
    console.log("Displaying results...");
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<h2>Detection Result:</h2>';

    if (results && results.classifications && results.classifications[0].categories && results.classifications[0].categories.length > 0) {
        const topCategory = results.classifications[0].categories[0];
        const percentage = (topCategory.score * 100).toFixed(2);
        const itemName = topCategory.categoryName || topCategory.displayName;

        // Check if the item is recyclable
        const isRecyclable = recyclableItems[itemName.toLowerCase()] || false; //Default to False if not in the list
        const recyclableMessage = isRecyclable ? "This item is recyclable :)" : "This item is not recyclable :(";
        const recyclableClass = isRecyclable ? "recyclable" : "not-recyclable";

        resultDiv.innerHTML += `<p><strong>Top Detection:</strong> ${itemName} (${percentage}%)</p>`;
        resultDiv.innerHTML += `<p class="${recyclableClass}">${recyclableMessage}</p>`;
    } else {
        resultDiv.innerHTML += '<p>No results found or unexpected result format.</p>';
    }
}

// Continuously run the object detection
async function startDetection() {
    await createImageClassifier();
    await startCamera();

    videoElement.addEventListener('loadeddata', () => {
        setInterval(detectFromVideoFrame, 1000);  // Run detection every 1 second
    });
}

startDetection();