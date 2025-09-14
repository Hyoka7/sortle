"use client";
import { useEffect, useRef, useState } from "react";
import { DndContext, pointerWithin, rectIntersection, DragEndEvent, CollisionDetection } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import ProblemPool from "./ProblemPool";
import AnswerSlot from "./AnswerSlot";
import { shuffleArray } from "./ShuffleArray";
import type { Problem } from "./types";

const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    return rectIntersection(args);
};

export default function Game() {
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [correctOrder, setCorrectOrder] = useState<string[]>([]);
    const [slots, setSlots] = useState<string[]>([]);
    const [result, setResult] = useState<string | null>(null);
    const [chosenNum, setChosenNum] = useState<number | null>(null);
    const [submitCount, setSubmitCount] = useState<number>(1);

    const startTimeRef = useRef<number>(Date.now());
    const getElapsedTime = () => Math.floor((Date.now() - startTimeRef.current) / 1000);

    const slotLabels = ["A", "B", "C", "D", "E", "F", "G", "Ex"];

    useEffect(() => {
        fetch("/filtered_problems.json")
            .then((res) => res.json())
            .then((data: Problem[]) => {
                setAllProblems(data);

                const parsed = data
                    .map((item) => {
                        const match = item.contest_id.match(/^abc(\d+)$/);
                        if (!match) return null;
                        return { num: parseInt(match[1], 10), problem: item };
                    })
                    .filter((v): v is { num: number; problem: Problem } => v !== null);

                const valid = parsed.filter((item) => item.num >= 126);
                if (valid.length === 0) return;

                const upper = Math.max(...valid.map((item) => item.num));
                const chosen = Math.floor(Math.random() * (upper - 126 + 1)) + 126;
                setChosenNum(chosen);

                const hits = valid.filter((item) => item.num === chosen).map((item) => item.problem);
                const ordered = [...hits].sort((a, b) =>
                    a.problem_index.localeCompare(b.problem_index, "en", { numeric: true })
                );

                setCorrectOrder(ordered.map((p) => p.id));
                setProblems(shuffleArray(ordered));
                setSlots(Array(ordered.length).fill(""));
            })
            .catch(() => alert("fetch error"));
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const overIsSlot = overId.startsWith("slot-");
        const overIsProblemInSlot = over.data.current?.sortable?.containerId.startsWith("slot-");

        if (overIsSlot || overIsProblemInSlot) {
            const targetSlotId = overIsSlot ? overId : over.data.current?.sortable.containerId;
            if (!targetSlotId) return;

            const slotIndex = parseInt(targetSlotId.replace("slot-", ""), 10);
            const fromIndex = slots.findIndex((s) => s === activeId);

            setSlots((cur) => {
                const newSlots = [...cur];
                const existingId = newSlots[slotIndex];
                const activeIsInPool = fromIndex === -1;

                if (fromIndex !== -1) {
                    [newSlots[slotIndex], newSlots[fromIndex]] = [newSlots[fromIndex], newSlots[slotIndex]];
                } else {
                    newSlots[slotIndex] = activeId;
                    if (existingId) {
                        setProblems((curProblems) => {
                            const original = allProblems.find((p) => p.id === existingId)!;
                            if (original && !curProblems.find((p) => p.id === existingId)) {
                                return [...curProblems, original];
                            }
                            return curProblems;
                        });
                    }

                    if (activeIsInPool) {
                        setProblems((curProblems) => curProblems.filter((p) => p.id !== activeId));
                    }
                }

                return newSlots;
            });

            return;
        }

        if (overId === "pool") {
            const fromIndex = slots.findIndex((s) => s === activeId);
            if (fromIndex !== -1) {
                // スロット → プール
                const returningId = activeId;
                setProblems((cur) => {
                    const original = allProblems.find((p) => p.id === returningId);
                    if (original && !cur.find((p) => p.id === returningId)) {
                        return [...cur, original];
                    }
                    return cur;
                });
                setSlots((cur) => cur.map((id, index) => (index === fromIndex ? "" : id)));
            }
        }
    };




    const reset = () => {
        setResult(null);
        setSlots(Array(correctOrder.length).fill(""));
        setProblems(shuffleArray(correctOrder.map((id) => allProblems.find((p) => p.id === id)!)));
    };

    const checkAnswer = () => {
        if (slots.some((s) => s === "")) {
            setResult("まだ空欄があります");
            return;
        }

        setSubmitCount((cur) => {
            let hit = 0;
            for (let i = 0; i < correctOrder.length; i++) {
                if (slots[i] === correctOrder[i]) hit++;
            }
            if (hit === correctOrder.length) {
                const elapsed = getElapsedTime();
                setResult(`🎉Correct!(From ABC${chosenNum}) Time:${elapsed}s ${cur} Attempt`);
                return 1;
            } else {
                const newCount = cur + 1;
                setResult(`${hit} Hit`);
                return newCount;
            }
        });
    };

    if (!chosenNum || correctOrder.length === 0) return <p>Loading...</p>;

    return (
        <div className="p-4 md:p-8">
            <h1 className="font-bold text-3xl text-center">ABC Sortle</h1>
            <p className="text-center">Drag problems into the slots in the correct order</p>

            <DndContext collisionDetection={customCollisionDetection} onDragEnd={handleDragEnd}>
                <h3 className="mt-4 text-xl font-bold">Problems</h3>
                <SortableContext items={problems.map(p => p.id)} strategy={rectSortingStrategy}>
                    <ProblemPool problems={problems} />
                </SortableContext>

                <h3 className="mt-4 text-xl font-bold">Your Answer</h3>
                <div className="flex flex-wrap mt-3">
                    {slots.map((id, i) => {
                        const problem = id !== "" ? allProblems.find((p) => p.id === id) || null : null;
                        return (
                            <SortableContext key={`slot-ctx-${i}`} items={id ? [id] : []} strategy={rectSortingStrategy}>
                                <AnswerSlot id={`slot-${i}`} label={slotLabels[i]} problem={problem} index={i} />
                            </SortableContext>
                        );
                    })}
                </div>
            </DndContext>

            <div className="mt-3">
                <button onClick={checkAnswer} className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
                <button onClick={reset} className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Reset</button>
            </div>

            {result && <h2 className="mt-3 text-lg font-semibold">{result}</h2>}
        </div>
    );
}