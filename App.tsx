import { StyleSheet, Button, Image, TextInput, View, Linking, Platform } from "react-native";
import { InferenceSession, Tensor } from "onnxruntime-react-native";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
// import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-react-native";

import { Moondream } from "moondream-rn";

import { useEffect, useState } from "react";

const downloadModel = async () => {
    const outDir = FileSystem.documentDirectory + "models/";

    const files = [
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/config.json?download=true", name: "config.json" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/coord_decoder.onnx?download=true", name: "coord_decoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/coord_encoder.onnx?download=true", name: "coord_encoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/initial_kv_cache.json?download=true", name: "initial_kv_cache.json" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/size_decoder.onnx?download=true", name: "size_decoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/size_encoder.onnx?download=true", name: "size_encoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/text_decoder.onnx?download=true", name: "text_decoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/text_encoder.onnx?download=true", name: "text_encoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/tokenizer.json?download=true", name: "tokenizer.json" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/vision_encoder.onnx?download=true", name: "vision_encoder.onnx" },
        { url: "https://huggingface.co/whistleroosh/moondream-rn/resolve/main/vision_projection.onnx?download=true", name: "vision_projection.onnx" }
    ];

    console.log("Downloading model files...");

    await FileSystem.makeDirectoryAsync(outDir, { intermediates: true });

    for (const file of files) {
        const fileOutputUri = outDir + file.name;
        const fileExists = await FileSystem.getInfoAsync(fileOutputUri);
        if (fileExists.exists) {
            console.log(`File ${file.name} already exists, skipping download.`);
            continue;
        }

        const result = await FileSystem.downloadAsync(file.url, fileOutputUri);

        if (result.status !== 200) {
            throw new Error(`Failed to download ${file.name}`);
        }

        console.log(`Downloaded and saved ${file.name} to ${fileOutputUri}`);
    }
}

export default function ModelScreen() {
    const [moondream, setMoondream] = useState<Moondream | null>(null);
    const [imageURI, setImageURI] = useState<string | null>(null);

    useEffect(() => {
        async function loadModel() {
            try {
                await downloadModel();
                const moondream: Moondream = await Moondream.load(FileSystem.documentDirectory + "models/");
                setMoondream(moondream);
                console.log("Model loaded successfully");
            } catch (error) {
                console.error("Error: ", error);
            }
        }
        loadModel();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images", "videos"],
            // allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageURI(result.assets[0].uri);
        }
    };

    // console.log(tf.tensor1d([1, 2, 3]).toString());

    const execute = async () => {
        // const tensorA = new Tensor('float32', Float32Array.from([parseFloat(xValue)]), [1]);
        // const tensorB = new Tensor('float32', Float32Array.from([parseFloat(yValue)]), [1]);

        const input_embeds = new Tensor('float32', Float32Array.from(Array(5*1024).fill(0.5)), [1, 5, 1024]);
        console.log("Created input_embeds tensor");
        const kv_cache =  new Tensor('float32', Float32Array.from(Array(24* 2* 1* 16* 5* 64).fill(0.5)), [24, 2, 1, 16, 5, 64]);
        console.log("Created kv_cache tensor");
        
        console.log(input_embeds.type, kv_cache.type);
        const feed = {
            input_embeds: input_embeds,
            kv_cache: kv_cache,
        };

        console.log("After creating tensors");

        if (!moondream) {
            console.error("Session is not initialized");
            return;
        }

        try {
            console.log("Running model");
            // const output = await session!.run(feed);
            // console.log("Output", output["new_kv_cache"].dims);
        } catch (error) {
            console.error("Error running model", error);
        }
    };

    return (
        <View>
            <View style={styles.inputContainer}>
                <Button title="Pick an image from camera roll" onPress={pickImage} />
            </View>
            {imageURI && <Image source={{ uri: imageURI }} style={styles.image}/>}
            <Button title="Run Model" onPress={execute} />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginTop: 50, // Top margin for the input fields
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
        borderRadius: 5,
    },
    image: {
        width: 400,
        height: 400,
    },
});
