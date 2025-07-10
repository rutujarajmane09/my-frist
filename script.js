// DOM Elements
const form = document.getElementById('studentForm');
const saveDraftBtn = document.getElementById('saveDraft');
const submitBtn = document.getElementById('submitForm');
const successModal = document.getElementById('successModal');
const closeModalBtn = document.getElementById('closeModal');
const submissionSummary = document.getElementById('submissionSummary');

// Form Data Storage
let formData = {};
let draftData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadDraft();
    setupEventListeners();
});

// Initialize form functionality
function initializeForm() {
    // Set default date to today for date of birth
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    document.getElementById('dateOfBirth').max = maxDate.toISOString().split('T')[0];
    
    // Auto-save functionality
    setupAutoSave();
    
    // Real-time validation
    setupRealTimeValidation();
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmission);
    
    // Save draft button
    saveDraftBtn.addEventListener('click', saveDraft);
    
    // Modal close button
    closeModalBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveDraft();
        }
    });
}

// Auto-save functionality
function setupAutoSave() {
    const formElements = form.querySelectorAll('input, select, textarea');
    
    formElements.forEach(element => {
        element.addEventListener('input', debounce(() => {
            saveDraft();
        }, 1000));
        
        element.addEventListener('change', () => {
            saveDraft();
        });
    });
}

// Debounce function to limit auto-save frequency
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Real-time validation
function setupRealTimeValidation() {
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    // GPA validation
    if (field.id === 'gpa' && value) {
        const gpa = parseFloat(value);
        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
            showFieldError(field, 'GPA must be between 0.00 and 4.00');
            return false;
        }
    }
    
    clearFieldError(field);
    return true;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#d93025';
    field.style.boxShadow = '0 0 0 3px rgba(217, 48, 37, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#d93025';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    errorDiv.style.fontWeight = '500';
    
    field.parentNode.appendChild(errorDiv);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = '';
    field.style.boxShadow = '';
    
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Validate entire form
function validateForm() {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Handle form submission
async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Simulate API call
        await simulateSubmission(data);
        
        // Show success modal
        showSubmissionSummary(data);
        showModal();
        
        // Clear draft
        clearDraft();
        
        // Reset form
        form.reset();
        
    } catch (error) {
        showNotification('Submission failed. Please try again.', 'error');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Simulate form submission
function simulateSubmission(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('Form submitted:', data);
            resolve(data);
        }, 1500);
    });
}

// Show submission summary
function showSubmissionSummary(data) {
    const summary = `
        <h4>Submission Summary</h4>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Student ID:</strong> ${data.studentId}</p>
        <p><strong>School:</strong> ${data.school}</p>
        <p><strong>Grade:</strong> ${data.grade}</p>
    `;
    
    submissionSummary.innerHTML = summary;
}

// Save draft
function saveDraft() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Remove empty values
    Object.keys(data).forEach(key => {
        if (!data[key]) {
            delete data[key];
        }
    });
    
    localStorage.setItem('studentFormDraft', JSON.stringify(data));
    showNotification('Draft saved automatically', 'success');
}

// Load draft
function loadDraft() {
    const savedDraft = localStorage.getItem('studentFormDraft');
    
    if (savedDraft) {
        try {
            const draftData = JSON.parse(savedDraft);
            
            Object.keys(draftData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = draftData[key];
                }
            });
            
            showNotification('Draft loaded successfully', 'info');
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}

// Clear draft
function clearDraft() {
    localStorage.removeItem('studentFormDraft');
}

// Show modal
function showModal() {
    successModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    successModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        
        .notification-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
    `;
    document.head.appendChild(style);
    
    // Add close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#34a853',
        error: '#d93025',
        warning: '#f29900',
        info: '#4285f4'
    };
    return colors[type] || '#4285f4';
}

// Form progress tracking
function updateFormProgress() {
    const requiredFields = form.querySelectorAll('[required]');
    const filledFields = Array.from(requiredFields).filter(field => field.value.trim() !== '');
    const progress = (filledFields.length / requiredFields.length) * 100;
    
    // You can add a progress bar here if needed
    console.log(`Form progress: ${Math.round(progress)}%`);
}

// Export form data
function exportFormData() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student-information.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Print form data
function printFormData() {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Student Information</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .section { margin-bottom: 20px; }
                    .field { margin-bottom: 10px; }
                    .label { font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Student Information</h1>
                <div class="section">
                    <h2>Personal Information</h2>
                    <div class="field">
                        <span class="label">Name:</span> ${data.firstName} ${data.lastName}
                    </div>
                    <div class="field">
                        <span class="label">Email:</span> ${data.email}
                    </div>
                    <div class="field">
                        <span class="label">Phone:</span> ${data.phone || 'N/A'}
                    </div>
                </div>
                <div class="section">
                    <h2>Academic Information</h2>
                    <div class="field">
                        <span class="label">Student ID:</span> ${data.studentId}
                    </div>
                    <div class="field">
                        <span class="label">School:</span> ${data.school}
                    </div>
                    <div class="field">
                        <span class="label">Grade:</span> ${data.grade}
                    </div>
                </div>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Handle tab navigation
        const focusableElements = form.querySelectorAll(
            'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
});

// Add form analytics (optional)
function trackFormInteraction(action, field = null) {
    const analytics = {
        action: action,
        field: field,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    console.log('Form Analytics:', analytics);
    // You can send this data to your analytics service
}

// Initialize form tracking
document.addEventListener('DOMContentLoaded', function() {
    trackFormInteraction('form_loaded');
    
    // Track field interactions
    const formFields = form.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('focus', () => {
            trackFormInteraction('field_focused', field.name);
        });
        
        field.addEventListener('blur', () => {
            trackFormInteraction('field_blurred', field.name);
        });
    });
}); 