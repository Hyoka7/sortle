import { NextResponse } from "next/server";

type Problem = {
    id: string;
    contest_id: string;
    problem_index: string;
    name: string;
    title: string;
};

export async function GET() {
    try {
        const res = await fetch(
            "https://kenkoooo.com/atcoder/resources/problems.json",
            {
                next: { revalidate: 86400 }, // 1day
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch problems: ${res.statusText}`);
        }

        const allProblems: Problem[] = await res.json();
        const filteredProblems = allProblems.filter((p) =>
            p.contest_id.startsWith("abc")
        );
        return NextResponse.json(filteredProblems);
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
