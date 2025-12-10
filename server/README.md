# ⚙️ **SkyVault Server**

The SkyVault server is a robust RESTful API built with **Node.js** and **Express**. It serves as the secure core of the application, managing user authentication, enforcing file permissions, interacting with the MongoDB database, fetch metadata from S3 file uploads, and create secured signed-urls to upload/download the file. It emphasizes security through strict input validation, rate limiting, and encrypted session management.

## 🌊 **The Flow**

1.  **Incoming Request**: A client (frontend) sends an HTTP request to the server.
2.  **Security & Parsing**: Global middleware secures headers (`helmet`), enables cross-origin requests (`cors`), and parses cookies and JSON bodies (`cookie-parser`, `express.json`).
3.  **Logging**: The request is logged for monitoring purposes using `morgan`.
4.  **Rate Limiting**: The request is checked against strict limits (especially for Auth/Public routes) to prevent abuse.
5.  **Routing**: The request matches a specific route definition (e.g., `/api/v1/file/...`).
6.  **Authentication**: Protected routes verify the user's session/JWT via the `authMiddleware`.
7.  **Validation**: The `validate` middleware checks the request body, query, or params against strict **Zod** schemas. If invalid, it rejects the request immediately.
8.  **Controller & Service**: The controller executes the business logic, often calling specialized services (like `s3.service` or `email.service`) to perform tasks.
9.  **Response**: The server sends back a standardized JSON response or an error code via the global error handler.

## 🏗️ **Project Structure**

The backend code is structured to ensure separation of concerns and scalability.

- **`src/config`**: Configuration for external services like MongoDB, Redis, and Logger.
- **`src/controllers`**: Handles the core logic for incoming requests and sends responses.
- **`src/middlewares`**: Interceptors for authentication, error handling, rate limiting, and validation.
- **`src/models`**: Mongoose schemas defining the data structure for Users, Files, Directories, etc.
- **`src/routes`**: Definitions of API endpoints and mapping them to controllers.
- **`src/services`**: Reusable business logic, such as S3 uploads, Email sending, and Google Auth.
- **`src/utils`**: Helper classes and functions like `ApiResponse` and email templates.
- **`src/validators`**: Zod schemas for validating request data before it reaches the controller.

## 🔌 **APIs**

The API is versioned at `/api/v1`. Below is a detailed reference for all available endpoints.

### ❤️ **Health (`/health`)**

- **`GET /`**
  - Returns server status. Useful for uptime monitoring.

### 🛡️ **Authentication (`/auth`)**

- **`POST /send-otp`**
  - Sends a verification OTP to the user's email.
  - **Payload:**
    ```json
    {
      "email": "user@example.com"
    }
    ```

- **`POST /register`**
  - Creates a new account after OTP verification.
  - **Payload:**
    ```json
    {
      "name": "John Doe",
      "email": "user@example.com",
      "password": "StrongPassword123!",
      "otp": "1234"
    }
    ```

- **`POST /login`**
  - Logs in a user and sets a session cookie.
  - **Payload:**
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPassword123!"
    }
    ```

- **`POST /google-login`**
  - Authenticates a user using a Google ID token.
  - **Payload:**
    ```json
    {
      "idToken": "eyJhbGciOiJRU..."
    }
    ```

- **`POST /forgot-password`**
  - Initiates the password reset process via email.
  - **Payload:**
    ```json
    {
      "email": "user@example.com"
    }
    ```

- **`POST /reset-password`**
  - Resets the password using a valid token.
  - **Payload:**
    ```json
    {
      "token": "reset-token-string",
      "password": "NewStrongPassword123!"
    }
    ```

- **`POST /logout`**
  - Clears the user session. No payload required.

- **`GET /me`**
  - Retrieves current user session details. No payload required.

### 📂 **Directory (`/directory`)**

- **`GET /:id?`**
  - Fetches contents of a folder. If `id` is omitted, fetches the root directory.

- **`POST /`**
  - Creates a new folder.
  - **Payload:**
    ```json
    {
      "name": "My New Folder",
      "parentId": "60d5ecb8b487343568912345" // Optional (null for root)
    }
    ```

- **`PATCH /:id`**
  - Renames a folder.
  - **Payload:**
    ```json
    {
      "name": "Renamed Folder"
    }
    ```

- **`DELETE /:id`**
  - Moves a folder to trash. No payload required.

- **`PATCH /:id/move`**
  - Moves a folder into another folder.
  - **Payload:**
    ```json
    {
      "newParentId": "60d5ecb8b487343568954321" // or null for root
    }
    ```

- **`PATCH /:id/copy`**
  - Copies a folder to another location.
  - **Payload:**
    ```json
    {
      "targetParentId": "60d5ecb8b487343568954321"
    }
    ```

### 📄 **File (`/file`)**

- **`POST /upload/initiate`**
  - Requests a pre-signed S3 URL to upload a file directly from the client.
  - **Payload:**
    ```json
    {
      "name": "image.png",
      "size": 102400,
      "mimeType": "image/png",
      "parentId": "60d5ecb8b487343568912345" // Optional
    }
    ```

- **`POST /upload/complete`**
  - Confirms the file was uploaded successfully to S3.
  - **Payload:**
    ```json
    {
      "fileId": "60d5ecb8b4873435689abcde"
    }
    ```

- **`GET /:id`**
  - Retrieves file metadata or a download URL.
  - **Query Params:** `?download=true` (optional) to get a download link.

- **`PATCH /:id`**
  - Renames a file.
  - **Payload:**
    ```json
    {
      "name": "new_image_name.png"
    }
    ```

- **`DELETE /:id`**
  - Moves a file to trash. No payload required.

- **`PATCH /:id/move`**
  - Moves a file to another folder.
  - **Payload:**
    ```json
    {
      "newParentId": "60d5ecb8b487343568954321"
    }
    ```

- **`PATCH /:id/copy`**
  - Copies a file to another folder.
  - **Payload:**
    ```json
    {
      "targetParentId": "60d5ecb8b487343568954321"
    }
    ```

### 🔐 **Vault (`/vault`)**

- **`POST /setup`**
  - Configures the secure vault PIN.
  - **Payload:**
    ```json
    {
      "pin": "123456" // 4-6 digits
    }
    ```

- **`POST /unlock`**
  - Unlocks the vault for the current session.
  - **Payload:**
    ```json
    {
      "pin": "123456"
    }
    ```

- **`POST /lock`**
  - Immediately locks the vault. No payload required.

### 🌍 **Share (`/share`)**

- **`POST /file/:id`**
  - Generates a public share link for a file. No body required.

- **`POST /directory/:id`**
  - Generates a public share link for a directory. No body required.

- **`DELETE /file/:id`**
  - Revokes access to a shared file. No body required.

- **`DELETE /directory/:id`**
  - Revokes access to a shared directory. No body required.

- **`GET /me`**
  - Lists all items currently shared by the user.

### 🌐 **Public Access (`/public`)**

- **`GET /share/:shareId`**
  - Retrieves details of a shared item using its unique share ID (no auth required).

- **`GET /download/:shareId`**
  - Gets a download URL for a shared file (no auth required).

### 🗑️ **Trash (`/trash`)**

- **`DELETE /permanent/file/:id`**
  - Permanently deletes a file. No recovery possible.

- **`DELETE /permanent/directory/:id`**
  - Permanently deletes a directory. No recovery possible.

- **`DELETE /empty`**
  - Permanently deletes all items in the trash.

### 🔍 **Search (`/search`)**

- **`GET /`**
  - Searches for files and folders matching the query.
  - **Query Params:** `?q=searchterm`
