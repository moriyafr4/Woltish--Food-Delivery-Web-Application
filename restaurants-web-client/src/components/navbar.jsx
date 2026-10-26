import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useCart } from './CartContext';
import Search from "./SearchBar";
import "./navbar.css";

function Navbar({ onOrdersClick, minimal = false }) {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const inputRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const userMenuRef = useRef(null);
  const debounceRef = useRef(null);
  

  // ── Close dropdown when clicking outside ──────────────────────────────────
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Debounced search against server ───────────────────────────────────────
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `/api/restaurant?search=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        // Support both array response and { restaurants: [] } shape
        const list = Array.isArray(data) ? data : data.restaurants ?? [];
        setResults(list);
        setIsDropdownOpen(true);
      } catch (err) {
        setSearchError("No results found");
        setIsDropdownOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleResultClick = (restaurant) => {
    setIsDropdownOpen(false);
    setQuery("");
    // Navigate to the restaurant page – adjust the route to match your app
    navigate(`/restaurant/${restaurant._id || restaurant.id}`);
  };

  const { clearCart } = useCart();
  const handleLogout = async () => {
    await logout();
    clearCart();
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* ── Left: Logo ── */}
      <div className="navbar-left">
        <button className="navbar-logo" onClick={() => navigate("/dashboard")}>
          <span className="logo-heart">🩵</span>
          <span className="logo-text">Woltish</span>
        </button>
        <button
          className="nav-btn theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark mode' : 'Light mode'}
      >
          {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
          ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
          )}
      </button>
      </div>
      {!minimal && (
        <>
      {/* ── Centre: Search ── */}
      <div className="navbar-center">
        <Search /> 
      </div>

      {/* ── Right: Nav actions ── */}
      <div className="navbar-right">
          {/* Home */}
        <button
          className={`nav-btn ${isActive("/dashboard") ? "active" : ""}`}
          onClick={() => navigate("/dashboard")}
          title="Home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Home</span>
        </button>

        {user && user.role === 'owner' && (
  <button
    className="nav-btn"
    onClick={() => navigate('/my-restaurants')}
    title="My Restaurants"
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  </button>
)}
        
        {user && user.role !== 'owner' && (
          <>
            <button
              className="nav-btn"
              onClick={() => navigate('/orders')}
              title="My Orders"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span>My Orders</span>
            </button>
          </>
        )}

        {/* Auth: show Login+Signup when logged out, avatar menu when logged in */}
        {!user ? (
          <div className="auth-buttons">
            <button
              className="btn-login"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
            <button
              className="btn-signup"
              onClick={() => navigate("/register")}
            >
              Sign up
            </button>
          </div>
        ) : (
          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setIsUserMenuOpen((p) => !p)}
              aria-label="User menu"
            >
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.displayName} className="avatar-img" />
              ) : (
                <span className="avatar-initials">
                  {(user.displayName || user.username || "U")[0].toUpperCase()}
                </span>
              )}
              <span className="avatar-name">{user.displayName || user.username}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isUserMenuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <strong>{user.displayName || user.username}</strong>
                  <span>{user.role === 'owner' ? '🏪 Restaurant Owner' : '🛒 Customer'}</span>
                </div>
                <hr className="user-dropdown-divider" />
                {user.role === 'owner' && (
                <button className="user-dropdown-item" onClick={() => { setIsUserMenuOpen(false); navigate('/add-restaurant'); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Restaurant
                </button>
                )}
                {user.role === 'owner' && (
                <button className="user-dropdown-item" onClick={() => { setIsUserMenuOpen(false); navigate('/my-restaurants'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  </svg>
                  My Restaurants
                </button>
                )}
                {user && user.role !== 'owner' && (
                <button className="user-dropdown-item" onClick={() => { setIsUserMenuOpen(false); navigate('/orders'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  My Orders
                </button>
                )}
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
              </>
      )}
    </nav>
  );
}

export default Navbar;