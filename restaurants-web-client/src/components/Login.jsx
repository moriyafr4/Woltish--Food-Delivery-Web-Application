import { useState } from "react";
import { useAuth } from "./AuthContext";
import "./Login.css";
import MyLogo from "../assets/WoltLogo.jsx";
import Navbar from './navbar';
import { useNavigate, Link } from "react-router-dom";


// Keep track of user inputs and error messages
function Login() {
    const navigate = useNavigate();
    const { setToken } = useAuth(); 
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

// Check inputs before sending to the server
const validate = () => {
  const newErrors = {};

  if (!username.trim()) {
    newErrors.username = "Please enter a username";
  }
  const passwordIssues = [];
  
  if (password.length < 8) {
    passwordIssues.push("at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    passwordIssues.push("one uppercase letter");
  }
  if (!/\d/.test(password)) {
    passwordIssues.push("one number");
  }

  if (passwordIssues.length > 0) {
    newErrors.password = "Password must include: " + passwordIssues.join(", ");
  }

  return newErrors;
};
    // async because we need to wait for the server response
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
    
    setErrors({});
        try {
            // Send username and password to the server     
            const response = await fetch("/api/tokens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                // Handle server error responses
                if (response.status === 401 || response.status === 404) {
                        setErrors({ general: "Invalid username or password" });
                } else {
                        setErrors({ general: "Server error, please try again later" });
                }
                return;
            }
            // Extract JWT from response and save it globally
            const data = await response.json();
            setToken(data.token)
            const token = data.token;
            const payload = JSON.parse(atob(token.split('.')[1]));
            login({ username: payload.username, userId: payload.userId, role: payload.role, profileImage: payload.profileImage, lat: payload.lat, lng: payload.lng }, token);
            
            navigate('/dashboard');
        } catch (err) {
            setErrors({ general: "Server error, please try again" });
        }
    };

    const imagesCol1 = [
        "https://images.pexels.com/photos/20545320/pexels-photo-20545320.jpeg",//yes
        "https://images.pexels.com/photos/15662161/pexels-photo-15662161.jpeg", //yes
        "https://images.pexels.com/photos/8131362/pexels-photo-8131362.jpeg",
        "https://images.pexels.com/photos/32318142/pexels-photo-32318142.jpeg",//yes
        "https://images.pexels.com/photos/15662161/pexels-photo-15662161.jpeg", //yes
        "https://images.pexels.com/photos/20545320/pexels-photo-20545320.jpeg",//yes
  ];

    const imagesCol2 = [
        "https://images.pexels.com/photos/19786235/pexels-photo-19786235.jpeg",//yes
        "https://images.pexels.com/photos/25856552/pexels-photo-25856552.jpeg",//yes
        "https://images.pexels.com/photos/19786235/pexels-photo-19786235.jpeg",//yes
        "https://images.pexels.com/photos/32318142/pexels-photo-32318142.jpeg",//yes
        "https://images.pexels.com/photos/28291553/pexels-photo-28291553.jpeg",//yes
        "https://images.pexels.com/photos/19786235/pexels-photo-19786235.jpeg",//yes
        ];

return (
    <div>
        <Navbar minimal={true} />
        <div className="login-container">
            <div className="login-image-side">
                <div className="scrolling-column">
                    <div className="scrolling-track scroll-up">
                        {imagesCol1.map((src, index) => (
                            <img key={`col1-${index}`} src={src} alt="Food" className="scrolling-image" />
                        ))}
                    </div>
                </div>

                <div className="scrolling-column">
                    <div className="scrolling-track scroll-down">
                        {imagesCol2.map((src, index) => (
                            <img key={`col2-${index}`} src={src} alt="Food" className="scrolling-image" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="login-form-side">
                <div className="login-box"> 
                    
                    <div className="wolt-logo-wrapper">
                        <MyLogo className="wolt-logo" />
                    </div>
                    <h2>Log in to Woltish</h2>
                    <p className="login-subtitle">Welcome back! Enter your details below</p>

                    {errors.general && <div className="error-text global-error">{errors.general}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">Username</label>
                            <input
                                type="text"
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={errors.username ? "input-error-border" : ""}
                            />
                            {errors.username && (
                                <div className="error-text">⚠️ {errors.username}</div>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                type="password"
                                placeholder="Your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={errors.password ? "input-error-border" : ""}
                            />
                            {errors.password && (
                                <div className="error-text">⚠️ {errors.password}</div>
                            )}
                        </div>

                        <button type="submit" className="continue-btn">Continue</button>
                    </form>

                    <p className="register-prompt">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>  
        </div>
    </div>

    );
}
export default Login;