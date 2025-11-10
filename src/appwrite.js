import { Client, Databases, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const clint = new Client();
clint
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(PROJECT_ID);

const database = new Databases(clint);

export const updateSearchTerm = async (searchTerm, movie) => {
  //use appwrite sdk to chech if search term exists in database
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", searchTerm),
    ]);
    if (result.documents.length > 0) {
      // If the document exists, update it
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        result.documents[0].$id,
        {
          count: result.documents[0].count + 1,
        }
      );
    } else {
      // If the document does not exist, create it
      await database.createDocument(DATABASE_ID, COLLECTION_ID, "unique()", {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search term:", error);
  }
};

export const getTrendingMovie = async () => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents;
  } catch (error) {
    console.log(error);
  }
};
