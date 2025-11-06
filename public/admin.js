// Simple API Configuration - No Backend Required
// This will use the SimpleAPI from simple-api.js

// Admin Login Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (window.location.pathname.includes('admin-dashboard.html')) {
        checkAuthentication();
    }

    // Login form handler
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Dashboard initialization
    if (document.querySelector('.admin-dashboard-body')) {
        initializeDashboard();
    }
});

// Login Authentication
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorMessage = document.getElementById('errorMessage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Hide previous error messages
    errorMessage.style.display = 'none';
    
    // Show loading
    loadingOverlay.style.display = 'flex';
    
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        
        // Use SimpleAPI for authentication
        const result = SimpleAPI.adminLogin(username, password);
        
        if (result.success) {
            // Set authentication
            if (rememberMe) {
                localStorage.setItem('adminAuth', 'true');
                localStorage.setItem('adminUsername', username);
            } else {
                sessionStorage.setItem('adminAuth', 'true');
                sessionStorage.setItem('adminUsername', username);
            }
            
            // Redirect to dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            // Show error
            const errorText = document.getElementById('errorText');
            if (!username) {
                errorText.textContent = 'Please enter a username.';
            } else {
                errorText.textContent = result.message || 'Invalid credentials. Please try again.';
            }
            errorMessage.style.display = 'flex';
        }
    }, 1000);
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Check authentication
function checkAuthentication() {
    const isAuthLocal = localStorage.getItem('adminAuth');
    const isAuthSession = sessionStorage.getItem('adminAuth');
    
    if (!isAuthLocal && !isAuthSession) {
        window.location.href = 'admin.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminUsername');
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('adminUsername');
    window.location.href = 'admin.html';
}

// Dashboard Initialization
function initializeDashboard() {
    // Initialize sidebar navigation
    initializeSidebar();
    
    // Initialize property management
    initializePropertyManagement();
    
    // Initialize contact management
    initializeContactManagement();
    
    // Load sample data
    loadSampleData();
}

// Sidebar Navigation
function initializeSidebar() {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    
    // Navigation click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    }
}

// Property Management
let properties = [];

async function initializePropertyManagement() {
    await loadPropertiesFromAPI();
    renderPropertiesTable();
}

// Load properties from SimpleAPI
async function loadPropertiesFromAPI() {
    try {
        const response = SimpleAPI.getProperties();
        properties = response.data || [];
    } catch (error) {
        console.error('Failed to load properties:', error);
        properties = [];
    }
}

