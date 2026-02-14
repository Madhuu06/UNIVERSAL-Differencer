// API client for Flask backend

const API_BASE_URL = '';  // Empty string for same origin, or use proxy in dev mode

export async function compareXML(xml1, xml2) {
    const response = await fetch(`${API_BASE_URL}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml1, xml2 })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
    }

    return data;
}

export async function compareJSON(json1, json2) {
    const response = await fetch(`${API_BASE_URL}/compare_json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json1, json2 })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
    }

    return data;
}

export async function compareText(text1, text2) {
    const response = await fetch(`${API_BASE_URL}/compare_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text1, text2 })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
    }

    return data;
}

export async function compareCSV(csv1, csv2) {
    const response = await fetch(`${API_BASE_URL}/compare_csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv1, csv2 })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
    }

    return data;
}

export async function compareYAML(yaml1, yaml2) {
    const response = await fetch(`${API_BASE_URL}/compare_yaml`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yaml1, yaml2 })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Comparison failed');
    }

    return data;
}
