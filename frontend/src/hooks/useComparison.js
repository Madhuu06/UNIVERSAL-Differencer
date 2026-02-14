import { useState } from 'react';
import * as api from '../utils/api';

export function useComparison() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const compare = async (format, content1, content2) => {
        setIsLoading(true);
        setError(null);

        try {
            let data;

            switch (format) {
                case 'xml':
                    data = await api.compareXML(content1, content2);
                    break;
                case 'json':
                    data = await api.compareJSON(content1, content2);
                    break;
                case 'text':
                    data = await api.compareText(content1, content2);
                    break;
                case 'csv':
                    data = await api.compareCSV(content1, content2);
                    break;
                case 'yaml':
                    data = await api.compareYAML(content1, content2);
                    break;
                default:
                    throw new Error('Invalid format');
            }

            setResults(data);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResults(null);
        setError(null);
    };

    return {
        isLoading,
        results,
        error,
        compare,
        reset
    };
}
