import React, { useEffect, useState } from 'react';
import { Users, Shield, UserCheck, Mail, Calendar } from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole } from '@visionguard/shared';
import { Card } from '../components/common/Card';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.auth.listUsers();
      setUsers(res.users);
    } catch (e) {
      console.error('Failed to load users', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const res = await api.auth.updateRole(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? res.user : u)));
    } catch (err: any) {
      alert(`Role change failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-extrabold text-white tracking-wide">Operator Access & RBAC Directory</h1>
        </div>
        <p className="text-xs text-slate-400">
          Manage system privileges across Admin, Security Analyst, and Viewer tiers
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] border-b border-white/[0.06] text-slate-400 font-mono uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=vg'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full bg-slate-800 border border-white/10"
                      />
                      <span className="font-semibold text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                        u.role === 'admin'
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                          : u.role === 'analyst'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-700/20 text-slate-400 border-slate-700/40'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-[#070B14] border border-white/10 rounded px-2.5 py-1 text-xs text-slate-200 outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="analyst">Analyst</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
