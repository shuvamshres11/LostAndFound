import { createSlice } from "@reduxjs/toolkit";

/* ---------- PASSWORD VALIDATION ---------- */
const validatePassword = (password) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;

  if (!hasLength)
    return "Password must be at least 8 characters long";
  if (!hasUppercase)
    return "Password must contain at least one uppercase letter";
  if (!hasSpecial)
    return "Password must contain at least one special character";

  return "";
};

/* ---------- INITIAL STATE ---------- */
const initialState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  otp: "",
  error: "",
};

/* ---------- SLICE ---------- */
const signupSlice = createSlice({
  name: "signup",
  initialState,
  reducers: {
    /* Full Name */
    setFullName(state, action) {
      state.fullName = action.payload;
    },

    /* Email */
    setEmail(state, action) {
      state.email = action.payload;
    },

    /* Password */
    setPassword(state, action) {
      state.password = action.payload;

      // Validate password rules
      state.error = validatePassword(action.payload);

      // If confirm password exists, re-check match
      if (
        state.confirmPassword &&
        state.confirmPassword !== action.payload
      ) {
        state.error = "Passwords do not match";
      }
    },

    /* Confirm Password */
    setConfirmPassword(state, action) {
      state.confirmPassword = action.payload;

      if (state.password !== action.payload) {
        state.error = "Passwords do not match";
      } else {
        state.error = validatePassword(state.password);
      }
    },

    /* OTP */
    setOtp(state, action) {
      state.otp = action.payload;
    },

    /* Clear Error */
    clearError(state) {
      state.error = "";
    },

    /* Reset after success (optional but good practice) */
    resetSignup(state) {
      Object.assign(state, initialState);
    },
  },
});

/* ---------- EXPORTS ---------- */
export const {
  setFullName,
  setEmail,
  setPassword,
  setConfirmPassword,
  setOtp,
  clearError,
  resetSignup,
} = signupSlice.actions;

export default signupSlice.reducer;
