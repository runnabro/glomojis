"use client";

import { useRef, useEffect, useState } from "react";

import {
  initializeImageMagick,
  ImageMagick,
  Magick,
  MagickFormat,
  Quantum,
} from "@imagemagick/magick-wasm";

const AutoMagick = () => {
  // const commandEl = useRef();
  const outputEl = useRef();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const wasmUrl =
          "https://cdn.jsdelivr.net/npm/@imagemagick/magick-wasm/dist/magick.wasm";
        const wasmResponse = await fetch(wasmUrl);
        const wasmBuffer = await wasmResponse.arrayBuffer();
        const wasmBytes = new Uint8Array(wasmBuffer);
        await initializeImageMagick(wasmBytes);
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize ImageMagick:", error);
      }
    };
    init();
  }, []);

  const hdrCommand = JSON.stringify([
    "convert",
    "People.jpg",
    "(",
    "-clone",
    "0",
    "People2.jpg",
    "-colorspace",
    "rgb",
    "-auto-gamma",
    "-evaluate",
    "Multiply",
    "1.5",
    "-evaluate",
    "Pow",
    "0.9",
    "-colorspace",
    "sRGB",
    "-depth",
    "16",
    ")",
    "-compose",
    "over",
    "-composite",
    "people_compare2.png",
  ]);

  // fetch the input image and get its content bytes
  async function getImage(src) {
    const fetchedSourceImage1 = await fetch(src);
    return new Uint8Array(await fetchedSourceImage1.arrayBuffer());
  }

  const doMagick = async () => {
    if (!isInitialized) {
      console.log("ImageMagick not initialized yet");
      return;
    }
    console.log("Magick started");
    const inputFile = await getImage("/take_my_money.png");
    console.log("File loaded");

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          // Set quantum format first
          Magick.quantumFormat = "floating-point";

          // Load the profile first
          const profileResponse = await fetch("/2020_profile.icc");
          const profileData = await profileResponse.arrayBuffer();
          const profileBytes = new Uint8Array(profileData);

          ImageMagick.read(inputFile, (image) => {
            try {
              // Apply the command sequence
              image.colorspace = "RGB";
              image.autoGamma();
              image.evaluate("Multiply", "1.5");
              image.evaluate("Pow", "0.9");
              image.colorspace = "sRGB";
              image.depth = 16;

              // Apply the profile
              image.setProfile("icc", profileBytes);

              // Write the result
              image.write(MagickFormat.Png, (data) => {
                const blob = new Blob([data], { type: "image/png" });
                outputEl.current.src = URL.createObjectURL(blob);
                resolve(blob);
              });
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      })();
    });
  };

  return (
    <>
      <input type="file" />
      <button onClick={doMagick} type="button">
        BLIND ME
      </button>
      <img src="/take_my_money.png" />
      <img ref={outputEl} />
    </>
  );
};

export default AutoMagick;
