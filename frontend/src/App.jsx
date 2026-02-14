import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FormatSelector } from './components/FormatSelector';
import { ComparisonInput } from './components/ComparisonInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Notifications } from './components/Notifications';
import { LandingPage } from './components/LandingPage';
import { useNotification } from './hooks/useNotification';
import { useComparison } from './hooks/useComparison';
import './index.css';

function ComparePage() {
    const [selectedFormat, setSelectedFormat] = useState('xml');
    const { notifications, showSuccess, showError } = useNotification();
    const { isLoading, results, compare, reset: resetComparison } = useComparison();
    const resultsRef = useRef(null);

    const handleFormatChange = (format) => {
        setSelectedFormat(format);
        resetComparison();
        document.title = `Universal Differencer - ${format.toUpperCase()} Comparison`;
    };

    const handleCompare = async (content1, content2) => {
        try {
            const data = await compare(selectedFormat, content1, content2);
            showSuccess(`${selectedFormat.toUpperCase()} comparison completed successfully!`);

            // Scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            showError(`Error: ${error.message}`);
        }
    };

    const handleReset = () => {
        resetComparison();
        // Clear all textareas
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            textarea.value = '';
        });
    };

    useEffect(() => {
        document.title = `Universal Differencer - ${selectedFormat.toUpperCase()} Comparison`;
    }, [selectedFormat]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
            <Header onReset={handleReset} />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <FormatSelector selectedFormat={selectedFormat} onFormatChange={handleFormatChange} />

                <div className="transition-all duration-500 ease-in-out">
                    <ComparisonInput
                        format={selectedFormat}
                        onCompare={handleCompare}
                        isLoading={isLoading}
                    />
                </div>

                <div ref={resultsRef}>
                    {results && <ResultsDisplay results={results} format={selectedFormat} />}
                </div>
            </main>

            <Footer />
            <Notifications notifications={notifications} />
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/compare" element={<ComparePage />} />
            </Routes>
        </Router>
    );
}

export default App;
