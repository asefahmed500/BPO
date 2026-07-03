"use client";

import { useState, useEffect } from "react";
import {
  getAllUsers,
  updateUserRole,
  toggleUserBlock,
} from "@/lib/actions/user-admin-actions";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      setUsers(await getAllUsers());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    setActionLoading(userId);
    try {
      await updateUserRole(userId, role);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleBlock = async (userId: string, blocked: boolean) => {
    setActionLoading(userId);
    try {
      await toggleUserBlock(userId, !blocked);
      load();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <p className="text-muted text-sm mb-8">Manage platform users</p>

      <div className="bg-white rounded-2xl border border-hairline overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline bg-canvas">
              <th className="text-left px-4 py-3 text-muted font-medium">Name</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Email</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Role</th>
              <th className="text-left px-4 py-3 text-muted font-medium">Status</th>
              <th className="text-right px-4 py-3 text-muted font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted text-sm">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted text-sm">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user._id} className="border-b border-hairline last:border-0">
                  <td className="px-4 py-3 text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role || "user"}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={actionLoading === user._id}
                      className="text-xs border border-hairline rounded-lg px-2 py-1 bg-white text-ink focus:outline-none focus:border-ink"
                    >
                      <option value="user">User</option>
                      <option value="support">Support</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        user.isBlocked
                          ? "bg-red-50 text-red-700"
                          : "bg-green-50 text-green-700"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                      disabled={actionLoading === user._id}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                        user.isBlocked
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      } disabled:opacity-50`}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
