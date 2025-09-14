"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableSlotItem({ id, name }: { id: string; name: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "8px 12px",
        margin: "6px",
        background: "#f2f2f2",
        borderRadius: "6px",
        cursor: "grab",
        minWidth: "80px",
        textAlign: "center" as const,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {name}
        </div>
    );
}