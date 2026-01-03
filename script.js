/**
 * Nurse Pedia - Enhanced JavaScript Functionality
 * Features: Dark Mode, PDF Export, Search, Lazy Loading, Smooth Scroll
 * @version 2.0.0
 */

/* ==========================================
 * 1. DARK MODE FUNCTIONALITY
 * ========================================== */
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Apply saved theme on load
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateToggleIcon();

        // Set up toggle button
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Listen to system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        this.setTheme(this.theme === 'light' ? 'dark' : 'light');
    }

    setTheme(newTheme) {
        this.theme = newTheme;
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateToggleIcon();
    }

    updateToggleIcon() {
        const toggleBtn = document.getElementById('darkModeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.className = this.theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
            }
        }
    }
}

/* ==========================================
 * 2. SEARCH FUNCTIONALITY
 * ========================================== */
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        if (this.searchInput) {
            this.init();
        }
    }

    init() {
        // Debounce search input
        let searchTimeout;
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.performSearch(e.target.value), 300);
        });
    }

    performSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        const lessonCards = document.querySelectorAll('.lesson-card');

        if (!searchTerm) {
            // Show all cards when search is empty
            lessonCards.forEach(card => {
                card.style.display = '';
                this.removeHighlight(card);
            });
            return;
        }

        lessonCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';
            const matches = title.includes(searchTerm) || description.includes(searchTerm);

            card.style.display = matches ? '' : 'none';

            if (matches) {
                this.highlightText(card, searchTerm);
            } else {
                this.removeHighlight(card);
            }
        });
    }

    highlightText(card, term) {
        this.removeHighlight(card);
        const title = card.querySelector('h3');
        const desc = card.querySelector('p');

        [title, desc].forEach(element => {
            if (element) {
                const text = element.textContent;
                const regex = new RegExp(`(${term})`, 'gi');
                const highlighted = text.replace(regex, '<mark>$1</mark>');
                element.innerHTML = highlighted;
            }
        });
    }

    removeHighlight(card) {
        const marks = card.querySelectorAll('mark');
        marks.forEach(mark => {
            const parent = mark.parentNode;
            parent.replaceChild(document.createTextNode(mark.textContent), mark);
            parent.normalize();
        });
    }
}

/* ==========================================
 * 3. LAZY LOADING FOR IMAGES
 * ========================================== */
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        if ('IntersectionObserver' in window) {
            this.init();
        } else {
            this.loadAllImages();
        }
    }

    init() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.images.forEach(img => imageObserver.observe(img));
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        this.images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/* ==========================================
 * 4. SMOOTH SCROLL & SCROLL TO TOP
 * ========================================== */
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || !href) return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });

        // Scroll to top button
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }
}

/* ==========================================
 * 5. PDF EXPORT WITH ENHANCED OPTIONS
 * ========================================== */
class PDFExporter {
    constructor() {
        this.modal = null;
        this.isGenerating = false;
        this.init();
    }

