// Utility functions
function validateXML(xmlStr) {
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
      // Clean up the error message and extract line information
      let errorText = parseError.textContent || parseError.innerText || "";
      
      // Extract line number if available
      let lineNumber = null;
      const lineMatch = errorText.match(/line (\d+)/);
      if (lineMatch) {
        lineNumber = parseInt(lineMatch[1]);
      }
      
      // Create line reference string
      const lineRef = lineNumber ? ` (line ${lineNumber})` : "";
      
      // Extract the meaningful part of the error message
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

    // Additional validation - check for single root element
    const rootChildren = Array.from(doc.childNodes).filter(node => 
      node.nodeType === Node.ELEMENT_NODE
    );
    
    if (rootChildren.length > 1) {
      return { 
        isValid: false, 
        error: "XML must have exactly one root element (found " + rootChildren.length + " root elements)" 
      };
    }

    // Check for XML declaration issues (optional but helpful)
    if (trimmed.startsWith('<?xml') && !trimmed.match(/^\s*<\?xml\s+version\s*=\s*["'][^"']+["']/)) {
      return { 
        isValid: false, 
        error: "Invalid XML declaration format (line 1)" 
      };
    }

    // Additional checks for common issues
    if (trimmed.includes('<![CDATA[') && !trimmed.includes(']]>')) {
      // Try to find the line number of the CDATA
      const lines = trimmed.split('\n');
      let cdataLine = null;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<![CDATA[')) {
          cdataLine = i + 1;
          break;
        }
      }
      const lineRef = cdataLine ? ` (line ${cdataLine})` : "";
      return { 
        isValid: false, 
        error: `Unclosed CDATA section${lineRef}` 
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

// JSON validation function
function validateJSON(jsonStr) {
  const trimmed = jsonStr.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "JSON content is empty" };
  }

  try {
    JSON.parse(trimmed);
    return { isValid: true, error: null };
  } catch (error) {
    let errorMessage = "Invalid JSON syntax";
    
    // Extract line information if available
    const lineMatch = error.message.match(/at position (\d+)/);
    if (lineMatch) {
      const position = parseInt(lineMatch[1]);
      const lines = trimmed.substring(0, position).split('\n');
      const lineNumber = lines.length;
      const columnNumber = lines[lines.length - 1].length + 1;
      errorMessage += ` (line ${lineNumber}, column ${columnNumber})`;
    }
    
    // Provide specific error details
    if (error.message.includes('Unexpected token')) {
      const tokenMatch = error.message.match(/Unexpected token (.+?) in/);
      if (tokenMatch) {
        errorMessage = `Unexpected character '${tokenMatch[1]}' in JSON${lineMatch ? ` (line ${lines.length})` : ''}`;
      }
    } else if (error.message.includes('Unexpected end of JSON input')) {
      errorMessage = "Incomplete JSON - missing closing brackets or quotes";
    }
    
    return { isValid: false, error: errorMessage };
  }
}

// Text validation (always valid)
function validateText(textStr) {
  return { isValid: true, error: null };
}

// Legacy function for backward compatibility
function isValidXML(xmlStr) {
  return validateXML(xmlStr).isValid;
}

function showError(message) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
  toast.innerHTML = `
    <div class="flex items-start">
      <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
      </svg>
      <div>
        <p class="font-medium">Error</p>
        <p class="text-sm opacity-90">${message}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}

function showSuccess(message) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
  toast.innerHTML = `
    <div class="flex items-start">
      <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      <div>
        <p class="font-medium">Success</p>
        <p class="text-sm opacity-90">${message}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove toast after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

function setLoadingState(isLoading, buttonId = "xmlCompareBtn") {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".loading-spinner");
  
  if (isLoading) {
    btn.disabled = true;
    if (buttonId === "xmlCompareBtn") {
      btnText.textContent = "Comparing...";
    } else if (buttonId === "jsonCompareBtn") {
      btnText.textContent = "Comparing...";
    } else if (buttonId === "textCompareBtn") {
      btnText.textContent = "Comparing...";
    }
    spinner.classList.remove("hidden");
    spinner.classList.add("inline");
  } else {
    btn.disabled = false;
    if (buttonId === "xmlCompareBtn") {
      btnText.textContent = "Compare XML Files";
    } else if (buttonId === "jsonCompareBtn") {
      btnText.textContent = "Compare JSON Files";
    } else if (buttonId === "textCompareBtn") {
      btnText.textContent = "Compare Text Files";
    }
    spinner.classList.add("hidden");
    spinner.classList.remove("inline");
  }
}

