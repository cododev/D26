# DeediX Technologies - Complete Project Structure

## 📁 Project Overview

This repository contains the complete DeediX Technologies digital infrastructure including:
1. **Main Website** - Corporate website with AI chatbot
2. **E-commerce Shop** - Online tech shop with database integration
3. **Live Agent System** - Real-time customer support platform
4. **CMS Training Platform** - Learning Management System (LMS)

---

## 🗂️ Complete Directory Structure

```
deedix25/
├── public/                                    # Main Website
│   ├── index.html                             # Homepage with chatbot
│   ├── about.html                             # About page with chatbot
│   ├── contact.html                           # Contact page with chatbot
│   ├── service.html                           # Services page with chatbot
│   ├── trainings.html                         # Trainings page
│   ├── people.html                            # Team page with chatbot
│   ├── portfolio.html                         # Portfolio showcase
│   ├── faq.html                               # FAQ page
│   └── assets/
│       └── main-site/
│           ├── css/
│           │   ├── modern-style.css           # Main styles
│           │   ├── chatbot.css                # AI Chatbot styles
│           │   ├── index.css                  # Homepage styles
│           │   ├── contact-page.css           # Contact page styles
│           │   ├── services.css               # Services page styles
│           │   ├── trainings.css              # Trainings page styles
│           │   ├── people.css                 # Team page styles
│           │   ├── about.css                  # About page styles
│           │   ├── faq.css                    # FAQ page styles
│           │   ├── pages.css                  # General page styles
│           │   └── animations.css             # Animation utilities
│           ├── js/
│           │   ├── modern-main.js             # Main JavaScript
│           │   ├── chatbot.js                 # AI Chatbot logic
│           │   ├── contact-form.js            # Contact form handler
│           │   └── trainings.js               # Trainings page logic
│           └── img/                           # Images and assets
│
├── shop/                                      # E-commerce Platform
│   ├── index.html                             # Shop homepage
│   ├── cart.html                              # Shopping cart
│   ├── checkout.html                          # Checkout page
│   ├── accessories.html                       # Product category
│   ├── gaming.html                            # Product category
│   ├── laptops.html                           # Product category
│   ├── backend/
│   │   ├── .env.example                       # Environment template
│   │   ├── package.json                       # Dependencies
│   │   └── ...                                # PHP backend files
│   ├── css/
│   │   ├── shop-main.css                      # Main shop styles
│   │   ├── cart.css                           # Cart styles
│   │   └── checkout.css                       # Checkout styles
│   ├── js/                                    # Shop JavaScript
│   ├── images/                                # Product images
│   ├── data/                                  # Product JSON data
│   └── admin/                                 # Admin dashboard
│       ├── index.html                         # Admin home
│       ├── products.html                      # Product management
│       ├── orders.html                        # Order management
│       ├── css/
│       │   └── admin.css                      # Admin styles
│       └── js/
│           ├── admin.js                       # Admin logic
│           ├── products.js                    # Product CRUD
│           └── orders.js                      # Order management
│
├── live-agents/                               # Live Support System
│   ├── README.md                              # System overview
│   ├── DEPLOYMENT.md                          # AWS/Azure deployment guide
│   ├── backend/                               # Node.js Backend
│   │   ├── server.js                          # Main server entry
│   │   ├── package.json                       # Dependencies
│   │   ├── .env.example                       # Environment template
│   │   ├── config/
│   │   │   └── database.js                    # MongoDB connection
│   │   ├── models/
│   │   │   ├── Agent.js                       # Agent model
│   │   │   ├── Conversation.js                # Conversation model
│   │   │   └── Message.js                     # Message model
│   │   ├── controllers/                       # Business logic
│   │   ├── routes/
│   │   │   └── auth.js                        # Authentication routes
│   │   ├── socket/
│   │   │   └── handler.js                     # Socket.io handlers
│   │   ├── middleware/                        # Express middleware
│   │   ├── services/
│   │   │   └── queueService.js                # Queue management
│   │   └── utils/
│   │       └── logger.js                      # Winston logger
│   ├── agent-dashboard/                       # React Agent Dashboard
│   │   ├── src/
│   │   │   ├── components/                    # React components
│   │   │   ├── pages/                         # Dashboard pages
│   │   │   ├── services/                      # API services
│   │   │   ├── store/                         # State management
│   │   │   └── utils/                         # Utilities
│   │   └── public/                            # Static assets
│   ├── customer-widget/                       # Customer Chat Widget
│   │   ├── css/                               # Widget styles
│   │   ├── js/                                # Widget logic
│   │   └── assets/                            # Widget assets
│   └── docs/                                  # Documentation
│
├── cms-training/                              # Learning Management System
│   ├── README.md                              # LMS overview
│   ├── DEPLOYMENT.md                          # AWS/Azure deployment guide
│   ├── backend/                               # Node.js Backend
│   │   ├── server.js                          # Main server entry
│   │   ├── package.json                       # Dependencies
│   │   ├── .env.example                       # Environment template
│   │   ├── app/
│   │   │   ├── Controllers/                   # API controllers
│   │   │   │   ├── AuthController.js
│   │   │   │   ├── CourseController.js
│   │   │   │   ├── LessonController.js
│   │   │   │   ├── EnrollmentController.js
│   │   │   │   ├── AssessmentController.js
│   │   │   │   ├── CertificateController.js
│   │   │   │   └── PaymentController.js
│   │   │   ├── Models/                        # Database models
│   │   │   │   ├── User.js
│   │   │   │   ├── Course.js
│   │   │   │   ├── Lesson.js
│   │   │   │   ├── Enrollment.js
│   │   │   │   ├── Assessment.js
│   │   │   │   ├── Submission.js
│   │   │   │   ├── Certificate.js
│   │   │   │   └── Payment.js
│   │   │   ├── Services/                      # Business logic
│   │   │   │   ├── VideoService.js            # AWS MediaConvert
│   │   │   │   ├── StorageService.js          # S3/Azure Blob
│   │   │   │   ├── EmailService.js            # AWS SES/SMTP
│   │   │   │   ├── PaymentService.js          # Stripe/Paystack
│   │   │   │   └── CertificateService.js      # PDF generation
│   │   │   └── Middleware/                    # Express middleware
│   │   │       ├── auth.js                    # JWT authentication
│   │   │       ├── authorize.js               # Role-based access
│   │   │       └── upload.js                  # File upload
│   │   ├── database/
│   │   │   ├── migrations/                    # Database migrations
│   │   │   └── seeders/                       # Seed data
│   │   ├── routes/                            # API routes
│   │   │   ├── auth.js
│   │   │   ├── courses.js
│   │   │   ├── lessons.js
│   │   │   ├── enrollments.js
│   │   │   ├── progress.js
│   │   │   ├── assessments.js
│   │   │   ├── submissions.js
│   │   │   ├── certificates.js
│   │   │   ├── payments.js
│   │   │   ├── analytics.js
│   │   │   ├── upload.js
│   │   │   ├── users.js
│   │   │   ├── categories.js
│   │   │   ├── reviews.js
│   │   │   ├── discussions.js
│   │   │   └── live.js
│   │   ├── config/
│   │   │   ├── database.js                    # MongoDB config
│   │   │   ├── logger.js                      # Winston logger
│   │   │   ├── passport.js                    # Auth strategies
│   │   │   ├── aws.js                         # AWS SDK config
│   │   │   └── azure.js                       # Azure SDK config
│   │   └── storage/
│   │       ├── videos/                        # Video uploads
│   │       ├── documents/                     # Course documents
│   │       └── certificates/                  # Generated certificates
│   ├── frontend/                              # React Student Portal
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Student/                   # Student components
│   │   │   │   │   ├── Dashboard.jsx
│   │   │   │   │   ├── CourseCard.jsx
│   │   │   │   │   ├── VideoPlayer.jsx
│   │   │   │   │   ├── Quiz.jsx
│   │   │   │   │   └── Certificate.jsx
│   │   │   │   ├── Instructor/                # Instructor components
│   │   │   │   │   ├── CourseDashboard.jsx
│   │   │   │   │   ├── CourseBuilder.jsx
│   │   │   │   │   ├── StudentProgress.jsx
│   │   │   │   │   └── Analytics.jsx
│   │   │   │   ├── Admin/                     # Admin components
│   │   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   │   ├── UserManagement.jsx
│   │   │   │   │   ├── CourseApproval.jsx
│   │   │   │   │   └── Reports.jsx
│   │   │   │   └── Common/                    # Shared components
│   │   │   │       ├── Navbar.jsx
│   │   │   │       ├── Footer.jsx
│   │   │   │       ├── Loader.jsx
│   │   │   │       └── Modal.jsx
│   │   │   ├── pages/                         # Page components
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── CourseCatalog.jsx
│   │   │   │   ├── CourseDetail.jsx
│   │   │   │   ├── Lesson.jsx
│   │   │   │   ├── MyLearning.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Checkout.jsx
│   │   │   ├── services/                      # API services
│   │   │   │   ├── api.js
│   │   │   │   ├── authService.js
│   │   │   │   ├── courseService.js
│   │   │   │   └── paymentService.js
│   │   │   ├── store/                         # Redux store
│   │   │   │   ├── index.js
│   │   │   │   ├── authSlice.js
│   │   │   │   ├── courseSlice.js
│   │   │   │   └── userSlice.js
│   │   │   ├── utils/                         # Utility functions
│   │   │   └── assets/                        # Static assets
│   │   └── public/                            # Public files
│   ├── admin-panel/                           # React Admin Dashboard
│   │   └── src/                               # Admin interface
│   └── docs/                                  # Documentation
│
├── database/                                  # Database Scripts
│   ├── schema.sql                             # MySQL schema
│   └── migrate_products.php                   # Migration script
│
├── .gitignore                                 # Git ignore file
├── .claude/                                   # Claude settings
│   └── settings.local.json                    # Local config
└── PROJECT_STRUCTURE.md                       # This file

```

