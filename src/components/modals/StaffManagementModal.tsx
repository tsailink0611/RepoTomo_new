import React, { useState } from 'react'
import { useStaff } from '../../hooks/useStaff'

interface StaffManagementModalProps {
  onClose: () => void
}

// スタッフ管理モーダル（管理者用）
export function StaffManagementModal({ onClose }: StaffManagementModalProps) {
  const { staff, addStaff, updateStaff, deleteStaff, toggleStaffActive, getStaffStats, isLoading } = useStaff()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [formData, setFormData] = useState({
    staff_id: '',
    name: '',
    email: '',
    role: 'STAFF' as 'STAFF' | 'MANAGER' | 'ADMIN',
    department: '',
    position: '',
    line_user_id: '',
    is_active: true
  })

  const stats = getStaffStats()

  const resetFormData = () => {
    setFormData({
      staff_id: '',
      name: '',
      email: '',
      role: 'STAFF',
      department: '',
      position: '',
      line_user_id: '',
      is_active: true
    })
    setEditingStaff(null)
  }

  const resetForm = () => {
    resetFormData()
    setShowAddForm(false)
  }

  const handleAdd = () => {
    resetFormData()
    setShowAddForm(true)
  }

  const handleEdit = (staffMember: any) => {
    setEditingStaff(staffMember)
    setFormData({
      staff_id: staffMember.staff_id,
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      department: staffMember.department || '',
      position: staffMember.position || '',
      line_user_id: staffMember.line_user_id || '',
      is_active: staffMember.is_active
    })
    setShowAddForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.staff_id || !formData.name || !formData.email) {
      alert('必須項目を入力してください')
      return
    }

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData)
        alert('スタッフ情報を更新しました')
      } else {
        await addStaff(formData)
        alert('新しいスタッフを追加しました')
      }
      resetForm()
    } catch (error) {
      console.error('操作エラー:', error)
      alert(`操作に失敗しました：${error.message}`)
    }
  }

  const handleDelete = async (staffMember: any) => {
    if (!confirm(`${staffMember.name}さんを削除しますか？この操作は取り消せません。`)) return

    try {
      await deleteStaff(staffMember.id)
      alert('スタッフを削除しました')
    } catch (error) {
      console.error('削除エラー:', error)
      alert(`削除に失敗しました：${error.message}`)
    }
  }

  const handleToggleActive = async (staffMember: any) => {
    try {
      await toggleStaffActive(staffMember.id)
    } catch (error) {
      console.error('状態変更エラー:', error)
      alert(`状態変更に失敗しました：${error.message}`)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'MANAGER':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">スタッフ管理</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>

          {/* 統計情報 */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <p className="text-sm text-gray-600">総スタッフ数</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-sm text-gray-600">アクティブ</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.managers}</div>
              <p className="text-sm text-gray-600">管理者</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
              <p className="text-sm text-gray-600">システム管理者</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withLine}</div>
              <p className="text-sm text-gray-600">LINE連携済み</p>
            </div>
          </div>

          {showAddForm ? (
            // 追加/編集フォーム
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">
                {editingStaff ? `${editingStaff.name}さんの情報を編集` : '新しいスタッフを追加'}
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    スタッフID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    氏名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="田中太郎"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="tanaka@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="STAFF">スタッフ</option>
                    <option value="MANAGER">管理者</option>
                    <option value="ADMIN">システム管理者</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">部署</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="営業部"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">役職名</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="主任"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINE User ID</label>
                  <input
                    type="text"
                    value={formData.line_user_id}
                    onChange={(e) => setFormData({...formData, line_user_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="LINE連携時に自動設定されます"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActiveStaff"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-3"
                />
                <label htmlFor="isActiveStaff" className="text-sm font-medium text-gray-700">
                  アクティブ（システムを使用可能）
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
                >
                  {editingStaff ? '更新する' : '追加する'}
                </button>
              </div>
            </div>
          ) : (
            // スタッフ一覧
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">スタッフ一覧</h3>
                <button
                  onClick={handleAdd}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 md:px-4 py-2 rounded-lg transition text-sm md:text-base"
                >
                  + 新規追加
                </button>
              </div>

              <div className="grid gap-4">
                {staff.map((staffMember) => (
                  <div key={staffMember.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{staffMember.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(staffMember.role)}`}>
                              {staffMember.role}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              staffMember.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {staffMember.is_active ? 'アクティブ' : '非アクティブ'}
                            </span>
                            {staffMember.line_user_id && (
                              <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-800">
                                LINE連携済み
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {staffMember.staff_id} | {staffMember.email}
                          </div>
                          {staffMember.department && (
                            <div className="text-sm text-gray-500">
                              {staffMember.department} {staffMember.position && `・ ${staffMember.position}`}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleActive(staffMember)}
                          className={`px-3 py-1 rounded text-sm transition ${
                            staffMember.is_active
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {staffMember.is_active ? '無効化' : '有効化'}
                        </button>
                        <button
                          onClick={() => handleEdit(staffMember)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(staffMember)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}