async function renderPropertiesTable() {
    const tableBody = document.getElementById('propertiesTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (properties.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; color: #718096; padding: 40px;">
                No properties found. <a href="#" onclick="openAddPropertyModal()" style="color: #667eea;">Add your first property</a>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    properties.forEach(property => {
        const row = document.createElement('tr');
        const firstImage = property.images && property.images.length > 0 
            ? property.images[0] 
            : 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&q=80';
            
        row.innerHTML = `
            <td>
                <div class="property-cell">
                    <img src="${firstImage}" alt="${property.name}" onerror="this.src='https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&q=80'">
                    <span>${property.name}</span>
                </div>
            </td>
            <td>${property.location}</td>
            <td>${property.price}</td>
            <td><span class="status-badge ${property.status}">${getStatusText(property.status)}</span></td>
            <td>
                <button class="action-btn-small edit" onclick="editProperty('${property._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn-small delete" onclick="deleteProperty('${property._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getStatusText(status) {
    const statusMap = {
        'for-sale': 'For Sale',
        'for-rent': 'For Rent',
        'sold': 'Sold',
        'rented': 'Rented'
    };
    return statusMap[status] || status;
}

// Property CRUD Operations
function openAddPropertyModal() {
    const modal = document.getElementById('addPropertyModal');
    modal.classList.add('active');
    
    // Reset form
    const form = modal.querySelector('form');
    form.reset();
    
    // Update modal title and button text
    modal.querySelector('.modal-header h3').textContent = 'Add New Property';
    modal.querySelector('.modal-actions .btn-primary').textContent = 'Add Property';
    
    // Store that this is an add operation
    form.setAttribute('data-operation', 'add');
    form.removeAttribute('data-property-id');
}

function editProperty(propertyId) {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;
    
    const modal = document.getElementById('addPropertyModal');
    const form = modal.querySelector('form');
    
    // Populate form with property data
    form.querySelector('input[placeholder="Enter property name"]').value = property.name;
    form.querySelector('input[placeholder="Enter price"]').value = property.price;
    form.querySelector('input[placeholder="Enter full address"]').value = property.location;
    form.querySelector('input[placeholder="Number of bedrooms"]').value = property.bedrooms;
    form.querySelector('input[placeholder="Number of bathrooms"]').value = property.bathrooms;
    form.querySelector('input[placeholder="Property size"]').value = property.sqft;
    form.querySelector('select').value = property.status;
    form.querySelector('textarea').value = property.description || '';
    
    // Update modal title and button text
    modal.querySelector('.modal-header h3').textContent = 'Edit Property';
    modal.querySelector('.modal-actions .btn-primary').textContent = 'Update Property';
    
    // Store that this is an edit operation
    form.setAttribute('data-operation', 'edit');
    form.setAttribute('data-property-id', propertyId);
    
    modal.classList.add('active');
}

async function deleteProperty(propertyId) {
    if (!confirm('Are you sure you want to delete this property?')) {
        return;
    }
    
    try {
        const result = SimpleAPI.deleteProperty(propertyId);
        if (result.success) {
            // Remove from local array
            properties = properties.filter(p => p._id !== propertyId);
            renderPropertiesTable();
            updateDashboardStats();
            showNotification(result.message, 'success');
        }
    } catch (error) {
        console.error('Failed to delete property:', error);
        showNotification('Failed to delete property', 'error');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Handle property form submission
document.addEventListener('DOMContentLoaded', function() {
    const propertyForm = document.querySelector('#addPropertyModal form');
    if (propertyForm) {
        propertyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const operation = this.getAttribute('data-operation');
            const propertyId = this.getAttribute('data-property-id');
            
            const propertyData = {
                name: this.querySelector('input[placeholder="Enter property name"]').value,
                price: this.querySelector('input[placeholder="Enter price"]').value,
                location: this.querySelector('input[placeholder="Enter full address"]').value,
                bedrooms: parseInt(this.querySelector('input[placeholder="Number of bedrooms"]').value) || 0,
                bathrooms: parseInt(this.querySelector('input[placeholder="Number of bathrooms"]').value) || 0,
                sqft: parseInt(this.querySelector('input[placeholder="Property size"]').value) || 0,
                status: this.querySelector('select').value,
                description: this.querySelector('textarea').value,
                images: collectImageUrls(),
                featured: false
            };
            
            try {
                let result;
                if (operation === 'add') {
                    result = SimpleAPI.createProperty(propertyData);
                    showNotification(result.message, 'success');
                } else if (operation === 'edit') {
                    result = SimpleAPI.updateProperty(propertyId, propertyData);
                    showNotification(result.message, 'success');
                }
                
                // Reload properties and update table
                loadPropertiesFromAPI();
                renderPropertiesTable();
                updateDashboardStats();
                closeModal('addPropertyModal');
                
            } catch (error) {
                console.error('Failed to save property:', error);
                showNotification('Failed to save property', 'error');
            }
        });
    }
});

// Image handling functions
function collectImageUrls() {
    const imageInputs = document.querySelectorAll('.image-url-input');
    const urls = [];
    
    imageInputs.forEach(input => {
        const url = input.value.trim();
        if (url) {
            urls.push(url);
        }
    });
    
    return urls;
}

function addImageInput(existingUrl = '') {
    const container = document.getElementById('imagesContainer');
    if (!container) return;
    
    const imageGroup = document.createElement('div');
    imageGroup.className = 'image-input-group';
    
    imageGroup.innerHTML = `
        <input type="url" placeholder="Image URL (e.g., from Cloudinary, Imgur, etc.)" class="image-url-input" value="${existingUrl}">
        <button type="button" class="btn-small" onclick="removeImageInput(this)">Remove</button>
    `;
    
    container.appendChild(imageGroup);
}

function removeImageInput(button) {
    button.parentElement.remove();
}

// Contact management
function loadContacts() {
    const contacts = SimpleAPI.getContacts();
    const tbody = document.querySelector('#contactsTable tbody');
    
    if (!tbody) return;
    
    tbody.innerHTML = contacts.map(contact => `
        <tr>
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.subject}</td>
            <td>${new Date(contact.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn-small view-btn" onclick="viewContact('${contact.id}')">View</button>
                <button class="btn-small delete-btn" onclick="deleteContact('${contact.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function viewContact(id) {
    const contact = SimpleAPI.getContacts().find(c => c.id === id);
    if (!contact) return;
    
    alert(`Name: ${contact.name}\nEmail: ${contact.email}\nSubject: ${contact.subject}\nMessage: ${contact.message}\nDate: ${new Date(contact.createdAt).toLocaleString()}`);
}

function deleteContact(id) {
    if (confirm('Are you sure you want you want to delete this contact?')) {
        SimpleAPI.deleteContact(id);
        loadContacts();
        showNotification('Contact deleted successfully');
    }
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function updateDashboardStats() {
    const properties = SimpleAPI.getProperties();
    const contacts = SimpleAPI.getContacts();
    
    const totalProperties = document.getElementById('totalProperties');
    const totalContacts = document.getElementById('totalContacts');
    
    if (totalProperties) totalProperties.textContent = properties.length;
    if (totalContacts) totalContacts.textContent = contacts.length;
}

// Page initialization
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!SimpleAPI.isAdminLoggedIn()) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Load initial data
    loadProperties();
    loadContacts();
    updateDashboardStats();
});

// Data export/import functions
function exportData() {
    const data = SimpleAPI.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `marco_real_estate_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully');
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (confirm('This will replace all current data. Are you sure you want to continue?')) {
                SimpleAPI.importData(data);
                loadProperties();
                loadContacts();
                updateDashboardStats();
                showNotification('Data imported successfully');
            }
        } catch (error) {
            showNotification('Invalid file format. Please select a valid JSON file.', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset the file input
    input.value = '';
}

// Contact Management
let contacts = [
    {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0123',
        interest: 'Buying Property',
        message: 'Hi, I\'m interested in the Modern Family Home on Oak Street. Could you provide more details about the property and schedule a viewing?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'unread'
    },
    {
        id: 2,
        name: 'Michael Chen',
        email: 'm.chen@business.com',
        phone: '+1-555-0124',
        interest: 'Business Setup',
        message: 'Looking for help with company registration in UAE. What services do you offer and what are the costs involved?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'read'
    }
];

function initializeContactManagement() {
    renderContactsList();
    
    // Contact filter
    const contactFilter = document.getElementById('contactFilter');
    if (contactFilter) {
        contactFilter.addEventListener('change', function() {
            renderContactsList(this.value);
        });
    }
}

function renderContactsList(filter = 'all') {
    const contactsList = document.getElementById('contactsList');
    if (!contactsList) return;
    
    let filteredContacts = contacts;
    if (filter !== 'all') {
        filteredContacts = contacts.filter(contact => contact.status === filter);
    }
    
    contactsList.innerHTML = '';
    
    filteredContacts.forEach(contact => {
        const contactDiv = document.createElement('div');
        contactDiv.className = `contact-item ${contact.status}`;
        contactDiv.innerHTML = `
            <div class="contact-header">
                <div class="contact-info">
                    <h4>${contact.name}</h4>
                    <span class="email">${contact.email}</span>
                </div>
                <div class="contact-meta">
                    <span class="time">${getTimeAgo(contact.timestamp)}</span>
                    <span class="status-dot ${contact.status}"></span>
                </div>
            </div>
            <div class="contact-preview">
                <p>Interested in: ${contact.interest}</p>
                <p>"${contact.message.substring(0, 100)}${contact.message.length > 100 ? '...' : ''}"</p>
            </div>
            <div class="contact-actions">
                ${contact.status === 'unread' 
                    ? `<button class="btn-small" onclick="markAsRead(${contact.id})">Mark as Read</button>`
                    : `<button class="btn-small" onclick="markAsUnread(${contact.id})">Mark as Unread</button>`
                }
                <button class="btn-small" onclick="replyToContact(${contact.id})">Reply</button>
                <button class="btn-small delete" onclick="deleteContact(${contact.id})">Delete</button>
            </div>
        `;
        contactsList.appendChild(contactDiv);
    });
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    } else if (hours < 24) {
        return `${hours} hours ago`;
    } else {
        return `${days} days ago`;
    }
}

function markAsRead(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.status = 'read';
        renderContactsList();
        showNotification('Contact marked as read', 'success');
    }
}

function markAsUnread(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        contact.status = 'unread';
        renderContactsList();
        showNotification('Contact marked as unread', 'success');
    }
}

function replyToContact(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
        // Open email client with pre-filled data
        const subject = encodeURIComponent(`Re: ${contact.interest} Inquiry`);
        const body = encodeURIComponent(`Dear ${contact.name},\n\nThank you for your inquiry about ${contact.interest}.\n\nBest regards,\nMarco Rodriguez\nAll Zone Corporate Services`);
        const mailtoLink = `mailto:${contact.email}?subject=${subject}&body=${body}`;
        window.open(mailtoLink);
    }
}

function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        contacts = contacts.filter(c => c.id !== contactId);
        renderContactsList();
        showNotification('Contact deleted successfully', 'success');
    }
}

// Sample Data Loading
function loadSampleData() {
    // Update dashboard stats
    updateDashboardStats();
}

function updateDashboardStats() {
    const totalProperties = properties.length;
    const newMessages = contacts.filter(c => c.status === 'unread').length;
    
    // Update stat cards if they exist
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
        statCards[0].querySelector('h3').textContent = totalProperties;
        statCards[1].querySelector('h3').textContent = newMessages;
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 3000;
                display: flex;
                align-items: center;
                gap: 15px;
                min-width: 300px;
                animation: slideIn 0.3s ease;
            }
            .notification-success { border-left: 4px solid #38a169; }
            .notification-error { border-left: 4px solid #e53e3e; }
            .notification-info { border-left: 4px solid #3182ce; }
            .notification-content { display: flex; align-items: center; gap: 10px; flex: 1; }
            .notification-close { background: none; border: none; cursor: pointer; color: #718096; }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Prevent form submission from refreshing page
document.addEventListener('submit', function(e) {
    const form = e.target;
    if (form.classList.contains('settings-form')) {
        e.preventDefault();
        showNotification('Settings saved successfully', 'success');
    }
});