# **App Name**: VeriReport

## Core Features:

- Role-Based Authentication: Implement secure role-based authentication using Firebase Auth for admins, teachers, students, parents, and verifiers.
- Report Card Upload and Metadata Storage: Admin/Teacher portal to upload report cards (PDF, Excel, Images) to Firebase Storage and store associated metadata (student ID, name, class, term, year) in Firestore.
- Unique Verification ID Generation: Automatically generate unique verification IDs and QR codes for each uploaded report card and store securely. The verification ID serves as a tool for the admin dashboard.
- Student/Parent Dashboard: Secure login for students/parents to view released report cards and track verification status.
- Public Verification Page: A public-facing page allowing verifiers to enter a report card ID or scan a QR code to check authenticity status (valid/invalid/pending).
- Mobile App Integration: React Native/Expo app enabling parents/students to log in, view report cards, and use a QR scanner for verification.

## Style Guidelines:

- Primary color: HSL(210, 60%, 50%) – A moderate (#6f1d1b), suggesting trustworthiness, clarity, and stability, aligning with the goal of secure report card verification.
- Background color: HSL(210, 20%, 95%) – Very light blue (#F0F8FF), ensuring a clean, neutral backdrop that doesn't distract from the content.
- Accent color: HSL(180, 50%, 50%) – A contrasting cyan (#f5ebe0), intended to highlight key actions and elements, conveying precision and accuracy.
- Font pairing: 'Inter' (sans-serif) for body text, providing excellent readability; 'Space Grotesk' (sans-serif) for headers, creating a modern tech-forward aesthetic.
- Use simple, professional icons from a library like FontAwesome or Material Icons to represent actions and categories. Ensure consistency in style and size.
- Implement a clean, grid-based layout using Tailwind CSS, optimizing for readability and a logical content flow. Prioritize a responsive design adapting to different screen sizes.
- Incorporate subtle transitions and animations to enhance user experience, such as loading spinners, button hover effects, and smooth navigation transitions.