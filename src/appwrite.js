import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID;

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(PROJECT_ID);

const database = new Databases(client);

/**
 * Update search count for a movie search term
 */
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // 1. Check if row exists
    const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);

    // 2. If row exists → update
    if (result.documents.length > 0) {
      const row = result.documents[0];

      await database.updateDocument(DATABASE_ID, TABLE_ID, row.$id, {
        count: row.count + 1,
      });

      return;
    }

    // 3. If no row exists → create a new one
    await database.createDocument(DATABASE_ID, TABLE_ID, ID.unique(), {
      searchTerm,
      count: 1,
      movie_id: movie.id,
      poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
    });
  } catch (error) {
    console.error("Failed to update search count:", error);
  }
};

/**
 * Get trending movies by count (top 5)
 */
export const getTrendingMovies = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, TABLE_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);

    return result.documents;
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return [];
  }
};
