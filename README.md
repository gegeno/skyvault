# ☁️ **SkyVault: Your Files. Secured in the Sky.**

**SkyVault** is a modern, secure, and user-friendly web application designed to store, manage, and share your digital files. Think of it as your personal hard drive in the cloud, but with an extra layer of security for your most sensitive documents.

The project is divided into two main parts:

1. **The User Application (Client):** The website that users see and interact with.
2. **The Central System (Server):** The engine that processes requests, stores data, and manages security behind the scenes.

## ✨ **Key Features**

Here is what you can do with **SkyVault:**

### 🗂️ Organized File Management

- **My Drive:** The central hub for all your uploads. You can create folders to keep things tidy and navigate through them easily, just like on your computer.
- **Instant Search:** Can't find a file? The built-in search bar helps you locate documents and folders instantly.

### 🛡️ The Secure Vault

- **Private Space:** A special, lockable folder for your most sensitive files (like tax documents or IDs).
- **PIN Protection:** This area is protected by a unique PIN that you set. Even if someone accesses your account, they cannot enter the vault without this code.

### 🤝 Easy Sharing

- **Public Links:** Need to send a large video or document to a friend? Generate a public link that allows them to view or download the file without needing an account.
- **Management:** You can easily see everything you have shared and revoke access (break the link) at any time if you change your mind.

### 🗑️ Trash

Accidents happen. When you delete a file, it isn't gone forever immediately.

- **Safety Net:** Deleted items move to the "Trash" area first.
- **Restore or Destroy:** From the trash, you can choose to put the file back where it came from ("Restore") or wipe it permanently ("Delete Forever").

### 🎨 Personalized Experience

- **Dark Mode:** Switch between light and dark themes to suit your preference and save your eyes at night.
- **Storage Tracking:** A handy bar shows you exactly how much storage space you have used and how much is left.

## 🔒 **Security & Privacy**

**SkyVault** takes your privacy seriously:

- **Secure Connection:** All communication between you and the server is encrypted (HTTPS).
- **Smart Cookies:** When you log in, the server gives your browser a secure "cookie" (a digital pass) so you stay logged in without sending your password back and forth.
- **Input Checks:** The server checks every piece of data you send (using "Zod") to prevent malicious code from sneaking in.

## 💻 **The Client (Frontend)**

The frontend is the visual part of SkyVault that you interact with. It is built to be fast, responsive, and easy to use on both computers and mobile phones. It manages your session, handles the file uploads, and updates the screen immediately when you make changes, like renaming a file or creating a folder. [Read More](client/README.md)

### Tech Stack:

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Animations:** Framer Motion
- **Icons:** Lucide React

## ⚙️ **The Server (Backend)**

The backend is the core of the application. It handles all the logic for user accounts, security, and file management. It verifies who you are, coordinates with the database to remember where your files are, and generates secure "keys" that allow your browser to upload files directly to the AWS S3. [Read More](server/README.md)

### Tech Stack:

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (with Mongoose)
- **Caching:** Redis
- **Cloud Storage:** AWS S3
- **Validation:** Zod
- **Email Service:** Nodemailer

## 🛠️ **Installation Guide**

Follow these steps to set up **SkyVault** on your local machine.

1. **Prerequisites** Ensure you have Node.js and pnpm installed. You will also need a MongoDB database and an AWS S3 bucket (or compatible storage).

2. **Clone the Repository** Clone the SkyVault repository to your local machine.

```bash
git clone https://github.com/ravindrayadav26/skyvault.git
```

3. **Setup the Server** Navigate to the server folder, install the tools, configure your environment, and start the application.

Create the new .env file based on [.env.sample](server/.env.sample) and fill in your details.

```bash
cd server
pnpm install
pnpm dev
```

4. **Setup the Client** Open a new terminal, navigate to the client folder, install the tools, configure your environment, and start the application.

Create the new .env file based on [.env.sample](client/.env.sample) and fill in your details.

```bash
cd client
pnpm install
pnpm dev
```

5. **Access the Application** Open your web browser and go to `http://localhost:3000` to start using SkyVault.