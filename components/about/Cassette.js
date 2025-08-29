"use client";
import Image from "next/image";

export default function Cassette({ name, image = "/avatar-placeholder.svg", inserted, onClick }) {
    return (
        <button
            type="button"
            className={`cassette ${inserted ? "inserted" : ""}`}
            onClick={onClick}
            aria-pressed={!!inserted}
            title={name}
        >
            <div className="cassette-img">
                <Image src={image} alt={name} fill sizes="200px" />
            </div>
            <div className="cassette-label">{name}</div>
            {/* Effetto flip/ombra via CSS con .inserted */}
        </button>
    );
}
