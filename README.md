# 🌍 Roaming Sonic - Travel & Tour Management System

<div align="center">

![Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

A comprehensive travel and tour management platform for Bangladesh, built with the MERN stack. Roaming Sonic provides seamless booking experiences for tourists, hotel owners, tour guides, and administrators.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 About The Project

Roaming Sonic is a full-stack web application designed to revolutionize travel management in Bangladesh. It offers an all-in-one platform for booking tours, hotels, buses, and hiring guides, with intelligent features like budget estimation, currency conversion, and a referral rewards system.

### ✨ Key Highlights

- 🎫 **Complete Booking System** - Tours, hotels, buses, and guides all in one place
- 👥 **Multi-Role Support** - Distinct dashboards for tourists, hotel owners, guides, and admins
- 💰 **Smart Pricing** - Dynamic pricing, seasonal discounts, and coupon system
- 📱 **Modern UI/UX** - Responsive design with dark/light theme support
- 🤖 **AI ChatBot** - Intelligent travel assistant for user queries
- 📄 **PDF Generation** - Automatic ticket and booking confirmation generation
- 🔒 **Secure Authentication** - JWT-based authentication with role-based access control

---

## 🎯 Features

### 👤 User Roles & Capabilities

<table>
<tr>
<td width="25%">

#### 🧳 Tourist
- Browse & book tour packages
- Reserve hotels & buses
- Hire tour guides
- Join group tours
- Manage bookings
- Write reviews
- Track referral rewards

</td>
<td width="25%">

#### 🏨 Hotel Owner
- Add/manage properties
- Update room availability
- Set pricing & discounts
- View booking analytics
- Respond to reviews
- Generate revenue reports

</td>
<td width="25%">

#### 🗺️ Tour Guide
- Create professional profile
- Manage availability
- Accept tour requests
- Set service rates
- Track earnings
- Build reputation

</td>
<td width="25%">

#### 👨‍💼 Admin
- Manage all users
- Approve/reject listings
- Monitor transactions
- Handle complaints
- Generate reports
- System configuration

</td>
</tr>
</table>

### 🚀 Core Features

#### Booking & Reservations
- **Tour Packages** - Domestic and international tours with detailed itineraries
- **Hotel Bookings** - Real-time availability, room selection, and instant confirmation
- **Bus Tickets** - Multi-stop journey planning with seat selection
- **Guide Services** - Professional guide hiring with ratings and reviews

#### Smart Features
- 💡 **Budget Estimator** - AI-powered trip cost calculator
- 💱 **Currency Converter** - Real-time exchange rates for foreign tours
- 🎁 **Referral Program** - 10% discount after 5 successful referrals
- 🏷️ **Coupon System** - Promotional codes and seasonal discounts
- ⭐ **Rating & Reviews** - Community-driven quality assurance
- 🔍 **Advanced Search** - Filter by price, location, rating, and availability

#### Additional Features
- 📋 **Wishlist Management** - Save favorite tours and hotels
- 🗨️ **Community Forum** - Q&A platform for travelers
- 🔍 **Lost & Found** - Report and recover lost items
- 📊 **Analytics Dashboard** - Comprehensive booking and revenue insights
- 💳 **Multiple Payment Options** - Cash, bKash, Nagad support
- 📧 **Email Notifications** - Booking confirmations and reminders

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v19.2.3) - UI library
- **React Router DOM** (v7.11.0) - Client-side routing
- **Axios** (v1.13.2) - HTTP client
- **html2pdf.js** (v0.12.1) - PDF generation
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** (v5.2.1) - Web framework
- **MongoDB** (v9.0.2) - NoSQL database
- **Mongoose** - ODM library
- **JWT** (v9.0.3) - Authentication
- **bcryptjs** (v3.0.3) - Password hashing
- **Multer** (v2.0.2) - File uploads

### Architecture
- **MVC Pattern** - Model-View-Controller architecture
- **RESTful API** - Standard API design
- **JWT Authentication** - Secure token-based auth
- **Role-Based Access Control** - Permission management

---

## 📦 Installation

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** - Package manager

### 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditi-Adri/Roaming-Sonic.git
   cd Roaming-Sonic
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/roaming-sonic
   
   # Authentication
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

6. **Seed the database (Optional)**
   ```bash
   # Seed tours
   node backend/scripts/seedBangladeshTours.js
   node backend/scripts/seedForeignTours.js
   
   # Seed hotels
   node backend/scripts/seedHotels.js
   
   # Seed guides
   node backend/scripts/seedGuides.js
   
   # Seed coupons
   node backend/scripts/seedCoupons.js
   
   # Create admin user
   node backend/scripts/createAdmin.js
   ```

7. **Start the application**

   **Option 1: Run both frontend and backend together**
   ```bash
   npm run dev:full
   ```

   **Option 2: Run separately**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

8. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000
   - **API Health Check**: http://localhost:5000/api/health

---

## 📁 Project Structure

