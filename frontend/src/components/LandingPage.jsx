import { Link } from 'react-router-dom';
import '../styles/landing.css';

export function LandingPage() {
    return (
        <div>
            {/* Navigation */}
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src="/img/logo.png" alt="Logo" className="nav-logo-img" />
                        <span className="nav-logo-text">
                            Universal <span className="nav-highlight">Differencer</span>
                        </span>
                    </div>
                    <div className="nav-menu">
                        <a href="#features" className="nav-link">Features</a>
                        <a href="#how-it-works" className="nav-link">How it Works</a>
                        <Link to="/compare" className="nav-link nav-cta">Start Comparing</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <i className="fas fa-sparkles"></i>
                            <span>Multi-Format Support</span>
                        </div>
                        <h1 className="hero-title">
                            Compare <span className="hero-gradient">XML, JSON, Text, CSV & YAML</span><br />
                            Files with Precision
                        </h1>
                        <p className="hero-description">
                            Professional file comparison tool that highlights differences with surgical precision.
                            Support for XML, JSON, Text, CSV, and YAML formats with advanced highlighting and detailed analysis.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/compare" className="btn btn-primary">
                                <i className="fas fa-rocket"></i>
                                Start Comparing
                            </Link>
                            <a href="#how-it-works" className="btn btn-secondary">
                                <i className="fas fa-play-circle"></i>
                                See How it Works
                            </a>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <div className="stat-number">5</div>
                                <div className="stat-label">File Formats</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">100%</div>
                                <div className="stat-label">Accurate</div>
                            </div>
                            <div className="stat">
                                <div className="stat-number">Fast</div>
                                <div className="stat-label">Processing</div>
                            </div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-card">
                            <div className="card-header">
                                <div className="card-dots">
                                    <span className="dot red"></span>
                                    <span className="dot yellow"></span>
                                    <span className="dot green"></span>
                                </div>
                                <div className="card-title">comparison.xml</div>
                            </div>
                            <div className="card-content">
                                <div className="code-line">
                                    <span className="tag">&lt;person&gt;</span>
                                </div>
                                <div className="code-line highlight-add">
                                    <span className="indent">  &lt;name&gt;</span><span className="text">Alice</span><span className="tag">&lt;/name&gt;</span>
                                </div>
                                <div className="code-line">
                                    <span className="indent">  &lt;age&gt;</span><span className="text">25</span><span className="tag">&lt;/age&gt;</span>
                                </div>
                                <div className="code-line highlight-remove">
                                    <span className="indent">  &lt;status&gt;</span><span className="text">active</span><span className="tag">&lt;/status&gt;</span>
                                </div>
                                <div className="code-line">
                                    <span className="tag">&lt;/person&gt;</span>
                                </div>
                            </div>
                        </div>
                        <div className="floating-elements">
                            <div className="floating-icon xml">XML</div>
                            <div className="floating-icon json">JSON</div>
                            <div className="floating-icon text">TXT</div>
                            <div className="floating-icon csv">CSV</div>
                            <div className="floating-icon yaml">YAML</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="features-container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Our <span className="gradient-text">Differencer</span>?</h2>
                        <p className="section-description">Advanced comparison technology that adapts to your workflow</p>
                    </div>

                    <div className="features-showcase">
                        <div className="primary-feature">
                            <div className="primary-feature-content">
                                <div className="feature-number">01</div>
                                <h3 className="primary-feature-title">Smart Multi-Format Detection</h3>
                                <p className="primary-feature-description">
                                    Our engine automatically detects file formats and applies the most appropriate
                                    comparison algorithms. Whether it's XML structures, JSON objects, plain text, CSV data, or YAML configurations -
                                    we've got you covered with precision parsing.
                                </p>
                                <div className="feature-highlights">
                                    <div className="highlight-item">
                                        <i className="fas fa-file-code"></i>
                                        <span>XML Structure Analysis</span>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fas fa-brackets-curly"></i>
                                        <span>JSON Object Mapping</span>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fas fa-file-text"></i>
                                        <span>Text Line Comparison</span>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fas fa-table"></i>
                                        <span>CSV Data Analysis</span>
                                    </div>
                                    <div className="highlight-item">
                                        <i className="fas fa-cog"></i>
                                        <span>YAML Configuration</span>
                                    </div>
                                </div>
                            </div>
                            <div className="primary-feature-visual">
                                <div className="format-cards">
                                    <div className="format-card xml-card">
                                        <i className="fas fa-code"></i>
                                        <span>XML</span>
                                    </div>
                                    <div className="format-card json-card">
                                        <i className="fab fa-js"></i>
                                        <span>JSON</span>
                                    </div>
                                    <div className="format-card text-card">
                                        <i className="fas fa-file-alt"></i>
                                        <span>TEXT</span>
                                    </div>
                                    <div className="format-card csv-card">
                                        <i className="fas fa-table"></i>
                                        <span>CSV</span>
                                    </div>
                                    <div className="format-card yaml-card">
                                        <i className="fas fa-cog"></i>
                                        <span>YAML</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="steps-section">
                <div className="steps-container">
                    <div className="section-header">
                        <h2 className="section-title">Experience the <span className="gradient-text">Magic</span> in 3 Steps</h2>
                        <p className="section-description">From upload to insights in seconds - it's that simple</p>
                    </div>

                    <div className="process-timeline">
                        <div className="timeline-line"></div>

                        <div className="process-step">
                            <div className="step-indicator">
                                <div className="step-number">01</div>
                                <div className="step-pulse"></div>
                            </div>
                            <div className="step-content">
                                <div className="step-visual">
                                    <div className="upload-animation">
                                        <i className="fas fa-cloud-upload-alt"></i>
                                        <div className="upload-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title">Choose & Upload</h3>
                                    <p className="step-description">
                                        Select your file format and paste your content. Our smart interface
                                        automatically detects XML, JSON, Text, CSV, or YAML formats for optimal processing.
                                    </p>
                                    <div className="step-features">
                                        <span className="feature-tag">Smart Detection</span>
                                        <span className="feature-tag">Format Validation</span>
                                        <span className="feature-tag">Instant Preview</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-indicator">
                                <div className="step-number">02</div>
                                <div className="step-pulse"></div>
                            </div>
                            <div className="step-content">
                                <div className="step-visual">
                                    <div className="analysis-animation">
                                        <i className="fas fa-brain"></i>
                                        <div className="analysis-waves">
                                            <div className="wave"></div>
                                            <div className="wave"></div>
                                            <div className="wave"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title">Fast Analysis</h3>
                                    <p className="step-description">
                                        Our advanced algorithms analyze your files with precision, identifying
                                        every change while maintaining context and structure integrity.
                                    </p>
                                    <div className="step-features">
                                        <span className="feature-tag">Checks Formats</span>
                                        <span className="feature-tag">Context Aware</span>
                                        <span className="feature-tag">Lightning Fast</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="process-step">
                            <div className="step-indicator">
                                <div className="step-number">03</div>
                                <div className="step-pulse"></div>
                            </div>
                            <div className="step-content">
                                <div className="step-visual">
                                    <div className="results-animation">
                                        <i className="fas fa-chart-line"></i>
                                        <div className="results-sparkles">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                                <div className="step-info">
                                    <h3 className="step-title">Beautiful Results</h3>
                                    <p className="step-description">
                                        Get stunning visual comparisons with detailed statistics, color-coded
                                        highlighting, and actionable insights in a professional interface.
                                    </p>
                                    <div className="step-features">
                                        <span className="feature-tag">Visual Excellence</span>
                                        <span className="feature-tag">Detailed Stats</span>
                                        <span className="feature-tag">Export Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <img src="/img/logo.png" alt="Logo" className="footer-logo-img" />
                            <span className="footer-logo-text">Universal Differencer</span>
                        </div>
                        <div className="footer-links">
                            <Link to="/compare" className="footer-link">Compare Files</Link>
                            <a href="#features" className="footer-link">Features</a>
                            <a href="#how-it-works" className="footer-link">How it Works</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p className="footer-text">
                            Built with <i className="fas fa-heart" style={{ color: '#e74c3c' }}></i> by
                            <a href="https://www.instagram.com/_ne.vin05/" target="_blank" rel="noopener noreferrer" className="footer-author"> Nevin</a>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
