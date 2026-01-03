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
                        <div class="pdf-option-grid">
                            <div class="pdf-option">
                                <label for="pdfFilename">Filename</label>
                                <input type="text" id="pdfFilename" value="Nurse-Pedia-Notes" />
                            </div>
                            <div class="pdf-option">
                                <label for="pdfPageSize">Page Size</label>
                                <select id="pdfPageSize">
                                    <option value="a4" selected>A4</option>
                                    <option value="letter">Letter</option>
                                    <option value="legal">Legal</option>
                                </select>
                            </div>
                            <div class="pdf-option">
                                <label for="pdfLayout">Style</label>
                                <select id="pdfLayout">
                                    <option value="wiki" selected>Wiki Content (Clean)</option>
                                    <option value="handwritten">Handwritten Notes (Lined Paper)</option>
                                    <option value="original">Web Match (Colorful)</option>
                                </select>
                            </div>
                            <div class="pdf-option">
                                <label for="pdfFontSize">Font Size</label>
                                <select id="pdfFontSize">
                                    <option value="small">Small (Compact)</option>
                                    <option value="medium" selected>Medium (Standard)</option>
                                    <option value="large">Large (Readable)</option>
                                </select>
                            </div>
                        </div>

                        <div class="pdf-checklist">
                            <div class="pdf-checkbox">
                                <input type="checkbox" id="pdfIncludeImages" checked />
                                <label for="pdfIncludeImages">Include Images</label>
                            </div>
                            <div class="pdf-checkbox">
                                <input type="checkbox" id="pdfIncludePageNumbers" checked />
                                <label for="pdfIncludePageNumbers">Page Numbers</label>
                            </div>
                        </div>
                    </div>
                    <div class="pdf-modal-footer">
                        <button class="pdf-btn pdf-btn-cancel" onclick="pdfExporter.closeModal()">Cancel</button>
                        <button class="pdf-btn pdf-btn-generate" onclick="pdfExporter.generate()">
                            <i class="fa-solid fa-download" aria-hidden="true"></i> Download PDF
                        </button>
                    </div>
                    <div id="pdfProgress" class="pdf-progress" style="display: none;" role="status" aria-live="polite">
                        <div class="pdf-progress-bar">
                            <div class="pdf-progress-fill"></div>
                        </div>
                        <p id="pdfProgressText">Preparing PDF...</p>
                        <p class="pdf-progress-tip">Generating pixel-perfect layout...</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.modal = document.getElementById('pdfModal');

        // Close handling
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal && !this.isGenerating) this.closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex' && !this.isGenerating) this.closeModal();
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
            if (typeof html2pdf === 'undefined') alert('PDF library not ready. Please verify internet connection.');
            return;
        }

        const filename = document.getElementById('pdfFilename')?.value || 'Nurse-Pedia';
        const pageSize = document.getElementById('pdfPageSize')?.value || 'a4';
        const layoutStyle = document.getElementById('pdfLayout')?.value || 'wiki';
        const fontSize = document.getElementById('pdfFontSize')?.value || 'medium';
        const includeImages = document.getElementById('pdfIncludeImages')?.checked ?? true;

        const progress = document.getElementById('pdfProgress');
        if (progress) progress.style.display = 'block';
        this.isGenerating = true;
        document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = true);

        try {
            this.updateProgress(10, 'Analyzing content structure...');

            // Select only the main content area (e.g., .lesson-content or main)
            // Use specific content container if available to avoid grabbing sidebars/navs
            const contentSource = document.querySelector('.lesson-content') || document.querySelector('main') || document.body;

            // Clone the node deeply
            const clone = contentSource.cloneNode(true);

            this.updateProgress(25, 'Applying pro layout styles...');

            // Prepare the wrapper that will receive the special PDF class
            const wrapper = document.createElement('div');

            // Add the special PDF class if Wiki style is selected
            if (layoutStyle === 'wiki') {
                wrapper.classList.add('pdf-export-wrapper');
                // Adjust font size specifically for the wrapper
                if (fontSize === 'small') wrapper.style.fontSize = '9pt';
                if (fontSize === 'large') wrapper.style.fontSize = '12pt';
            } else if (layoutStyle === 'handwritten') {
                wrapper.classList.add('pdf-export-wrapper'); // Base styles
                wrapper.classList.add('pdf-handwritten');    // Handwritten overrides
            } else {
                // Web Match style - ensure background is white for printing
                wrapper.style.background = '#fff';
                wrapper.style.color = '#000';
            }

            wrapper.appendChild(clone);

            // Clean up unwanted elements from the clone
            const removeSelectors = ['.navbar', '.download-btn', '.pdf-modal', '.breadcrumb', '.lesson-navigation',
                '.scroll-to-top', '.theme-toggle', '.search-container', '.toc-card', '.share-buttons'];
            removeSelectors.forEach(selector => {
                clone.querySelectorAll(selector).forEach(el => el.remove());
            });

            if (!includeImages) {
                clone.querySelectorAll('img').forEach(img => img.remove());
            }

            // Pre-process special elements for better page breaking
            // E.g., ensure no heading is the last element in a container
            clone.querySelectorAll('h2, h3').forEach(heading => {
                heading.style.pageBreakAfter = 'avoid';
            });

            this.updateProgress(50, 'Rendering high-resolution pages...');

            const opt = {
                margin: [15, 15, 15, 15], // Standard document margins (mm)
                filename: `${filename}.pdf`,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: {
                    scale: 2, // High resolution
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm',
                    format: pageSize,
                    orientation: 'portrait',
                    compress: true
                },
                // Use 'css' mode primarily to respect our new break-inside: avoid rules
                // 'avoid-all' is sometimes too aggressive, so we rely on our smart CSS
                pagebreak: { mode: 'css', avoid: ['img', '.content-section', 'table', '.term-pair'] }
            };

            await html2pdf().set(opt).from(wrapper).save();

            this.updateProgress(100, 'Download starting...');

            setTimeout(() => {
                if (progress) progress.style.display = 'none';
                this.closeModal();
                this.isGenerating = false;
                document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = false);
            }, 1000);

        } catch (error) {
            console.error('PDF Error:', error);
            alert('Error generating PDF. Please try again.');
            if (progress) progress.style.display = 'none';
            this.isGenerating = false;
            document.querySelectorAll('.pdf-btn').forEach(btn => btn.disabled = false);
        }
    }
}

