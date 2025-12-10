// Welcome Email Template Generator

// Environment Variables
const ENV = process.env.NODE_ENV;
const CLIENT_URL = ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;
const COMPANY_EMAIL = process.env.GMAIL_USER;

/**
 * Generates the HTML content for the welcome email sent to new users.
 * @param {string} name - The name of the user to greet.
 * @returns {string} - A complete HTML string ready to be sent as an email body.
 */
export const getWelcomeEmailTemplate = (name) => {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Our Community</title>
  </head>
  <body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">

      <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
        <div style="font-size:48px;margin-bottom:15px;">🎉</div>
        <h1 style="color:#ffffff;font-size:28px;font-weight:600;margin:0;">Welcome Aboard!</h1>
      </div>

      <div style="padding:50px 40px;text-align:center;">
        <h2 style="color:#1a202c;font-size:24px;margin-bottom:16px;font-weight:600;">Hello, ${name} 👋</h2>
        <p style="color:#4a5568;font-size:16px;line-height:1.6;margin-bottom:30px;">
          We’re thrilled to have you join our community! You’ve successfully created your account, and we can’t wait for you to explore everything we have to offer.
        </p>
        <div style="background:#f7fafc;border-radius:12px;padding:25px;text-align:left;">
          <h3 style="color:#2d3748;font-size:16px;margin-bottom:15px;font-weight:600;display:flex;align-items:center;gap:8px;">
            🚀 Get Started Quickly
          </h3>
          <ul style="list-style:none;padding:0;margin:0;">
            <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
              <span style="position:absolute;left:0;">✅</span> Explore your dashboard to customize your profile
            </li>
            <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
              <span style="position:absolute;left:0;">✅</span> Upload your files and organize them into folders
            </li>
            <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
              <span style="position:absolute;left:0;">✅</span> Check out our community and help center
            </li>
          </ul>
        </div>

        <div style="margin-top:40px;">
          <a href="${CLIENT_URL}/drive"
             style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">
             Go to Dashboard →
          </a>
        </div>

        <p style="color:#4a5568;font-size:16px;line-height:1.6;margin-top:40px;">
          We’re here to help you every step of the way. If you have any questions, feel free to reach out anytime.
        </p>
      </div>

      <div style="background:#f7fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#718096;font-size:14px;margin:8px 0;line-height:1.6;"><strong>Need Help? 💬</strong></p>
        <p style="color:#718096;font-size:14px;margin:8px 0;line-height:1.6;">
          Contact our support team at
          <a href="mailto:${COMPANY_EMAIL}" style="color:#667eea;text-decoration:none;font-weight:500;">${COMPANY_EMAIL}</a>
        </p>
        <p style="color:#718096;font-size:14px;margin-top:20px;">© ${year} | SkyVault. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;
};
