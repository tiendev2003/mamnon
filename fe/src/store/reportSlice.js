import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunks
export const fetchOverviewReport = createAsyncThunk(
  'reports/fetchOverviewReport',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/reports/overview?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchStudentReport = createAsyncThunk(
  'reports/fetchStudentReport',
  async ({ startDate, endDate, status, classId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      if (classId) params.append('classId', classId);
      
      const response = await api.get(`/reports/students?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchTeacherReport = createAsyncThunk(
  'reports/fetchTeacherReport',
  async ({ startDate, endDate, teacherId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (teacherId) params.append('teacherId', teacherId);
      
      const response = await api.get(`/reports/teachers?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchTherapyReport = createAsyncThunk(
  'reports/fetchTherapyReport',
  async ({ startDate, endDate, status, teacherId, studentId }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      if (teacherId) params.append('teacherId', teacherId);
      if (studentId) params.append('studentId', studentId);
      
      const response = await api.get(`/reports/therapy?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

export const fetchClassReport = createAsyncThunk(
  'reports/fetchClassReport',
  async ({ startDate, endDate, status }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (status) params.append('status', status);
      
      const response = await api.get(`/reports/classes?${params}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Có lỗi xảy ra' });
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState: {
    // Overview report
    overviewReport: {
      period: {},
      totalStudents: 0,
      totalTeachers: 0,
      totalClasses: 0,
      totalTherapySessions: 0,
      activeStudents: 0,
      completedTherapySessions: 0,
      cancelledTherapySessions: 0,
      therapySuccessRate: 0,
      therapyCancellationRate: 0
    },
    
    // Student report
    studentReport: {
      period: {},
      filters: {},
      students: [],
      statistics: {
        total: 0,
        byClass: [],
        byStatus: []
      }
    },
    
    // Teacher report
    teacherReport: {
      period: {},
      filters: {},
      teachers: []
    },
    
    // Therapy report
    therapyReport: {
      period: {},
      filters: {},
      sessions: [],
      statistics: {
        total: 0,
        byStatus: [],
        byMonth: [],
        byTeacher: []
      }
    },
    
    // Class report
    classReport: {
      period: {},
      filters: {},
      classes: [],
      statistics: {
        totalClasses: 0,
        totalStudents: 0,
        averageClassSize: 0
      }
    },
    
    // Loading states
    isLoading: {
      overview: false,
      student: false,
      teacher: false,
      therapy: false,
      class: false
    },
    
    // Error states
    error: {
      overview: null,
      student: null,
      teacher: null,
      therapy: null,
      class: null
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
    
    resetReports: (state) => {
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
    // Overview report
    builder
      .addCase(fetchOverviewReport.pending, (state) => {
        state.isLoading.overview = true;
        state.error.overview = null;
      })
      .addCase(fetchOverviewReport.fulfilled, (state, action) => {
        state.isLoading.overview = false;
        state.overviewReport = action.payload;
      })
      .addCase(fetchOverviewReport.rejected, (state, action) => {
        state.isLoading.overview = false;
        state.error.overview = action.payload;
      })
      
      // Student report
      .addCase(fetchStudentReport.pending, (state) => {
        state.isLoading.student = true;
        state.error.student = null;
      })
      .addCase(fetchStudentReport.fulfilled, (state, action) => {
        state.isLoading.student = false;
        state.studentReport = action.payload;
      })
      .addCase(fetchStudentReport.rejected, (state, action) => {
        state.isLoading.student = false;
        state.error.student = action.payload;
      })
      
      // Teacher report
      .addCase(fetchTeacherReport.pending, (state) => {
        state.isLoading.teacher = true;
        state.error.teacher = null;
      })
      .addCase(fetchTeacherReport.fulfilled, (state, action) => {
        state.isLoading.teacher = false;
        state.teacherReport = action.payload;
      })
      .addCase(fetchTeacherReport.rejected, (state, action) => {
        state.isLoading.teacher = false;
        state.error.teacher = action.payload;
      })
      
      // Therapy report
      .addCase(fetchTherapyReport.pending, (state) => {
        state.isLoading.therapy = true;
        state.error.therapy = null;
      })
      .addCase(fetchTherapyReport.fulfilled, (state, action) => {
        state.isLoading.therapy = false;
        state.therapyReport = action.payload;
      })
      .addCase(fetchTherapyReport.rejected, (state, action) => {
        state.isLoading.therapy = false;
        state.error.therapy = action.payload;
      })
      
      // Class report
      .addCase(fetchClassReport.pending, (state) => {
        state.isLoading.class = true;
        state.error.class = null;
      })
      .addCase(fetchClassReport.fulfilled, (state, action) => {
        state.isLoading.class = false;
        state.classReport = action.payload;
      })
      .addCase(fetchClassReport.rejected, (state, action) => {
        state.isLoading.class = false;
        state.error.class = action.payload;
      });
  }
});

export const { clearError, resetReports } = reportSlice.actions;
export default reportSlice.reducer;
