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
      } else if (errorText.includes("XML declaration")) {
        cleanError = `Invalid XML declaration${lineRef}`;
      } else if (errorText.includes("StartTag:")) {
        cleanError = `Invalid start tag${lineRef}`;
      } else if (errorText.includes("EndTag:")) {
        cleanError = `Invalid end tag${lineRef}`;
      } else {
        // Extract just the core error without browser-specific formatting
        const errorLines = errorText.split('\n');
        for (let line of errorLines) {
          if (line.includes('error on line') || line.includes('Error:')) {
            // Extract the actual error description
            const parts = line.split(':');
            if (parts.length > 2) {
              cleanError = parts.slice(2).join(':').trim() + lineRef;
              break;
            }
          }
        }
        if (cleanError === "Invalid XML syntax") {
          cleanError = `Invalid XML syntax${lineRef}`;
        }
      }
      
      return { 
        isValid: false, 
        error: cleanError
      };
    }

    // Check if there's a root element
    if (!doc.documentElement) {
      return { 
        isValid: false, 
        error: "XML must have a root element" 
      };
    }

    // Check for multiple root elements
    const rootChildren = Array.from(doc.childNodes).filter(node => 
      node.nodeType === Node.ELEMENT_NODE
    );
    
    if (rootChildren.length === 0) {
      return { 
        isValid: false, 
        error: "XML must contain at least one element" 
      };
    }
    
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

// Legacy function for backward compatibility
function isValidXML(xmlStr) {
  return validateXML(xmlStr).isValid;
}

function showError(message) {
  // Create a toast notification
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 4000);
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
  toast.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
      <span>${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => document.body.removeChild(toast), 300);
  }, 3000);
}

function setLoadingState(isLoading) {
  const btn = document.getElementById("compareBtn");
  const btnText = document.getElementById("btnText");
  const spinner = document.getElementById("loadingSpinner");
  
  if (isLoading) {
    btn.disabled = true;
    btnText.textContent = "Comparing...";
    spinner.classList.remove("hidden");
  } else {
    btn.disabled = false;
    btnText.textContent = "Compare XML Files";
    spinner.classList.add("hidden");
  }
}

function updateStatistics(diffs) {
  const totalDiffs = diffs.length;
  const missingTags = diffs.filter(d => d['Difference Type'] === 'Tag missing').length;
  const extraTags = diffs.filter(d => d['Difference Type'] === 'Extra tag').length;
  const mismatchTags = diffs.filter(d => d['Difference Type'].includes('mismatch')).length;
  
  document.getElementById('totalDiffs').textContent = totalDiffs;
  document.getElementById('missingTags').textContent = missingTags;
  document.getElementById('extraTags').textContent = extraTags;
  document.getElementById('mismatchTags').textContent = mismatchTags;
}

function getDiffTypeBadge(diffType) {
  const badges = {
    'Tag missing': 'diff-badge diff-badge-missing',
    'Extra tag': 'diff-badge diff-badge-extra',
    'Attribute missing': 'diff-badge diff-badge-missing',
    'Attribute mismatch': 'diff-badge diff-badge-mismatch',
    'Text mismatch': 'diff-badge diff-badge-text'
  };
  
  return badges[diffType] || 'diff-badge diff-badge-text';
}

