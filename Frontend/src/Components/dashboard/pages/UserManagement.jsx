import React, { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { FaUsers, FaSearch } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { store } from "../../../state/store";
import axios from "axios";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";

const createApiClient = () => {
  const api = axios.create({ baseURL: BASE_URL });
  api.interceptors.request.use((config) => {
    const token = store.getState().user.accessToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return api;
};

// --- Helper Components ---

const RoleBadge = ({ role }) => {
  const roleStyles = {
    admin: "bg-purple-100 text-purple-800",
    driver: "bg-yellow-100 text-yellow-800",
    passenger: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        roleStyles[role] || "bg-gray-100 text-gray-700"
      }`}
    >
      {role}
    </span>
  );
};

// --- THIS COMPONENT IS NOW CORRECT ---
const StatusToggle = ({ user, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(user.pkid, { is_active: !user.is_active });
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative inline-flex items-center cursor-pointer ${
        loading ? "cursor-not-allowed opacity-70" : ""
      }`}
    >
      {loading ? (
        <Loader2 className="animate-spin text-gray-400" size={20} />
      ) : (
        <div
          className={`group relative bg-white rounded-full duration-300 w-12   h-6 ring-2 
            ${user.is_active ? "ring-green-500" : "ring-red-500"}
          `}
        >
          <div
            className={`absolute top-1/2 -translate-y-1/2  left-0 h-5 w-5  rounded-full flex justify-center items-center transition-transform  duration-300
              ${
                user.is_active
                  ? "translate-x-6 bg-green-500"
                  : "translate-x-1 bg-red-500"
              }
              ${!loading && "group-hover:scale-95"}
            `}
          />
        </div>
      )}
    </button>
  );
};

// --- THIS COMPONENT IS NOW CORRECT ---
const EditRoleModal = ({ user, onClose, onSave }) => {
  const roles = [
    { value: "passenger", label: "Passenger" },
    { value: "driver", label: "Driver" },
    { value: "admin", label: "Admin" },
  ];
  const [selectedRole, setSelectedRole] = useState(
    roles.find((r) => r.value === user.role)
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // FIX: Pass an object with the key 'role', as expected by the backend serializer.
    await onSave(user.pkid, { role: selectedRole.value });
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="text-lg font-bold">ویرایش نقش برای{user.full_name}</h3>
        </div>
        <div className="p-5 space-y-4">
          <p>
            نقش جدید را برای این کاربر انتخاب کنید. توجه داشته باشید که ارتقا
            دادن کاربر به مدیر (Admin) دسترسی کامل به او می‌دهد.
          </p>
          <Select
            options={roles}
            value={selectedRole}
            onChange={setSelectedRole}
          />
        </div>
        <div className="p-4 bg-gray-50 flex justify-center gap-3 ">
          <button onClick={onClose} className="secondry-btn">
            لغو
          </button>
          <button
            onClick={handleSave}
            className=" flex items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white hover:bg-white hover:border hover:border-primary hover:text-primary focus:outline-none cursor-pointer  transition-colors duration-500"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "ذخیره تغییرات"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main Component ---
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const api = createApiClient();
    try {
      const response = await api.get("/api/v1/profiles/admin/users/");
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Could not load the list of users.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // This parent function now correctly receives a data OBJECT.
  const handleUpdateUser = async (userId, data) => {
    const api = createApiClient();
    try {
      await api.patch(`/api/v1/profiles/admin/users/${userId}/`, data);
      Swal.fire("Success", "User has been updated successfully.", "success");
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      Swal.fire("Error", "Failed to update user.", "error");
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        (user.full_name &&
          user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.username &&
          user.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  return (
    <>
      <AnimatePresence>
        {editingUser && (
          <EditRoleModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleUpdateUser}
          />
        )}
      </AnimatePresence>

      <div className="p-3 md:p-6 w-full">
        <div className="bg-white p-6  rounded-lg ">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center gap-3">
            <span className="p-2 rounded-full bg-gray-300">
              <FaUsers />
            </span>{" "}
            <span className="text-xl font-Ray_black text-gray-600">
              {" "}
              مدیریت کاربران
            </span>{" "}
          </h1>

          <div className="flex items-center mb-4 w-full max-w-md border border-gray-300 rounded-full overflow-hidden">
            <input
              type="text"
              placeholder="جستجو بر اساس نام، ایمیل، یا نام کاربری..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow py-2 pr-5 outline-none text-right placeholder-gray-400"
            />
            <div className="pl-4 pr-2 text-gray-400">
              <FaSearch size={20} />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full text-sm text-center text-gray-500">
                <thead className="text-base text-gray-700 uppercase bg-gray-300">
                  <tr>
                    <th className="px-5 py-3">نام کامل</th>
                    <th className="px-5 py-3">ایمیل</th>
                    <th className="px-5 py-3">نقش</th>
                    <th className="px-5 py-3">تاریخ پیوستن</th>
                    <th className="px-5 py-3 text-center">وضعیت فعال</th>
                    <th className="px-5 py-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.pkid}
                      className={`border-b hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-gray-100" : ""
                      } `}
                    >
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {user.full_name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{user.email}</td>
                      <td className="px-5 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {new Date(user.date_joined).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <StatusToggle user={user} onToggle={handleUpdateUser} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="font-medium text-primary hover:underline"
                        >
                          ویرایش نقش
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