function updateStatistics(data, format = 'xml') {
  if (data.total_differences !== undefined) {
    // New format from backend
    document.getElementById('totalDiffs').textContent = data.total_differences;
    document.getElementById('missingItems').textContent = data.missing_tags || data.missing_items || 0;
    document.getElementById('extraItems').textContent = data.extra_tags || data.extra_items || 0;
    document.getElementById('mismatchItems').textContent = (data.attribute_mismatches || 0) + (data.text_mismatches || 0) + (data.value_mismatches || 0);
  } else {
    // Legacy format - array of differences
    const totalDiffs = data.length;
    const missingItems = data.filter(d => d['Difference Type'] === 'Tag missing' || d['Difference Type'] === 'Missing').length;
    const extraItems = data.filter(d => d['Difference Type'] === 'Extra tag' || d['Difference Type'] === 'Extra').length;
    const mismatchItems = data.filter(d => d['Difference Type'].includes('mismatch')).length;
    
    document.getElementById('totalDiffs').textContent = totalDiffs;
    document.getElementById('missingItems').textContent = missingItems;
    document.getElementById('extraItems').textContent = extraItems;
    document.getElementById('mismatchItems').textContent = mismatchItems;
  }
  
  // Update labels based on format
  const missingLabel = document.getElementById('missingLabel');
  const extraLabel = document.getElementById('extraLabel');
  
  if (format === 'xml') {
    missingLabel.textContent = 'Missing Tags';
    extraLabel.textContent = 'Extra Tags';
  } else if (format === 'json') {
    missingLabel.textContent = 'Missing Keys';
    extraLabel.textContent = 'Extra Keys';
  } else if (format === 'text') {
    missingLabel.textContent = 'Removed Lines';
    extraLabel.textContent = 'Added Lines';
  }
}

function updateResultsForFormat(format) {
  // Update panel titles
  document.getElementById('leftPanelTitle').textContent = `${format} File 1`;
  document.getElementById('rightPanelTitle').textContent = `${format} File 2`;
  
  // Update table headers
  const pathHeader = document.getElementById('pathHeader');
  const attributeHeader = document.getElementById('attributeHeader');
  
  if (format === 'XML') {
    pathHeader.textContent = 'Tag Path';
    attributeHeader.textContent = 'Attribute';
  } else if (format === 'JSON') {
    pathHeader.textContent = 'Key Path';
    attributeHeader.textContent = 'Property';
  } else if (format === 'Text') {
    pathHeader.textContent = 'Line Number';
    attributeHeader.textContent = 'Content';
  }
  
  // Update results description
  const description = document.getElementById('resultsDescription');
  if (format === 'JSON') {
    description.textContent = 'Differences are highlighted in color. Red indicates removed/missing properties, green indicates added/extra properties.';
  } else if (format === 'Text') {
    description.textContent = 'Differences are highlighted in color. Red indicates missing lines from File 1, green indicates added lines in File 2.';
  } else {
    description.textContent = 'Differences are highlighted in color. Red indicates removed/missing content, green indicates added/extra content.';
  }
  
  // Hide differences table for text format
  const differencesTable = document.getElementById('differencesTable');
  if (format === 'Text') {
    differencesTable.style.display = 'none';
  } else {
    differencesTable.style.display = 'block';
  }
}

