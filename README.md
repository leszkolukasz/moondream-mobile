## Moondream Mobile

This is a react-native app that allows inference of the [Moondream](https://github.com/vikhyat/moondream) model.

> [!NOTE]
> Project is abandoned because as it turns out it's hard to find good libraries for image processing/tensor manipulation that do not depend on browser/nodejs APIs. Current implementation is not only slow but also uses `numjs` library which sometimes fails to work on Android. I am currently rewriting this project in C++/Qt.
>
> Edit: [Moondream CPP](https://github.com/leszkolukasz/moondream-cpp) is officially out.

## Usage

The project depends on `moondream-react-native` package which is now called [moondream-nodejs](https://github.com/leszkolukasz/moondream-nodejs). To run it you need to clone this repository and modify it to use react-native not NodeJS that is:

- Comment all lines that use `fs`,`onnxruntime-node` packages
- Uncomment all already commented lines that use `react-native` packages
- Don't build packages found in `pnpm-workspace.yaml` file
- Remove `onnxruntime-node`, `sharp` packages
- Modify `package.json` from this repo to use the modified `moondream-nodejs` package

## Usage

Run `pnpm run android`. Project was not tested on iOS.
