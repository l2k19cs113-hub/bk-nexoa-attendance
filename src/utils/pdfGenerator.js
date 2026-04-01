import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { APP_NAME } from '../constants';

export const generatePayslipPDF = async (employee, salary, attendance) => {
  const monthName = format(new Date(salary.year, salary.month - 1), 'MMMM yyyy');
  
  const attendanceRows = attendance.map(a => `
    <tr>
      <td>${format(new Date(a.date), 'dd/MM/yyyy')}</td>
      <td>${a.check_in_time ? format(new Date(a.check_in_time), 'hh:mm a') : '--'}</td>
      <td>${a.check_out_time ? format(new Date(a.check_out_time), 'hh:mm a') : '--'}</td>
      <td>Present</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #6C63FF; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #6C63FF; margin-bottom: 5px; }
          .document-title { font-size: 18px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
          
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { flex: 1; }
          .info-box h3 { font-size: 14px; color: #888; margin-bottom: 5px; text-transform: uppercase; }
          .info-box p { font-size: 16px; font-weight: 600; margin: 0; }

          .salary-table, .attendance-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .salary-table th, .attendance-table th { background-color: #F3F4F6; text-align: left; padding: 12px; font-size: 12px; color: #666; border-bottom: 1px solid #EEE; }
          .salary-table td, .attendance-table td { padding: 12px; border-bottom: 1px solid #EEE; font-size: 14px; }
          
          .total-row { background-color: #6C63FF; color: white; font-weight: bold; }
          .total-row td { border: none; font-size: 18px; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
          .signature-area { margin-top: 60px; display: flex; justify-content: space-between; }
          .signature-box { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 10px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">${APP_NAME}</div>
          <div class="document-title">Salary Slips - ${monthName}</div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Employee Details</h3>
            <p>${employee.name}</p>
            <p>${employee.email}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <h3>Bank Details</h3>
            <p>${employee.bank_name || 'N/A'}</p>
            <p>A/C: ${employee.account_no || 'N/A'}</p>
          </div>
        </div>

        <h3>Salary Breakdown</h3>
        <table class="salary-table">
          <tr><th>Description</th><th style="text-align: right;">Amount</th></tr>
          <tr><td>Monthly Base Salary</td><td style="text-align: right;">₹${salary.base_salary}</td></tr>
          <tr><td>Absent Deductions</td><td style="text-align: right; color: #EF4444;">- ₹${salary.absent_deduction}</td></tr>
          <tr><td>Performance Bonus</td><td style="text-align: right; color: #10B981;">+ ₹${salary.bonus}</td></tr>
          <tr class="total-row"><td>Net Payable</td><td style="text-align: right;">₹${salary.net_salary}</td></tr>
        </table>

        <h3>Attendance Summary</h3>
        <table class="attendance-table">
          <thead><tr><th>Date</th><th>In Time</th><th>Out Time</th><th>Status</th></tr></thead>
          <tbody>${attendanceRows}</tbody>
        </table>

        <div class="signature-area">
          <div class="signature-box">Employee Signature</div>
          <div class="signature-box">Authorized Signatory</div>
        </div>

        <div class="footer">
          This is a computer generated document and does not require a physical signature.
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (err) {
    console.error('PDF Generation failed:', err);
    throw new Error('Failed to generate PDF');
  }
};
