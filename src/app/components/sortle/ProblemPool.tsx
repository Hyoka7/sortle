"use client";
import { useDroppable } from "@dnd-kit/core";
import SortableItem from "./SortableItem";
import type { Problem } from "./types";

export default function ProblemPool({ problems }: { problems: Problem[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: "pool" });

    return (
        <div
            ref={setNodeRef}
            className={`inline-flex  p-3 rounded-md bg-cyan-100 ${isOver ? "bg-green-100" : ""}`}
        >
            {problems.map((p) => (
                <SortableItem key={p.id} id={p.id} name={p.name} className="m-1" />
            ))}
        </div>
    );
}