---

## 🚀 Quick Start Guide

### 1. Main Website
```bash
# Navigate to public folder
cd public

# Open in browser
# Simply open index.html in your browser
# Or use a local server:
python -m http.server 8080
# Visit: http://localhost:8080
```

### 2. E-commerce Shop
```bash
cd shop/backend

# Install dependencies
composer install

# Configure database
cp .env.example .env
# Edit .env with your database credentials

# Run migration
php migrate_products.php

# Start PHP server
php -S localhost:8000
```

### 3. Live Agent System
```bash
cd live-agents/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB, Redis, AWS credentials

# Start development server
npm run dev

# Production deployment
npm start

# See DEPLOYMENT.md for cloud deployment
```

### 4. CMS Training Platform
```bash
cd cms-training/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with MongoDB, AWS/Azure, Stripe, Paystack credentials

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start development server
npm run dev

# Production deployment
npm start

# See DEPLOYMENT.md for full AWS/Azure setup
```

---

## 🌟 Key Features

### Main Website
- ✅ **AI Chatbot** on all major pages (index, about, contact, service, people)
- ✅ Fully responsive design
- ✅ Modern animations and transitions
- ✅ Professional corporate design
- ✅ Contact form integration
- ✅ Service showcase
- ✅ Team profiles
- ✅ Portfolio display
- ✅ FAQ section