```
roaming-sonic/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── busController.js
│   │   ├── complaintController.js
│   │   ├── couponController.js
│   │   ├── groupTourController.js
│   │   ├── guideController.js
│   │   ├── hotelController.js
│   │   ├── tourController.js
│   │   └── userController.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # File upload handling
│   ├── models/              # Database schemas
│   │   ├── Booking.js
│   │   ├── Bus.js
│   │   ├── Complaint.js
│   │   ├── Coupon.js
│   │   ├── GroupTour.js
│   │   ├── GuideRequest.js
│   │   ├── Hotel.js
│   │   ├── TourPackage.js
│   │   └── User.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── busRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── groupTourRoutes.js
│   │   ├── guideRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── tourRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/             # Database seeding scripts
│   ├── uploads/             # User uploaded files
│   ├── server.js            # Entry point
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── Images/          # Static images
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── ChatBot.js
│   │   │   ├── DashboardLayout.js
│   │   │   ├── Navbar.js
│   │   │   └── PaymentForm.js
│   │   ├── context/         # React Context
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── pages/           # Page components
│   │   │   ├── dashboards/  # Role-based dashboards
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── GuideDashboard.js
│   │   │   │   ├── HotelOwnerDashboard.js
│   │   │   │   ├── TouristDashboard.js
│   │   │   │   ├── ManageCoupons.js
│   │   │   │   └── ManageHotels.js
│   │   │   ├── Buses.js
│   │   │   ├── Contact.js
│   │   │   ├── GroupTours.js
│   │   │   ├── Guides.js
│   │   │   ├── Home.js
│   │   │   ├── Hotels.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Tours.js
│   │   ├── services/        # API service layer
│   │   │   └── api.js
│   │   ├── App.js           # Root component
│   │   └── index.js         # Entry point
│   └── package.json
├── .env                     # Environment variables
├── package.json             # Root package.json
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
└── README.md               # This file
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/me` | Get current user | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update profile | Yes |
| PUT | `/users/change-password` | Change password | Yes |
| GET | `/users/bookings` | Get user bookings | Yes |

### Tour Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tours` | Get all tours | No |
| GET | `/tours/:id` | Get tour details | No |
| POST | `/tours` | Create tour (Admin) | Yes |
| PUT | `/tours/:id` | Update tour (Admin) | Yes |
| DELETE | `/tours/:id` | Delete tour (Admin) | Yes |

### Hotel Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/hotels` | Get all hotels | No |
| GET | `/hotels/:id` | Get hotel details | No |
| POST | `/hotels` | Create hotel | Yes |
| PUT | `/hotels/:id` | Update hotel | Yes |
| DELETE | `/hotels/:id` | Delete hotel | Yes |

### Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bookings` | Create booking | Yes |
| GET | `/bookings/:id` | Get booking details | Yes |
| PUT | `/bookings/:id/cancel` | Cancel booking | Yes |
| GET | `/bookings/user/:userId` | Get user bookings | Yes |

### Bus Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/buses` | Get all buses | No |
| GET | `/buses/search` | Search buses | No |
| POST | `/buses` | Create bus (Admin) | Yes |
| PUT | `/buses/:id` | Update bus (Admin) | Yes |

### Guide Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/guides` | Get all guides | No |
| GET | `/guides/:id` | Get guide details | No |
| POST | `/guide-requests` | Request guide | Yes |
| PUT | `/guide-requests/:id` | Update request | Yes |

### Coupon Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/coupons` | Get all coupons (Admin) | Yes |
| POST | `/coupons` | Create coupon (Admin) | Yes |
| POST | `/coupons/validate` | Validate coupon | Yes |
| DELETE | `/coupons/:id` | Delete coupon (Admin) | Yes |

### Complaint Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/complaints` | Submit complaint | Yes |
| GET | `/complaints` | Get all complaints | Yes |
| PUT | `/complaints/:id` | Update complaint | Yes |

---

## 🎨 Screenshots

> Add screenshots of your application here to showcase the UI

---

## 🚀 Deployment

### Deploy to Vercel (Frontend)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy with one click

### Deploy to Render (Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables

---

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests (if implemented)
cd backend
npm test
```

---

## 🤝 Contributing

Contributions are welcome! This is an educational project created for CSE470.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Authors

**Roaming Sonic Development Team**
- GitHub: [@Aditi-Adri](https://github.com/Aditi-Adri)

---

## 🙏 Acknowledgments

- Built as part of CSE470 - Software Engineering course project
- Special thanks to all contributors and testers
- Icons and images from various open-source resources

---

## 📧 Contact

For any queries or support:
- **Project Repository**: [Roaming-Sonic](https://github.com/Aditi-Adri/Roaming-Sonic)
- **Issues**: [Report Bug](https://github.com/Aditi-Adri/Roaming-Sonic/issues)

---

<div align="center">

Made with ❤️ for travelers in Bangladesh

**[⬆ back to top](#-roaming-sonic---travel--tour-management-system)**

</div>
