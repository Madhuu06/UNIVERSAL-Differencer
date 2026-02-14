// Validation utility functions for different file formats

export function validateXML(xmlStr) {
    const trimmed = xmlStr.trim();

    if (!trimmed) {
        return { isValid: false, error: "XML content is empty" };
    }

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, "application/xml");

        // Check for parser errors
        const parseError = doc.querySelector("parsererror");
        if (parseError) {
            let errorText = parseError.textContent || parseError.innerText || "";

            // Extract line number if available
            let lineNumber = null;
            const lineMatch = errorText.match(/line (\d+)/);
            if (lineMatch) {
                lineNumber = parseInt(lineMatch[1]);
            }

            const lineRef = lineNumber ? ` (line ${lineNumber})` : "";
            let cleanError = "Invalid XML syntax";

            if (errorText.includes("Opening and ending tag mismatch")) {
                const tagMatch = errorText.match(/Opening and ending tag mismatch: (\w+).*?and (\w+)/);
                if (tagMatch) {
                    cleanError = `Tag mismatch: opening tag '${tagMatch[1]}' does not match closing tag '${tagMatch[2]}'${lineRef}`;
                } else {
                    cleanError = `Opening and closing tags do not match${lineRef}`;
                }
            } else if (errorText.includes("expected '>'")) {
                cleanError = `Missing '>' in XML tag${lineRef}`;
            } else if (errorText.includes("not well-formed")) {
                cleanError = `XML is not well-formed - check for unclosed tags or invalid syntax${lineRef}`;
            } else if (errorText.includes("no element found")) {
                cleanError = "No XML elements found";
            } else if (errorText.includes("junk after document element")) {
                cleanError = "Multiple root elements detected - XML must have exactly one root element";
            } else if (errorText.includes("unclosed token")) {
                cleanError = `Unclosed XML tag detected${lineRef}`;
            } else if (errorText.includes("mismatched tag")) {
                cleanError = `Mismatched XML tags${lineRef}`;
            }

            return { isValid: false, error: cleanError };
        }

        // Check for single root element
        const rootChildren = Array.from(doc.childNodes).filter(node =>
            node.nodeType === Node.ELEMENT_NODE
        );

        if (rootChildren.length > 1) {
            return {
                isValid: false,
                error: "XML must have exactly one root element (found " + rootChildren.length + " root elements)"
            };
        }

        return { isValid: true, error: null };

    } catch (error) {
        return {
            isValid: false,
            error: "XML parsing failed: " + error.message
        };
    }
}

export function validateJSON(jsonStr) {
    const trimmed = jsonStr.trim();

    if (!trimmed) {
        return { isValid: false, error: "JSON content is empty" };
    }

    try {
        JSON.parse(trimmed);
        return { isValid: true, error: null };
    } catch (error) {
        let errorMessage = "Invalid JSON syntax";

        const lineMatch = error.message.match(/at position (\d+)/);
        if (lineMatch) {
            const position = parseInt(lineMatch[1]);
            const lines = trimmed.substring(0, position).split('\n');
            const lineNumber = lines.length;
            errorMessage += ` (line ${lineNumber})`;
        }

        return { isValid: false, error: errorMessage };
    }
}

export function validateText(textStr) {
    return { isValid: true, error: null };
}

export function validateCSV(csvStr) {
    const trimmed = csvStr.trim();

    if (!trimmed) {
        return { isValid: false, error: "CSV content is empty" };
    }

    const lines = trimmed.split('\n');
    if (lines.length === 0) {
        return { isValid: false, error: "CSV must contain at least one line" };
    }

    const firstLine = lines[0].trim();
    if (!firstLine) {
        return { isValid: false, error: "CSV must have a header row" };
    }

    return { isValid: true, error: null };
}

export function validateYAML(yamlStr) {
    const trimmed = yamlStr.trim();

    if (!trimmed) {
        return { isValid: false, error: "YAML content is empty" };
    }

    try {
        if (!trimmed.includes(':') && !trimmed.includes('-')) {
            return { isValid: false, error: "Invalid YAML format - must contain key-value pairs" };
        }

        return { isValid: true, error: null };
    } catch (error) {
        return { isValid: false, error: "Invalid YAML syntax: " + error.message };
    }
}
