"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { shuffleArray } from "./ShuffleArray";
import type { Problem } from "./types";

export function useSortleGame() {
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [correctOrder, setCorrectOrder] = useState<string[]>([]);
    const [slots, setSlots] = useState<string[]>([]);
    const [result, setResult] = useState<string | null>(null);
    const [chosenNum, setChosenNum] = useState<number | null>(null);
    const [submitCount, setSubmitCount] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const startTimeRef = useRef<number>(0);

    const resetGame = useCallback((orderedProblems: Problem[]) => {
        setCorrectOrder(orderedProblems.map((p) => p.id));
        setProblems(shuffleArray(orderedProblems));
        setSlots(Array(orderedProblems.length).fill(""));
        setResult(null);
        setSubmitCount(1);
        startTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        const fetchAndSetupGame = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/filtered_problems.json");
                if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
                const data: Problem[] = await res.json();
                setAllProblems(data);

                const parsed = data
                    .map((item) => {
                        const match = item.contest_id.match(/^abc(\d+)$/);
                        if (!match) return null;
                        return { num: parseInt(match[1], 10), problem: item };
                    })
                    .filter((v): v is { num: number; problem: Problem } => v !== null);

                const MIN_CONTEST_NUM = 126;
                const valid = parsed.filter((item) => item.num >= MIN_CONTEST_NUM);
                if (valid.length === 0) {
                    return;
                }

                const upper = Math.max(...valid.map((item) => item.num));
                const chosen = Math.floor(Math.random() * (upper - MIN_CONTEST_NUM + 1)) + MIN_CONTEST_NUM;
                setChosenNum(chosen);

                const hits = valid.filter((item) => item.num === chosen).map((item) => item.problem);
                const ordered = [...hits].sort((a, b) =>
                    a.problem_index.localeCompare(b.problem_index, "en", { numeric: true })
                );
                resetGame(ordered);
            } catch (error) {
                console.error("Failed to fetch or setup game:", error);
                alert("データの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAndSetupGame();
    }, [resetGame]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id.toString();
        const overContainerId = over.data.current?.sortable?.containerId ?? over.id.toString();

        const fromSlotIndex = slots.indexOf(activeId);
        const isMovingFromSlot = fromSlotIndex !== -1;

        // Case 1: Moving to a slot
        if (overContainerId.startsWith("slot-")) {
            const toSlotIndex = parseInt(overContainerId.replace("slot-", ""), 10);
            let nextSlots = [...slots];
            let nextProblems = [...problems];

            if (isMovingFromSlot) { // Moving between slots (swap)
                [nextSlots[toSlotIndex], nextSlots[fromSlotIndex]] = [nextSlots[fromSlotIndex], nextSlots[toSlotIndex]];
            } else { // Moving from pool to slot
                const itemInTargetSlotId = slots[toSlotIndex];
                nextSlots[toSlotIndex] = activeId;
                nextProblems = problems.filter((p) => p.id !== activeId);

                if (itemInTargetSlotId) { // If target slot was occupied, move its item to the pool
                    const problemToReturn = allProblems.find((p) => p.id === itemInTargetSlotId);
                    if (problemToReturn) {
                        nextProblems.push(problemToReturn);
                    }
                }
            }
            setSlots(nextSlots);
            setProblems(nextProblems);
            return;
        }

        // Case 2: Moving to the problem pool
        if (overContainerId === "pool") {
            if (isMovingFromSlot) { // Moving from a slot to the pool
                setProblems((cur) => {
                    const original = allProblems.find((p) => p.id === activeId);
                    return original ? [...cur, original] : cur;
                });
                setSlots((cur) => cur.map((id, index) => (index === fromSlotIndex ? "" : id)));
            }
            // If not from a slot, it's a no-op (moving within the pool)
        }
    };

    const reset = () => {
        const orderedProblems = correctOrder
            .map((id) => allProblems.find((p) => p.id === id))
            .filter((p): p is Problem => !!p);
        resetGame(orderedProblems);
    };

    const checkAnswer = () => {
        if (slots.some((s) => s === "")) {
            setResult("まだ空欄があります");
            return;
        }

        const hit = slots.reduce((acc, id, i) => acc + (id === correctOrder[i] ? 1 : 0), 0);

        if (hit === correctOrder.length) {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            setResult(`🎉Correct!(From ABC${chosenNum}) Time:${minutes}:${seconds} ふ${submitCount} Attempt`);
            setSubmitCount(1); // Reset for next game
        } else {
            setResult(`${hit} Hit`);
            setSubmitCount(prev => prev + 1);
        }
    };

    return {
        problems,
        slots,
        result,
        isLoading,
        allProblems,
        handleDragEnd,
        reset,
        checkAnswer,
    };
}