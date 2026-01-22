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
import EditProfile from "./EditProfile.jsx";
import ForgotPassword from "./ForgotPassword.jsx";
import VerifyResetOtp from "./VerifyResetOtp.jsx";
import ResetPassword from "./ResetPassword.jsx";
import ItemDetails from "./ItemDetails.jsx"; // ✅ ADD THIS
import Chat from "./Chat.jsx"; // ✅ ADD THIS
import { ToastProvider } from "./components/ToastContext.jsx";
import LandingPage from "./LandingPage.jsx";
import MyItems from "./MyItems.jsx";

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<LandingPage />} />
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
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* New Routes */}
          <Route path="/items/:id" element={<ItemDetails />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/my-items" element={<MyItems />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