function formatJSONForDisplay(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    const formatted = JSON.stringify(parsed, null, 2);
    
    return formatted
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("[\w\s-]+")\s*:/g, '<span class="text-blue-600">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-green-600">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-600">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-orange-600">$1</span>');
  } catch (e) {
    return jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

function formatTextForDisplay(textString) {
  return textString
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n')
    .map((line, index) => `<span class="line-number text-gray-400 select-none">${(index + 1).toString().padStart(3, ' ')}</span> ${line}`)
    .join('\n');
}

function formatXMLForDisplay(xmlString) {
  // Add basic XML syntax highlighting
  return xmlString
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;/g, '<span class="text-blue-600">&lt;</span>')
    .replace(/&gt;/g, '<span class="text-blue-600">&gt;</span>')
    .replace(/(\s+)([a-zA-Z-]+)(=)/g, '$1<span class="text-purple-600">$2</span><span class="text-gray-500">$3</span>')
    .replace(/"([^"]*)"/g, '"<span class="text-green-600">$1</span>"');
}

function getDiffTypeBadge(diffType) {
  const badges = {
    // XML types
    'Tag missing': 'diff-badge diff-badge-missing',
    'Extra tag': 'diff-badge diff-badge-extra',
    'Attribute missing': 'diff-badge diff-badge-missing',
    'Attribute mismatch': 'diff-badge diff-badge-mismatch',
    'Text mismatch': 'diff-badge diff-badge-text',
    
    // JSON types
    'Missing': 'diff-badge diff-badge-missing',
    'Extra': 'diff-badge diff-badge-extra',
    'Value mismatch': 'diff-badge diff-badge-mismatch',
    'Type mismatch': 'diff-badge diff-badge-mismatch',
    
    // Text types
    'Missing Line': 'diff-badge diff-badge-missing',
    'Added Line': 'diff-badge diff-badge-extra',
    'Removed': 'diff-badge diff-badge-missing',
    'Added': 'diff-badge diff-badge-extra'
  };
  
  return badges[diffType] || 'diff-badge diff-badge-text';
}

