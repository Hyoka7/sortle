"use client";
import {
    DndContext,
    pointerWithin,
    rectIntersection,
    CollisionDetection,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import clsx from "clsx";
import ProblemPool from "./ProblemPool";
import AnswerSlot from "./AnswerSlot";
import { useSortleGame } from "./useSortleGame";
import { ThemeToggleButton } from "./ThemeToggleButton";

const customCollisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    return rectIntersection(args);
};

const slotLabels = ["A", "B", "C", "D", "E", "F", "G", "Ex"];

export default function Game() {
    const {
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
    } = useSortleGame();

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="p-4 md:p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-500">
            <div className="flex justify-center items-center gap-4">
                <h1 className="font-bold text-3xl text-center">
                    AtCoder Beginner Contest Sortle
                </h1>
                <ThemeToggleButton />
            </div>

            <DndContext
                collisionDetection={customCollisionDetection}
                onDragEnd={handleDragEnd}
            >
                <h3 className="mt-4 text-xl font-bold">Problems</h3>
                <SortableContext
                    items={problems.map((p) => p.id)}
                    strategy={rectSortingStrategy}
                >
                    <ProblemPool problems={problems} />
                </SortableContext>

                <h3 className="mt-4 text-xl font-bold">Your Answer</h3>
                <div className="flex flex-wrap mt-3">
                    {slots.map((id, i) => {
                        const problem =
                            id !== ""
                                ? allProblems.find((p) => p.id === id) || null
                                : null;
                        return (
                            <SortableContext
                                key={`slot-ctx-${i}`}
                                items={id ? [id] : []}
                                strategy={rectSortingStrategy}
                            >
                                <AnswerSlot
                                    id={`slot-${i}`}
                                    label={slotLabels[i]}
                                    problem={problem}
                                    index={i}
                                />
                            </SortableContext>
                        );
                    })}
                </div>
            </DndContext>

            <div className="mt-3 flex justify-center">
                <button
                    onClick={checkAnswer}
                    className={clsx(
                        "text-white font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 focus:outline-none focus:ring-4",
                        "bg-blue-600 hover:bg-blue-700 focus:ring-blue-400",
                        "dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-900"
                    )}
                >
                    Submit
                </button>
                <button
                    onClick={reset}
                    className={clsx(
                        "text-white font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 focus:outline-none focus:ring-4",
                        "bg-red-600 hover:bg-red-700 focus:ring-red-400",
                        "dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-900"
                    )}
                >
                    Reset
                </button>
            </div>

            {result && (
                <div className="mt-4 text-center">
                    <h2 className="text-lg font-semibold">{result}</h2>
                    {shareText && (
                        <button
                            onClick={handleShare}
                            className={clsx(
                                "text-white font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 focus:outline-none focus:ring-4",
                                "mt-2 bg-green-600 hover:bg-green-700 focus:ring-green-300",
                                "dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
                            )}
                        >
                            結果をシェア
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
