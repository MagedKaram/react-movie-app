import React, { use, useEffect, useState } from "react";
import Search from "./components/Search";
import { ClipLoader } from "react-spinners";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { updateSearchTerm, getTrendingMovie } from "./appwrite";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "#F1F1F1",
};

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_Key = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "Get",
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${API_Key}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [useDebounceSearchTerm, setUseDebounceSearchTerm] = useState("");

  useDebounce(
    () => {
      setUseDebounceSearchTerm(searchTerm);
    },
    1000,
    [searchTerm]
  );

  let [color, setColor] = useState("#ffffff");

  const fetchMovie = async (query) => {
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) {
        throw new Error("failed to fetch movies");
      }
      const data = await response.json();
      if (data.response === "False") {
        setErrorMessage("Failed to fetch movies");
        setMovieList([]);
        return;
      }
      setMovieList(data.results);
      // console.log(data.results);

      if (query && data.results.length > 0) {
        await updateSearchTerm(query, data.results[0]);
      }
    } catch (error) {
      setErrorMessage("Failed to fetch movies. Please try again later.");
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const result = await getTrendingMovie();
      setTrendingMovies(result);
      console.log(result);
    } catch (error) {
      console.error("Error fetching trending movies:", error);
    }
  };

  useEffect(() => {
    fetchMovie(useDebounceSearchTerm);
  }, [useDebounceSearchTerm]);
  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((item, i) => (
                <li key={item.$id} className="trending-movie-item">
                  <p>{i + 1}</p>
                  <img
                    src={item.poster_url ? item.poster_url : "./No-Poster.png"}
                    alt={item.searchTerm}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <ClipLoader
              cssOverride={override}
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((mov) => (
                <MovieCard key={mov.id} mov={mov} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
