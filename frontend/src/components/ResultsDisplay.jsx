import '../styles/highlight.css';

export function ResultsDisplay({ results, format }) {
    if (!results) return null;

    const { left, right, statistics } = results;

    const getFormatLabel = (format) => {
        return format.charAt(0).toUpperCase() + format.slice(1);
    };

    return (
        <div className="transition-all duration-500 ease-in-out">
            {/* Statistics Banner */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-blue-600">{statistics?.total_differences || 0}</p>
                        <p className="text-sm text-gray-600">Total Differences</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-red-600">
                            {statistics?.missing_tags || statistics?.missing_items || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                            {format === 'xml' ? 'Missing Tags' : format === 'text' ? 'Removed Lines' : 'Missing Items'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-600">
                            {statistics?.extra_tags || statistics?.extra_items || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                            {format === 'xml' ? 'Extra Tags' : format === 'text' ? 'Added Lines' : 'Extra Items'}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-orange-600">
                            {(statistics?.attribute_mismatches || 0) +
                                (statistics?.text_mismatches || 0) +
                                (statistics?.value_mismatches || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                            {format === 'text' ? 'Modified Lines' : 'Mismatches'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Comparison Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Highlighted Differences</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Differences are highlighted in color. Red indicates removed/missing content, green indicates added/extra content.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left Panel */}
                    <div className="border-r border-gray-200">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-medium text-gray-900 flex items-center">
                                <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-full mr-2"></span>
                                <span>{getFormatLabel(format)} File 1</span>
                            </h4>
                        </div>
                        <div className="p-0">
                            <div
                                className="xml-display-box"
                                dangerouslySetInnerHTML={{ __html: left }}
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div>
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                            <h4 className="font-medium text-gray-900 flex items-center">
                                <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-2"></span>
                                <span>{getFormatLabel(format)} File 2</span>
                            </h4>
                        </div>
                        <div className="p-0">
                            <div
                                className="xml-display-box"
                                dangerouslySetInnerHTML={{ __html: right }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
