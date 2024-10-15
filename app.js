import { FilesetResolver, ImageClassifier } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/vision_bundle.js";

let imageClassifier;

async function createImageClassifier() {
    console.log("Creating image classifier...");
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    imageClassifier = await ImageClassifier.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite"
        },
        maxResults: 1  // Changed to 1 to get only the top result
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
        resultDiv.innerHTML += `<p><strong>Top Detection:</strong> ${topCategory.categoryName || topCategory.displayName} (${percentage}%)</p>`;
    } else {
        resultDiv.innerHTML += '<p>No results found or unexpected result format.</p>';
    }
    
    // Log the full results to the console
    console.log("Full classification results:", results);
}

init();