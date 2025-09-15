// Multi-format comparison tool JavaScript
// Supports XML, JSON, and Text comparison with enhanced validation and UI

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
  
  // Show selected section
  const targetSection = document.getElementById(`${format}Section`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }
  
  // Hide results when switching formats
  const resultsSection = document.getElementById('resultsSection');
  if (resultsSection) {
    resultsSection.classList.add('hidden');
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
      const xml1 = document.getElementById("xmlText1").value.trim();
      const xml2 = document.getElementById("xmlText2").value.trim();

      if (!xml1 || !xml2) {
        showError("Please paste XML content into both text boxes.");
        return;
      }

      const xml1Validation = validateXML(xml1);
      if (!xml1Validation.isValid) {
        showError("XML File 1 Error: " + xml1Validation.error);
        return;
      }

      const xml2Validation = validateXML(xml2);
      if (!xml2Validation.isValid) {
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
});
