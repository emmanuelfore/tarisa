import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_issue_queue';

export interface QueuedIssue {
    id: string;           // local UUID
    queuedAt: string;     // ISO timestamp
    payload: {
        title: string;
        description: string;
        category: string;
        location: string;
        priority: string;
        coordinates: string;
        photos: string[];
        imageUrl: string | null;
    };
    photoUri?: string;    // local file URI — uploaded on sync
}

/** Add an issue to the offline queue */
export async function addToQueue(item: Omit<QueuedIssue, 'id' | 'queuedAt'>) {
    const queue = await getQueue();
    const newItem: QueuedIssue = {
        ...item,
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        queuedAt: new Date().toISOString(),
    };
    queue.push(newItem);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return newItem;
}

/** Get all pending queued issues */
export async function getQueue(): Promise<QueuedIssue[]> {
    try {
        const raw = await AsyncStorage.getItem(QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/** Remove a successfully synced item from the queue */
export async function removeFromQueue(id: string) {
    const queue = await getQueue();
    const filtered = queue.filter(item => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

/** Get count of pending items */
export async function getQueueCount(): Promise<number> {
    const queue = await getQueue();
    return queue.length;
}

/** Sync all queued issues to the server. Call when network is restored. */
export async function syncQueue(api: any): Promise<{ synced: number; failed: number }> {
    const queue = await getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const item of queue) {
        try {
            // Upload photo if we have a local URI
            let photoUrl: string | null = item.payload.imageUrl;
            if (item.photoUri) {
                try {
                    const formData = new FormData();
                    const filename = item.photoUri.split('/').pop() || 'photo.jpg';
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : 'image/jpeg';
                    // @ts-ignore
                    formData.append('photos', { uri: item.photoUri, name: filename, type });
                    const uploadRes = await api.post('/api/upload/photo', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    if (uploadRes.data.urls?.length > 0) {
                        photoUrl = uploadRes.data.urls[0];
                    }
                } catch {
                    // Photo upload failed — submit without photo
                }
            }

            await api.post('/api/issues', {
                ...item.payload,
                imageUrl: photoUrl,
                photos: photoUrl ? [photoUrl] : [],
            });

            await removeFromQueue(item.id);
            synced++;
        } catch (err: any) {
            // Skip items that fail auth (401) — they're stale
            if (err?.response?.status === 401) {
                await removeFromQueue(item.id);
            }
            failed++;
        }
    }

    return { synced, failed };
}
