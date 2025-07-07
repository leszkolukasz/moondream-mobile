import { StyleSheet, Button, TextInput, View } from 'react-native';
import { InferenceSession, Tensor } from "onnxruntime-react-native";

import { getSession } from "moondream-rn";


import { useEffect, useState } from 'react';
import { useAssets } from 'expo-asset';

export default function ModelScreen() {
    const [assets, _] = useAssets([
        require('@/assets/models/text_decoder_float.onnx'),
    ]);

    const [session, setSession] = useState<InferenceSession | null>(null);
    const [xValue, setXValue] = useState<string>(''); // State for x input
    const [yValue, setYValue] = useState<string>(''); // State for y input

    useEffect(() => {
        if (!assets) {
            return;
        }

        async function loadModel() {
            try {
                const session: InferenceSession = await getSession(assets![0].localUri!);
                setSession(session);
                console.log(assets![0].localUri)
                console.log("Model loaded successfully");
            } catch (error) {
                console.error("Error loading model", error);
            }
        }
        loadModel();
    }, [assets]);

    const execute = async () => {
        // const tensorA = new Tensor('float32', Float32Array.from([parseFloat(xValue)]), [1]);
        // const tensorB = new Tensor('float32', Float32Array.from([parseFloat(yValue)]), [1]);

        console.log("Executing model with inputs:", xValue, yValue);

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

        if (!session) {
            console.error("Session is not initialized");
            return;
        }

        try {
            console.log("Running model");
            const output = await session!.run(feed);
            console.log("Output", output["new_kv_cache"].dims);
        } catch (error) {
            console.error("Error running model", error);
        }
    };

    return (
        <View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter x value"
                    keyboardType="numeric"
                    value={xValue}
                    onChangeText={setXValue}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Enter y value"
                    keyboardType="numeric"
                    value={yValue}
                    onChangeText={setYValue}
                />
            </View>
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
});
