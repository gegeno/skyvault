// Password Reset Email Template Generator

/**
 * Generates the HTML content for the password reset email.
 * @param {string} [username="User"] - The name of the user requesting the reset.
 * @param {string} [resetLink="#"] - The unique link containing the reset token.
 * @param {number} [expiryMinutes=15] - The validity duration of the link in minutes.
 * @returns {string} - A complete HTML string ready to be sent as an email body.
 */
export const getPasswordResetEmailTemplate = (
  username = 'User',
  resetLink = '#',
  expiryMinutes = 15,
) => {
  const year = new Date().getFullYear();
  const companyEmail = process.env.GMAIL_USER;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password Reset Request</title>
</head>
<body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">

    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
      <div style="font-size:48px;margin-bottom:15px;">🔑</div>
      <h1 style="color:#ffffff;font-size:28px;font-weight:600;margin:0;">Password Reset</h1>
    </div>

    <div style="padding:50px 40px;text-align:center;">
      <h2 style="color:#1a202c;font-size:24px;margin-bottom:16px;font-weight:600;">Hello, ${username}</h2>
      <p style="color:#4a5568;font-size:16px;line-height:1.6;margin-bottom:30px;">
        We received a request to reset your password. You can set up a new one by clicking the button below.
      </p>

      <div style="margin:40px 0;">
        <a href="${resetLink}"
           style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:600;display:inline-block;">
           Reset Password →
        </a>
      </div>

      <div style="background:#fff5f5;border-left:4px solid #fc8181;padding:16px 20px;border-radius:8px;margin:30px 0;text-align:left;">
        <p style="color:#c53030;font-size:14px;margin:0;display:flex;align-items:center;gap:10px;">
          <span style="font-size:20px;flex-shrink:0;">⏰</span>
          <span><strong>Note:</strong> This link will expire in ${expiryMinutes} minutes.</span>
        </p>
      </div>

      <p style="color:#4a5568;font-size:16px;line-height:1.6;">
        If you did not request a password reset, you can safely ignore this email — your account will remain secure.
      </p>

      <div style="background:#f7fafc;border-radius:12px;padding:25px;margin-top:30px;text-align:left;">
        <h3 style="color:#2d3748;font-size:16px;margin-bottom:15px;font-weight:600;display:flex;align-items:center;gap:8px;">
          🛡️ Security Tips
        </h3>
        <ul style="list-style:none;padding:0;margin:0;">
          <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
            <span style="position:absolute;left:0;">✅</span> Always keep your password private
          </li>
          <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
            <span style="position:absolute;left:0;">✅</span> Avoid using the same password on multiple sites
          </li>
          <li style="color:#4a5568;font-size:14px;margin-bottom:10px;padding-left:24px;position:relative;line-height:1.5;">
            <span style="position:absolute;left:0;">✅</span> Enable two-factor authentication if available
          </li>
        </ul>
      </div>
    </div>

    <div style="background:#f7fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="color:#718096;font-size:14px;margin:8px 0;line-height:1.6;"><strong>Need Help? 💬</strong></p>
      <p style="color:#718096;font-size:14px;margin:8px 0;line-height:1.6;">
        Contact our support team at
        <a href="mailto:${companyEmail}" style="color:#667eea;text-decoration:none;font-weight:500;">${companyEmail}</a>
      </p>
      <p style="color:#718096;font-size:14px;margin-top:20px;">© ${year} | SkyVault. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
};
