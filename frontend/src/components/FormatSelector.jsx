export function FormatSelector({ selectedFormat, onFormatChange }) {
    const formats = [
        { id: 'xml', label: 'XML', icon: 'M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z' },
        { id: 'json', label: 'JSON', icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' },
        { id: 'text', label: 'Text', icon: 'M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z' },
        { id: 'csv', label: 'CSV', icon: 'M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v2H4V4zm0 4h4v2H4V8zm6 0h6v2h-6V8zm-6 4h4v2H4v-2zm6 0h6v2h-6v-2z' },
        { id: 'yaml', label: 'YAML', icon: 'M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z' }
    ];

    return (
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Universal File Comparison</h2>
            <p className="text-gray-600 mb-6">Choose your format and compare files with enhanced validation</p>

            <div className="flex flex-wrap justify-center gap-2 sm:inline-flex sm:bg-gray-100 sm:rounded-lg sm:p-1 mb-6">
                {formats.map((format) => (
                    <button
                        key={format.id}
                        onClick={() => onFormatChange(format.id)}
                        className={`px-4 sm:px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${selectedFormat === format.id
                                ? 'bg-blue-600 text-white focus:ring-blue-500'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                            }`}
                    >
                        <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d={format.icon} />
                        </svg>
                        <span className="hidden sm:inline">{format.label}</span>
                        <span className="sm:hidden">{format.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
