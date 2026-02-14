import { Link } from 'react-router-dom';

export function Header({ onReset }) {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3">
                        <img src="/img/logo.png" alt="Logo" className="h-8 w-8" />
                        <Link to="/" className="flex items-center">
                            <h1 className="text-xl font-bold">
                                <span className="text-gray-900">Universal</span>
                                <span className="text-red-600 ml-1">Differencer</span>
                            </h1>
                        </Link>
                    </div>
                    <nav className="flex items-center space-x-4">
                        <button
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Reset
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
}
