
import "dotenv/config";
import { db } from "./db";
import { issues, upvotes, comments, jurisdictions, departments } from "@shared/schema";
import { eq, sql, getTableColumns, desc } from "drizzle-orm";

async function testQuery() {
    try {
        console.log("Testing listIssues query...");
        const result = await db
            .select({
                ...getTableColumns(issues),
                upvotes: sql<number>`count(distinct ${upvotes.id})`.as('upvotes'),
                comments: sql<number>`count(distinct ${comments.id})`.as('comments'),
            })
            .from(issues)
            .leftJoin(upvotes, eq(issues.id, upvotes.issueId))
            .leftJoin(comments, eq(issues.id, comments.issueId))
            .groupBy(issues.id)
            .orderBy(desc(issues.createdAt));

        console.log("Query successful! Found", result.length, "issues.");
    } catch (error) {
        console.error("Query failed:", error);
    } finally {
        process.exit();
    }
}

testQuery();