/* ==========================================
 * 6. PROGRESS TRACKING
 * ========================================== */
class ProgressManager {
    constructor() {
        this.storageKey = 'nursepedia_progress';
        this.progress = JSON.parse(localStorage.getItem(this.storageKey)) || {};
        this.init();
    }

    init() {
        this.updateUI();
        this.bindEvents();
    }

    bindEvents() {
        // Handle "Mark as Complete" button clicks
        const completeBtn = document.getElementById('markCompleteBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                const lessonId = completeBtn.dataset.lessonId;
                this.toggleLesson(lessonId);
            });
        }
    }

    toggleLesson(lessonId) {
        if (!lessonId) return;

        this.progress[lessonId] = !this.progress[lessonId];
        this.saveProgress();
        this.updateUI();

        // Show celebratory toast if completed
        if (this.progress[lessonId]) {
            this.showToast('Lesson Completed! 🎉');
        }
    }

    saveProgress() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
    }

    updateUI() {
        // 1. Update Lesson Page Button
        const completeBtn = document.getElementById('markCompleteBtn');
        if (completeBtn) {
            const lessonId = completeBtn.dataset.lessonId;
            const isComplete = this.progress[lessonId];

            if (isComplete) {
                completeBtn.classList.add('completed');
                completeBtn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Completed';
            } else {
                completeBtn.classList.remove('completed');
                completeBtn.innerHTML = '<i class="fa-regular fa-circle-check"></i> Mark as Complete';
            }
        }

        // 2. Update Home Page Cards
        document.querySelectorAll('.lesson-card').forEach(card => {
            const lessonId = card.dataset.lessonId;
            if (this.progress[lessonId]) {
                card.classList.add('is-completed');

                // Add badge if not exists
                if (!card.querySelector('.completion-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'completion-badge';
                    badge.innerHTML = '<i class="fa-solid fa-check"></i>';
                    card.appendChild(badge);
                }
            } else {
                card.classList.remove('is-completed');
                const badge = card.querySelector('.completion-badge');
                if (badge) badge.remove();
            }
        });

        // 3. Update Global Progress Bar (if exists (future))
        this.updateGlobalProgress();
    }

    updateGlobalProgress() {
        // Calculate total progress
        const totalLessons = 50; // Placeholder total
        const completedCount = Object.values(this.progress).filter(Boolean).length;
        // console.log(`Progress: ${completedCount}/${totalLessons}`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Remove after 3s
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

/* ==========================================
 * 7. INITIALIZATION
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
        const progressManager = new ProgressManager(); // Init progress

        console.log('✅ Nurse Pedia: All modules initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// Export for inline onclick handlers
window.pdfExporter = pdfExporter;
