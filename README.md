#  UNIVERSAL Differencer

A comprehensive, modern web-based file comparison tool that supports **5 major formats** (XML, JSON, CSV, Text, YAML) with precision highlighting and professional-grade analysis.

##  Key Features

### **Universal Format Support**
- **XML Files**: Structure-aware comparison with element-level precision
- **JSON Objects**: Nested object/array comparison with exact value mapping
- **CSV Data**: Content-based matching with cell-level highlighting
- **Text Files**: Line-by-line analysis with clean formatting
- **YAML Documents**: Hierarchical structure comparison
- **Intelligent format detection** and validation

###  **Precision Analysis Engine**
- **Cell-level highlighting** - highlights only actual differences, not entire rows/objects
- **Content-based matching** - CSV comparison uses logical keys instead of position
- **Exact value mapping** - JSON comparison prevents false positive highlighting
- **Clean output formatting** - text comparison without line number artifacts
- **Smart statistics** - accurate difference counting and categorization

##  Technology Stack

- **Backend**: Python Flask 2.3.3 with multi-format processing engine
- **Frontend**: Modern HTML5, CSS3 with animations, Vanilla JavaScript
- **Comparison Algorithms**: 
  - **XML**: ElementTree with structure-aware parsing
  - **JSON**: Native parsing with recursive object comparison
  - **CSV**: DictReader with content-based primary key matching
  - **Text**: difflib.SequenceMatcher for precise line analysis
  - **YAML**: PyYAML with hierarchical difference detection
- **Styling**: Custom CSS with glassmorphism effects and smooth animations
- **Deployment**: Flask WSGI with Render.com hosting support

## Supported Formats & Capabilities

| Format | Features | Highlighting | Use Cases |
|--------|----------|--------------|-----------|
| **XML** | Structure-aware, attribute comparison, validation | Element-level precision | Configuration files, data exchange |
| **JSON** | Nested objects/arrays, type-aware, exact mapping | Value-level accuracy | APIs, configuration, data storage |
| **CSV** | Content-based matching, header detection, cell-level | Individual cell changes | Data analysis, spreadsheets, reports |
| **Text** | Line-by-line, word-level, clean formatting | Precise line targeting | Documentation, code, logs |
| **YAML** | Hierarchical structure, nested comparison | Structure-aware | Configuration files, CI/CD, Kubernetes |


##  How to Use

### Step 1: Choose Your Format
Navigate to the modern landing page and select your comparison format from the tabbed interface.

### Step 2: Input Your Content
- Paste or upload your files into the side-by-side text areas
- Real-time validation provides immediate feedback
- Format-specific error detection guides you through any issues

### Step 3: Analyze Results
- Click "Compare" to generate detailed analysis
- Review precision highlighting showing only actual differences
- Examine comprehensive statistics and insights


## Project Structure

```
UNIVERSAL-Differencer/
├──  app.py                    # Flask application with 5-format support
├──  xml_compare.py           # XML parsing and comparison logic
├──  highlight_util.py        # Precision highlighting utilities
├──  requirements.txt         # Python dependencies
├──  Procfile                 # Deployment configuration
├──  render.yaml             # Render.com deployment settings
├──  README.md               # Project documentation
├──  templates/
│   ├──  landing.html        # Modern landing page
│   └──  index.html          # Multi-format comparison interface
├──  static/
│   ├──  landingp.css        # Landing page styling
│   ├──  highlight.css       # Comparison results styling
│   ├──  script.js           # Frontend JavaScript logic
│   └──  img/               # Images and icons
└──  .venv/                  # Virtual environment (local)
```



