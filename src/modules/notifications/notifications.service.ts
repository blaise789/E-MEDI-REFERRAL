import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ClinicalGateway } from '../hospitals/clinical.gateway';
import * as nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ClinicalGateway,
  ) {}

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { recipientId: userId, isRead: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  /**
   * Send a notification to a single user.
   */
  async dispatchNotification(recipientId: string, message: string, referralId?: string) {
    const notification = await this.prisma.notification.create({
      data: { recipientId, message, referralId },
    });

    // Broadcast live
    this.gateway.broadcastNotification(recipientId, {
      id: notification.id,
      message,
      referralId,
      createdAt: notification.createdAt,
    });

    return notification;
  }

  /**
   * Send a notification to all staff at a given hospital.
   */
  async notifyHospitalStaff(hospitalId: string, message: string, referralId?: string) {
    const users = await this.prisma.user.findMany({
      where: { hospitalId },
      select: { id: true },
    });

    if (users.length === 0) return;

    await this.prisma.notification.createMany({
      data: users.map((user) => ({
        recipientId: user.id,
        message,
        referralId,
      })),
    });

    users.forEach((user) => {
      this.gateway.broadcastNotification(user.id, {
        message,
        hospitalId,
        referralId,
      });
    });
  }

  /**
   * Generate a professional PDF transfer document in memory.
   */
  private generateReferralPdf(patient: any, referral: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fillColor('#1e40af').fontSize(20).text('MEDIREFER – TRANSFER DOCUMENT', { align: 'center' });
      doc.fontSize(10).fillColor('#64748b').text('Rwanda Healthcare Network – Continuity of Care Record', { align: 'center' });
      doc.moveDown(0.5);
      doc.rect(50, doc.y, 495, 1).fill('#e2e8f0');
      doc.moveDown(1.5);

      // Referral metadata
      doc.fillColor('#000000').fontSize(9).text(`Referral ID: ${referral.id}`, { align: 'right' });
      doc.text(`Date Issued: ${format(new Date(referral.createdAt), 'PPPp')}`, { align: 'right' });
      const urgencyStr = referral.urgency ? referral.urgency : (referral.isEmergency ? 'EMERGENCY' : 'ROUTINE');
      if (urgencyStr === 'EMERGENCY') {
        doc.fillColor('#dc2626').fontSize(11).text('⚠  EMERGENCY TRANSFER', { align: 'right' });
      } else if (urgencyStr === 'URGENT') {
        doc.fillColor('#ea580c').fontSize(11).text('⚠  URGENT TRANSFER', { align: 'right' });
      } else {
        doc.fillColor('#1e40af').fontSize(11).text('ROUTINE TRANSFER', { align: 'right' });
      }
      doc.moveDown(1);

      // Patient
      doc.fillColor('#1e40af').fontSize(12).font('Helvetica-Bold').text('PATIENT IDENTIFICATION');
      doc.fillColor('#000000').fontSize(10).font('Helvetica');
      doc.text(`Full Name:   ${patient.firstName} ${patient.lastName}`);
      doc.text(`National ID: ${patient.nationalId}`);
      doc.text(`Gender:      ${patient.gender}`);
      doc.text(`DOB:         ${format(new Date(patient.dateOfBirth), 'PPP')}`);
      doc.text(`Address:     ${[patient.cell ? `Cell: ${patient.cell}` : '', patient.sector ? `Sector: ${patient.sector}` : '', patient.district ? `District: ${patient.district}` : ''].filter(Boolean).join(', ') || 'N/A'}`);
      doc.text(`Insurance:   ${patient.insurance || 'None / Out-of-pocket'}`);
      doc.moveDown();

      // Clinical
      doc.fillColor('#1e40af').fontSize(12).text('CLINICAL SUMMARY');
      doc.fillColor('#000000').fontSize(10);
      doc.text(`Primary Diagnosis:     ${referral.diagnosis}`);
      if (referral.significantFindings) {
        doc.text(`Significant Findings:  ${referral.significantFindings}`);
      }
      if (referral.proceduresReceived) {
        doc.text(`Procedures & Treatments Received: ${referral.proceduresReceived}`);
      }
      if (referral.currentMedications) {
        doc.text(`Current Medications:   ${referral.currentMedications}`);
      }
      if (referral.patientCondition) {
        doc.text(`Immediate Condition:   ${referral.patientCondition}`);
      }
      doc.text(`Reason for Transfer:   ${referral.reasonForTransfer}`);
      if (referral.preTransferTreatment) {
        doc.text(`Pre-Transfer Treatment: ${referral.preTransferTreatment}`);
      }
      doc.text(`Transport Type:        ${referral.transportType || 'AMBULANCE'}`);
      if (referral.monitoringRequired) {
        doc.text(`Transport Monitoring:  ${referral.monitoringRequired}`);
      }
      if (referral.targetWardType) {
        doc.text(`Target Ward:           ${referral.targetWardType}`);
      }
      if (referral.expectedAdmissionDate) {
        const formattedDate = new Date(referral.expectedAdmissionDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        doc.text(`Expected Admission:    ${formattedDate}`);
      }
      doc.moveDown();

      // Transfer chain
      doc.fillColor('#1e40af').fontSize(12).text('TRANSFER CHAIN');
      doc.fillColor('#000000').fontSize(10);
      doc.text(`Referring Hospital:  ${referral.referringHospital?.name}`);
      doc.text(`Receiving Hospital:  ${referral.receivingHospital?.name}`);
      if (referral.referringDoctorName) {
        doc.text(`Referring Doctor:    ${referral.referringDoctorName}${referral.referringDoctorContact ? ` (${referral.referringDoctorContact})` : ''}`);
      }
      if (referral.targetSpecialist) {
        doc.text(`Assigned Specialist: Dr. ${referral.targetSpecialist.firstName} ${referral.targetSpecialist.lastName} (${referral.targetSpecialist.discipline})`);
      }
      doc.moveDown();

      // Counter-referral / discharge if present
      if (referral.counterReferral) {
        doc.rect(50, doc.y, 495, 1).fill('#e2e8f0');
        doc.moveDown(0.5);
        doc.fillColor('#1e40af').fontSize(12).text('DISCHARGE & FOLLOW-UP NOTES');
        doc.fillColor('#000000').fontSize(10);
        if (referral.counterReferral.dischargeNotes) {
          doc.text(`Discharge Notes: ${referral.counterReferral.dischargeNotes}`);
        }
        if (referral.counterReferral.followUpInstructions) {
          doc.text(`Follow-up:       ${referral.counterReferral.followUpInstructions}`);
        }
        doc.moveDown();
      }

      // Footer
      doc.rect(50, 730, 495, 1).fill('#e2e8f0');
      doc.fontSize(8).fillColor('#94a3b8').text(
        `Generated by MediRefer Digital Referral System  •  ${format(new Date(), 'PPPp')}`,
        50, 740,
        { align: 'center', width: 495 },
      );

      doc.end();
    });
  }

  /**
   * Send a professionally formatted transfer PDF to a patient via email.
   */
  async sendPatientEmail(patient: any, referral: any) {
    if (!patient?.email) return;

    // Generate the PDF buffer in memory
    const pdfBuffer = await this.generateReferralPdf(patient, referral);

    // Use configured SMTP credentials if present, otherwise fall back to Ethereal
    let transporter;
    const isUsingRealSmtp = !!(process.env.MAIL_USER && process.env.MAIL_PASSWORD);

    if (isUsingRealSmtp) {
      transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        secure: process.env.MAIL_PORT === '465',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: process.env.MAIL_USER ? `"MediRefer System" <${process.env.MAIL_USER}>` : '"MediRefer System" <no-reply@medirefer.rw>',
      to: patient.email,
      subject: `Your Transfer Document – Referral #${referral.id.substring(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <div style="background: #1e40af; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">MediRefer</h1>
            <p style="color: #bfdbfe; margin: 4px 0 0;">Rwanda Healthcare Referral Network</p>
          </div>
          <div style="padding: 24px;">
            <p>Dear <strong>${patient.firstName} ${patient.lastName}</strong>,</p>
            <p>A medical transfer has been initiated on your behalf. Please find your official transfer document attached to this email.</p>
            <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
              <tr><td style="padding:8px; background:#f1f5f9; font-weight:bold;">Referring Hospital</td><td style="padding:8px;">${referral.referringHospital?.name}</td></tr>
              <tr><td style="padding:8px; background:#f1f5f9; font-weight:bold;">Receiving Hospital</td><td style="padding:8px;">${referral.receivingHospital?.name}</td></tr>
              <tr><td style="padding:8px; background:#f1f5f9; font-weight:bold;">Diagnosis</td><td style="padding:8px;">${referral.diagnosis}</td></tr>
              ${referral.isEmergency ? '<tr><td colspan="2" style="padding:8px; background:#fef2f2; color:#dc2626; font-weight:bold; text-align:center;">⚠ EMERGENCY TRANSFER</td></tr>' : ''}
            </table>
            <p style="color:#64748b; font-size:12px;">Please bring this document to the receiving hospital. Referral ID: <strong>${referral.id}</strong></p>
          </div>
          <div style="background:#f8fafc; padding:12px; text-align:center; font-size:11px; color:#94a3b8;">
            MediRefer Digital Referral System • Rwanda Healthcare Network
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Transfer_${patient.lastName}_${referral.id.substring(0, 8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });

    // In development, print the email preview URL to the terminal
    console.log(`\n📧 [EMAIL] Sent to: ${patient.email}`);
    if (!isUsingRealSmtp) {
      console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);
    } else {
      console.log(`📤 Sent via real SMTP: ${process.env.MAIL_HOST || 'smtp.gmail.com'}\n`);
    }
  }
}
