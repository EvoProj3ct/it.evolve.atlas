"use client";
import React from "react";
import GameBoyCore from "@/components/gameboy/GameBoyCore";
import { PixelWrapper, Palettes } from "@/components/gameboy/arcade/GameBoyPixelWrapper";
import { createPongLogic } from "@/components/gameboy/arcade/cartridges/logic-bouncer";



// 2) Cassetta “engine” a pixel
const pongengine = new PixelWrapper({
  label: "Evolve Pong",
  image: "/cartridges/evolve-pong.png",
  width: 160, height: 144,
  mode: "indexed", bpp: 2,
  fps: 59.7,
  palette: Palettes.DMG,
  autoStart: true,
});
pongengine.attachLogic(createPongLogic());

export default function Demo() {
  return (
      <GameBoyCore
          wrappers={[pongengine]}
          className="shell-compact"
          onEvent={(name, payload) => {
            // console.debug(name, payload);
          }}
      />
  );
}