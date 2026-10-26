import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; 
import { Link } from "react-router-dom";
import MyLogo from "../assets/WoltLogo.jsx";
import Navbar from './navbar';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "user",
    lat: "",
    lng: "",
    phone: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) value = digits;
      else if (digits.length <= 6) value = `${digits.slice(0,3)}-${digits.slice(3)}`;
      else value = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
    if (errors.profileImage) {
      setErrors((prev) => ({ ...prev, profileImage: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    } else if (form.username.trim().length < 3) {
      newErrors.username = "Min 3 characters";
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.lat || isNaN(form.lat)) {
    newErrors.lat = "Enter a valid latitude";
    } else if (form.lat < 29 || form.lat > 34) {
    newErrors.lat = "Latitude must be in Israel (29-34)";
    }

    if (!form.lng || isNaN(form.lng)) {
      newErrors.lng = "Enter a valid longitude";
    } else if (form.lng < 34 || form.lng > 36) {
      newErrors.lng = "Longitude must be in Israel (34-36)";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required";
    } 
    else if (!/^05\d{8}$/.test(form.phone.replace(/[-\s]/g, ""))) {
      newErrors.phone = "Format: 05X-XXX-XXXX";
    }

    const passwordIssues = [];
    if (form.password.length < 8) passwordIssues.push("min 8 chars");
    if (!/[A-Z]/.test(form.password)) passwordIssues.push("one uppercase letter");
    if (!/\d/.test(form.password)) passwordIssues.push("one number");
    if (passwordIssues.length > 0) {
      newErrors.password = passwordIssues.join(", ");
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (!profileImage) {
      newErrors.profileImage = "Please choose a profile picture";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", form.username.trim());
      formData.append("password", form.password);
      formData.append("fullName", form.fullName.trim());
      formData.append("lat", form.lat);
      formData.append("lng", form.lng);
      formData.append("role", form.role);
      formData.append("phone", form.phone.trim());
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/users", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setErrors({ username: "Username already taken" });
        } else if (data.error) {
          setErrors({ general: data.error });
        } else {
          setErrors({ general: "Registration failed. Please try again." });
        }
        return;
      }

      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setErrors({ general: "Server error, please try again" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
    <Navbar minimal={true} />
    <div className="register-container">
      <div className="register-box">
        
        <div className="register-header">
            <div className="wolt-logo-wrapper">
            <MyLogo className="wolt-logo" />
            </div>
            <h2>Create an account</h2>
            <p className="register-subtitle">Join Woltish and start ordering today</p>
        </div>

        {errors.general && (
          <div className="error-text global-error">
            <span className="error-icon">⚠️</span> {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }} noValidate>

          <div className="input-group avatar-group">
            <div
              className={`avatar-picker ${errors.profileImage ? "avatar-error" : ""}`}
              onClick={() => fileInputRef.current.click()}
            >
              {profilePreview ? (
                <img src={profilePreview} alt="Preview" className="avatar-preview" />
              ) : (
                <span className="avatar-placeholder">Add<br/>Photo</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {errors.profileImage && (
              <div className="error-text">⚠️ {errors.profileImage}</div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Full name *</label>
            <input
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              className={errors.fullName ? "input-error-border" : ""}
            />
            {errors.fullName && <div className="error-text">⚠️ {errors.fullName}</div>}
          </div>

          {/* Username + Role */}
        <div className="form-row">
        <div className="input-group">
          <label className="input-label">Username *</label>
          <input type="text" name="username" placeholder="Choose a username"
          value={form.username} onChange={handleChange}
          className={errors.username ? "input-error-border" : ""} />
          {errors.username && <div className="error-text">⚠️ {errors.username}</div>}
        </div>

        <div className="input-group">
          <label className="input-label">I am a *</label>
          <select name="role" value={form.role} onChange={handleChange} className="form-select">
            <option value="user">Customer</option>
            <option value="owner">Restaurant Owner</option>
          </select>
        </div>
        </div>

        {/* Lat + Lng */}
        <div className="form-row">
        <div className="input-group">
        <label className="input-label">Latitude *</label>
        <input type="tel" inputMode="decimal" name="lat" placeholder="29-34" autoComplete="off"
          value={form.lat} onChange={handleChange}
          className={errors.lat ? "input-error-border" : ""} />
          {errors.lat && <div className="error-text">⚠️ {errors.lat}</div>}
        </div>

        <div className="input-group">
          <label className="input-label">Longitude *</label>
          <input type="tel" inputMode="decimal" name="lng" placeholder="34-36" autoComplete="off"
          value={form.lng} onChange={handleChange}
          className={errors.lng ? "input-error-border" : ""} />
          {errors.lng && <div className="error-text">⚠️ {errors.lng}</div>}
        </div>
        </div>

        {/* Phone */}
        <div className="input-group">
          <label className="input-label">Phone number *</label>
          <input type="tel" name="phone" placeholder="05X-XXX-XXXX"
            value={form.phone} onChange={handleChange}
            className={errors.phone ? "input-error-border" : ""} />
            {errors.phone && <div className="error-text">⚠️ {errors.phone}</div>}
        </div>

          <div className="form-row">
            <div className="input-group">
                <label className="input-label">Password *</label>
                <input
                type="password"
                name="password"
                placeholder="Min. 8 chars"
                value={form.password}
                onChange={handleChange}
                className={errors.password ? "input-error-border" : ""}
                />
                {errors.password && <div className="error-text">⚠️ {errors.password}</div>}
            </div>

            <div className="input-group">
                <label className="input-label">Confirm *</label>
                <input
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "input-error-border" : ""}
                />
                {errors.confirmPassword && <div className="error-text">⚠️ {errors.confirmPassword}</div>}
            </div>
          </div>

          <button type="submit" className="continue-btn" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="register-prompt">
          Already have an account?{" "}
         <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  </div>
  );
}

export default Register;