function populateDifferencesTable(diffs) {
  const tbody = document.getElementById('differencesTableBody');
  tbody.innerHTML = '';
  
  if (diffs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="px-6 py-8 text-center text-gray-500">
          <div class="flex flex-col items-center">
            <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p class="text-lg font-medium">No differences found!</p>
            <p class="text-sm">The XML files are identical.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  diffs.forEach((diff, index) => {
    const row = document.createElement('tr');
    row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="${getDiffTypeBadge(diff['Difference Type'])}">
          ${diff['Difference Type']}
        </span>
      </td>
      <td class="px-6 py-4 text-sm text-gray-900 font-mono break-all">
        ${diff['Tag Path']}
      </td>
      <td class="px-6 py-4 text-sm text-gray-900 font-mono">
        ${diff['Attribute']}
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

function addValidationFeedback(textareaId) {
  const textarea = document.getElementById(textareaId);
  const parent = textarea.parentElement;
  
  // Create feedback element if it doesn't exist
  let feedback = parent.querySelector('.validation-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'validation-feedback text-xs mt-1 hidden';
    parent.appendChild(feedback);
  }
  
  return feedback;
}

function updateValidationFeedback(textareaId) {
  const textarea = document.getElementById(textareaId);
  const content = textarea.value.trim();
  const feedback = addValidationFeedback(textareaId);
  
  if (!content) {
    feedback.className = 'validation-feedback text-xs mt-1 hidden';
    textarea.className = textarea.className.replace(/border-(red|green)-500/g, 'border-gray-300');
    return;
  }
  
  const validation = validateXML(content);
  
  if (validation.isValid) {
    const lineCount = content.split('\n').length;
    feedback.innerHTML = `
      <div class="flex items-center text-green-600">
        <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        Valid XML (${lineCount} line${lineCount === 1 ? '' : 's'})
      </div>
    `;
    feedback.className = 'validation-feedback text-xs mt-1';
    textarea.className = textarea.className.replace(/border-(red|gray-300)-500/g, '') + ' border-green-500';
  } else {
    feedback.innerHTML = `
      <div class="flex items-start text-red-600">
        <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>${validation.error}</span>
      </div>
    `;
    feedback.className = 'validation-feedback text-xs mt-1';
    textarea.className = textarea.className.replace(/border-(green|gray-300)-500/g, '') + ' border-red-500';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const compareBtn = document.getElementById("compareBtn");
  const resetBtn = document.getElementById("resetBtn");
  const clearText1 = document.getElementById("clearText1");
  const clearText2 = document.getElementById("clearText2");
  const helpBtn1 = document.getElementById("helpBtn1");
  const helpBtn2 = document.getElementById("helpBtn2");
  const xmlHelp = document.getElementById("xmlHelp");
  
  // Compare button event
  compareBtn.addEventListener("click", function () {
    const xml1 = document.getElementById("text1").value.trim();
    const xml2 = document.getElementById("text2").value.trim();

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

    setLoadingState(true);

    fetch("/compare", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ xml1, xml2 })
    })
      .then(response => response.json())
      .then(data => {
        setLoadingState(false);
        
        if (data.error) {
          showError("Error: " + data.error);
          return;
        }

        // Show results section
        document.getElementById("resultsSection").classList.remove("hidden");
        
        // Update highlighted XML displays
        document.getElementById("highlight-left").innerHTML = data.left || formatXMLForDisplay(xml1);
        document.getElementById("highlight-right").innerHTML = data.right || formatXMLForDisplay(xml2);
        
        // Update statistics
        if (data.statistics) {
          document.getElementById('totalDiffs').textContent = data.statistics.total_differences;
          document.getElementById('missingTags').textContent = data.statistics.missing_tags;
          document.getElementById('extraTags').textContent = data.statistics.extra_tags;
          document.getElementById('mismatchTags').textContent = data.statistics.attribute_mismatches + data.statistics.text_mismatches;
        }
        
        // Populate differences table
        if (data.differences) {
          populateDifferencesTable(data.differences);
        }
        
        // Scroll to results
        document.getElementById("resultsSection").scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        showSuccess("XML comparison completed successfully!");
      })
      .catch(error => {
        setLoadingState(false);
        showError("An error occurred during comparison: " + error.message);
        console.error(error);
      });
  });
  
  // Reset button event
  resetBtn.addEventListener("click", function() {
    document.getElementById("text1").value = "";
    document.getElementById("text2").value = "";
    document.getElementById("resultsSection").classList.add("hidden");
    document.getElementById("text1").focus();
  });
  
  // Clear buttons
  clearText1.addEventListener("click", function() {
    document.getElementById("text1").value = "";
    document.getElementById("text1").focus();
  });
  
  clearText2.addEventListener("click", function() {
    document.getElementById("text2").value = "";
    document.getElementById("text2").focus();
  });
  
  // Help buttons
  helpBtn1.addEventListener("click", function() {
    xmlHelp.classList.toggle("hidden");
  });
  
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
  
  // Help buttons
  helpBtn1.addEventListener("click", function() {
    xmlHelp.classList.toggle("hidden");
  });
  
  helpBtn2.addEventListener("click", function() {
    xmlHelp.classList.toggle("hidden");
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
