"use client";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import { CSS } from "@dnd-kit/utilities";

export default function SortableSlotItem({ id, name }: { id: string; name: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            {...attributes}
            {...listeners}
            className={clsx(
                "p-2 rounded-md cursor-grab min-w-[80px] text-center break-words border-2",
                "bg-white dark:bg-gray-700 border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100"
            )}
        >
            {name}
        </div>
    );
}