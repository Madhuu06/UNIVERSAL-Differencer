import { useState, useRef } from 'react';
import * as validators from '../utils/validators';

export function ComparisonInput({ format, onCompare, isLoading }) {
    const [content1, setContent1] = useState('');
    const [content2, setContent2] = useState('');
    const [validation1, setValidation1] = useState({ isValid: true, error: null });
    const [validation2, setValidation2] = useState({ isValid: true, error: null });
    const [showHelp, setShowHelp] = useState(false);

    const textarea1Ref = useRef(null);
    const textarea2Ref = useRef(null);

    const handleDrop = (e, setContent) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                setContent(event.target.result);
            };

            reader.readAsText(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
    };

    const validateContent = () => {
        let validator;
        switch (format) {
            case 'xml':
                validator = validators.validateXML;
                break;
            case 'json':
                validator = validators.validateJSON;
                break;
            case 'csv':
                validator = validators.validateCSV;
                break;
            case 'yaml':
                validator = validators.validateYAML;
                break;
            default:
                validator = validators.validateText;
        }

        const result1 = validator(content1);
        const result2 = validator(content2);

        setValidation1(result1);
        setValidation2(result2);

        return result1.isValid && result2.isValid;
    };

    const handleCompare = () => {
        if (!content1.trim() || !content2.trim()) {
            setValidation1({ isValid: !content1.trim(), error: content1.trim() ? null : 'Please paste content here' });
            setValidation2({ isValid: !content2.trim(), error: content2.trim() ? null : 'Please paste content here' });
            return;
        }

        if (validateContent()) {
            onCompare(content1, content2);
        }
    };

    const getPlaceholder = () => {
        const placeholders = {
            xml: 'Paste your first XML content here...\n\nExample:\n<root>\n  <element>value</element>\n</root>',
            json: 'Paste your first JSON content here...\n\nExample:\n{\n  "name": "value",\n  "array": [1, 2, 3]\n}',
            text: 'Paste your first text content here...\n\nAny plain text, code, or formatted content',
            csv: 'Paste your first CSV content here...\n\nExample:\nName,Age,City\nJohn,25,New York\nJane,30,San Francisco',
            yaml: 'Paste your first YAML content here...\n\nExample:\nname: John\nage: 25\naddress:\n  city: New York\n  zip: 10001'
        };
        return placeholders[format] || '';
    };

    const getHelpContent = () => {
        const helpContent = {
            xml: {
                title: 'XML Requirements:',
                items: [
                    'Must have exactly one root element',
                    'All opening tags must have matching closing tags',
                    'Tag names are case-sensitive',
                    'Attribute values must be quoted',
                    'No multiple root elements like: <root1></root1><root2></root2>',
                    'Self-closing tags are allowed: <element/>'
                ],
                example: '<root>\n  <child attribute="value">text</child>\n  <empty-element/>\n</root>',
                tip: 'Line numbers in error messages help you locate issues quickly. Use Ctrl+G in most text editors to jump to a specific line.',
                color: 'blue'
            },
            json: {
                title: 'JSON Requirements:',
                items: [
                    'All property names must be in double quotes',
                    'String values must be in double quotes',
                    'No trailing commas after last elements',
                    'Valid data types: string, number, boolean, null, object, array',
                    'Objects wrapped in {}, arrays in []'
                ],
                example: '{\n  "name": "John",\n  "age": 30,\n  "active": true,\n  "hobbies": ["reading", "coding"]\n}',
                color: 'green'
            },
            text: {
                title: 'Text Comparison Features:',
                items: [
                    'Line-by-line comparison with precise difference detection',
                    'Supports any text format: code, documentation, logs, etc.',
                    'Highlights added, removed, and modified lines',
                    'Character-level differences within lines',
                    'Preserves formatting and whitespace'
                ],
                tip: 'Perfect for: Code reviews, documentation changes, configuration files, logs analysis',
                color: 'purple'
            },
            csv: {
                title: 'CSV Comparison Help:',
                items: [
                    'Supports comma, semicolon, and tab-separated values',
                    'Compares data row by row and column by column',
                    'Detects missing/extra columns and rows',
                    'Highlights cell value differences with precise location',
                    'First row is treated as header'
                ],
                color: 'blue'
            },
            yaml: {
                title: 'YAML Comparison Help:',
                items: [
                    'Supports nested structures and arrays',
                    'Compares values at all levels of hierarchy',
                    'Detects missing/extra keys and value changes',
                    'Highlights structural differences with precise paths',
                    'Preserves original formatting in comparison view'
                ],
                color: 'blue'
            }
        };
        return helpContent[format] || helpContent.text;
    };

    const help = getHelpContent();
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
        <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input 1 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                            {format.toUpperCase()} File 1
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setContent1('')}
                                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                Help
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={textarea1Ref}
                        value={content1}
                        onChange={(e) => {
                            setContent1(e.target.value);
                            setValidation1({ isValid: true, error: null });
                        }}
                        placeholder={getPlaceholder()}
                        className={`w-full h-40 px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:border-transparent transition-all duration-300 font-mono text-sm hover:border-gray-400 focus:shadow-lg ${validation1.isValid
                                ? 'border-gray-300 focus:ring-blue-500'
                                : 'border-red-300 focus:ring-red-500'
                            }`}
                        onDrop={(e) => handleDrop(e, setContent1)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    />
                    {!validation1.isValid && validation1.error && (
                        <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 border border-red-200 rounded">
                            {validation1.error}
                        </div>
                    )}
                </div>

                {/* Input 2 */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-700">
                            {format.toUpperCase()} File 2
                        </label>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setContent2('')}
                                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setShowHelp(!showHelp)}
                                className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                            >
                                Help
                            </button>
                        </div>
                    </div>
                    <textarea
                        ref={textarea2Ref}
                        value={content2}
                        onChange={(e) => {
                            setContent2(e.target.value);
                            setValidation2({ isValid: true, error: null });
                        }}
                        placeholder={getPlaceholder().replace('first', 'second')}
                        className={`w-full h-40 px-4 py-3 border rounded-lg resize-none focus:ring-2 focus:border-transparent transition-all duration-300 font-mono text-sm hover:border-gray-400 focus:shadow-lg ${validation2.isValid
                                ? 'border-gray-300 focus:ring-blue-500'
                                : 'border-red-300 focus:ring-red-500'
                            }`}
                        onDrop={(e) => handleDrop(e, setContent2)}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                    />
                    {!validation2.isValid && validation2.error && (
                        <div className="text-xs text-red-600 mt-1 p-2 bg-red-50 border border-red-200 rounded">
                            {validation2.error}
                        </div>
                    )}
                </div>
            </div>

            {/* Help Section */}
            {showHelp && (
                <div className={`mt-4 border rounded-lg p-4 ${colorClasses[help.color]}`}>
                    <h4 className="text-sm font-semibold mb-2">{help.title}</h4>
                    <ul className="text-sm space-y-1">
                        {help.items.map((item, index) => (
                            <li key={index}>• {item}</li>
                        ))}
                    </ul>
                    {help.example && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold mb-1">Valid Example:</h5>
                            <pre className="text-xs bg-white border rounded p-2 text-gray-800">
                                {help.example}
                            </pre>
                        </div>
                    )}
                    {help.tip && (
                        <div className="mt-3">
                            <h5 className="text-sm font-semibold mb-1">💡 Tip:</h5>
                            <p className="text-sm">{help.tip}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Compare Button */}
            <div className="text-center mt-6">
                <button
                    onClick={handleCompare}
                    disabled={isLoading}
                    className={`px-8 py-3 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${format === 'xml' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                            format === 'json' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                                format === 'text' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                                    format === 'csv' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                                        'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        } text-white`}
                >
                    {isLoading ? (
                        <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Comparing...
                        </span>
                    ) : (
                        `Compare ${format.toUpperCase()} Files`
                    )}
                </button>
            </div>
        </div>
    );
}
