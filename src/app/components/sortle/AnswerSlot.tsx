"use client";
import { useDroppable } from "@dnd-kit/core";
import SortableSlotItem from "./SortableSlotItem";
import type { Problem } from "./types";

const bgColors = [
    "bg-gray-100",
    "bg-amber-100",
    "bg-green-100",
    "bg-sky-100",
    "bg-blue-100",
    "bg-yellow-100",
    "bg-orange-100",
    "bg-red-100",
];

export default function AnswerSlot({
    id,
    label,
    problem,
    index,
}: {
    id: string;
    label: string;
    problem: Problem | null;
    index: number;
}) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const bgClass = isOver ? "bg-blue-200" : bgColors[index];
    return (
        <div
            ref={setNodeRef}
            className={`flex-1 border-2 border-dashed border-gray-400 rounded-md m-1 p-4 min-w-[40px] text-center  ${bgClass}`}
        >
            <div className="font-bold mb-2">{label}</div>
            {problem ? (
                <SortableSlotItem id={problem.id} name={problem.name} />
            ) : (
                <span className="text-gray-400">Drop here</span>
            )}
        </div>
    );
}
