import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchOverviewStats = createAsyncThunk(
  'dashboard/fetchOverviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchMonthlyStats = createAsyncThunk(
  'dashboard/fetchMonthlyStats',
  async ({ year, month }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      
      const response = await api.get(`/dashboard/monthly?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchStudentGrowthChart = createAsyncThunk(
  'dashboard/fetchStudentGrowthChart',
  async ({ year }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      
      const response = await api.get(`/dashboard/student-growth?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchTherapyStatsChart = createAsyncThunk(
  'dashboard/fetchTherapyStatsChart',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/dashboard/therapy-stats?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async ({ limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/recent-activities?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchTopTeachers = createAsyncThunk(
  'dashboard/fetchTopTeachers',
  async ({ limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/top-teachers?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    // Overview stats
    overviewStats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalUsers: 0,
      activeStudents: 0,
      activeClasses: 0,
      todayTherapySessions: 0,
      pendingTherapySessions: 0
    },
    
    // Monthly stats
    monthlyStats: {
      period: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
      newStudentsThisMonth: 0,
      therapySessionsThisMonth: 0,
      completedTherapySessionsThisMonth: 0,
      activeClassesThisMonth: 0
    },
    
    // Chart data
    studentGrowthChart: {
      year: new Date().getFullYear(),
      chartData: []
    },
    
    therapyStatsChart: {
      period: {},
      chartData: []
    },
    
    // Activities and teachers
    recentActivities: [],
    topTeachers: [],
    
    // Loading states
    isLoading: {
      overview: false,
      monthly: false,
      studentGrowth: false,
      therapyStats: false,
      activities: false,
      topTeachers: false
    },
    
    // Error states
    error: {
      overview: null,
      monthly: null,
      studentGrowth: null,
      therapyStats: null,
      activities: null,
      topTeachers: null
    }
  },
  reducers: {
    clearError: (state, action) => {
      const errorType = action.payload;
      if (errorType) {
        state.error[errorType] = null;
      } else {
        // Clear all errors
        Object.keys(state.error).forEach(key => {
          state.error[key] = null;
        });
      }
    },
    
    resetDashboard: (state) => {
      return {
        ...state,
        isLoading: Object.keys(state.isLoading).reduce((acc, key) => {
          acc[key] = false;
          return acc;
        }, {}),
        error: Object.keys(state.error).reduce((acc, key) => {
          acc[key] = null;
          return acc;
        }, {})
      };
    }
  },
  extraReducers: (builder) => {
    // Overview stats
    builder
      .addCase(fetchOverviewStats.pending, (state) => {
        state.isLoading.overview = true;
        state.error.overview = null;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.isLoading.overview = false;
        state.overviewStats = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.isLoading.overview = false;
        state.error.overview = action.payload;
      })
      
      // Monthly stats
      .addCase(fetchMonthlyStats.pending, (state) => {
        state.isLoading.monthly = true;
        state.error.monthly = null;
      })
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.isLoading.monthly = false;
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyStats.rejected, (state, action) => {
        state.isLoading.monthly = false;
        state.error.monthly = action.payload;
      })
      
      // Student growth chart
      .addCase(fetchStudentGrowthChart.pending, (state) => {
        state.isLoading.studentGrowth = true;
        state.error.studentGrowth = null;
      })
      .addCase(fetchStudentGrowthChart.fulfilled, (state, action) => {
        state.isLoading.studentGrowth = false;
        state.studentGrowthChart = action.payload;
      })
      .addCase(fetchStudentGrowthChart.rejected, (state, action) => {
        state.isLoading.studentGrowth = false;
        state.error.studentGrowth = action.payload;
      })
      
      // Therapy stats chart
      .addCase(fetchTherapyStatsChart.pending, (state) => {
        state.isLoading.therapyStats = true;
        state.error.therapyStats = null;
      })
      .addCase(fetchTherapyStatsChart.fulfilled, (state, action) => {
        state.isLoading.therapyStats = false;
        state.therapyStatsChart = action.payload;
      })
      .addCase(fetchTherapyStatsChart.rejected, (state, action) => {
        state.isLoading.therapyStats = false;
        state.error.therapyStats = action.payload;
      })
      
      // Recent activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoading.activities = true;
        state.error.activities = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoading.activities = false;
        state.recentActivities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoading.activities = false;
        state.error.activities = action.payload;
      })
      
      // Top teachers
      .addCase(fetchTopTeachers.pending, (state) => {
        state.isLoading.topTeachers = true;
        state.error.topTeachers = null;
      })
      .addCase(fetchTopTeachers.fulfilled, (state, action) => {
        state.isLoading.topTeachers = false;
        state.topTeachers = action.payload;
      })
      .addCase(fetchTopTeachers.rejected, (state, action) => {
        state.isLoading.topTeachers = false;
        state.error.topTeachers = action.payload;
      });
  }
});

export const { clearError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
