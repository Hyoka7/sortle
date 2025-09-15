"use client";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import { CSS } from "@dnd-kit/utilities";

export default function SortableSlotItem({ id, name }: { id: string; name: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    return (
        <div ref={setNodeRef} style={{
            transform: CSS.Transform.toString(transform),
            transition,
        }} {...attributes} {...listeners} className="p-2 bg-gray-100 rounded-md cursor-grab min-w-[80px] text-center break-words border-2 border-gray-900">
            className={clsx(
                "p-2 bg-gray-100 rounded-md cursor-grab min-w-[80px] text-center break-words border-2 border-gray-900"
            )}
            {name}
        </div>
    );
}