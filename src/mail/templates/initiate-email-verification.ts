import appConfig from 'src/config/app.config';

export const initiateEmailVerification = ({
  names,
  verificationCode,
}: {
  names: string;
  verificationCode: string;
}) =>
  `

    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f1f1f1;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333333;
      margin-bottom: 20px;
    }

    p {
      color: #666666;
      margin-bottom: 10px;
    }

    .verification-code {
      margin-top: 20px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      color: #0066cc;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification</h1>
    <p>Hello, ${names}!</p>
    <p>Your email verification code is:</p>
    <div class="verification-code">
      ${verificationCode}
    </div>
    <p>Please enter this code to complete the email verification process.</p>
    <p>Or click <a href=${appConfig().client.url}/auth/reset-password/${verificationCode}>this link</a></p>
    <p>If you did not request this code, please ignore this email.</p>
    <p>Thank you!</p>
  </div>
</body>
</html>

    
    `;
