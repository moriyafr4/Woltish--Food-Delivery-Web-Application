import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import highlightMatch from "./highlightMatch";
import "./search.css";

function Search() {
  // save what the user types in the search box
  const [query, setQuery] = useState("");
  // Holds the list of results
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    const delay = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/search/${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Search failed');
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  // The function takes the current value of the box and updates the query state with it.
  const handleChange = (e) => {
    setQuery(e.target.value);
    setError(null);
  };

  // When the user clicks the ✕ button, this function clears everything:
  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError(null);
    inputRef.current.focus();
  };

  const handleResultClick = (restaurant) => {
    navigate(`/restaurant/${restaurant.id || restaurant._id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="search-container">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for restaurants or dishes..."
          value={query}
          onChange={handleChange}
          className="search-input"
        />
        {query && (
          <button className="clear-btn" onClick={handleClear}>✕</button>
        )}
      </div>

      {query.length === 1 && (
        <div className="too-short">Please type at least 2 characters...</div>
      )}

      {isLoading && (
        <div className="loading">Searching...</div>
      )}

      {error && (
        <div className="error">{error}</div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="results-list">
          {results.map((restaurant) => {
            const lowerQuery = query.toLowerCase();
            const matchesProduct = restaurant.products?.some(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery)
            );
            const matchesDescription = restaurant.description?.toLowerCase().includes(lowerQuery);
            const matchesName = restaurant.name.toLowerCase().includes(lowerQuery);
            const matchesCategory = restaurant.category?.toLowerCase().includes(lowerQuery);

            return (
                <div key={restaurant.id || restaurant._id} className="search-result-item"
                    onClick={() => handleResultClick(restaurant)}
                    style={{ cursor: 'pointer' }}>
                    <h3>{highlightMatch(restaurant.name, query)}</h3>
                    <p>{highlightMatch(restaurant.category || '', query)}</p>
                    {!matchesName && !matchesCategory && matchesDescription && (
                        <p className="match-hint">📝 Matches restaurant description</p>
                    )}
                    {!matchesName && !matchesCategory && !matchesDescription && matchesProduct && (
                        <p className="match-hint">🍽️ Matches a dish in the menu</p>
                    )}
                </div>
            );
        })}
        </div>
      )}

      {!isLoading && query.length >= 2 && results.length === 0 && !error && (
        <div className="no-results">No restaurants match your search... 😕</div>
      )}
    </div>
  );
}

export default Search;
