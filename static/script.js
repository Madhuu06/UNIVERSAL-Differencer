// Multi-format comparison tool JavaScript
// Supports XML, JSON, Text, CSV, and YAML comparison with enhanced validation and UI

// Drag and Drop functionality
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
}

function handleDragEnter(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.add('border-blue-400', 'bg-blue-50');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const textarea = e.currentTarget;
  textarea.classList.remove('border-blue-400', 'bg-blue-50');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
      textarea.value = event.target.result;
      textarea.focus();
      showSuccess(`File "${file.name}" loaded successfully!`);
    };
    
    reader.onerror = function() {
      showError('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
  }
}

// Enhanced validation with better user feedback
function showValidationFeedback(element, isValid, message = '') {
  const parent = element.parentElement;
  let feedbackEl = parent.querySelector('.validation-feedback');
  
  if (feedbackEl) {
    feedbackEl.remove();
  }
  
  if (!isValid && message) {
    feedbackEl = document.createElement('div');
    feedbackEl.className = 'validation-feedback text-xs text-red-600 mt-1 p-2 bg-red-50 border border-red-200 rounded';
    feedbackEl.textContent = message;
    parent.appendChild(feedbackEl);
    
    element.classList.add('border-red-300', 'focus:ring-red-500');
    element.classList.remove('border-gray-300', 'focus:ring-blue-500');
  } else {
    element.classList.remove('border-red-300', 'focus:ring-red-500');
    element.classList.add('border-gray-300', 'focus:ring-blue-500');
  }
}

// Utility functions for validation
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

    return { isValid: true, error: null };
    
  } catch (error) {
    return { 
      isValid: false, 
      error: "XML parsing failed: " + error.message 
    };
  }
}

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
      errorMessage += ` (line ${lineNumber})`;
    }
    
    return { isValid: false, error: errorMessage };
  }
}

function validateText(textStr) {
  return { isValid: true, error: null };
}

function validateCSV(csvStr) {
  const trimmed = csvStr.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "CSV content is empty" };
  }

  // Basic CSV validation - check for at least one line
  const lines = trimmed.split('\n');
  if (lines.length === 0) {
    return { isValid: false, error: "CSV must contain at least one line" };
  }

  // Check if first line (header) exists
  const firstLine = lines[0].trim();
  if (!firstLine) {
    return { isValid: false, error: "CSV must have a header row" };
  }

  return { isValid: true, error: null };
}

function validateYAML(yamlStr) {
  const trimmed = yamlStr.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "YAML content is empty" };
  }

  // Basic YAML validation - check for reasonable structure
  try {
    // Simple check for basic YAML patterns
    if (!trimmed.includes(':') && !trimmed.includes('-')) {
      return { isValid: false, error: "Invalid YAML format - must contain key-value pairs" };
    }
    
    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: "Invalid YAML syntax: " + error.message };
  }
}

// UI notification functions
function showError(message) {
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
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}

