"use client";

import { useEffect, useState } from "react";
import {
  initializeImageMagick,
  ImageMagick,
  Magick,
  MagickFormat,
} from "@imagemagick/magick-wasm";
import { FileImage, Loader } from "lucide-react";

import classes from "./style.module.scss";

const AutoMagick = () => {
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);

    // abort
    if (e.target.files.length === 0) {
      setIsLoading(false);
      return;
    }

    // proceed
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
      setIsLoading(false);
      console.log("ImageMagick not Initialized");
      return;
    }

    return new Promise((resolve, reject) => {
      (async () => {
        try {
          console.log("Quantum Formatting");
          // Set quantum format first
          Magick.quantumFormat = "floating-point";

          console.log("Loading profile");
          // Load the profile first
          const profileResponse = await fetch("/2020_profile.icc");
          const profileData = await profileResponse.arrayBuffer();
          const profileBytes = new Uint8Array(profileData);

          ImageMagick.read(file, (image) => {
            try {
              console.log("Applying HDR");
              // Apply hdr
              image.colorspace = "RGB";
              image.autoGamma();
              image.evaluate("Multiply", "1.5");
              image.evaluate("Pow", "0.9");
              image.colorspace = "sRGB";
              image.depth = 16;

              console.log("Applying Profile");
              // Apply profile
              image.setProfile("icc", profileBytes);

              console.log("Generating Image");
              // Write the result
              image.write(MagickFormat.Png, (data) => {
                const blob = new Blob([data], { type: "image/png" });
                setOutputFile(URL.createObjectURL(blob));
                resolve(blob);
              });

              setIsLoading(false);
            } catch (error) {
              setIsLoading(false);
              reject(error);
            }
          });
        } catch (error) {
          setIsLoading(false);
          reject(error);
        }
      })();
    });
  };

  const doMagick = async () => {
    if (!inputFile) {
      setIsLoading(false);
      return;
    }
    const imageData = await getImage(inputFile);
    await processImage(imageData);
  };

  return (
    <div className={classes["AutoMagick"]}>
      <label
        className={`${classes["AutoMagick-upload"]} ${
          isLoading ? classes["AutoMagick-upload_disabled"] : ""
        }`}
      >
        <input
          accept="image/png, image/jpeg, image/webp, image/gif, image/heic"
          className={classes["AutoMagick-upload-input"]}
          disabled={isLoading}
          id="hdr-input"
          onChange={handleFileChange}
          type="file"
        />
        Choose image to HDR-infuse
        {isLoading ? (
          <Loader className={classes["AutoMagick-upload-icon"]} />
        ) : (
          <>
            {inputFile ? (
              <img
                className={classes["AutoMagick-upload-preview"]}
                src={inputFile}
              />
            ) : (
              <FileImage className={classes["AutoMagick-upload-icon"]} />
            )}
          </>
        )}
      </label>
      <div className={classes["AutoMagick-output"]}>
        {!isLoading && outputFile && (
          <div className={classes["AutoMagick-output-preview"]}>
            <img className={classes["AutoMagick-img"]} src={outputFile} />
            <a
              className={classes["AutoMagick-output-download"]}
              download="hdr-infused.png"
              href={outputFile}
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoMagick;
