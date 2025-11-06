const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Data storage using JSON files (upgrade from localStorage)
const DATA_DIR = path.join(__dirname, 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');

// Ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Property data helpers
async function getProperties() {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        const defaultProperties = [
            {
                _id: 'prop_1',
                name: 'Modern Family Home',
                price: '$750,000',
                location: '123 Oak Street, Riverside',
                bedrooms: 4,
                bathrooms: 3,
                sqft: 2500,
                status: 'for-sale',
                description: 'Beautiful modern family home with spacious rooms and great location.',
                images: [
                    'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                ],
                featured: true,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString()
            },
            {
                _id: 'prop_2',
                name: 'Downtown Condo',
                price: '$450,000',
                location: '456 City Center, Downtown',
                bedrooms: 2,
                bathrooms: 2,
                sqft: 1200,
                status: 'for-sale',
                description: 'Stylish downtown condo with city views and modern amenities.',
                images: [
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                ],
                featured: true,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString()
            },
            {
                _id: 'prop_3',
                name: 'Luxury Villa',
                price: '$1,250,000',
                location: '789 Pine Avenue, Hillcrest',
                bedrooms: 5,
                bathrooms: 4,
                sqft: 3800,
                status: 'for-sale',
                description: 'Stunning luxury villa with premium finishes and mountain views.',
                images: [
                    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
                ],
                featured: true,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString()
            }
        ];
        await saveProperties(defaultProperties);
        return defaultProperties;
    }
}

async function saveProperties(properties) {
    await ensureDataDir();
    await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
}

async function getPropertyById(id) {
    const properties = await getProperties();
    return properties.find(p => p._id === id);
}

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', async (req, res) => {
    const properties = await getProperties();
    let featuredProperties = properties.filter(p => p.featured);
    
    // If we don't have enough featured properties, fill with regular properties
    if (featuredProperties.length < 3) {
        const additionalProperties = properties
            .filter(p => !p.featured)
            .slice(0, 3 - featuredProperties.length);
        featuredProperties = [...featuredProperties, ...additionalProperties];
    }
    
    // Limit to 3 properties
    featuredProperties = featuredProperties.slice(0, 3);
    
    const pageData = {
        title: 'All Zone Corporate Services - Your Trusted Business Partner',
        description: 'From business setup to accounting, tax services, and real estate - All Zone Corporate Services provides comprehensive solutions for all your business needs.',
        currentPage: 'home',
        featuredProperties: featuredProperties
    };
    res.render('index', pageData);
});

app.get('/property/:id', async (req, res) => {
    const propertyId = req.params.id;
    const property = await getPropertyById(propertyId);
    
    if (!property) {
        return res.status(404).render('404', {
            title: 'Property Not Found',
            description: 'The requested property could not be found.',
            currentPage: 'error'
        });
    }
    
    const pageData = {
        title: `${property.name} - All Zone Corporate Services`,
        description: property.description || 'Beautiful property for sale or rent.',
        currentPage: 'property',
        property: property
    };
    res.render('property', pageData);
});

app.get('/admin', (req, res) => {
    const pageData = {
        title: 'Admin Login - All Zone Corporate Services',
        description: 'Admin dashboard login',
        currentPage: 'admin'
    };
    res.render('admin', pageData);
});

app.get('/admin/dashboard', (req, res) => {
    const pageData = {
        title: 'Admin Dashboard - All Zone Corporate Services',
        description: 'Property management dashboard',
        currentPage: 'admin-dashboard'
    };
    res.render('admin-dashboard', pageData);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('EJS templating system ready!');
});