export default function SimpleApp() {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-primary">
          🎉 RepoTomo
        </h1>
        <p className="text-center text-gray-600">
          心理的安全性重視の報告書管理システム
        </p>
        <div className="mt-6 flex justify-center">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg">
            テストボタン
          </button>
        </div>
      </div>
    </div>
  )
}