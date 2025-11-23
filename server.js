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
app.get('/', (req, res) => {
    const pageData = {
        title: 'All Zone Corporate Services - Your Trusted Business Partner',
        description: 'From business setup to accounting, tax services, and real estate - All Zone Corporate Services provides comprehensive solutions for all your business needs.',
        currentPage: 'home'
    };
    res.render('index', pageData);
});

app.get('/business-setup', (req, res) => {
    const pageData = {
        title: 'Business Setup in Dubai, UAE - All Zone Corporate Services',
        description: 'Launch your company with expert support from A&A Associate, Dubai\'s trusted business setup company with over 9 years of experience.',
        currentPage: 'business-setup'
    };
    res.render('business-setup', pageData);
});

app.get('/free-zone-setup', (req, res) => {
    const pageData = {
        title: 'Free Zone Company Setup in UAE - All Zone Corporate Services',
        description: 'Establish your Free Zone company in UAE with 100% ownership, zero tax, and streamlined setup process. Expert guidance across all UAE Free Zones.',
        currentPage: 'free-zone-setup'
    };
    res.render('free-zone-setup', pageData);
});

app.get('/mainland-setup', (req, res) => {
    const pageData = {
        title: 'Mainland Company Setup in UAE - All Zone Corporate Services',
        description: 'Establish a mainland company in UAE with full market access, government contracting capabilities, and unlimited business flexibility. Expert DED licensing support.',
        currentPage: 'mainland-setup'
    };
    res.render('mainland-setup', pageData);
});

app.get('/about', (req, res) => {
    const pageData = {
        title: 'About Marco Lye - Managing Director | All Zone Corporate Services',
        description: 'Meet Marco Lye, Managing Director with 27+ years of experience in business setup, corporate services, and real estate across the Middle East.',
        currentPage: 'about'
    };
    res.render('about', pageData);
});

app.get('/real-estate', (req, res) => {
    const pageData = {
        title: 'Dubai Real Estate - Premium Properties | All Zone Corporate Services',
        description: 'Discover premium real estate in Dubai. From luxury apartments to stunning villas, find your perfect property in the UAE with expert guidance.',
        currentPage: 'real-estate'
    };
    res.render('real-estate', pageData);
});

// Property Details Routes
app.get('/properties/sky-elaris', (req, res) => {
    const pageData = {
        title: 'Elaris Sky - Premium High-Rise Apartments | All Zone Corporate Services',
        description: 'Elaris Sky Object 1 - Premium high-rise residential tower with studios and 1 & 2 bedroom apartments. Starting from AED 767,000 with panoramic city views.',
        currentPage: 'properties'
    };
    res.render('properties/sky-elaris', pageData);
});

app.get('/properties/lb-shastri-nagar', (req, res) => {
    const pageData = {
        title: 'LB Shastri Nagar - 2BHK Apartment | All Zone Corporate Services',
        description: 'LB Shastri Nagar 2BHK apartment with modern amenities and well-connected location. Ready to move property.',
        currentPage: 'properties'
    };
    res.render('properties/lb-shastri-nagar', pageData);
});

app.get('/properties/godrej-ananda', (req, res) => {
    const pageData = {
        title: 'Godrej Ananda - 3BHK Jodi Unit | All Zone Corporate Services',
        description: 'Godrej Ananda 3BHK Jodi unit (Studio + 2BHK) in Bagalur. 1400 sqft, East facing, 25th floor. Price: 1.4 Cr.',
        currentPage: 'properties'
    };
    res.render('properties/godrej-ananda', pageData);
});

app.get('/properties/cooke-town-plot', (req, res) => {
    const pageData = {
        title: 'Residential Plot - Cooke Town | All Zone Corporate Services',
        description: '8000 sqft residential plot for sale in Cooke Town. Off Hutchins Road, 5th Cross. Prime location with 80 sqft frontage. Price: 15 Cr.',
        currentPage: 'properties'
    };
    res.render('properties/cooke-town-plot', pageData);
});

app.get('/properties/godrej-reserve', (req, res) => {
    const pageData = {
        title: 'Godrej Reserve - Devanahalli Plots | All Zone Corporate Services',
        description: 'Godrej Reserve - 100 acre property with 900 plots in Devanahalli STRR. 10 kms from airport. Forest-themed plotted development.',
        currentPage: 'properties'
    };
    res.render('properties/godrej-reserve', pageData);
});

// Business Licensing Routes
app.get('/trade-license', (req, res) => {
    const pageData = {
        title: 'Trade License UAE - AZ Corporate Services',
        description: 'Get your UAE Trade License for commercial activities including buying, selling, importing, and exporting. Complete licensing process with government approvals.',
        currentPage: 'trade-license'
    };
    res.render('business-licensing/trade-license', pageData);
});

