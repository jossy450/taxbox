import { Link, Outlet } from 'react-router-dom';

export default function PublicLegalLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/login" className="text-lg font-bold hover:text-blue-200">TaxBox NG</Link>
          <Link to="/login" className="text-sm text-blue-200 hover:text-white transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Outlet />
      </div>
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-3xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          <Link to="/login" className="hover:text-gray-600">Sign In</Link>
          <span className="mx-2">·</span>
          <Link to="/register" className="hover:text-gray-600">Register</Link>
        </div>
      </footer>
    </div>
  );
}
