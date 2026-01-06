// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./login.jsx";
import Signup from "./signup.jsx";
import HomePage from "./homepage.jsx";
import LostItems from "./lostitems.jsx";
import FoundItems from "./founditems.jsx";
import About from "./about.jsx";
import Contact from "./contact.jsx";
import VerifyOtp from "./VerifyOtp.jsx";
import PostItem from "./PostItem.jsx";
import EditProfile from "./EditProfile.jsx"; // ✅ ADD THIS
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyResetOtp from "./VerifyResetOtp.jsx";
import ResetPassword from "./ResetPassword.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/lost-items" element={<LostItems />} />
        <Route path="/found-items" element={<FoundItems />} />
        <Route path="/post-item" element={<PostItem />} />
        <Route path="/edit-profile" element={<EditProfile />} /> {/* ✅ Registered Route */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
