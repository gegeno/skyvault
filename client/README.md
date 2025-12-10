# 💻 **SkyVault Client**

The SkyVault client is a modern web application built to provide a fast and responsive interface for managing your cloud files. It is developed using **Next.js** and **React**, offering a smooth user experience with features like file uploads, instant search, secure vault and dark mode support.

## 🌊 **The Flow**

1.  **Onboarding & Authentication:**
    - **Landing:** Users arrive at a landing page showcasing features like the Secure Vault and lightning-fast speeds.
    - **Entry:** Users can sign up or log in using email/password or Google authentication.
    - **Protection:** The application uses an `AuthGuard` to ensure only logged-in users can access private areas, redirecting guests to the login screen.

2.  **Dashboard & Navigation:**
    - **Layout:** Once authenticated, users see the main dashboard with a sidebar for quick navigation to "My Drive", "Secure Vault", "Shared", and "Trash".
    - **Browsing:** The main view displays files and folders in a grid or list format. Users can navigate into folders, and a breadcrumb bar helps track their location.

3.  **File Operations:**
    - **Management:** Users can rename, move, copy, or delete files and folders directly from the interface using a context menu.
    - **Uploads:** A "New" button allows creating folders or uploading files, which are sent directly to the storage server (AWS S3).

4.  **Secure Vault Access:**
    - **Setup:** First-time users are prompted to set a 4-6 digit PIN to create their vault.
    - **Access:** To view vault files, users must enter this PIN. The vault automatically locks for security.

5.  **Sharing:**
    - **Public Links:** Users can generate unique public links for any file or folder to share them with others.
    - **Public View:** Recipients access these links via a dedicated public page to preview or download the content without needing an account.

## 🏗️ Project Structure

The frontend code is organized to separate user interface components from logic and data services.

- **`src/app`**: Contains the main pages and routing logic for the application.
  - `(auth)`: Pages for Login, Register, and Password Reset.
  - `(drive)`: The core application area (Drive, Vault, Trash, Shared) protected by authentication.
  - `(public)`: Publicly accessible pages for shared links.
- **`src/components`**: Reusable building blocks for the interface.
  - `ui`: Basic elements like Buttons, Inputs, and Dialogs (using Shadcn UI).
  - `drive`: Components specific to file browsing, like File Icons and Item Cards.
  - `vault`: Components for Vault PIN entry and setup.
  - `modals`: Pop-ups for actions like "Share", "Rename", or "Create Folder".
- **`src/services`**: Handles communication with the backend server.
  - Contains distinct services for `auth`, `file`, `directory`, and `share` operations.
- **`src/store`**: Manages global application state (like the current user or file view preferences) using Zustand.
- **`src/lib`**: Helper functions and configurations.
  - Includes the HTTP client (`axios.js`) and form validation schemas (`validators.js`).
