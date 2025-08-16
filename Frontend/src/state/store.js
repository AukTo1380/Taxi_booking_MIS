import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import userReducer, { injectStore } from "./userSlice/userSlice.js";
import themeReducer from "./Theme/themeSlice";
// import checkoutReducer from "./checkoutSlice/checkoutSlice";
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  // checkout: checkoutReducer,
  userSettings: userReducer,
});
const persistConfig = {
  key: "root",
  storage,
  version: 1,
  blacklist: ["checkout"],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

injectStore(store);
export const persistor = persistStore(store);
