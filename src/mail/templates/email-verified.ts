export const emailVerified = ({ names }: { names: string }) =>
  `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verified</title>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verified</h1>
    <p>Hello, ${names}!</p>
    <p>Your email has been successfully verified.</p>
    <p>Thank you for confirming your email address.</p>
    <p>Feel free to login and start using our platform.</p>
    <p>Thank you!</p>
  </div>
</body>
</html>


`;
