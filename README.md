# Image Processing Service (Cloudinary-Like Application)

A full-stack cloud image processing platform that allows users to:
Register & Login (JWT Authentication)
Upload images to AWS S3
Apply image transformations (resize, grayscale, format conversion)
Cache transformed images
Retrieve original and transformed images
Manage images via a modern React dashboard

## Live Deployment

Frontend (Vercel): https://your-frontend-url.vercel.app

Backend (Railway): https://your-backend-url.railway.app

🏗️ Tech Stack
🔹 Frontend

React (Vite)

React Router (BrowserRouter)

Axios

CSS (Custom Styling)

Vercel Deployment

🔹 Backend

Node.js

Express.js

MongoDB (Mongoose)

JWT Authentication

AWS S3 (Cloud Storage)

Sharp (Image Processing)

Railway Deployment

📁 Project Structure
Image_Processing_App/
│
├── image-service-backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── image-service-frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   └── ImageDetails.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json
│   └── package.json
│
└── README.md

🔐 Authentication System
Backend

JWT token generation

Auth middleware for protected routes

Secure user-password hashing

Owner-based image access control

Frontend

Login & Register pages

Token stored in localStorage

Axios interceptor for attaching JWT

Protected route logic

Logout clears token & redirects to login

🖼️ Image Management Features
1️⃣ Upload Image

Upload via multipart/form-data

Store original image in AWS S3

Save metadata in MongoDB:

Width

Height

Format

Size

Owner

2️⃣ Transform Image

Supported transformations:

Resize

Rotate

Grayscale

Format conversion (JPEG/PNG)

Transformation Process:

Fetch original image from S3

Apply transformations using Sharp

Generate unique hash

Check cache (TransformedImage collection)

If cached → return existing image

If not cached → store new transformed image in S3

3️⃣ List Images (Paginated)
GET /images?page=1&limit=10


Returns:

Page number

Total images

Results array

4️⃣ Get Image by ID

Returns:

Original image

Latest transformed image (if exists)

🖥️ Frontend Features
Pages Implemented
🔹 Login Page

User authentication

Redirect to dashboard after login

🔹 Register Page

New user creation

JWT returned after registration

🔹 Dashboard

Displays all user images

Paginated API integration

Click to view image details

🔹 Upload Page

Image file input

Preview before upload

Upload success confirmation

🔹 Image Details Page

Display original image

Apply transformations

View transformed result

Cache-aware transformation handling

⚠️ SPA Routing Issue (Important Learning)

Since the app uses:

<BrowserRouter>


Refreshing or directly accessing routes like:

/login
/dashboard


caused 404 errors on Vercel.

Why?

React Router handles routes client-side, but Vercel tries to find physical files.

Solution

Added vercel.json:

{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}


Now:

All routes serve index.html

React Router handles navigation

No more 404 errors

⚙️ Environment Variables
Backend (.env)
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key

AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket

Frontend (.env)
VITE_API_URL=https://your-backend-url.railway.app/api

🧪 Testing

Jest

Supertest

Auth flow testing

S3 upload mocking

Image upload integration test

🚀 Deployment
Backend → Railway

Connect GitHub

Add environment variables

Deploy Node service

Frontend → Vercel

Set Root Directory to image-service-frontend

Add vercel.json

Deploy

📌 Key Concepts Demonstrated

REST API Architecture

JWT Authentication

Middleware Protection

AWS S3 Cloud Storage

Image Processing (Sharp)

Transformation Caching via Hashing

Pagination

SPA Routing in Production

Monorepo Deployment Handling

Frontend + Backend Integration

🧩 Future Enhancements

Crop

Watermark

Compression

Rate limiting

Redis caching

Background job queue (BullMQ / RabbitMQ)

CDN integration

Docker containerization

👩‍💻 Author

Sakshi Vijay Nandgude
Full Stack Developer

⭐ Project Purpose

This project demonstrates:

Scalable backend architecture

Cloud integration

Image processing pipeline

Production-ready frontend deployment

Full-stack engineering skills
