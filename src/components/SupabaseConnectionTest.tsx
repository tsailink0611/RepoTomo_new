import React, { useState, useEffect } from 'react'
import { supabase, isUsingMockData, testConnection } from '../lib/supabase'

export const SupabaseConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking')
  const [tableInfo, setTableInfo] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus('checking')
    setError('')
    
    if (isUsingMockData) {
      setConnectionStatus('failed')
      setError('モックデータモードです。環境変数を確認してください。')
      return
    }

    try {
      // 接続テスト
      const isConnected = await testConnection()
      
      if (isConnected) {
        setConnectionStatus('connected')
        
        // テーブル情報を取得
        const tables = ['staff', 'report_templates', 'submissions', 'stores', 'sales_data']
        const tableData = []
        
        for (const tableName of tables) {
          try {
            const { count, error } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true })
            
            tableData.push({
              name: tableName,
              count: error ? 'エラー' : count || 0,
              status: error ? '❌' : '✅'
            })
          } catch (err) {
            tableData.push({
              name: tableName,
              count: 'エラー',
              status: '❌'
            })
          }
        }
        
        setTableInfo(tableData)
      } else {
        setConnectionStatus('failed')
        setError('Supabaseへの接続に失敗しました')
      }
    } catch (err) {
      setConnectionStatus('failed')
      setError(err instanceof Error ? err.message : '不明なエラー')
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">🔌 Supabase接続テスト</h2>
      
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${
            connectionStatus === 'checking' ? 'bg-yellow-400 animate-pulse' :
            connectionStatus === 'connected' ? 'bg-green-500' :
            'bg-red-500'
          }`} />
          <span className="text-lg font-medium">
            {connectionStatus === 'checking' && '接続確認中...'}
            {connectionStatus === 'connected' && '✅ 接続成功！'}
            {connectionStatus === 'failed' && '❌ 接続失敗'}
          </span>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}
      </div>

      {connectionStatus === 'connected' && tableInfo.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">📊 データベース状態</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">テーブル名</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">レコード数</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tableInfo.map((table, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{table.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{table.count}</td>
                    <td className="px-4 py-2 text-sm">{table.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={checkConnection}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition"
        >
          再テスト
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600">
        <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL?.substring(0, 30)}...</p>
        <p><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 30)}...</p>
      </div>
    </div>
  )
}