app.get('/professional-license', (req, res) => {
    const pageData = {
        title: 'Professional License UAE - AZ Corporate Services',
        description: 'Get your UAE Professional License for consultancy, design, accounting, education, and technical services. 100% ownership for most activities.',
        currentPage: 'professional-license'
    };
    res.render('business-licensing/professional-license', pageData);
});

app.get('/ecommerce-license', (req, res) => {
    const pageData = {
        title: 'Ecommerce License UAE - AZ Corporate Services',
        description: 'Get your UAE Ecommerce License for online selling, Shopify stores, Instagram sales, and digital products. Full compliance and platform integration support.',
        currentPage: 'ecommerce-license'
    };
    res.render('business-licensing/ecommerce-license', pageData);
});

app.get('/commercial-license', (req, res) => {
    const pageData = {
        title: 'Commercial License UAE - AZ Corporate Services',
        description: 'Get your UAE Commercial License for trading, logistics, wholesale, retail businesses. Complete setup with banking assistance and office space support.',
        currentPage: 'commercial-license'
    };
    res.render('business-licensing/commercial-license', pageData);
});

app.get('/general-trading-license', (req, res) => {
    const pageData = {
        title: 'General Trading License UAE - AZ Corporate Services',
        description: 'Get your UAE General Trading License for multiple goods trading. High flexibility for electronics, textiles, food, building materials with fast processing.',
        currentPage: 'general-trading-license'
    };
    res.render('business-licensing/general-trading-license', pageData);
});

