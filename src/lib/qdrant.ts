// Stub for Qdrant Client
// In a real implementation, this would initialize the @qdrant/js-client-rest

export const initQdrant = () => {
    const url = process.env.QDRANT_URL;
    const key = process.env.QDRANT_API_KEY;

    if (!url || !key) {
        console.warn("Qdrant credentials missing.");
        return null;
    }

    console.log("Qdrant client initialized for:", url);
    return {
        // Mock client methods
        search: async () => [],
        upsert: async () => ({ status: "ok" }),
    };
};
