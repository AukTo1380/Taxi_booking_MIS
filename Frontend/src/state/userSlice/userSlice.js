import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const getErrorMessage = (error) => {
  const errorData = error.response?.data;
  if (!errorData) return error.message || "An unknown error occurred.";
  if (errorData.detail) return errorData.detail;
  if (typeof errorData === "string") return errorData;
  return Object.entries(errorData)
    .map(
      ([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
    )
    .join("; ");
};

let store;

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  try {
    const token = store.getState().user.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn(
      "Could not get token for request. Store might not be injected yet."
    );
  }
  return config;
});


export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/v1/profiles/me/");
      return response.data.profile; // Return the nested profile object directly
    } catch (error) {
      toast.error("Could not load profile.");
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const profilePayload = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (
          key === "profile_photo" &&
          profileData.profile_photo instanceof File
        ) {
          profilePayload.append(key, profileData.profile_photo);
        } else if (profileData[key] != null && !(key === "profile_photo")) {
          profilePayload.append(key, profileData[key]);
        }
      });

      await api.put("/api/v1/profiles/me/update/", profilePayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      const updatedProfile = await dispatch(fetchUserProfile()).unwrap();
      return updatedProfile;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message || "Failed to update profile.");
      return rejectWithValue(message);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const endpoint = `/api/v1/auth/register/`;
      const response = await axios.post(`${BASE_URL}${endpoint}`, userData);
      toast.success("Registration successful! Please sign in.");
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const signIn = createAsyncThunk(
  "user/signIn",
  async (credentials, { rejectWithValue }) => {
    try {
      // Step 1: Get the access and refresh tokens
      const tokenResponse = await axios.post(
        `${BASE_URL}/api/v1/auth/token/`,
        credentials
      );
      const { access, refresh } = tokenResponse.data;

      const profileResponse = await axios.get(
        `${BASE_URL}/api/v1/profiles/me/`,
        {
          headers: { Authorization: `Bearer ${access}` },
        }
      );

      const profileData = profileResponse.data.profile;
      toast.success("Login successful!");

      // Return a clean payload for the reducer
      return {
        accessToken: access,
        refreshToken: refresh,
        profile: profileData,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  currentUser: null,
  profile: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signOutSuccess: (state) => {
      Object.assign(state, initialState); 
      toast.success("You have been signed out.");
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.profile = action.payload.profile;
        state.currentUser = {
          id: action.payload.profile.user_pkid,
          email: action.payload.profile.email,
          fullName: action.payload.profile.full_name,
          role: action.payload.profile.role,
        };
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Profile Reducers ---
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        // Also update currentUser in case names/roles have changed
        state.currentUser = {
          id: action.payload.user_pkid,
          email: action.payload.email,
          fullName: action.payload.full_name,
          role: action.payload.role,
        };
        state.loading = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.currentUser = {
          id: action.payload.user_pkid,
          email: action.payload.email,
          fullName: action.payload.full_name,
          role: action.payload.role,
        };
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { signOutSuccess, clearUserError } = userSlice.actions;
export default userSlice.reducer;

// This function allows the axios interceptor to access the Redux store
export const injectStore = (_store) => {
  store = _store;
};
