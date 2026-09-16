const generateEmailTemplate = (booking, seats) => {
  const tableNumbers = [
    ...new Set(seats.map((seat) => seat.table.tableNumber)),
  ];
  const seatNumbers = seats.map((seat) => seat.seatNumber).join(", ");
  const totalAmount = booking.amount.toLocaleString();

  // URL encode the QR data for the QR code generator
  const encodedQRData = encodeURIComponent(
    JSON.stringify({
      bookingId: booking._id.toString(),
      name: booking.name,
      matricNo: booking.matricNo,
      seats: seatNumbers,
      tables: tableNumbers.join(", "),
      amount: booking.amount,
      timestamp: booking.createdAt,
    })
  );

  // Create verification URL with booking data
  const verificationUrl = `https://dinner.nuesaabuad.ng/verify/${booking._id}`;

  return `
      <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FÀÁJÍ LAWA | Your Reservation is Confirmed</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Crimson Text', serif;
            line-height: 1.6;
            color: #ffffff;
            background: linear-gradient(135deg, #0a0a0a 0%, #16130b 50%, #0a0a0a 100%);
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(180deg, #000000 0%, #0f0d08 50%, #000000 100%);
            border: 2px solid #d4af37;
            box-shadow: 0 20px 40px rgba(212, 175, 55, 0.25);
        }

        .header {
            text-align: center;
            padding: 40px 30px 25px;
            background: linear-gradient(45deg, #0a0a0a 0%, #1a1508 100%);
            border-bottom: 1px solid #d4af37;
            position: relative;
            overflow: hidden;
        }

        .logo {
            position: relative;
            z-index: 2;
        }

        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 44px;
            font-weight: 900;
            color: #d4af37;
            text-shadow: 2px 2px 10px rgba(212, 175, 55, 0.4);
            margin-bottom: 10px;
            letter-spacing: 4px;
        }

        .tagline {
            font-size: 14px;
            color: #fcf6ba;
            font-weight: 600;
            letter-spacing: 3px;
            text-transform: uppercase;
            position: relative;
            z-index: 2;
        }

        .content {
            padding: 40px 30px;
            background: #0a0a0a;
        }

        .welcome-message {
            text-align: center;
            margin-bottom: 40px;
        }

        .welcome-message h2 {
            font-family: 'Playfair Display', serif;
            font-size: 30px;
            color: #d4af37;
            margin-bottom: 20px;
            font-style: italic;
        }

        .welcome-text {
            font-size: 18px;
            color: #e0e0e0;
            line-height: 1.8;
            margin-bottom: 30px;
        }

        .booking-details {
            background: linear-gradient(135deg, #0f0d08, #1a1508);
            border: 1px solid #d4af37;
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
            box-shadow: inset 0 2px 10px rgba(212, 175, 55, 0.12);
        }

        .booking-details h3 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #d4af37;
            text-align: center;
            margin-bottom: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 4px;
            padding: 12px 0;
            border-bottom: 1px solid #2a2a2a;
            font-size: 15px;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            font-weight: 600;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .detail-value {
            font-weight: 400;
            color: #ffffff;
            text-align: right;
        }

        .dress-code {
            background: #1a1508;
            border: 1px solid #d4af37;
            color: #fcf6ba;
            padding: 25px;
            margin: 30px 0;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.15);
        }

        .dress-code h4 {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            color: #d4af37;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .dress-colors {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-top: 15px;
        }

        .color-swatch {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid #d4af37;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .color-black {
            background: #000000;
        }

        .color-gold {
            background: #d4af37;
        }

        .quote {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #0f0d08, #1a1508);
            border-left: 5px solid #d4af37;
            border-radius: 0 10px 10px 0;
        }

        .quote p {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-style: italic;
            color: #fcf6ba;
            line-height: 1.6;
            position: relative;
        }

        .social-message {
            background: #111111;
            padding: 30px;
            border-radius: 10px;
            margin: 30px 0;
            border: 1px solid #2a2a2a;
        }

        .social-message h4 {
            font-family: 'Playfair Display', serif;
            color: #d4af37;
            font-size: 20px;
            margin-bottom: 15px;
        }

        .social-message p {
            color: #e0e0e0;
            line-height: 1.7;
            margin-bottom: 15px;
        }

        .signature {
            text-align: right;
            color: #d4af37;
            font-weight: 600;
            font-style: italic;
            margin-top: 20px;
        }

        .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #111111;
            border: 1px solid #2a2a2a;
            border-radius: 8px;
        }

        .qr-section h3 {
            color: #d4af37;
            margin-bottom: 10px;
        }

        .qr-code {
            margin: 15px 0;
        }

        .qr-instructions {
            background-color: #111111;
            color: #e0e0e0;
            padding: 25px;
            border-radius: 6px;
            margin: 30px 0;
            border: 1px solid #2a2a2a;
        }

        .qr-instructions strong {
            color: #d4af37;
        }

        .footer {
            background: #0a0a0a;
            border-top: 1px solid #d4af37;
            color: #b8b8b8;
            text-align: center;
            padding: 30px;
            font-size: 14px;
        }

        .footer p {
            margin-bottom: 10px;
        }

        .footer .gold {
            color: #d4af37;
        }

        .footer .copyright {
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }

            .header {
                padding: 30px 20px 15px;
            }

            .logo h1 {
                font-size: 34px;
            }

            .content {
                padding: 30px 20px;
            }

            .booking-details {
                padding: 20px;
            }

            .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }

            .detail-value {
                text-align: left;
                font-weight: 600;
            }

            .dress-colors {
                flex-wrap: wrap;
            }
        }
    </style>
</head>

<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <h1>FÀÁJÍ LAWA</h1>
                <div class="tagline">Honor • Legacy • Ambition</div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            <div class="welcome-message">
                <h2>Your Reservation is Confirmed</h2>
                <p class="welcome-text">
                    Congratulations, <strong style="color: #d4af37; text-transform: capitalize;">${
                      booking.name
                    }</strong>. Your seat at Fàájí Lawa
                    has been secured.
                    You have been granted access to an evening of culture, couture, and legendary hospitality.
                </p>
            </div>

            <!-- Booking Details -->
            <div class="booking-details">
                <h3>Your Reservation Details</h3>

                <div class="detail-row">
                    <span class="detail-label">Guest Name</span>
                    <span class="detail-value" style="text-transform: capitalize;">${
                      booking.name
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Email</span>
                    <span class="detail-value">${booking.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Guest Phone</span>
                    <span class="detail-value">${booking.phone}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Table Assignment</span>
                    <span class="detail-value">Table ${tableNumbers.join(
                      ", "
                    )}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Seat(s) Reserved</span>
                    <span class="detail-value">${seatNumbers}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Amount</span>
                    <span class="detail-value">₦${totalAmount}</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Event Date &amp; Time</span>
                    <span class="detail-value" style="color: #d4af37; font-style: italic;">31ST OCTOBER, 2026 • 7:00 PM</span>
                </div>

                <div class="detail-row">
                    <span class="detail-label">Venue</span>
                    <span class="detail-value">Alfa Belgore Hall, ABUAD, Ado-Ekiti</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date</span>
                    <span class="detail-value">${new Date(
                      booking.createdAt
                    ).toLocaleDateString()}</span>
                </div>
            </div>

            <!-- Dress Code -->
            <div class="dress-code">
                <h4>Dress Code</h4>
                <p>Present yourself in your finest—black tie or high-fashion African couture.</p>
                <div class="dress-colors">
                    <div class="color-swatch color-black" title="Black"></div>
                    <div class="color-swatch color-gold" title="Gold"></div>
                </div>
                <p style="margin-top: 15px; font-size: 16px;"><strong>Black • Gold</strong></p>
            </div>

            <!-- Quote -->
            <div class="quote">
                <p>A night where culture meets couture, and every moment is crafted into a timeless legacy.</p>
            </div>

            <!-- Social Directors Message -->
            <div class="social-message">
                <h4>A Message from Your Social Directors</h4>
                <p>
                    Dear Esteemed Guest,
                </p>
                <p>
                    Your journey into excellence begins the moment you step through our doors. We have crafted an
                    evening that transcends mere dining—this is an experience where sophistication, culture, and
                    celebration come together.
                </p>
                <p>
                    Prepare yourself for an unforgettable night of honour, legacy, and ambition.
                    Your seat at our table is not just reserved, it is earned.
                </p>
                <div class="signature">
                    — The Social Directors<br>
                    NUESA ABUAD
                </div>
            </div>
        </div>

        <!-- QR Code Section -->
        <div class="qr-section">
            <h3>Your Entry Pass</h3>
            <p style="margin-bottom: 15px; color: #e0e0e0;">
                Present this QR code at the entrance for quick verification
            </p>

            <div class="qr-code">
                <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${verificationUrl}"
                    alt="Booking QR Code"
                    style="border: 1px solid #d4af37; border-radius: 8px; padding: 10px; background: #ffffff;"
                />
            </div>

            <p style="font-size: 12px; color: #b8b8b8; margin-top: 10px;">
                Scan this code to verify your booking
            </p>
        </div>

        <div class="qr-instructions">
            <strong>📋 Important Entry Instructions:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Save this email and present it at the entrance of the event</li>
                <li>Have your QR code ready when approaching the entrance</li>
                <li>Ensure your phone brightness is at maximum for easy scanning</li>
                <li>If you booked multiple seats, all guests must arrive together</li>
                <li>Keep a valid ID card ready for additional verification</li>
            </ul>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="gold"><strong>FÀÁJÍ LAWA</strong></p>
            <p>Honour • Legacy • Ambition</p>
            <p>We look forward to seeing you at the event! If you have any questions or need to make changes to your booking, please contact us at least 24 hours before the event.</p>
            <p>If you have any questions, please contact us at nuesadinner@gmail.com</p>
            <div class="copyright">
                ©2025/2026 NUESA ABUAD, REFORMATION ADMINISTRATION. All rights reserved.
            </div>
        </div>
    </div>
</body>

</html>
      `;
};

export default generateEmailTemplate;
