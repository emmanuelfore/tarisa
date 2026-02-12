
import { storage } from "../storage";

// Approximate centers for Harare Wards (Lat, Lng)
const WARD_CENTERS: Record<string, [number, number]> = {
    "1": [-17.8252, 31.0335], // CBD 
    "2": [-17.8400, 31.0600], // Arcadia/Braeside
    "3": [-17.8580, 31.0400], // Mbare East
    "4": [-17.8600, 31.0300], // Mbare West
    "6": [-17.8100, 31.0400], // Avenues
    "7": [-17.7900, 31.0300], // Avondale
    "16": [-17.8500, 31.1500], // Mabvuku
    "18": [-17.7500, 31.1000], // Borrowdale
    "41": [-17.7800, 30.9800], // Marlborough
};

interface LocationResult {
    provinceId?: number;
    localAuthorityId?: number;
    wardId?: number;
    suburbId?: number;
}

export async function resolveCoordinates(latStr: string, lngStr: string): Promise<LocationResult> {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) return {};

    console.log(`Resolving location for ${lat}, ${lng}...`);

    // 1. Find Nearest Ward based on simple Euclidean distance
    let nearestWardNum = "1"; // Default to CBD
    let minDist = Number.MAX_VALUE;

    for (const [wardNum, coords] of Object.entries(WARD_CENTERS)) {
        const d = Math.sqrt(Math.pow(lat - coords[0], 2) + Math.pow(lng - coords[1], 2));
        if (d < minDist) {
            minDist = d;
            nearestWardNum = wardNum;
        }
    }

    console.log(`Nearest Ward determined: ${nearestWardNum} (Approximation)`);

    // 2. Lookup IDs in DB
    try {
        // Assume Harare City Council for this mock (ID lookup ideal, but hardcoded for speed if needed)
        // Better: Fetch auths and find "Harare".
        const auths = await storage.listLocalAuthorities();
        const harare = auths.find(a => a.name.includes("Harare"));

        if (!harare) return {};

        const wards = await storage.listWards(harare.id);
        const targetWard = wards.find(w => w.wardNumber === nearestWardNum);

        if (!targetWard) return { localAuthorityId: harare.id };

        // 3. Pick a suburb in that ward (First available for now, simulating "Inside Polygon")
        const suburbs = await storage.listSuburbs(targetWard.id);
        const targetSuburb = suburbs.length > 0 ? suburbs[0] : undefined;

        return {
            provinceId: harare.provinceId || undefined,
            localAuthorityId: harare.id,
            wardId: targetWard.id,
            suburbId: targetSuburb?.id
        };

    } catch (e) {
        console.error("Geo-resolution error:", e);
        return {};
    }
}
