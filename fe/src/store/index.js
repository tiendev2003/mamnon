import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import classSlice from "./classSlice";
import studentSlice from "./studentSlice";
import teacherSlice from "./teacherSlice";
import scheduleSlice from "./scheduleSlice";
import therapySlice from "./therapySlice";
import userSlice from "./userSlice";
import dashboardSlice from "./dashboardSlice";
import reportSlice from "./reportSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    classes: classSlice,
    students: studentSlice,
    teachers: teacherSlice,
    schedules: scheduleSlice,
    therapySessions: therapySlice,
    users: userSlice,
    dashboard: dashboardSlice,
    reports: reportSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: true,
});
