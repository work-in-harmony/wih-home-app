import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: "",
  role: "MEMBER",
  subscribed: false
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.subscribed = action.payload.subscribed || false;
    },
    clearUser: (state) => {
      state.email = "";
      state.role = "MEMBER";
      state.subscribed = false;
    },
  },
}); 

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;