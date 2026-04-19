export const reservationRejectionTemplate = ({
  plateNumber,
  vehicleType,
  vehicleSize,
  location,
  reason,
}: {
  plateNumber: string;
  vehicleType: string;
  vehicleSize: string;
  location?: string;
  reason: string;
}) => `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              background-color: #f44336;
              color: white;
              padding: 10px 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
          }
          .content {
              padding: 20px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 5px 5px;
          }
          .details {
              background-color: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
          }
          .reason {
              background-color: #ffebee;
              padding: 15px;
              border-radius: 5px;
              margin: 15px 0;
              border-left: 4px solid #f44336;
          }
          .footer {
              margin-top: 20px;
              font-size: 0.8em;
              color: #777;
              text-align: center;
          }
          .action {
              margin-top: 20px;
              text-align: center;
          }
          .action a {
              background-color: #2196F3;
              color: white;
              padding: 10px 15px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h2>Parking Reservation Rejected</h2>
      </div>
      <div class="content">
          <p>We regret to inform you that your parking reservation request could not be approved.</p>
          
          <div class="details">
              <p><strong>Vehicle Plate:</strong> ${plateNumber}</p>
              <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
              <p><strong>Vehicle Size:</strong> ${vehicleSize}</p>
              ${location ? `<p><strong>Requested Location:</strong> ${location}</p>` : ''}
          </div>
  
          <div class="reason">
              <h3>Reason for Rejection:</h3>
              <p>${reason}</p>
          </div>
  
          <div class="action">
              <a href="${process.env.FRONTEND_URL || '#'}/reservations/new">Make New Reservation</a>
          </div>
          
          <div class="footer">
              <p>If you believe this is an error or need assistance, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Parking Management System</p>
          </div>
      </div>
  </body>
  </html>
  `;
