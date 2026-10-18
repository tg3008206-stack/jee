import React, { useState } from 'react';
import { Users, Search, UserPlus, Shield, GraduationCap, BookOpen, CheckCircle, Ban, Edit2, Key, Info } from 'lucide-react';
import { DemoUser, UserRole } from '../../types';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';

interface AdminUsersProps {
  users: DemoUser[];
  onToggleUserStatus: (userId: string) => void;
  onAddUser: (user: DemoUser) => void;
  onUpdateUser: (user: DemoUser) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  onToggleUserStatus,
  onAddUser,
  onUpdateUser,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'examiners'>('students');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addRole, setAddRole] = useState<'student' | 'examiner'>('student');
  const [editingUser, setEditingUser] = useState<DemoUser | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('student123');
  const [formRollNumber, setFormRollNumber] = useState('SCH-2026-');
  const [formBatch, setFormBatch] = useState('Super-30 JEE 2026');
  const [formDepartment, setFormDepartment] = useState('Physics Faculty');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleOpenAdd = (role: 'student' | 'examiner') => {
    setAddRole(role);
    setFormName('');
    setFormEmail('');
    setFormUsername('');
    setFormPassword(role === 'student' ? 'student123' : 'examiner123');
    setFormRollNumber(role === 'student' ? `SCH-2026-${Math.floor(Math.random() * 899 + 100)}` : '');
    setFormBatch(role === 'student' ? 'Super-30 JEE 2026' : '');
    setFormDepartment(role === 'examiner' ? 'Physics Faculty' : '');
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: DemoUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormUsername(user.username || '');
    setFormPassword(user.password || 'demo123');
    setFormRollNumber(user.rollNumber || '');
    setFormBatch(user.batch || '');
    setFormDepartment(user.department || '');
    setFormErrors({});
  };

  const validateUserForm = () => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Full name is required';
    if (!formEmail.trim() || !formEmail.includes('@')) errors.email = 'Valid email is required';
    if (!formUsername.trim()) errors.username = 'Username is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    const initials = formName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newUser: DemoUser = {
      id: `usr-${Date.now()}`,
      name: formName,
      email: formEmail,
      username: formUsername.toLowerCase(),
      password: formPassword,
      role: addRole,
      rollNumber: addRole === 'student' ? formRollNumber : undefined,
      batch: addRole === 'student' ? formBatch : undefined,
      department: addRole === 'examiner' ? formDepartment : undefined,
      targetExam: addRole === 'student' ? 'JEE Advanced 2026' : undefined,
      status: 'Active',
      lastActive: 'Just registered',
      avatarInitials: initials || 'US',
    };

    onAddUser(newUser);
    showToast('Demo User Created', `${formName} added as demo ${addRole}`, 'success');
    setIsAddModalOpen(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !validateUserForm()) return;

    const updated: DemoUser = {
      ...editingUser,
      name: formName,
      email: formEmail,
      username: formUsername.toLowerCase(),
      password: formPassword,
      rollNumber: editingUser.role === 'student' ? formRollNumber : editingUser.rollNumber,
      batch: editingUser.role === 'student' ? formBatch : editingUser.batch,
      department: editingUser.role === 'examiner' ? formDepartment : editingUser.department,
    };

    onUpdateUser(updated);
    showToast('Demo User Updated', `${formName} profile updated successfully`, 'success');
    setEditingUser(null);
  };

  const filteredUsers = users.filter((u) => {
    const isMatchingRole = activeTab === 'students' ? u.role === 'student' : u.role === 'examiner';
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.rollNumber && u.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.batch && u.batch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchTerm.toLowerCase()));
    return isMatchingRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Demo User & Candidate Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage mock students, login credentials, roll identifiers, and faculty examiner assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('student')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Demo Student</span>
          </button>
          <button
            onClick={() => handleOpenAdd('examiner')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Demo Examiner</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'students'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Students ({users.filter((u) => u.role === 'student').length})
          </button>
          <button
            onClick={() => setActiveTab('examiners')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'examiners'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Examiners ({users.filter((u) => u.role === 'examiner').length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab} by name, roll, email, or batch...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Demo User & Identifier</th>
                <th className="py-3 px-4">Username & Demo Credentials</th>
                <th className="py-3 px-4">
                  {activeTab === 'students' ? 'Enrolled Batch' : 'Department & Assigned Exams'}
                </th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs shrink-0">
                        {user.avatarInitials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {user.rollNumber || user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-slate-800 font-medium">user: {user.username || user.email.split('@')[0]}</div>
                    <div className="text-slate-400">pass: {user.password || 'demo123'}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {activeTab === 'students' ? (
                      <div>
                        <div className="font-medium text-slate-900">{user.batch || 'Super-30 JEE 2026'}</div>
                        <div className="text-[11px] text-slate-500">{user.targetExam || 'JEE Advanced'}</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium text-slate-900">{user.department || 'Academic Committee'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {user.assignedExams ? `${user.assignedExams.length} tests assigned` : '3 tests assigned'}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {user.lastActive}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          onToggleUserStatus(user.id);
                          showToast(
                            `User Status Updated`,
                            `${user.name} is now ${user.status === 'Active' ? 'Deactivated' : 'Active'}`,
                            user.status === 'Active' ? 'warning' : 'success'
                          );
                        }}
                        className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          user.status === 'Active'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Register Demo ${addRole === 'student' ? 'Student Account' : 'Examiner Faculty'}`}
        subtitle="Add a simulated account to test the examination workflow"
      >
        <form onSubmit={handleSaveNewUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Siddharth Verma"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institutional Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="siddharth.v26@student.schlar.org"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Username</label>
              <input
                type="text"
                required
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="siddharth.verma"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Demo Password</label>
              <input
                type="text"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>

            {addRole === 'student' ? (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Roll Identifier</label>
                <input
                  type="text"
                  value={formRollNumber}
                  onChange={(e) => setFormRollNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department / Subject</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            )}
          </div>

          {addRole === 'student' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Enrolled Batch</label>
              <input
                type="text"
                value={formBatch}
                onChange={(e) => setFormBatch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Create Demo Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Demo User: ${editingUser.name}`}
          subtitle={`Role: ${editingUser.role.toUpperCase()}`}
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Password</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>

              {editingUser.role === 'student' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Roll Identifier</label>
                  <input
                    type="text"
                    value={formRollNumber}
                    onChange={(e) => setFormRollNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </div>

            {editingUser.role === 'student' && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Batch</label>
                <input
                  type="text"
                  value={formBatch}
                  onChange={(e) => setFormBatch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