    init() {
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.showOptions());
        }
    }

    showOptions() {
        if (!this.modal) {
            this.createModal();
        }
        this.modal.style.display = 'flex';
    }

    closeModal() {
        if (this.modal && !this.isGenerating) {
            this.modal.style.display = 'none';
        }
    }

    createModal() {
        const modalHTML = `
            <div id="pdfModal" class="pdf-modal" role="dialog" aria-labelledby="pdfModalTitle" aria-modal="true">
                <div class="pdf-modal-content">
                    <div class="pdf-modal-header">
                        <h3 id="pdfModalTitle"><i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF Export Options</h3>
                        <button class="pdf-close" onclick="pdfExporter.closeModal()" aria-label="Close dialog">&times;</button>
                    </div>
                    <div class="pdf-modal-body">
                        <div class="pdf-option">
                            <label for="pdfFilename">Filename:</label>
                            <input type="text" id="pdfFilename" value="Nurse-Pedia-Notes" aria-label="PDF filename" />
                        </div>
                        <div class="pdf-option">
                            <label for="pdfPageSize">Page Size:</label>
                            <select id="pdfPageSize" aria-label="PDF page size">
                                <option value="a4" selected>A4</option>
                                <option value="letter">Letter</option>
                                <option value="legal">Legal</option>
                            </select>
                        </div>
                        <div class="pdf-option">
                            <label for="pdfOrientation">Orientation:</label>
                            <select id="pdfOrientation" aria-label="PDF orientation">
                                <option value="portrait" selected>Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
                        <div class="pdf-option">
                            <label for="pdfQuality">Quality:</label>
                            <select id="pdfQuality" aria-label="PDF quality">
                                <option value="low">Low (Faster, Smaller)</option>
                                <option value="medium" selected>Medium (Recommended)</option>
                                <option value="high">High (Slower, Larger)</option>
                            </select>
                        </div>
                        <div class="pdf-option pdf-checkbox">
                            <input type="checkbox" id="pdfIncludeImages" checked aria-label="Include images"/>
                            <label for="pdfIncludeImages">Include Images</label>
                        </div>
                        <div class="pdf-option pdf-checkbox">
                            <input type="checkbox" id="pdfIncludePageNumbers" checked aria-label="Add page numbers" />
                            <label for="pdfIncludePageNumbers">Add Page Numbers</label>
                        </div>
                    </div>
                    <div class="pdf-modal-footer">
                        <button class="pdf-btn pdf-btn-cancel" onclick="pdfExporter.closeModal()">Cancel</button>
                        <button class="pdf-btn pdf-btn-generate" onclick="pdfExporter.generate()">
                            <i class="fa-solid fa-download" aria-hidden="true"></i> Generate PDF
                        </button>
                    </div>
                    <div id="pdfProgress" class="pdf-progress" style="display: none;" role="status" aria-live="polite">
                        <div class="pdf-progress-bar">
                            <div class="pdf-progress-fill"></div>
                        </div>
                        <p id="pdfProgressText">Preparing PDF...</p>
                        <p class="pdf-progress-tip">This may take a moment. Please don't close this window.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('pdfModal');

        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal && !this.isGenerating) {
                this.closeModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex' && !this.isGenerating) {
                this.closeModal();
            }
        });
    }

    updateProgress(percentage, message) {
        const progressFill = document.querySelector('.pdf-progress-fill');
        const progressText = document.getElementById('pdfProgressText');
        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = message;
    }

    async generate() {
        if (this.isGenerating || typeof html2pdf === 'undefined') {
            if (typeof html2pdf === 'undefined') {
                alert('PDF library not loaded. Please try again or use browser Print (Ctrl+P).');
            }
            return;
        }

        const filename = document.getElementById('pdfFilename')?.value || 'Nurse-Pedia';
        const pageSize = document.getElementById('pdfPageSize')?.value || 'a4';
        const orientation = document.getElementById('pdfOrientation')?.value || 'portrait';
        const quality = document.getElementById('pdfQuality')?.value || 'medium';
        const includeImages = document.getElementById('pdfIncludeImages')?.checked ?? true;

        const progress = document.getElementById('pdfProgress');
        if (progress) progress.style.display = 'block';
        this.isGenerating = true;

        document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = true);

        try {
            this.updateProgress(10, 'Preparing content...');

            const element = document.querySelector('main') || document.body;
            const clone = element.cloneNode(true);

            this.updateProgress(20, 'Processing content...');

            // Remove unwanted elements
            const removeSelectors = ['.navbar', '.download-btn', '.pdf-modal', '.breadcrumb', '.lesson-navigation', '.scroll-to-top', '.theme-toggle', '.search-container'];
            removeSelectors.forEach(selector => {
                clone.querySelectorAll(selector).forEach(el => el.remove());
            });

            if (!includeImages) {
                clone.querySelectorAll('img').forEach(img => img.remove());
            }

            this.updateProgress(40, 'Configuring PDF settings...');

            const scaleMap = { low: 1.5, medium: 2, high: 3 };
            const qualityMap = { low: 0.7, medium: 0.85, high: 0.98 };

            const opt = {
                margin: [15, 10, 15, 10],
                filename: `${filename}.pdf`,
                image: { type: 'jpeg', quality: qualityMap[quality] },
                html2canvas: {
                    scale: scaleMap[quality],
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm',
                    format: pageSize,
                    orientation: orientation,
                    compress: true
                },
                pagebreak: { mode: ['avoid-all', 'css'], before: '.content-section' }
            };

            this.updateProgress(50, 'Generating PDF (this may take a while)...');

            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'background: white; padding: 20px;';
            wrapper.appendChild(clone);

            await html2pdf().set(opt).from(wrapper).save();

            this.updateProgress(100, 'PDF generated successfully!');

            setTimeout(() => {
                if (progress) progress.style.display = 'none';
                this.closeModal();
                this.isGenerating = false;
                document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = false);
            }, 1000);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try using your browser Print function (Ctrl+P or Cmd+P).');
            if (progress) progress.style.display = 'none';
            this.isGenerating = false;
            document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = false);
        }
    }
}

/* ==========================================
 * 6. INITIALIZATION
 * ========================================== */
let themeManager, searchManager, lazyLoader, scrollManager, pdfExporter;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        themeManager = new ThemeManager();
        searchManager = new SearchManager();
        lazyLoader = new LazyLoader();
        scrollManager = new ScrollManager();
        pdfExporter = new PDFExporter();

        console.log('✅ Nurse Pedia: All modules initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// Export for inline onclick handlers
window.pdfExporter = pdfExporter;
