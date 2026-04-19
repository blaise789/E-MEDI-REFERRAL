export const reservationApprovalTemplate = ({
  slotNumber,
  plateNumber,
  vehicleType,
  vehicleSize,
  location,
  expirationDate,
}: {
  slotNumber: string;
  plateNumber: string;
  vehicleType: string;
  vehicleSize: string;
  location: string;
  expirationDate: Date | null;
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
              background-color: #4CAF50;
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
          .footer {
              margin-top: 20px;
              font-size: 0.8em;
              color: #777;
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <h2>Parking Reservation Approved</h2>
      </div>
      <div class="content">
          <p>Your parking reservation has been approved. Below are your reservation details:</p>
          
          <div class="details">
              <p><strong>Slot Number:</strong> ${slotNumber}</p>
              <p><strong>Vehicle Plate:</strong> ${plateNumber}</p>
              <p><strong>Vehicle Type:</strong> ${vehicleType}</p>
              <p><strong>Vehicle Size:</strong> ${vehicleSize}</p>
              <p><strong>Location:</strong> ${location}</p>
              ${
                expirationDate
                  ? `
              <p><strong>Expires At:</strong> ${expirationDate.toLocaleString()}</p>
              `
                  : ''
              }
          </div>
  
          <p>Please present this confirmation when you arrive at the parking facility.</p>
          
          <div class="footer">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} Parking Management System</p>
          </div>
      </div>
  </body>
  </html>
  `;