function showSuccess(message) {
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
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Loading state management
function setLoadingState(isLoading, buttonId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  
  const btnText = btn.querySelector(".btn-text");
  const spinner = btn.querySelector(".loading-spinner");
  
  if (isLoading) {
    btn.disabled = true;
    btnText.textContent = "Comparing...";
    if (spinner) {
      spinner.classList.remove("hidden");
      spinner.classList.add("inline");
    }
  } else {
    btn.disabled = false;
    if (buttonId === "xmlCompareBtn") {
      btnText.textContent = "Compare XML Files";
    } else if (buttonId === "jsonCompareBtn") {
      btnText.textContent = "Compare JSON Files";
    } else if (buttonId === "textCompareBtn") {
      btnText.textContent = "Compare Text Files";
    } else if (buttonId === "csvCompareBtn") {
      btnText.textContent = "Compare CSV Files";
    } else if (buttonId === "yamlCompareBtn") {
      btnText.textContent = "Compare YAML Files";
    }
    if (spinner) {
      spinner.classList.add("hidden");
      spinner.classList.remove("inline");
    }
  }
}

// Statistics update
function updateStatistics(data, format) {
  const totalElement = document.getElementById('totalDiffs');
  const missingElement = document.getElementById('missingItems');
  const extraElement = document.getElementById('extraItems');
  const mismatchElement = document.getElementById('mismatchItems');
  
  if (totalElement) totalElement.textContent = data.total_differences || 0;
  if (missingElement) missingElement.textContent = data.missing_tags || data.missing_items || 0;
  if (extraElement) extraElement.textContent = data.extra_tags || data.extra_items || 0;
  if (mismatchElement) mismatchElement.textContent = (data.attribute_mismatches || 0) + (data.text_mismatches || 0) + (data.value_mismatches || 0);
  
  // Update labels based on format
  const missingLabel = document.getElementById('missingLabel');
  const extraLabel = document.getElementById('extraLabel');
  const mismatchLabel = document.getElementById('mismatchLabel');
  
  if (missingLabel && extraLabel && mismatchLabel) {
    if (format === 'xml') {
      missingLabel.textContent = 'Missing Tags';
      extraLabel.textContent = 'Extra Tags';
      mismatchLabel.textContent = 'Mismatches';
    } else if (format === 'json') {
      missingLabel.textContent = 'Missing Keys';
      extraLabel.textContent = 'Extra Keys';
      mismatchLabel.textContent = 'Mismatches';
    } else if (format === 'text') {
      missingLabel.textContent = 'Removed Lines';
      extraLabel.textContent = 'Added Lines';
      mismatchLabel.textContent = 'Modified Lines';
    }
  }
}

// Results UI update
function updateResultsForFormat(format) {
  const leftPanelTitle = document.getElementById('leftPanelTitle');
  const rightPanelTitle = document.getElementById('rightPanelTitle');
  
  if (leftPanelTitle) leftPanelTitle.textContent = `${format} File 1`;
  if (rightPanelTitle) rightPanelTitle.textContent = `${format} File 2`;
}

// Format switching functionality
function switchFormat(format) {
  // Clear any existing validation feedback
  document.querySelectorAll('.validation-feedback').forEach(el => el.remove());
  document.querySelectorAll('.content-textarea').forEach(textarea => {
    textarea.classList.remove('border-red-300', 'focus:ring-red-500');
    textarea.classList.add('border-gray-300', 'focus:ring-blue-500');
  });

  // Update active tab with enhanced animation
  document.querySelectorAll('.format-tab').forEach(tab => {
    tab.classList.remove('bg-blue-600', 'text-white', 'transform', 'scale-105', 'shadow-md');
    tab.classList.add('bg-gray-100', 'text-gray-700');
  });
  
  const activeTab = document.querySelector(`[data-format="${format}"]`);
  if (activeTab) {
    activeTab.classList.remove('bg-gray-100', 'text-gray-700');
    activeTab.classList.add('bg-blue-600', 'text-white', 'transform', 'scale-105', 'shadow-md');
  }
  
  // Add fade-out animation to current sections
  document.querySelectorAll('.comparison-section').forEach(section => {
    if (!section.classList.contains('hidden')) {
      section.style.opacity = '0';
      section.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        section.classList.add('hidden');
        section.style.opacity = '';
        section.style.transform = '';
      }, 150);
    }
  });
  
  // Show selected section with fade-in animation
  const targetSection = document.getElementById(`${format}Section`);
  if (targetSection) {
    setTimeout(() => {
      targetSection.classList.remove('hidden');
      targetSection.style.opacity = '0';
      targetSection.style.transform = 'translateY(10px)';
      
      // Trigger animation
      requestAnimationFrame(() => {
        targetSection.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        targetSection.style.opacity = '1';
        targetSection.style.transform = 'translateY(0)';
        
        // Clean up inline styles after animation
        setTimeout(() => {
          targetSection.style.transition = '';
          targetSection.style.opacity = '';
          targetSection.style.transform = '';
        }, 300);
      });
    }, 150);
  }
  
  // Hide results when switching formats with animation
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection && !resultsSection.classList.contains('hidden')) {
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      resultsSection.classList.add('hidden');
      resultsSection.style.opacity = '';
      resultsSection.style.transform = '';
    }, 150);
  }
  
  // Update page title dynamically
  document.title = `Universal Differencer - ${format.toUpperCase()} Comparison`;
  
  // Show format-specific tips
  showFormatTips(format);
}

// Show contextual tips for each format
function showFormatTips(format) {
  // Remove any existing tips
  const existingTip = document.querySelector('.format-tip');
  if (existingTip) {
    existingTip.remove();
  }
  
  const tips = {
    xml: 'Tip: Ensure your XML has a single root element and all tags are properly closed.',
    json: 'Tip: Make sure your JSON syntax is valid - use double quotes for strings and proper comma placement.',
    text: 'Tip: Text comparison works line-by-line. Each line is compared for differences.',
    csv: 'Tip: CSV files should have headers in the first row. Supports comma, semicolon, and tab delimiters.',
    yaml: 'Tip: YAML is indentation-sensitive. Make sure your structure is properly aligned.'
  };
  
  const tipText = tips[format];
  if (tipText) {
    const tipElement = document.createElement('div');
    tipElement.className = 'format-tip mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 text-sm rounded-r-lg';
    tipElement.innerHTML = `
      <div class="flex items-start">
        <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        <span>${tipText}</span>
      </div>
    `;
    
    const targetSection = document.getElementById(`${format}Section`);
    if (targetSection) {
      const inputSection = targetSection.querySelector('.mb-8');
      if (inputSection) {
        inputSection.appendChild(tipElement);
      }
    }
  }
}

