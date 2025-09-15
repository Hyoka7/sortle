"use client";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import SortableItem from "./SortableItem";
import type { Problem } from "./types";

export default function ProblemPool({ problems }: { problems: Problem[] }) {
    const { setNodeRef, isOver } = useDroppable({ id: "pool" });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "flex flex-wrap justify-center p-3 rounded-md",
                "bg-cyan-100 dark:bg-cyan-900/50",
                {
                    "bg-green-200 dark:bg-green-800/60": isOver,
                }
            )}
        >
            {problems.map((p) => (
                <SortableItem
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    className="m-1"
                />
            ))}
        </div>
    );
}
