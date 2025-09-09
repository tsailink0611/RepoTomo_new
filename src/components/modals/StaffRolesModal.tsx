import React, { useState } from 'react'
import { useStaff } from '../../hooks/useStaff'

interface StaffRolesModalProps {
  onClose: () => void
}

// スタッフ権限設定モーダル（管理者用）
export function StaffRolesModal({ onClose }: StaffRolesModalProps) {
  const { staff, updateStaff, getStaffStats } = useStaff()
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [newRole, setNewRole] = useState<'STAFF' | 'MANAGER' | 'ADMIN'>('STAFF')

  const handleRoleChange = async () => {
    if (!selectedStaff) return

    try {
      await updateStaff(selectedStaff.id, { role: newRole })
      alert(`${selectedStaff.name}さんの権限を${newRole}に変更しました`)
      setSelectedStaff(null)
    } catch (error) {
      console.error('権限変更エラー:', error)
      alert(`権限変更に失敗しました：${error.message}`)
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'システム全体の管理権限'
      case 'MANAGER':
        return '管理ダッシュボードへのアクセス権限'
      default:
        return '基本的な報告書提出権限'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">スタッフ権限設定</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ 権限の変更は慎重に行ってください。システム管理者権限を与えると、すべての機能にアクセス可能になります。
              </p>
            </div>

            {selectedStaff ? (
              // 権限変更フォーム
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {selectedStaff.name}さんの権限を変更
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">現在の権限:</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                      {selectedStaff.role}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({getRoleDescription(selectedStaff.role)})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    新しい権限
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="STAFF">STAFF - 基本権限</option>
                    <option value="MANAGER">MANAGER - 管理者権限</option>
                    <option value="ADMIN">ADMIN - システム管理者権限</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    {getRoleDescription(newRole)}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedStaff(null)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleRoleChange}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    権限を変更
                  </button>
                </div>
              </div>
            ) : (
              // スタッフ選択一覧
              <div className="grid gap-4">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{staffMember.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              staffMember.role === 'ADMIN' 
                                ? 'bg-red-100 text-red-800'
                                : staffMember.role === 'MANAGER'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {staffMember.role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {staffMember.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getRoleDescription(staffMember.role)}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedStaff(staffMember)
                          setNewRole(staffMember.role)
                        }}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        権限を変更
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}