// Main event listener
document.addEventListener('DOMContentLoaded', function() {
  // Format tab event listeners
  document.querySelectorAll('.format-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const format = this.getAttribute('data-format');
      switchFormat(format);
    });
  });

  // Initialize with XML section visible
  switchFormat('xml');

  // XML Compare button
  const xmlCompareBtn = document.getElementById("xmlCompareBtn");
  if (xmlCompareBtn) {
    xmlCompareBtn.addEventListener("click", function () {
      const xml1Input = document.getElementById("xmlText1");
      const xml2Input = document.getElementById("xmlText2");
      const xml1 = xml1Input.value.trim();
      const xml2 = xml2Input.value.trim();

      // Clear previous validation feedback
      showValidationFeedback(xml1Input, true);
      showValidationFeedback(xml2Input, true);

      if (!xml1 || !xml2) {
        if (!xml1) showValidationFeedback(xml1Input, false, "Please paste XML content here");
        if (!xml2) showValidationFeedback(xml2Input, false, "Please paste XML content here");
        showError("Please provide XML content in both text boxes.");
        return;
      }

      const xml1Validation = validateXML(xml1);
      if (!xml1Validation.isValid) {
        showValidationFeedback(xml1Input, false, xml1Validation.error);
        showError("XML File 1 Error: " + xml1Validation.error);
        return;
      }

      const xml2Validation = validateXML(xml2);
      if (!xml2Validation.isValid) {
        showValidationFeedback(xml2Input, false, xml2Validation.error);
        showError("XML File 2 Error: " + xml2Validation.error);
        return;
      }

      setLoadingState(true, 'xmlCompareBtn');

      fetch("/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml1, xml2 })
      })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false, 'xmlCompareBtn');
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        updateResultsForFormat('XML');
        document.getElementById("resultsSection").classList.remove("hidden");
        
        const leftPanel = document.getElementById("highlight-left");
        const rightPanel = document.getElementById("highlight-right");
        
        if (leftPanel) leftPanel.innerHTML = data.left || xml1;
        if (rightPanel) rightPanel.innerHTML = data.right || xml2;
        
        if (data.statistics) updateStatistics(data.statistics, 'xml');
        
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
        showSuccess("XML comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false, 'xmlCompareBtn');
        showError("An error occurred: " + error.message);
      });
    });
  }
  
  // JSON Compare button
  const jsonCompareBtn = document.getElementById("jsonCompareBtn");
  if (jsonCompareBtn) {
    jsonCompareBtn.addEventListener("click", function () {
      const json1 = document.getElementById("jsonText1").value.trim();
      const json2 = document.getElementById("jsonText2").value.trim();

      if (!json1 || !json2) {
        showError("Please paste JSON content into both text boxes.");
        return;
      }

      const json1Validation = validateJSON(json1);
      if (!json1Validation.isValid) {
        showError("JSON File 1 Error: " + json1Validation.error);
        return;
      }

      const json2Validation = validateJSON(json2);
      if (!json2Validation.isValid) {
        showError("JSON File 2 Error: " + json2Validation.error);
        return;
      }

      setLoadingState(true, 'jsonCompareBtn');

      fetch("/compare_json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json1, json2 })
      })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false, 'jsonCompareBtn');
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        updateResultsForFormat('JSON');
        document.getElementById("resultsSection").classList.remove("hidden");
        
        const leftPanel = document.getElementById("highlight-left");
        const rightPanel = document.getElementById("highlight-right");
        
        if (leftPanel) leftPanel.innerHTML = data.left || json1;
        if (rightPanel) rightPanel.innerHTML = data.right || json2;
        
        if (data.statistics) updateStatistics(data.statistics, 'json');
        
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
        showSuccess("JSON comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false, 'jsonCompareBtn');
        showError("An error occurred: " + error.message);
      });
    });
  }
  
  // Text Compare button
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1, text2 })
      })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false, 'textCompareBtn');
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        updateResultsForFormat('Text');
        document.getElementById("resultsSection").classList.remove("hidden");
        
        const leftPanel = document.getElementById("highlight-left");
        const rightPanel = document.getElementById("highlight-right");
        
        if (leftPanel) leftPanel.innerHTML = data.left || text1;
        if (rightPanel) rightPanel.innerHTML = data.right || text2;
        
        if (data.statistics) updateStatistics(data.statistics, 'text');
        
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
        showSuccess("Text comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false, 'textCompareBtn');
        showError("An error occurred: " + error.message);
      });
    });
  }

  // CSV Compare button
  const csvCompareBtn = document.getElementById("csvCompareBtn");
  if (csvCompareBtn) {
    csvCompareBtn.addEventListener("click", function () {
      const csv1 = document.getElementById("csvText1").value.trim();
      const csv2 = document.getElementById("csvText2").value.trim();

      if (!csv1 || !csv2) {
        showError("Please paste CSV content into both text boxes.");
        return;
      }

      // Validate CSV content
      const validation1 = validateCSV(csv1);
      const validation2 = validateCSV(csv2);

      if (!validation1.isValid) {
        showError("CSV 1 validation failed: " + validation1.error);
        return;
      }

      if (!validation2.isValid) {
        showError("CSV 2 validation failed: " + validation2.error);
        return;
      }

      setLoadingState(true, 'csvCompareBtn');

      fetch("/compare_csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv1, csv2 })
      })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false, 'csvCompareBtn');
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        updateResultsForFormat('CSV');
        document.getElementById("resultsSection").classList.remove("hidden");
        
        const leftPanel = document.getElementById("highlight-left");
        const rightPanel = document.getElementById("highlight-right");
        
        if (leftPanel) leftPanel.innerHTML = data.left || csv1;
        if (rightPanel) rightPanel.innerHTML = data.right || csv2;
        
        if (data.statistics) updateStatistics(data.statistics, 'csv');
        
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
        showSuccess("CSV comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false, 'csvCompareBtn');
        showError("An error occurred: " + error.message);
      });
    });
  }

  // YAML Compare button
  const yamlCompareBtn = document.getElementById("yamlCompareBtn");
  if (yamlCompareBtn) {
    yamlCompareBtn.addEventListener("click", function () {
      const yaml1 = document.getElementById("yamlText1").value.trim();
      const yaml2 = document.getElementById("yamlText2").value.trim();

      if (!yaml1 || !yaml2) {
        showError("Please paste YAML content into both text boxes.");
        return;
      }

      // Validate YAML content
      const validation1 = validateYAML(yaml1);
      const validation2 = validateYAML(yaml2);

      if (!validation1.isValid) {
        showError("YAML 1 validation failed: " + validation1.error);
        return;
      }

      if (!validation2.isValid) {
        showError("YAML 2 validation failed: " + validation2.error);
        return;
      }

      setLoadingState(true, 'yamlCompareBtn');

      fetch("/compare_yaml", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ yaml1, yaml2 })
      })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false, 'yamlCompareBtn');
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        updateResultsForFormat('YAML');
        document.getElementById("resultsSection").classList.remove("hidden");
        
        const leftPanel = document.getElementById("highlight-left");
        const rightPanel = document.getElementById("highlight-right");
        
        if (leftPanel) leftPanel.innerHTML = data.left || yaml1;
        if (rightPanel) rightPanel.innerHTML = data.right || yaml2;
        
        if (data.statistics) updateStatistics(data.statistics, 'yaml');
        
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth' });
        showSuccess("YAML comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false, 'yamlCompareBtn');
        showError("An error occurred: " + error.message);
      });
    });
  }

  // Reset button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      document.querySelectorAll('textarea').forEach(textarea => {
        textarea.value = "";
      });
      
      const resultsSection = document.getElementById("resultsSection");
      if (resultsSection) {
        resultsSection.classList.add("hidden");
      }
    });
  }

  // Clear buttons
  document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const target = document.getElementById(targetId);
      if (target) {
        target.value = '';
        target.focus();
      }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to compare current format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      
      const activeTab = document.querySelector('.format-tab.bg-blue-600');
      if (activeTab) {
        const format = activeTab.getAttribute('data-format');
        const compareBtn = document.getElementById(`${format}CompareBtn`);
        if (compareBtn && !compareBtn.disabled) {
          compareBtn.click();
        }
      }
    }
    
    // Alt + number keys (1-5) to switch formats
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const formats = ['xml', 'json', 'text', 'csv', 'yaml'];
      const keyNum = parseInt(e.key);
      
      if (keyNum >= 1 && keyNum <= 5) {
        e.preventDefault();
        switchFormat(formats[keyNum - 1]);
      }
    }
    
    // Ctrl/Cmd + R to reset
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      const resetBtn = document.getElementById('resetBtn');
      if (resetBtn) {
        resetBtn.click();
      }
    }
  });

  // Add keyboard shortcut hints
  const shortcutHint = document.createElement('div');
  shortcutHint.className = 'fixed bottom-4 right-4 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 z-50';
  shortcutHint.innerHTML = `
    <div class="space-y-1">
      <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+Enter</kbd> Compare</div>
      <div><kbd class="bg-gray-700 px-1 rounded">Alt+1-5</kbd> Switch format</div>
      <div><kbd class="bg-gray-700 px-1 rounded">Ctrl+R</kbd> Reset</div>
    </div>
  `;
  document.body.appendChild(shortcutHint);
  
  // Show shortcut hint briefly on load
  setTimeout(() => {
    shortcutHint.style.opacity = '1';
    setTimeout(() => {
      shortcutHint.style.opacity = '0';
    }, 3000);
  }, 1000);
});