function populateDifferencesTable(diffs, format = 'XML') {
  const tbody = document.getElementById('differencesTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (diffs.length === 0) {
    const noResultsMessage = format === 'Text' ? 'The text files are identical.' : 
                            format === 'JSON' ? 'The JSON files are identical.' : 
                            'The XML files are identical.';
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-8 text-center text-gray-500">
          <div class="flex flex-col items-center">
            <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-lg font-medium">No differences found!</p>
            <p class="text-sm">${noResultsMessage}</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  diffs.forEach((diff, index) => {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    
    // Determine which properties to use based on format
    let pathValue, attributeValue;
    
    if (format === 'Text') {
      pathValue = diff['Line Number'] || diff['Tag Path'] || '';
      attributeValue = diff['Content'] || diff['Attribute'] || '';
    } else if (format === 'JSON') {
      pathValue = diff['Key Path'] || diff['Tag Path'] || '';
      attributeValue = diff['Property'] || diff['Attribute'] || '';
    } else {
      pathValue = diff['Tag Path'] || '';
      attributeValue = diff['Attribute'] || '';
    }
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="${getDiffTypeBadge(diff['Difference Type'])}">
          ${diff['Difference Type']}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-900 font-mono break-all">
        ${pathValue}
      </td>
      <td class="px-6 py-4 text-sm text-gray-900 font-mono max-w-xs truncate" title="${attributeValue}">
        ${attributeValue}
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Update validation feedback for different formats
function updateValidationFeedback(textareaId) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) return;
  
  const content = textarea.value.trim();
  
  if (!content) {
    textarea.classList.remove('border-red-300', 'border-green-300');
    textarea.classList.add('border-gray-300');
    textarea.title = '';
    return;
  }
  
  let validation;
  if (textareaId.includes('xml')) {
    validation = validateXML(content);
  } else if (textareaId.includes('json')) {
    validation = validateJSON(content);
  } else if (textareaId.includes('text')) {
    validation = validateText(content);
  } else {
    validation = { isValid: true, error: null };
  }
  
  if (validation.isValid) {
    textarea.classList.remove('border-red-300');
    textarea.classList.add('border-green-300');
    textarea.title = '';
  } else {
    textarea.classList.remove('border-green-300');
    textarea.classList.add('border-red-300');
    
    // Show error tooltip
    textarea.title = validation.error;
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Format switching functionality
  let currentFormat = 'xml';
  
  function switchFormat(format) {
    // Update active tab
    document.querySelectorAll('.format-tab').forEach(tab => {
      tab.classList.remove('bg-blue-600', 'text-white');
      tab.classList.add('bg-gray-100', 'text-gray-700');
    });
    
    const activeTab = document.querySelector(`[data-format="${format}"]`);
    if (activeTab) {
      activeTab.classList.remove('bg-gray-100', 'text-gray-700');
      activeTab.classList.add('bg-blue-600', 'text-white');
    }
    
    // Hide all sections
    document.querySelectorAll('.comparison-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show selected section with animation
    const targetSection = document.getElementById(`${format}Section`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    // Hide results when switching formats
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
      resultsSection.classList.add('hidden');
    }
    
    currentFormat = format;
  }
  
  // Format tab event listeners
  document.querySelectorAll('.format-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const format = this.getAttribute('data-format');
      switchFormat(format);
    });
  });

  // Initialize with XML section visible
  switchFormat('xml');

  const resetBtn = document.getElementById("resetBtn");
  
  // Compare button event - XML
  const xmlCompareBtn = document.getElementById("xmlCompareBtn");
  if (xmlCompareBtn) {
    xmlCompareBtn.addEventListener("click", function () {
      const xml1 = document.getElementById("xmlText1").value.trim();
      const xml2 = document.getElementById("xmlText2").value.trim();

      if (!xml1 || !xml2) {
        showError("Please paste XML content into both text boxes.");
        return;
      }

      // Validate XML 1
      const xml1Validation = validateXML(xml1);
      if (!xml1Validation.isValid) {
        showError("XML File 1 Error: " + xml1Validation.error);
        return;
      }

      // Validate XML 2
      const xml2Validation = validateXML(xml2);
      if (!xml2Validation.isValid) {
        showError("XML File 2 Error: " + xml2Validation.error);
        return;
      }

      setLoadingState(true, 'xmlCompareBtn');

      fetch("/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ xml1, xml2 })
      })
        .then(response => response.json())
        .then(data => {
          setLoadingState(false, 'xmlCompareBtn');
          
          if (data.error) {
            showError("Error: " + data.error);
            return;
          }

          // Update UI for XML results
          updateResultsForFormat('XML');

          // Show results section
          document.getElementById("resultsSection").classList.remove("hidden");
          
          // Update highlighted XML displays
          document.getElementById("highlight-left").innerHTML = data.left || formatXMLForDisplay(xml1);
          document.getElementById("highlight-right").innerHTML = data.right || formatXMLForDisplay(xml2);
          
          // Update statistics
          if (data.statistics) {
            updateStatistics(data.statistics, 'xml');
          }
          
          // Populate differences table
          if (data.differences) {
            populateDifferencesTable(data.differences, 'XML');
          }
          
          // Scroll to results
          document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          showSuccess("XML comparison completed successfully!");
        })
        .catch(error => {
          setLoadingState(false, 'xmlCompareBtn');
          showError("An error occurred during comparison: " + error.message);
          console.error(error);
        });
    });
  }
  
  // JSON Compare button event
  const jsonCompareBtn = document.getElementById("jsonCompareBtn");
  if (jsonCompareBtn) {
    jsonCompareBtn.addEventListener("click", function () {
      const json1 = document.getElementById("jsonText1").value.trim();
      const json2 = document.getElementById("jsonText2").value.trim();

      if (!json1 || !json2) {
        showError("Please paste JSON content into both text boxes.");
        return;
      }

      // Validate JSON 1
      const json1Validation = validateJSON(json1);
      if (!json1Validation.isValid) {
        showError("JSON File 1 Error: " + json1Validation.error);
        return;
      }

      // Validate JSON 2
      const json2Validation = validateJSON(json2);
      if (!json2Validation.isValid) {
        showError("JSON File 2 Error: " + json2Validation.error);
        return;
      }

      setLoadingState(true, 'jsonCompareBtn');

      fetch("/compare_json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ json1, json2 })
      })
        .then(response => response.json())
        .then(data => {
          setLoadingState(false, 'jsonCompareBtn');
          
          if (data.error) {
            showError("Error: " + data.error);
            return;
          }

          // Update UI for JSON results
          updateResultsForFormat('JSON');
          
          // Show results section
          document.getElementById("resultsSection").classList.remove("hidden");
          
          // Update highlighted displays
          document.getElementById("highlight-left").innerHTML = data.left || formatJSONForDisplay(json1);
          document.getElementById("highlight-right").innerHTML = data.right || formatJSONForDisplay(json2);
          
          // Update statistics
          if (data.statistics) {
            updateStatistics(data.statistics, 'json');
          }
          
          // Populate differences table
          if (data.differences) {
            populateDifferencesTable(data.differences, 'JSON');
          }
          
          // Scroll to results
          document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          showSuccess("JSON comparison completed successfully!");
        })
        .catch(error => {
          setLoadingState(false, 'jsonCompareBtn');
          showError("An error occurred during comparison: " + error.message);
          console.error(error);
        });
    });
  }
  
  // Text Compare button event
  const textCompareBtn = document.getElementById("textCompareBtn");
  if (textCompareBtn) {
    textCompareBtn.addEventListener("click", function () {
      const text1 = document.getElementById("textText1").value.trim();
      const text2 = document.getElementById("textText2").value.trim();

      if (!text1 || !text2) {
        showError("Please paste text content into both text boxes.");
        return;
      }

      setLoadingState(true, 'textCompareBtn');

      fetch("/compare_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text1, text2 })
      })
        .then(response => response.json())
        .then(data => {
          setLoadingState(false, 'textCompareBtn');
          
          if (data.error) {
            showError("Error: " + data.error);
            return;
          }

          // Update UI for Text results
          updateResultsForFormat('Text');
          
          // Show results section
          document.getElementById("resultsSection").classList.remove("hidden");
          
          // Update highlighted displays
          document.getElementById("highlight-left").innerHTML = data.left || formatTextForDisplay(text1);
          document.getElementById("highlight-right").innerHTML = data.right || formatTextForDisplay(text2);
          
          // Update statistics
          if (data.statistics) {
            updateStatistics(data.statistics, 'text');
          }
          
          // For text, we don't show the differences table
          // It's hidden by updateResultsForFormat('Text')
          
          // Scroll to results
          document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          showSuccess("Text comparison completed successfully!");
        })
        .catch(error => {
          setLoadingState(false, 'textCompareBtn');
          showError("An error occurred during comparison: " + error.message);
          console.error(error);
        });
    });
  }
  
  // Reset button event
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      // Clear all text areas
      document.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = "";
        textarea.classList.remove('border-red-300', 'border-green-300');
        textarea.classList.add('border-gray-300');
        textarea.title = '';
      });
      
      // Hide results
      const resultsSection = document.getElementById("resultsSection");
      if (resultsSection) {
        resultsSection.classList.add("hidden");
      }
      
      // Focus on the first visible textarea
      const visibleSection = document.querySelector('.comparison-section:not(.hidden)');
      if (visibleSection) {
        const firstTextarea = visibleSection.querySelector('textarea');
        if (firstTextarea) {
          firstTextarea.focus();
        }
      }
    });
  }
  
  // Universal Clear buttons
  document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.value = '';
        target.focus();
        // Reset validation styling
        target.classList.remove('border-red-300', 'border-green-300');
        target.classList.add('border-gray-300');
        target.title = '';
      }
    });
  });
  
  // Universal Help buttons
  document.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.classList.toggle('hidden');
      }
    });
  });
  
  // Auto-resize textareas and add validation
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Auto-resize functionality
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 300) + 'px';
      
      // Add debounced validation
      clearTimeout(this.validationTimeout);
      this.validationTimeout = setTimeout(() => {
        updateValidationFeedback(this.id);
      }, 500);
    });
    
    // Initial validation on blur
    textarea.addEventListener('blur', function() {
      if (this.value.trim()) {
        updateValidationFeedback(this.id);
      }
    });
  });
});
