"use client";

import React from "react";
import Image from "next/image";

import * as Emojis from "./src";
import classes from "./style.module.scss";

const Gallery = () => {
  const Images = () => {
    const imageList = Object.keys(Emojis);
    return (
      <>
        {imageList?.map((image) => (
          <li key={`emoji-${image}`}>
            <a
              className={classes["Gallery-link"]}
              download={`${image}.png`}
              href={Emojis[image].src}
            >
              <span>{image}</span>
              <Image
                alt={image}
                height={20}
                src={Emojis[image].src}
                width={20}
              />
            </a>
          </li>
        ))}
      </>
    );
  };
  return (
    <article className={classes.Gallery}>
      <ol className={classes["Gallery-list"]}>
        <Images />
      </ol>
    </article>
  );
};

export default Gallery;
