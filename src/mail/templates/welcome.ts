export const welcome = ({ names }: { names: string }) =>
  `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
        <h1>Welcome, ${names}!</h1>
        <p>Thank you for joining our platform.</p>
        <p>We are excited to have you on board!</p>
    </div>
    </body>
    </html>
    `;
