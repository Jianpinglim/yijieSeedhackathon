import { FilesetResolver, ImageClassifier } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

let imageClassifier;

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
    "bottle caps": true
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

async function init() {
    try {
        await createImageClassifier();
        document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    } catch (error) {
        console.error("Error initializing classifier:", error);
    }
}

async function handleImageUpload(e) {
    console.log("Image uploaded, processing...");
    const file = e.target.files[0];
    const img = document.getElementById('imagePreview');
    img.src = URL.createObjectURL(file);
    img.style.display = 'block';

    img.onload = async () => {
        console.log("Image loaded, running classification...");
        if (!imageClassifier) {
            console.error("Image classifier not initialized");
            return;
        }
        try {
            const results = await imageClassifier.classify(img);
            console.log("Classification results:", results);
            displayResults(results);
        } catch (error) {
            console.error("Error during classification:", error);
        }
    };
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
    
    console.log("Full classification results:", results);
}

init();
