"use client";

import { useEffect, useState } from "react";

import {
  initializeImageMagick,
  ImageMagick,
  Magick,
  MagickFormat,
} from "@imagemagick/magick-wasm";

import classes from "./style.module.scss";

const AutoMagick = () => {
  const [inputFile, setInputFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
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

  // fetch the input image and get its content bytes
  async function getImage(src) {
    const fetchSourceImage = await fetch(src);
    return new Uint8Array(await fetchSourceImage.arrayBuffer());
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setInputFile(url);
      const imageData = await getImage(url);
      await processImage(imageData);
    }
  };

  const processImage = async (file) => {
    if (!isInitialized) {
      console.log("ImageMagick not initialized yet");
      return;
    }

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          // Set quantum format first
          Magick.quantumFormat = "floating-point";

          // Load the profile first
          const profileResponse = await fetch("/2020_profile.icc");
          const profileData = await profileResponse.arrayBuffer();
          const profileBytes = new Uint8Array(profileData);

          ImageMagick.read(file, (image) => {
            try {
              // Apply hdr
              image.colorspace = "RGB";
              image.autoGamma();
              image.evaluate("Multiply", "1.5");
              image.evaluate("Pow", "0.9");
              image.colorspace = "sRGB";
              image.depth = 16;

              // Apply profile
              image.setProfile("icc", profileBytes);

              // Write the result
              image.write(MagickFormat.Png, (data) => {
                const blob = new Blob([data], { type: "image/png" });
                setOutputFile(URL.createObjectURL(blob));
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

  const doMagick = async () => {
    if (!inputFile) return;
    const imageData = await getImage(inputFile);
    await processImage(imageData);
  };

  return (
    <>
      <input
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handleFileChange}
        type="file"
      />
      <img className={classes["AutoMagick-img"]} src={inputFile} />
      <img className={classes["AutoMagick-img"]} src={outputFile} />
    </>
  );
};

export default AutoMagick;
