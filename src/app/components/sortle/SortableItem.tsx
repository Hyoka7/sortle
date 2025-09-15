"use client";
import { useSortable } from "@dnd-kit/sortable";
import clsx from "clsx";
import { CSS } from "@dnd-kit/utilities";

type Props = {
    id: string;
    name: string;
    className?: string;
};

export default function SortableItem({ id, name, className }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={clsx(
                "p-2 m-1 rounded-md cursor-grab min-w-[80px] text-center border-2 w-auto break-words",
                "bg-white dark:bg-gray-700 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100",
                className
            )}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {name}
        </div>
    );
}
