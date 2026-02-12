import type { Issue } from "@shared/schema";

/**
 * Calculate the time difference between two dates in days
 */
export function getDaysDifference(start: Date | string, end: Date | string): number {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate average resolution time for issues
 */
export function calculateAverageResolutionTime(
    issues: Issue[],
    category?: string
): number | null {
    const resolvedIssues = issues.filter(
        (issue) =>
            issue.status === 'resolved' &&
            issue.resolvedAt &&
            (!category || issue.category === category)
    );

    if (resolvedIssues.length === 0) return null;

    const totalDays = resolvedIssues.reduce((sum, issue) => {
        if (!issue.resolvedAt) return sum;
        return sum + getDaysDifference(issue.createdAt, issue.resolvedAt);
    }, 0);

    return Math.round(totalDays / resolvedIssues.length);
}

/**
 * Get resolution rate percentage
 */
export function getResolutionRate(
    issues: Issue[],
    category?: string
): number {
    const filteredIssues = category
        ? issues.filter(i => i.category === category)
        : issues;

    if (filteredIssues.length === 0) return 0;

    const resolvedCount = filteredIssues.filter(
        i => i.status === 'resolved'
    ).length;

    return Math.round((resolvedCount / filteredIssues.length) * 100);
}

/**
 * Calculate distance between two coordinates in meters using Haversine formula
 */
export function calculateDistance(
    coord1: [number, number],
    coord2: [number, number]
): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (coord1[0] * Math.PI) / 180;
    const φ2 = (coord2[0] * Math.PI) / 180;
    const Δφ = ((coord2[0] - coord1[0]) * Math.PI) / 180;
    const Δλ = ((coord2[1] - coord1[1]) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Parse coordinate string to [lat, lng] tuple
 */
export function parseCoordinates(coordString: string | null): [number, number] | null {
    if (!coordString) return null;
    const parts = coordString.split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        return [parts[0], parts[1]];
    }
    return null;
}

/**
 * Find nearby issues within a given radius
 */
export function findNearbyIssues(
    issue: Issue,
    allIssues: Issue[],
    radiusMeters: number = 100
): Issue[] {
    const issueCoords = parseCoordinates(issue.coordinates);
    if (!issueCoords) return [];

    return allIssues.filter((otherIssue) => {
        if (otherIssue.id === issue.id) return false;

        const otherCoords = parseCoordinates(otherIssue.coordinates);
        if (!otherCoords) return false;

        const distance = calculateDistance(issueCoords, otherCoords);
        return distance <= radiusMeters;
    });
}

/**
 * Find similar nearby issues (same category, within radius)
 */
export function findSimilarNearbyIssues(
    issue: Issue,
    allIssues: Issue[],
    radiusMeters: number = 100
): Issue[] {
    const nearbyIssues = findNearbyIssues(issue, allIssues, radiusMeters);
    return nearbyIssues.filter(
        (nearby) => nearby.category === issue.category
    );
}

/**
 * Get monthly comparison data
 */
export function getMonthlyComparison(issues: Issue[]): {
    thisMonth: number;
    lastMonth: number;
    percentageChange: number;
} {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthResolved = issues.filter((issue) => {
        if (!issue.resolvedAt || issue.status !== 'resolved') return false;
        const resolvedDate = new Date(issue.resolvedAt);
        return resolvedDate >= thisMonthStart;
    }).length;

    const lastMonthResolved = issues.filter((issue) => {
        if (!issue.resolvedAt || issue.status !== 'resolved') return false;
        const resolvedDate = new Date(issue.resolvedAt);
        return resolvedDate >= lastMonthStart && resolvedDate <= lastMonthEnd;
    }).length;

    const percentageChange = lastMonthResolved === 0
        ? 100
        : Math.round(((thisMonthResolved - lastMonthResolved) / lastMonthResolved) * 100);

    return {
        thisMonth: thisMonthResolved,
        lastMonth: lastMonthResolved,
        percentageChange,
    };
}

/**
 * Get top N most reported categories
 */
export function getTopCategories(issues: Issue[], limit: number = 3): Array<{
    category: string;
    count: number;
}> {
    const categoryCounts: Record<string, number> = {};

    issues.forEach((issue) => {
        categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

/**
 * Get issue lifecycle timeline events
 */
export interface TimelineEvent {
    label: string;
    date: Date | null;
    icon?: string;
}

export function getIssueTimeline(issue: Issue): TimelineEvent[] {
    const timeline: TimelineEvent[] = [
        {
            label: 'Reported',
            date: new Date(issue.createdAt),
            icon: 'alert',
        },
    ];

    // Add acknowledged if different from created
    if (issue.updatedAt && issue.updatedAt !== issue.createdAt) {
        timeline.push({
            label: 'Acknowledged',
            date: new Date(issue.updatedAt),
            icon: 'check',
        });
    }

    // Add in progress if assigned
    if ((issue as any).assignedAt) {
        timeline.push({
            label: 'In Progress',
            date: new Date((issue as any).assignedAt),
            icon: 'clock',
        });
    } else if (issue.status === 'in_progress') {
        timeline.push({
            label: 'In Progress',
            date: new Date(issue.updatedAt),
            icon: 'clock',
        });
    }

    // Add resolved
    if (issue.resolvedAt && issue.status === 'resolved') {
        timeline.push({
            label: 'Resolved',
            date: new Date(issue.resolvedAt),
            icon: 'check-circle',
        });
    }

    return timeline;
}
