import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { APP_NAME } from '../constants';
import { LOGO_BASE64 } from '../constants/logo';

export const generatePayslipPDF = async (employee, salary, attendance) => {
  const monthName = format(new Date(salary.year, salary.month - 1), 'MMMM yyyy');
  
  const attendanceRows = attendance.map(a => `
    <tr>
      <td>${format(new Date(a.date), 'dd/MM/yyyy')}</td>
      <td>${a.check_in_time ? format(new Date(a.check_in_time), 'hh:mm a') : '--'}</td>
      <td>${a.check_out_time ? format(new Date(a.check_out_time), 'hh:mm a') : '--'}</td>
      <td><span class="badge ${a.status === 'absent' ? 'absent' : 'present'}">Present</span></td>
    </tr>
  `).join('');

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1F2937; background: #FFF; }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #E5E7EB; padding-bottom: 25px; margin-bottom: 30px; }
          .logo-container { width: 120px; height: 120px; }
          .logo { width: 100%; height: 100%; object-fit: contain; }
          
          .company-info { text-align: right; }
          .company-name { font-size: 24px; font-weight: 800; color: #111827; }
          .payslip-title { font-size: 14px; text-transform: uppercase; color: #6B7280; letter-spacing: 1px; margin-top: 5px; }
          .payslip-month { font-size: 18px; font-weight: 700; color: #6366F1; margin-top: 2px; }

          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #9CA3AF; margin-bottom: 12px; border-bottom: 1px solid #F3F4F6; padding-bottom: 5px; }
          
          .info-label { font-size: 11px; color: #6B7280; margin-bottom: 2px; }
          .info-value { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 10px; }

          .tables-container { display: flex; gap: 30px; margin-bottom: 40px; }
          .table-wrapper { flex: 1; }
          
          table { width: 100%; border-collapse: collapse; }
          th { background: #F9FAFB; text-align: left; padding: 12px; font-size: 11px; font-weight: 700; color: #4B5563; border-bottom: 1px solid #E5E7EB; text-transform: uppercase; }
          td { padding: 12px; font-size: 13px; border-bottom: 1px solid #F3F4F6; color: #374151; }
          
          .amount { text-align: right; font-weight: 600; }
          .deduction { color: #EF4444; }
          .addition { color: #10B981; }

          .net-pay-card { background: #111827; color: white; padding: 25px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
          .net-pay-label { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .net-pay-value { font-size: 32px; font-weight: 800; }

          .attendance-section { margin-top: 20px; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .present { background: #ECFDF5; color: #059669; }
          
          .signatures { display: flex; justify-content: space-between; margin-top: 80px; }
          .sig-box { width: 200px; text-align: center; border-top: 1px solid #D1D5DB; padding-top: 10px; font-size: 12px; color: #6B7280; }

          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #9CA3AF; border-top: 1px solid #F3F4F6; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="${LOGO_BASE64}" class="logo" />
          </div>
          <div class="company-info">
            <div class="company-name">${APP_NAME}</div>
            <div class="payslip-title">Official Payslip</div>
            <div class="payslip-month">${monthName}</div>
          </div>
        </div>

        <div class="grid">
          <div>
            <div class="section-title">Employee Details</div>
            <div class="info-label">Name</div>
            <div class="info-value">${employee.name}</div>
            <div class="info-label">Email</div>
            <div class="info-value">${employee.email}</div>
          </div>
          <div>
            <div class="section-title">Payment Method</div>
            <div class="info-label">Bank Name</div>
            <div class="info-value">${employee.bank_name || 'N/A'}</div>
            <div class="info-label">Account Number</div>
            <div class="info-value">${employee.account_no || 'N/A'}</div>
          </div>
        </div>

        <div class="tables-container">
          <div class="table-wrapper">
            <div class="section-title">Earnings</div>
            <table>
              <tr><th>Description</th><th class="amount">Amount</th></tr>
              <tr><td>Base Salary</td><td class="amount">₹${salary.base_salary}</td></tr>
              <tr><td>Bonus</td><td class="amount addition">+ ₹${salary.bonus}</td></tr>
            </table>
          </div>
          <div class="table-wrapper">
            <div class="section-title">Deductions</div>
            <table>
              <tr><th>Description</th><th class="amount">Amount</th></tr>
              <tr><td>Absenteeism</td><td class="amount deduction">- ₹${salary.absent_deduction}</td></tr>
              <tr><td>Misc. Deductions</td><td class="amount deduction">- ₹0</td></tr>
            </table>
          </div>
        </div>

        <div class="net-pay-card">
          <div class="net-pay-label">Net Monthly Salary</div>
          <div class="net-pay-value">₹${salary.net_salary}</div>
        </div>

        <div class="attendance-section">
          <div class="section-title">Attendance Log (Present Days)</div>
          <table>
            <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr></thead>
            <tbody>${attendanceRows}</tbody>
          </table>
        </div>

        <div class="signatures">
          <div class="sig-box">Employee's Signature</div>
          <div class="sig-box">Authorized Signatory</div>
        </div>

        <div class="footer">
          This is a computer-generated document from ${APP_NAME}. No physical signature is required.
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
