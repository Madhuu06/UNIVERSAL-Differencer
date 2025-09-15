# XML Differencer

A modern, web-based XML comparison tool with enhanced validation and visual feedback.

## Features

### 🎯 Advanced XML Validation
- **Real-time validation** with immediate visual feedback
- **Line number reporting** for precise error location
- **Comprehensive error detection** including:
  - Tag mismatches with specific tag names
  - Multiple root element detection
  - Unclosed tags and CDATA sections
  - Invalid XML declarations
  - Missing brackets and syntax errors

### 📊 Intelligent Comparison
- **Side-by-side XML comparison** with syntax highlighting
- **Statistics dashboard** showing:
  - Total differences count
  - Missing tags (red indicator)
  - Extra tags (green indicator)
  - Mismatches (orange indicator)
- **Detailed differences table** with categorized results
- **Visual highlighting** of differences in XML content

### 🎨 Modern User Interface
- **Responsive design** that works on all devices
- **Clean, professional layout** with Tailwind CSS
- **Toast notifications** for user feedback
- **Loading states** during processing
- **Interactive help section** with XML requirements
- **Auto-resizing text areas** for better UX

### 🛠️ Enhanced User Experience
- **Clear and reset buttons** for easy content management
- **Real-time validation feedback** as you type
- **Context-sensitive error messages** with line numbers
- **Visual indicators** (green/red borders) for validation status
- **Keyboard shortcuts guidance** (Ctrl+G to jump to lines)

## Technology Stack

- **Backend**: Python Flask with CORS support
- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript
- **XML Processing**: Python's xml.etree.ElementTree
- **Validation**: Custom validation with DOMParser integration
- **Styling**: Modern CSS with smooth animations and transitions

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd xml-differencer
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate virtual environment**:
   - Windows: `.venv\Scripts\activate`
   - macOS/Linux: `source .venv/bin/activate`

4. **Install dependencies**:
   ```bash
   pip install flask flask-cors
   ```

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Open browser** and navigate to `http://127.0.0.1:5000/compare`

## Usage

1. **Paste XML content** into the two text areas
2. **Real-time validation** will show if your XML is valid
3. **Click "Compare XML Files"** to see differences
4. **View results** in the statistics dashboard and detailed table
5. **Use the help section** for XML formatting guidance

## Error Messages

The application provides clear, actionable error messages:

- `Tag mismatch: opening tag 'title' does not match closing tag 'book' (line 11)`
- `Multiple root elements detected - XML must have exactly one root element`
- `Unclosed XML tag detected (line 5)`
- `Missing '>' in XML tag (line 3)`

## File Structure

```
xml-differencer/
├── app.py                 # Flask application
├── xml_compare.py         # XML parsing and comparison logic
├── highlight_util.py      # XML highlighting utilities
├── templates/
│   ├── index.html        # Main comparison page
│   └── landing.html      # Landing page
├── static/
│   ├── script.js         # Frontend JavaScript
│   ├── highlight.css     # Custom CSS styles
│   ├── landingp.css      # Landing page styles
│   └── img/              # Images and icons
└── requirements.txt      # Python dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built with ❤ by Nevin

---

## Recent Improvements

- ✅ Enhanced error messages with line numbers
- ✅ Real-time XML validation
- ✅ Modern responsive UI design
- ✅ Comprehensive error detection
- ✅ Statistics dashboard
- ✅ Visual feedback system
- ✅ Help section with examples
