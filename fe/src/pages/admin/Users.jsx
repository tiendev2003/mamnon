import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  changeUserPassword,
  clearError,
} from "../../store/userSlice";
import Table from "../../components/UI/Table";
import Modal from "../../components/UI/Modal";
import Button from "../../components/UI/Button";
import { FiCheckCircle, FiLock, FiPause, FiPlus, FiUnlock } from "react-icons/fi";

const Users = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    role: "staff",
    position: "",
    phoneNumber: "",
    password: "",
    permissions: [],
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch]);

  const columns = [
    {
      key: "fullName",
      title: "Họ tên",
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "username",
      title: "Tài khoản",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "role",
      title: "Vai trò",
      render: (value) => {
        const roleLabels = {
          admin: "Quản trị viên",
          staff: "Nhân viên",
        };
        return (
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              value === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {roleLabels[value] || value}
          </span>
        );
      },
    },
    {
      key: "position",
      title: "Chức vụ",
    },
    {
      key: "phoneNumber",
      title: "Số điện thoại",
      render: (value) => value || "-",
    },
    {
      key: "lastLogin",
      title: "Đăng nhập cuối",
      render: (value) => {
        if (!value) return "Chưa đăng nhập";
        return new Date(value).toLocaleDateString("vi-VN");
      },
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {value ? "Hoạt động" : "Tạm khóa"}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(row);
            }}
            className={`text-xs px-2 py-1 rounded ${
              value
                ? "text-red-600 hover:bg-red-50"
                : "text-green-600 hover:bg-green-50"
            }`}
            title={value ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
          >
            {
              value ? <FiLock className="w-4 h-4" /> : <FiUnlock className="w-4 h-4" />
            }
          </button>
        </div>
      ),
    },
  ];

  const availablePermissions = [
    { value: "manage_students", label: "Quản lý học sinh" },
    { value: "manage_teachers", label: "Quản lý giáo viên" },
    { value: "manage_classes", label: "Quản lý lớp học" },
    { value: "manage_therapy", label: "Quản lý trị liệu" },
    { value: "view_reports", label: "Xem báo cáo" },
    { value: "manage_users", label: "Quản lý tài khoản" },
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: "",
      email: "",
      fullName: "",
      role: "staff",
      position: "",
      phoneNumber: "",
      password: "",
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      position: user.position || "",
      phoneNumber: user.phoneNumber || "",
      password: "", // Không hiển thị mật khẩu hiện tại
      permissions: user.permissions || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user) => {
    if (
      window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${user.fullName}?`)
    ) {
      try {
        await dispatch(deleteUser(user._id)).unwrap();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Có lỗi xảy ra khi xóa tài khoản");
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await dispatch(
        updateUserStatus({
          id: user._id,
          isActive: !user.isActive,
        })
      ).unwrap();
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
    }
  };

  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setPasswordData({
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!editingUser && !formData.password) {
      alert("Vui lòng nhập mật khẩu cho tài khoản mới");
      return;
    }

    const processedData = { ...formData };

    // Nếu là edit và không nhập password mới thì bỏ trường password
    if (editingUser && !formData.password) {
      delete processedData.password;
    }

    try {
      if (editingUser) {
        await dispatch(
          updateUser({
            id: editingUser._id,
            ...processedData,
          })
        ).unwrap();
      } else {
        await dispatch(createUser(processedData)).unwrap();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Có lỗi xảy ra khi lưu thông tin tài khoản");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      await dispatch(
        changeUserPassword({
          id: selectedUser._id,
          newPassword: passwordData.newPassword,
        })
      ).unwrap();
      setIsPasswordModalOpen(false);
      alert("Đổi mật khẩu thành công");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "permissions") {
      const updatedPermissions = checked
        ? [...formData.permissions, value]
        : formData.permissions.filter((p) => p !== value);

      setFormData((prev) => ({
        ...prev,
        permissions: updatedPermissions,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const activeUsers = users.filter((u) => u.isActive);
  const inactiveUsers = users.filter((u) => !u.isActive);
  const adminUsers = users.filter((u) => u.role === "admin");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          
        </div>
        <Button onClick={handleAddUser} icon={FiPlus}>
          Tạo tài khoản
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Có lỗi xảy ra khi tải dữ liệu:{" "}
            {error.message || error.error || "Lỗi không xác định"}
          </p>
        </div>
      )}

      {/* Stats */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <FiCheckCircle className="w-6 h-6 mr-3 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Tổng tài khoản</p>
                <p className="text-xl font-bold">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
             {/* icon check */}
              <FiCheckCircle className="w-6 h-6 mr-3 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-xl font-bold text-green-600">
                  {activeUsers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
               <FiPause className="w-6 h-6 mr-3 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Tạm khóa</p>
                <p className="text-xl font-bold text-red-600">
                  {inactiveUsers.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center">
               <FiCheckCircle className="w-6 h-6 mr-3 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Quản trị viên</p>
                <p className="text-xl font-bold text-purple-600">
                  {adminUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <Table
          columns={columns}
          data={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          actions={(row) => (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleChangePassword(row);
              }}
            >
              � Đổi mật khẩu
            </Button>
          )}
        />
      )}

      {/* Create/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
        size="large"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tài khoản <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu{" "}
                {!editingUser && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!editingUser}
                placeholder={
                  editingUser ? "Để trống nếu không đổi mật khẩu" : ""
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="staff">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                placeholder="VD: Giáo viên, Điều dưỡng, Kế toán..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                pattern="[0-9]{10}"
                placeholder="0123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quyền hạn
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label key={permission.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="permissions"
                    value={permission.value}
                    checked={formData.permissions.includes(permission.value)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {permission.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit">
              {editingUser ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={`Đổi mật khẩu - ${selectedUser?.fullName}`}
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordInputChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordInputChange}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button type="submit">Đổi mật khẩu</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
