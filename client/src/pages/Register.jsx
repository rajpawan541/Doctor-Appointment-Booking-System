import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/register.css";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_DOMAIN;

function Register() {
  const [file, setFile] = useState("");
  const [loading, setLoading] = useState(false);
  const [formDetails, setFormDetails] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confpassword: "",
  });
  const navigate = useNavigate();

  const inputChange = (e) => {
    const { name, value } = e.target;
    return setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const onUpload = async (element) => {
    setLoading(true);
  
    // Check file type
    if (element.type !== "image/jpeg" && element.type !== "image/png") {
      setLoading(false);
      toast.error("Please select an image in jpeg or png format");
      return;
    }
  
    // Check file size (optional)
    if (element.size > 5 * 1024 * 1024) { // 5MB
      setLoading(false);
      toast.error("File size must be less than 5MB");
      return;
    }
  
    const data = new FormData();
    data.append("file", element);
    data.append("upload_preset", process.env.REACT_APP_CLOUDINARY_PRESET);
    data.append("cloud_name", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
  
    try {
      const response = await fetch(process.env.REACT_APP_CLOUDINARY_BASE_URL, {
        method: "POST",
        body: data,
      });
  
      if (!response.ok) {
        throw new Error("Error uploading image to Cloudinary");
      }
  
      const responseData = await response.json();
      setFile(responseData.url.toString());
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error uploading image. Please try again.");
      console.error("Upload error:", error);
    }
  };
  

  const formSubmit = async (e) => {
    try {
      e.preventDefault();
  
      if (loading) return;
      if (file === "") return;
  
      const { firstname, lastname, email, password, confpassword } = formDetails;
  
      // Validate form inputs
      if (!firstname || !lastname || !email || !password || !confpassword) {
        return toast.error("Input fields should not be empty");
      } else if (firstname.length < 3) {
        return toast.error("First name must be at least 3 characters long");
      } else if (lastname.length < 3) {
        return toast.error("Last name must be at least 3 characters long");
      } else if (password.length < 5) {
        return toast.error("Password must be at least 5 characters long");
      } else if (password !== confpassword) {
        return toast.error("Passwords do not match");
      }
  
      const response = await axios.post("/user/register", {
        firstname,
        lastname,
        email,
        password,
        pic: file,
      });
  
      // Handle successful response
      toast.success("User registered successfully");
      return navigate("/login");
  
    } catch (error) {
      // Log and display detailed error response
      console.error("Error response:", error.response); // View the error in console
      toast.error(`Registration failed: ${error.response?.data?.message || "Unknown error"}`);
    }
  };
  
  return (
    <section className="register-section flex-center">
      <div className="register-container flex-center">
        <h2 className="form-heading">Sign Up</h2>
        <form
          onSubmit={formSubmit}
          className="register-form"
        >
          <input
            type="text"
            name="firstname"
            className="form-input"
            placeholder="Enter your first name"
            value={formDetails.firstname}
            onChange={inputChange}
          />
          <input
            type="text"
            name="lastname"
            className="form-input"
            placeholder="Enter your last name"
            value={formDetails.lastname}
            onChange={inputChange}
          />
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Enter your email"
            value={formDetails.email}
            onChange={inputChange}
          />
          <input
            type="file"
            onChange={(e) => onUpload(e.target.files[0])}
            name="profile-pic"
            id="profile-pic"
            className="form-input"
          />
          <input
            type="password"
            name="password"
            className="form-input"
            placeholder="Enter your password"
            value={formDetails.password}
            onChange={inputChange}
          />
          <input
            type="password"
            name="confpassword"
            className="form-input"
            placeholder="Confirm your password"
            value={formDetails.confpassword}
            onChange={inputChange}
          />
          <button
            type="submit"
            className="btn form-btn"
            disabled={loading ? true : false}
          >
            sign up
          </button>
        </form>
        <p>
          Already a user?{" "}
          <NavLink
            className="login-link"
            to={"/login"}
          >
            Log in
          </NavLink>
        </p>
      </div>
    </section>
  );
}

export default Register;
