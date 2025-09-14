"use client";
import { useSortable } from "@dnd-kit/sortable";
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
            className={`
        p-2 m-1 rounded-md cursor-grab min-w-[80px] text-center border-2 border-gray-500 w-32 break-words
        ${className ?? ""}
      `}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {name}
        </div>
    );
}