### E-commerce Shop
- ✅ Product catalog with categories
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Admin dashboard
- ✅ Product management
- ✅ Order tracking
- ✅ Database integration (MySQL/PostgreSQL)

### Live Agent System
- ✅ **Real-time chat** with Socket.io
- ✅ **Agent dashboard** for support staff
- ✅ **Customer queue management**
- ✅ **File sharing** capabilities
- ✅ **Chat history** and transcripts
- ✅ **AWS S3** integration for files
- ✅ **Redis** for session management
- ✅ **MongoDB** for data persistence
- ✅ **JWT authentication**
- ✅ **Agent status tracking**
- ✅ **Analytics and reporting**

### CMS Training Platform
- ✅ **Complete LMS** functionality
- ✅ **Video streaming** with AWS MediaConvert/Azure Media Services
- ✅ **Course management** system
- ✅ **Student enrollment** and progress tracking
- ✅ **Quizzes and assessments**
- ✅ **Certificate generation** (PDF)
- ✅ **Payment integration** (Stripe + Paystack)
- ✅ **Multi-cloud support** (AWS + Azure)
- ✅ **SSO with Azure AD**
- ✅ **OAuth** (Google, LinkedIn, Microsoft)
- ✅ **Live classes** (Zoom/Teams integration)
- ✅ **Discussion forums**
- ✅ **Analytics dashboard**

