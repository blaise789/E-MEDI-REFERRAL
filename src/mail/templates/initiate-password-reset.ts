import { config } from 'dotenv';
import appConfig from 'src/config/app.config';

export const initiatePasswordReset = ({
  token,
  names,
}: {
  token: string;
  names: string;
}) =>
  `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
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

    .reset-link {
      margin-top: 20px;
      text-align: center;
    }

    .reset-link a {
      display: inline-block;
      padding: 10px 20px;
      background-color: #0066cc;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset</h1>
    <p>Hello, ${names}!</p>
    <p>We received a request to reset your password. Click the link below to reset it:</p>
    <div class="reset-link">
      <a href="${appConfig().client.url + '/auth/forgot-password/' + token}">Reset Password</a>
    </div>
  </div>
</body>
</html>

    `;
