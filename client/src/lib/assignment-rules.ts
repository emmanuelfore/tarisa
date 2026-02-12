/**
 * Auto-assignment rules for routing issues to departments
 */

export interface AssignmentRule {
    department: string;
    defaultPriority: 'critical' | 'high' | 'medium' | 'low';
    sla: number; // hours
    description: string;
}

export const ASSIGNMENT_RULES: Record<string, AssignmentRule> = {
    'Roads': {
        department: 'Public Works',
        defaultPriority: 'high',
        sla: 72, // 3 days
        description: 'Potholes, road damage, signage issues'
    },
    'Water': {
        department: 'Utilities',
        defaultPriority: 'critical',
        sla: 24, // 1 day
        description: 'Water main breaks, leaks, water quality'
    },
    'Sewer': {
        department: 'Utilities',
        defaultPriority: 'high',
        sla: 48, // 2 days
        description: 'Sewer blockages, overflows, odors'
    },
    'Lights': {
        department: 'Utilities',
        defaultPriority: 'medium',
        sla: 168, // 1 week
        description: 'Street lights, traffic signals'
    },
    'Waste': {
        department: 'Sanitation',
        defaultPriority: 'medium',
        sla: 72, // 3 days
        description: 'Garbage collection, illegal dumping'
    },
};

/**
 * Get assignment rule for a category
 */
export function getAssignmentRule(category: string): AssignmentRule | null {
    return ASSIGNMENT_RULES[category] || null;
}

/**
 * Get suggested department for a category
 */
export function getSuggestedDepartment(category: string): string | null {
    const rule = getAssignmentRule(category);
    return rule ? rule.department : null;
}

/**
 * Get default priority for a category
 */
export function getDefaultPriority(category: string): string {
    const rule = getAssignmentRule(category);
    return rule ? rule.defaultPriority : 'medium';
}

/**
 * Get SLA target in hours for a category
 */
export function getSLATarget(category: string): number {
    const rule = getAssignmentRule(category);
    return rule ? rule.sla : 168; // default 1 week
}

/**
 * Check if issue is breaching SLA
 */
export function isSLABreached(
    createdAt: Date | string,
    category: string,
    status: string
): boolean {
    if (status === 'resolved') return false;

    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const slaTarget = getSLATarget(category);
    const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 60 * 60);

    return hoursElapsed > slaTarget;
}

/**
 * Get SLA status and percentage
 */
export function getSLAStatus(
    createdAt: Date | string,
    category: string,
    status: string
): {
    breached: boolean;
    percentageUsed: number;
    hoursRemaining: number;
} {
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const slaTarget = getSLATarget(category);
    const hoursElapsed = (Date.now() - created.getTime()) / (1000 * 60 * 60);

    const percentageUsed = Math.round((hoursElapsed / slaTarget) * 100);
    const hoursRemaining = Math.max(0, slaTarget - hoursElapsed);
    const breached = status !== 'resolved' && hoursElapsed > slaTarget;

    return {
        breached,
        percentageUsed,
        hoursRemaining,
    };
}
