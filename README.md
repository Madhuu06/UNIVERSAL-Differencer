# Multi-Format Differencer

A powerful, modern web-based comparison tool supporting XML, JSON, and Text files with professional-grade analysis and beautiful visualizations.

## ✨ Features

### 🎯 Smart Multi-Format Detection
- **Intelligent format recognition** - automatically detects XML, JSON, or Text
- **Format-specific parsing** with optimized algorithms for each type
- **Real-time validation** with immediate visual feedback
- **Comprehensive error reporting** with line numbers and context

### 📊 Advanced Comparison Engine
- **Precision highlighting** that targets exact changes without affecting other content
- **Smart statistics** showing additions, deletions, and modifications
- **Visual comparison** with color-coded differences
- **Professional results display** with clean, modern interface

### 🎨 Modern Professional Design
- **Stunning landing page** with interactive elements and animations
- **Glassmorphism navigation** with smooth transitions
- **Timeline-based process visualization** with animated steps
- **Responsive design** that works beautifully on all devices
- **Professional typography** with Inter font family
- **Gradient effects** and modern color schemes

### � Enhanced User Experience
- **Tabbed interface** for easy format switching
- **Real-time validation feedback** as you type
- **Animated visual effects** including floating elements and pulse animations
- **Smart analytics dashboard** with comprehensive insights
- **Instant results** with optimized performance
- **100% secure** - all processing happens locally

## 🛠️ Technology Stack

- **Backend**: Python Flask 2.3.3 with enhanced multi-format processing
- **Frontend**: Modern HTML5, CSS3 with animations, Vanilla JavaScript
- **Processing**: 
  - XML: Python's xml.etree.ElementTree with custom highlighting
  - JSON: Native JSON parsing with object mapping
  - Text: difflib.SequenceMatcher for line-by-line comparison
- **Styling**: Custom CSS with Tailwind utilities, gradient effects, and animations
- **Fonts**: Inter font family with Font Awesome icons
- **Design**: Professional glassmorphism effects and modern UI patterns

## 🚀 Supported Formats

### XML Files
- Structure-aware comparison with element-level precision
- Attribute and text content analysis
- Hierarchical difference detection
- Syntax validation with detailed error reporting

### JSON Files  
- Object and array comparison with nested support
- Key-value pair analysis
- Type-aware difference detection
- JSON validation with error highlighting

### Text Files
- Line-by-line comparison with context
- Word-level and character-level differences
- Modified line detection (not just additions/deletions)
- Clean, readable difference visualization

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Madhuu06/XML-Differencer.git
   cd XML-Differencer
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
   pip install -r requirements.txt
   ```

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Open browser** and navigate to:
   - **Landing Page**: `http://127.0.0.1:5000/`
   - **Comparison Tool**: `http://127.0.0.1:5000/compare`

## 🚀 Deploy to Render

This application is ready for deployment on [Render](https://render.com) with the following configuration:

### Option 1: Using render.yaml (Recommended)
1. Connect your GitHub repository to Render
2. The `render.yaml` file will automatically configure the deployment
3. Render will use Gunicorn as the WSGI server for production

### Option 2: Manual Setup
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
   - **Environment**: Python 3
   - **Plan**: Free (or your preferred plan)

### Production Features
- ✅ **Gunicorn WSGI server** for production performance
- ✅ **Environment-based configuration** with PORT detection
- ✅ **Production-ready Flask settings** (debug=False)
- ✅ **Automatic dependency management** via requirements.txt
- ✅ **Cross-platform compatibility** for Linux deployment

## 🎯 How to Use

### Step 1: Choose Your Format
- Visit the modern landing page with interactive design
- Click "Try It Now" to access the comparison tool
- Select your format tab (XML, JSON, or Text)

### Step 2: Input Your Content
- Paste your content into the side-by-side text areas
- Real-time validation shows format correctness
- Visual indicators guide you through any errors

### Step 3: View Beautiful Results
- Click "Compare" to see professional analysis
- Review color-coded differences with precision highlighting
- Check comprehensive statistics and insights

## 🎨 Interface Features

- **Modern Landing Page**: Professional design with animations and interactive elements
- **Tabbed Interface**: Easy switching between XML, JSON, and Text formats
- **Real-time Validation**: Instant feedback with visual indicators
- **Professional Results**: Clean statistics display without overwhelming details
- **Responsive Design**: Perfect experience on desktop, tablet, and mobile

## 🗂️ Project Structure

```
Multi-Format-Differencer/
├── app.py                    # Flask application with multi-format support
├── xml_compare.py           # XML parsing and comparison logic
├── highlight_util.py        # Precision highlighting utilities
├── templates/
│   ├── index.html          # Multi-format comparison interface
│   └── landing.html        # Modern landing page with animations
├── static/
│   ├── script.js           # Multi-format frontend JavaScript
│   ├── highlight.css       # Comparison styling with animations
│   ├── landingp.css        # Modern landing page styles
│   └── img/                # Professional images and icons
├── requirements.txt         # Python dependencies
└── README.md               # This documentation
```

## 🚀 Recent Major Updates

### Version 2.0 - Modern Redesign
- ✅ **Complete UI/UX overhaul** with professional modern design
- ✅ **Multi-format support** - XML, JSON, and Text comparison
- ✅ **Interactive landing page** with animations and visual effects
- ✅ **Enhanced comparison engine** with precision highlighting
- ✅ **Improved statistics** showing modified lines vs separate add/delete
- ✅ **Professional styling** with glassmorphism and gradient effects
- ✅ **Responsive design** optimized for all screen sizes
- ✅ **Timeline visualization** for the "How It Works" section

### Previous Improvements
- ✅ Enhanced error messages with line numbers
- ✅ Real-time validation across all formats
- ✅ Comprehensive error detection
- ✅ Visual feedback system
- ✅ Tabbed interface for format switching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper testing
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Madhuu06** - *Full-stack Developer*
- GitHub: [@Madhuu06](https://github.com/Madhuu06)
- Project: [XML-Differencer](https://github.com/Madhuu06/XML-Differencer)

Built with ❤️ and modern web technologies

---

## 🌟 Demo

Experience the modern, professional file comparison tool with:
- **Beautiful landing page** with interactive animations
- **Smart multi-format detection** for XML, JSON, and Text
- **Professional results** with precision highlighting
- **Responsive design** that works on any device

Try it now at the live demo or clone and run locally!
