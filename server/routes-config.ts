// DEPARTMENT & CATEGORY MANAGEMENT ROUTES

import express from "express";
import { departments, issueCategories } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

const router = express.Router();

// ============ DEPARTMENTS ============

// GET all departments
router.get("/api/departments", async (req, res) => {
    try {
        const depts = await db.select().from(departments);
        res.json(depts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch departments" });
    }
});

// GET single department
router.get("/api/departments/:id", async (req, res) => {
    try {
        const [dept] = await db.select().from(departments).where(eq(departments.id, parseInt(req.params.id)));
        if (!dept) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json(dept);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch department" });
    }
});

// POST create department
router.post("/api/departments", async (req, res) => {
    try {
        const [newDept] = await db.insert(departments).values(req.body).returning();
        res.status(201).json(newDept);
    } catch (error) {
        res.status(500).json({ error: "Failed to create department" });
    }
});

// PUT update department
router.put("/api/departments/:id", async (req, res) => {
    try {
        const [updated] = await db
            .update(departments)
            .set(req.body)
            .where(eq(departments.id, parseInt(req.params.id)))
            .returning();
        if (!updated) {
            return res.status(404).json({ error: "Department not found" });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update department" });
    }
});

// DELETE department
router.delete("/api/departments/:id", async (req, res) => {
    try {
        await db.delete(departments).where(eq(departments.id, parseInt(req.params.id)));
        res.json({ message: "Department deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete department" });
    }
});

// ============ CATEGORIES ============

// GET all categories
router.get("/api/categories", async (req, res) => {
    try {
        const cats = await db.select().from(issueCategories);
        res.json(cats);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

// GET single category
router.get("/api/categories/:code", async (req, res) => {
    try {
        const [cat] = await db.select().from(issueCategories).where(eq(issueCategories.code, req.params.code));
        if (!cat) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(cat);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch category" });
    }
});

// POST create category
router.post("/api/categories", async (req, res) => {
    try {
        const [newCat] = await db.insert(issueCategories).values(req.body).returning();
        res.status(201).json(newCat);
    } catch (error) {
        res.status(500).json({ error: "Failed to create category" });
    }
});

// PUT update category
router.put("/api/categories/:code", async (req, res) => {
    try {
        const [updated] = await db
            .update(issueCategories)
            .set(req.body)
            .where(eq(issueCategories.code, req.params.code))
            .returning();
        if (!updated) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category" });
    }
});

// DELETE category
router.delete("/api/categories/:code", async (req, res) => {
    try {
        await db.delete(issueCategories).where(eq(issueCategories.code, req.params.code));
        res.json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});

export default router;
