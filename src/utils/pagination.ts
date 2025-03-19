export const getPagination = (query: any) => {
    // Set default values for page and limit if not provided
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || 10);
    
    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    return { skip, limit };
};
