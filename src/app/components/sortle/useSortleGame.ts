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
    const [shareText, setShareText] = useState<string | null>(null);
    const [submitCount, setSubmitCount] = useState<number>(1);
    const [jstDate, setJstDate] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const startTimeRef = useRef<number>(0);

    const resetGame = useCallback((orderedProblems: Problem[]) => {
        setCorrectOrder(orderedProblems.map((p) => p.id));
        setProblems(shuffleArray(orderedProblems));
        setSlots(Array(orderedProblems.length).fill(""));
        setResult(null);
        setShareText(null);
        setSubmitCount(1);
        startTimeRef.current = Date.now();
    }, []);

    useEffect(() => {
        const fetchAndSetupGame = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/problems");
                if (!res.ok)
                    throw new Error(`Fetch failed with status ${res.status}`);
                const data: Problem[] = await res.json();
                setAllProblems(data);
                const parsed = data
                    .map((item) => {
                        const match = item.contest_id.match(/^abc(\d+)$/);
                        if (!match) return null;
                        return { num: parseInt(match[1], 10), problem: item };
                    })
                    .filter(
                        (v): v is { num: number; problem: Problem } =>
                            v !== null
                    );
                const MIN_CONTEST_NUM = 126;
                const valid = parsed.filter(
                    (item) => item.num >= MIN_CONTEST_NUM
                );
                if (valid.length === 0) {
                    return;
                }
                const now = new Date();
                const dateForSeed = new Date(now);
                if (now.getUTCHours() < 15) {
                    dateForSeed.setUTCDate(dateForSeed.getUTCDate() - 1);
                }
                const year = dateForSeed.getFullYear();
                const month = (dateForSeed.getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
                const day = dateForSeed.getDate().toString().padStart(2, "0");
                setJstDate(`${year}/${month}/${day}`);

                const seed =
                    dateForSeed.getUTCFullYear() * 10000 +
                    (dateForSeed.getUTCMonth() + 1) * 100 +
                    dateForSeed.getUTCDate();
                const seededRandom = (s: number) => {
                    const x = Math.sin(s) * 10000;
                    return x - Math.floor(x);
                };

                const uniqueContestNums = [
                    ...new Set(valid.map((item) => item.num)),
                ];
                const chosen =
                    uniqueContestNums[
                        Math.floor(
                            seededRandom(seed) * uniqueContestNums.length
                        )
                    ];
                setChosenNum(chosen);

                const hits = valid
                    .filter((item) => item.num === chosen)
                    .map((item) => item.problem);
                const ordered = [...hits].sort((a, b) =>
                    a.problem_index.localeCompare(b.problem_index, "en", {
                        numeric: true,
                    })
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
        const overContainerId =
            over.data.current?.sortable?.containerId ?? over.id.toString();

        const fromSlotIndex = slots.indexOf(activeId);
        const isMovingFromSlot = fromSlotIndex !== -1;

        if (overContainerId.startsWith("slot-")) {
            const toSlotIndex = parseInt(
                overContainerId.replace("slot-", ""),
                10
            );
            const nextSlots = [...slots];
            let nextProblems = [...problems];

            if (isMovingFromSlot) {
                // Moving between slots (swap)
                [nextSlots[toSlotIndex], nextSlots[fromSlotIndex]] = [
                    nextSlots[fromSlotIndex],
                    nextSlots[toSlotIndex],
                ];
            } else {
                // Moving from pool to slot
                const itemInTargetSlotId = slots[toSlotIndex];
                nextSlots[toSlotIndex] = activeId;
                nextProblems = problems.filter((p) => p.id !== activeId);

                if (itemInTargetSlotId) {
                    const problemToReturn = allProblems.find(
                        (p) => p.id === itemInTargetSlotId
                    );
                    if (problemToReturn) {
                        nextProblems.push(problemToReturn);
                    }
                }
            }
            setSlots(nextSlots);
            setProblems(nextProblems);
            return;
        }

        if (overContainerId === "pool") {
            if (isMovingFromSlot) {
                setProblems((cur) => {
                    const original = allProblems.find((p) => p.id === activeId);
                    return original ? [...cur, original] : cur;
                });
                setSlots((cur) =>
                    cur.map((id, index) => (index === fromSlotIndex ? "" : id))
                );
            }
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
            setShareText(null);
            setResult("Set All Problems");
            return;
        }

        const hit = slots.reduce(
            (acc, id, i) => acc + (id === correctOrder[i] ? 1 : 0),
            0
        );

        if (hit === correctOrder.length) {
            const elapsed = Math.floor(
                (Date.now() - startTimeRef.current) / 1000
            );
            const minutes = Math.floor(elapsed / 60)
                .toString()
                .padStart(2, "0");
            const seconds = (elapsed % 60).toString().padStart(2, "0");
            const resultText = `🎉Correct!(From ABC${chosenNum}) Time:${minutes}:${seconds} Attempts:${submitCount}`;
            const textToShare = `ABC Sortle (${jstDate})\nTime:${submitCount}\nAttempts:${minutes}:${seconds}\n#ABCSortle`;
            setResult(resultText);
            setShareText(textToShare);
            setSubmitCount(1);
        } else {
            setResult(`${hit} Hit`);
            setShareText(null);
            setSubmitCount((prev) => prev + 1);
        }
    };

    return {
        problems,
        slots,
        result,
        isLoading,
        allProblems,
        shareText,
        handleDragEnd,
        reset,
        checkAnswer,
        handleShare,
    };

    async function handleShare() {
        if (!shareText) return;

        const shareData = {
            title: "ABC Sortle Result",
            text: shareText,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    `${shareText}\n${window.location.href}`
                );
                alert("結果をクリップボードにコピーしました！");
            }
        } catch (error) {
            console.error("Share failed:", error);
        }
    }
}