app.get('/industrial-license', (req, res) => {
    const pageData = {
        title: 'Industrial License UAE - AZ Corporate Services',
        description: 'Get your UAE Industrial License for manufacturing, production, assembling, and processing. Complete support with environmental approvals and industrial zone leasing.',
        currentPage: 'industrial-license'
    };
    res.render('business-licensing/industrial-license', pageData);
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

// Accounting Services Routes
app.get('/accounting-services', (req, res) => {
    const pageData = {
        title: 'Accounting Services UAE - AZ Corporate Services',
        description: 'Professional accounting services in UAE. Complete accounting setup, monthly/quarterly accounting, compliance with standards, and financial advisory services.',
        currentPage: 'accounting-services'
    };
    res.render('accounting/accounting-services', pageData);
});

app.get('/bookkeeping-services', (req, res) => {
    const pageData = {
        title: 'Bookkeeping Services UAE - AZ Corporate Services',
        description: 'Professional bookkeeping services in UAE. Daily transaction recording, bank reconciliation, expense tracking, and monthly financial reports.',
        currentPage: 'bookkeeping-services'
    };
    res.render('accounting/bookkeeping-services', pageData);
});

app.get('/backlog-accounts', (req, res) => {
    const pageData = {
        title: 'Backlog Accounts Update UAE - AZ Corporate Services',
        description: 'Update your backlog accounts in UAE. Reconstruction of financial records, verification of past entries, and complete cleanup of accounting files.',
        currentPage: 'backlog-accounts'
    };
    res.render('accounting/backlog-accounts', pageData);
});

app.get('/outsource-accounting', (req, res) => {
    const pageData = {
        title: 'Outsource Accounting Services UAE - AZ Corporate Services',
        description: 'Outsource your accounting in UAE. Reduce costs, access experienced professionals, scalable services with secure procedures.',
        currentPage: 'outsource-accounting'
    };
    res.render('accounting/outsource-accounting', pageData);
});

app.get('/financial-reporting', (req, res) => {
    const pageData = {
        title: 'Financial Reporting Services UAE - AZ Corporate Services',
        description: 'Professional financial reporting in UAE. Income statements, balance sheets, cash flow statements, and custom management reports.',
        currentPage: 'financial-reporting'
    };
    res.render('accounting/financial-reporting', pageData);
});

app.get('/accounting-supervision', (req, res) => {
    const pageData = {
        title: 'Accounting Supervision Services UAE - AZ Corporate Services',
        description: 'Professional accounting supervision in UAE. Review processes, supervise entries, ensure compliance, and provide monthly review reports.',
        currentPage: 'accounting-supervision'
    };
    res.render('accounting/accounting-supervision', pageData);
});

app.get('/accountant-secondment', (req, res) => {
    const pageData = {
        title: 'Accountant Secondment Services UAE - AZ Corporate Services',
        description: 'Professional accountant secondment in UAE. Temporary and long-term placement of qualified accountants for your business needs.',
        currentPage: 'accountant-secondment'
    };
    res.render('accounting/accountant-secondment', pageData);
});

// Corporate Tax Services Routes
app.get('/corporate-tax-registration', (req, res) => {
    const pageData = {
        title: 'Corporate Tax Registration UAE - AZ Corporate Services',
        description: 'Mandatory corporate tax registration in UAE. Complete FTA registration process, document preparation, and full compliance support.',
        currentPage: 'corporate-tax-registration'
    };
    res.render('tax-services/corporate-tax/corporate-tax-registration', pageData);
});

app.get('/corporate-tax-assessment', (req, res) => {
    const pageData = {
        title: 'Corporate Tax Assessment UAE - AZ Corporate Services',  
        description: 'Professional corporate tax assessment in UAE. Financial review, tax exposure identification, and compliance optimization strategies.',
        currentPage: 'corporate-tax-assessment'
    };
    res.render('tax-services/corporate-tax/corporate-tax-assessment', pageData);
});

app.get('/corporate-tax-filing', (req, res) => {
    const pageData = {
        title: 'Corporate Tax Filing UAE - AZ Corporate Services',
        description: 'Professional corporate tax filing in UAE. Complete tax return preparation, FTA submission, and audit support services.',
        currentPage: 'corporate-tax-filing'
    };
    res.render('tax-services/corporate-tax/corporate-tax-filing', pageData);
});

app.get('/transfer-pricing', (req, res) => {
    const pageData = {
        title: 'Transfer Pricing Services UAE - AZ Corporate Services',
        description: 'Professional transfer pricing services in UAE. Master File, Local File preparation, benchmarking studies, and FTA audit support.',
        currentPage: 'transfer-pricing'
    };
    res.render('tax-services/corporate-tax/transfer-pricing', pageData);
});

// VAT Services Routes
app.get('/vat-registration', (req, res) => {
    const pageData = {
        title: 'VAT Registration UAE - AZ Corporate Services',
        description: 'Professional VAT registration services in UAE. Mandatory and voluntary VAT registration, FTA compliance, and TRN issuance support.',
        currentPage: 'vat-registration'
    };
    res.render('tax-services/vat-services/vat-registration', pageData);
});

app.get('/vat-returns-filing', (req, res) => {
    const pageData = {
        title: 'VAT Returns Filing UAE - AZ Corporate Services',  
        description: 'Professional VAT returns filing in UAE. Monthly and quarterly VAT returns, FTA compliance, and penalty-free filing services.',
        currentPage: 'vat-returns-filing'
    };
    res.render('tax-services/vat-services/vat-returns-filing', pageData);
});

// Business Support Services Routes
app.get('/legal-services', (req, res) => {
    const pageData = {
        title: 'Legal Services UAE - AZ Corporate Services',
        description: 'Professional legal services in UAE. Contract drafting, company documentation, compliance guidance, and regulatory support.',
        currentPage: 'legal-services'
    };
    res.render('business-support/legal-services', pageData);
});

app.get('/bank-account-opening', (req, res) => {
    const pageData = {
        title: 'Bank Account Opening UAE - AZ Corporate Services',
        description: 'Professional bank account opening services in UAE. Corporate banking assistance, documentation preparation, and KYC support.',
        currentPage: 'bank-account-opening'
    };
    res.render('business-support/bank-account-opening', pageData);
});

app.get('/golden-visa', (req, res) => {
    const pageData = {
        title: 'Golden Visa UAE - AZ Corporate Services',
        description: 'UAE Golden Visa services. 10-year renewable residency for investors, entrepreneurs, and professionals. Complete application support.',
        currentPage: 'golden-visa'
    };
    res.render('business-support/golden-visa', pageData);
});

app.get('/trademark-registration', (req, res) => {
    const pageData = {
        title: 'Trademark Registration UAE - AZ Corporate Services',
        description: 'Professional trademark registration in UAE. Brand protection, logo registration, and intellectual property services.',
        currentPage: 'trademark-registration'
    };
    res.render('business-support/trademark-registration', pageData);
});

app.get('/pro-services', (req, res) => {
    const pageData = {
        title: 'PRO Services UAE - AZ Corporate Services',
        description: 'Professional PRO services in UAE. Visa processing, government transactions, license renewals, and corporate approvals.',
        currentPage: 'pro-services'
    };
    res.render('business-support/pro-services', pageData);
});

app.get('/corporate-training', (req, res) => {
    const pageData = {
        title: 'Corporate Training Programs - AZ Corporate Services',
        description: 'Expert corporate training in communication, leadership, team collaboration, and professional development. 20+ years of proven expertise.',
        currentPage: 'corporate-training'
    };
    res.render('business-support/corporate-training', pageData);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('EJS templating system ready!');
});