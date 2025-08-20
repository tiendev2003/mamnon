import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '../services/api'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/users')
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' })
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/users/${id}`)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch user' })
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/users', userData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create user' })
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, ...userData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData)
      return response.data.data || response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' })
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/users/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete user' })
    }
  }
)

export const updateUserStatus = createAsyncThunk(
  'users/updateUserStatus',
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { isActive })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user status' })
    }
  }
)

export const changeUserPassword = createAsyncThunk(
  'users/changeUserPassword',
  async ({ id, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${id}/change-password`, { newPassword })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to change password' })
    }
  }
)

const initialState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch User By Id
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload.data || action.payload
        state.error = null
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create User
      .addCase(createUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users.push(action.payload.data || action.payload)
        state.error = null
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedUser = action.payload.data || action.payload
        const index = state.users.findIndex(u => u._id === updatedUser._id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
        state.error = null
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.users = state.users.filter(u => u._id !== action.payload)
        state.error = null
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update User Status
      .addCase(updateUserStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedUser = action.payload.data || action.payload
        const index = state.users.findIndex(u => u._id === updatedUser._id)
        if (index !== -1) {
          state.users[index] = updatedUser
        }
        state.error = null
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Change User Password
      .addCase(changeUserPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changeUserPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { clearError, clearCurrentUser } = userSlice.actions

export default userSlice.reducer

// Selectors
export const selectUsers = (state) => state.users.users
export const selectCurrentUser = (state) => state.users.currentUser
export const selectUsersLoading = (state) => state.users.isLoading
export const selectUsersError = (state) => state.users.error