---

## 🔧 Technology Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **React.js** (for dashboards)
- **Bootstrap/Tailwind CSS**
- **Socket.io Client** (real-time)

### Backend
- **Node.js v18+**
- **Express.js**
- **Socket.io** (WebSocket)
- **Mongoose** (MongoDB ODM)
- **Passport.js** (Authentication)
- **JWT** (JSON Web Tokens)

### Databases
- **MongoDB** (Primary - Atlas recommended)
- **Redis** (Caching & Sessions)
- **MySQL/PostgreSQL** (E-commerce)

### Cloud Services (AWS)
- **EC2/ECS Fargate** - Compute
- **S3** - Object Storage
- **CloudFront** - CDN
- **ElastiCache** - Redis
- **MediaConvert** - Video Processing
- **SES** - Email Service
- **Route 53** - DNS
- **Certificate Manager** - SSL/TLS
- **Secrets Manager** - Credentials
- **CloudWatch** - Monitoring
- **X-Ray** - Tracing

### Cloud Services (Azure)
- **App Service/Container Apps** - Compute
- **Blob Storage** - Object Storage
- **CDN** - Content Delivery
- **Cache for Redis** - Caching
- **Media Services** - Video Processing
- **Azure AD** - SSO
- **Application Insights** - Monitoring

### Payment Gateways
- **Stripe** (International)
- **Paystack** (Nigeria)

### Development Tools
- **Git** - Version control
- **Docker** - Containerization
- **PM2** - Process management
- **Winston** - Logging
- **Jest** - Testing
- **ESLint** - Code linting

---

## 📊 Deployment Options

### Option 1: AWS (Recommended)
- **Best for**: Scalability, global reach
- **Monthly Cost**: ~$240-630
- **Setup Time**: 2-4 hours
- **See**: `live-agents/DEPLOYMENT.md` and `cms-training/DEPLOYMENT.md`

### Option 2: Azure
- **Best for**: Microsoft ecosystem integration
- **Monthly Cost**: ~$280-700
- **Setup Time**: 2-4 hours
- **See**: Deployment guides in each system folder

### Option 3: Hybrid
- **Best for**: Specific workload optimization
- **Example**: AWS for backend, Azure for media services
- **Monthly Cost**: Variable
- **Setup Time**: 4-6 hours

---

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation with Joi
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ SSL/TLS encryption
- ✅ Secrets management (AWS Secrets Manager/Azure Key Vault)
- ✅ Role-based access control (RBAC)

---

## 📚 Documentation

- **Live Agent System**: [live-agents/README.md](live-agents/README.md)
- **CMS Training Platform**: [cms-training/README.md](cms-training/README.md)
- **Deployment Guides**:
  - [Live Agent Deployment](live-agents/DEPLOYMENT.md)
  - [CMS Training Deployment](cms-training/DEPLOYMENT.md)

---

## 🤝 Support

- **Email**: devops@deedixtech.com
- **Phone**: +234 807 438 7880
- **Website**: https://deedixtech.com

---

## 📝 License

© 2025 DeediX Technologies. All rights reserved.

---

## 🎯 Next Steps

1. **Choose your cloud provider** (AWS or Azure)
2. **Set up MongoDB Atlas** account
3. **Configure environment variables**
4. **Deploy backend services**
5. **Set up CDN and media services**
6. **Configure payment gateways**
7. **Deploy frontend applications**
8. **Set up monitoring and logging**
9. **Configure backups**
10. **Go live!**

For detailed step-by-step instructions, refer to the DEPLOYMENT.md files in each system folder.
