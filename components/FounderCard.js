"use client";
import { useState } from "react";
import Image from "next/image";
import GameBoyPanel from "./ui/GameBoyPanel";

const placeholder = "/avatar-placeholder.svg";

export default function FounderCard({ name, image = placeholder, description }) {
  const [open, setOpen] = useState(false);

  return (
      <div className={`founder-card ${open ? "is-open" : ""}`}>
        <button
            type="button"
            className="founder-hit"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={`gb-panel-${name}`}
            title={open ? "Chiudi dettagli" : "Apri dettagli"}
        >
          <div className="founder-front">
            {/* wrapper relativo per next/image fill */}
            <div className="founder-img-wrap">
              <Image src={image || placeholder} alt={name} fill sizes="(max-width: 700px) 100vw, 33vw" />
            </div>
            <span className="founder-name">{name}</span>
          </div>
        </button>

        {/* Pannello stile Game Boy, appare sotto la card */}
        {open && (
            <GameBoyPanel
                id={`gb-panel-${name}`}
                onClose={() => setOpen(false)}
                content={description}
            />
        )}
      </div>
  );
}
