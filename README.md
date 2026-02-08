# Image_Processing_App (Ongoing Project)
A full-stack image processing application with Angular.js, Node.js + Express, JWT-based authentication, ownership-based access control, image upload and transformation with Multer and Sharp, caching, MongoDB, Pagination, Rate Limiting with express-rate-limit, file storage on disk with Amazon S3 integration in progress, and end-to-end integration testing using Jest and Supertest.

## Image Processing Backend Service
A backend image processing service inspired by Cloudinary that allows users to upload images, apply transformations, and retrieve optimized image versions securely.
This service supports user authentication, cloud storage, image transformation pipelines, caching of transformed images, and rate-limited processing APIs.

## Features
Authentication

User registration

User login

JWT based authentication

Image Management

Upload images

Store images in AWS S3

Retrieve user images

View image metadata

Image Transformations

Users can apply one or more transformations in a single request:

Resize

Crop

Rotate

Format change (jpeg, png, webp, etc.)

Grayscale filter

Sepia filter

(Extensible for more operations)

Performance & Security

Transformed image caching

Rate-limiting on transform endpoint

Ownership based access control

## Architecture (Current)
Client

   |
   
API (Node + Express)

   |
   
MongoDB (metadata, users, transformations)

   |
   
AWS S3 (original + transformed images)

   |
   
Sharp (image processing)

## Tech Stack
Node.js

Express.js

MongoDB (Mongoose)

AWS S3

Sharp

JWT

Multer

Jest (API testing)

## Deployed Backend URL
https://imageprocessingapp-production.up.railway.app/

## Environment Variables
Create a .env file with:

PORT=4000

MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret

AWS_REGION=your_region

AWS_ACCESS_KEY=your_access_key

AWS_SECRET_KEY=your_secret_key

AWS_BUCKET_NAME=your_bucket_name


## Run Locally
npm install

npm run dev

Server runs on:
http://localhost:4000

## Authentication Endpoints
Register
POST /api/auth/register

Login
POST /api/auth/login

## Image APIs
Upload Image
POST /api/images

Transform Image
POST /api/images/:id/transform

List User Images
GET /api/images?page=1&limit=10

Get Image Details (with all transformed versions)
GET /api/images/:id

## Caching Behaviour
If the same transformation is requested again for the same image:

the server returns the cached transformed image

no new processing is performed

Response includes:
cached: true

## Rate Limiting
The transform endpoint is rate-limited to prevent abuse:
POST /api/images/:id/transform

## Testing
Jest and Supertest are used for API tests.

S3 operations are mocked in tests to avoid real cloud calls.

Run:
npm test

## Access Control
Users can only access their own images

All image endpoints are protected using JWT authentication

## Current Status
Backend implementation is complete and deployed.

Frontend will be implemented next and integrated with this API.

## Author
Sakshi Vijay Nandgude
