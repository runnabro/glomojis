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
          <tr key={`emoji-${image}`}>
            <td>{image}</td>
            <td>
              <a download href={Emojis[image]}>
                <Image alt={image} height={25} src={Emojis[image]} width={25} />
              </a>
            </td>
          </tr>
        ))}
      </>
    );
  };
  return (
    <article className={classes.Gallery}>
      <table>
        <tbody>
          <Images />
        </tbody>
      </table>
    </article>
  );
};

export default Gallery;
