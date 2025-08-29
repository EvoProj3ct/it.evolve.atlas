"use client";
import Image from "next/image";

export default function Cassette({ name, image = "/avatar-placeholder.svg", active, onClick }) {
    return (
        <button
            type="button"
            className={`cassette ${active ? "active" : ""}`}
            onClick={onClick}
            aria-pressed={active}
            title={name}
        >
            <div className="cassette-img">
                <Image src={image || "/avatar-placeholder.svg"} alt={name} fill sizes="180px" />
            </div>
            <div className="cassette-label">{name}</div>
        </button>
    );
}
