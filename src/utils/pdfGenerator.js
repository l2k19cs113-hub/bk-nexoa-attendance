import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';
import { APP_NAME } from '../constants';
import { LOGO_BASE64 } from '../constants/logo';

const numberToWords = (amount) => {
  const words = [];
  const units = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

  if (amount === 0) return 'ZERO ONLY';

  let num = Math.floor(amount);

  if (Math.floor(num / 100000) > 0) {
    words.push(numberToWords(Math.floor(num / 100000)).replace(' ONLY', '') + ' LAKH');
    num %= 100000;
  }
  if (Math.floor(num / 1000) > 0) {
    words.push(numberToWords(Math.floor(num / 1000)).replace(' ONLY', '') + ' THOUSAND');
    num %= 1000;
  }
  if (Math.floor(num / 100) > 0) {
    words.push(units[Math.floor(num / 100)] + ' HUNDRED');
    num %= 100;
  }
  if (num > 0) {
    if (num < 20) {
      words.push(units[num]);
    } else {
      words.push(tens[Math.floor(num / 10)]);
      if (num % 10 > 0) {
        words.push(units[num % 10]);
      }
    }
  }
  return words.join(' ') + ' ONLY';
};

export const generatePayslipPDF = async (employee, salary, attendance) => {
  const payMonth = format(new Date(salary.year, salary.month - 1), 'MMMM yyyy').toUpperCase();
  const dateOfIssuance = format(new Date(), 'dd MMM yyyy').toUpperCase();
  const joiningDate = employee.created_at ? format(new Date(employee.created_at), 'dd-MMM-yyyy').toUpperCase() : '--';

  const baseSal = Number(salary.base_salary || 0);
  const bonus = Number(salary.bonus || 0);
  const deductionsVal = Number(salary.absent_deduction || 0);
  const grossEarnings = baseSal + bonus;
  const netPay = grossEarnings - deductionsVal;

  const netPayWords = numberToWords(netPay);
  const empIdStr = employee.phone || (employee.id ? `BKNT${employee.id.replace(/[^0-9]/g, '').substring(0, 4)}` : 'N/A');
  const designationStr = employee.department ? employee.department.toUpperCase() : (employee.role || 'Employee').toUpperCase();

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; background: #FFF; margin: 0; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
          .header-left { display: flex; flex-direction: column; }
          .logo-area { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
          .logo { height: 45px; }
          .logo-text-block { display: flex; flex-direction: column; }
          .company-name { font-size: 28px; font-weight: 900; color: #0f2b5a; margin: 0; line-height: 1; letter-spacing: -0.5px; }
          .company-tag { font-size: 13px; color: #444; margin-top: 3px; }
          
          .payslip-text { font-size: 42px; font-weight: 900; color: #0f2b5a; margin: 0; letter-spacing: 1px; }
          .doi-text { font-size: 13px; color: #222; font-weight: 600; margin-top: 4px; }

          .header-right { text-align: right; margin-top: 60px; }
          .header-right p { margin: 3px 0; font-size: 12px; color: #111; }

          /* Employee Info Table */
          .info-table { border-collapse: collapse; width: 100%; margin-bottom: 25px; border: 1px solid #d1d5db; }
          .info-table td { border: 1px solid #d1d5db; padding: 10px 12px; width: 33.33%; background: #f9fafb; }
          .info-table td.white-bg { background: #fff; }
          .info-label { font-size: 11px; color: #4b5563; display: block; margin-bottom: 3px; }
          .info-value { font-weight: 700; color: #111; font-size: 13px; }
          
          /* Split Tables container */
          .tables-wrapper { display: flex; width: 100%; border: 1px solid #d1d5db; border-bottom: none; border-radius: 6px 6px 0 0; overflow: hidden; }
          
          .col-half { width: 50%; display: flex; flex-direction: column; }
          .col-left { border-right: 1px solid #d1d5db; }
          
          .earnings-header { background: #0b3161; color: #fff; text-align: center; padding: 12px; font-weight: 700; font-size: 14px; letter-spacing: 1px; }
          .deductions-header { background: #4b5563; color: #fff; text-align: center; padding: 12px; font-weight: 700; font-size: 14px; letter-spacing: 1px; }

          .data-table { width: 100%; border-collapse: collapse; }
          .data-table th, .data-table td { border-bottom: 1px solid #d1d5db; padding: 12px 15px; font-size: 13px; }
          .data-table th { background: #f3f4f6; text-align: left; font-weight: 700; color: #111; }
          .data-table th.right, .data-table td.right { text-align: right; border-left: 1px solid #d1d5db; width: 35%; }
          .data-table td.val { font-weight: 500; color: #111; }
          
          .totals-row td { background: #e5e7eb; font-weight: 800; color: #000; font-size: 14px; }

          /* Net Pay Box */
          .net-pay-box { background: #0b3161; color: #fff; border-radius: 6px; text-align: center; padding: 18px; margin-top: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .net-pay-title { font-size: 14px; font-weight: 700; margin-bottom: 2px; color: #9bbcf2; }
          .net-payable { font-size: 30px; font-weight: 900; margin-bottom: 5px; letter-spacing: 0.5px; }
          .net-words { font-size: 11px; text-transform: uppercase; color: #e2e8f0; font-weight: 500; letter-spacing: 0.5px; }

          /* Footer Signatures */
          .signatures-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 70px; margin-bottom: 30px; padding: 0 20px; }
          .sig-box { text-align: center; font-size: 12px; font-weight: 600; color: #111; }
          .sig-line { width: 200px; border-bottom: 1px solid #555; margin-bottom: 8px; height: 35px; display: flex; align-items: flex-end; justify-content: center; }
          .cursive { font-family: 'Brush Script MT', cursive, Georgia, serif; font-size: 32px; color: #111; line-height: 0.5; margin-bottom: -5px; }

          /* Bottom Bar */
          .bottom-bar { text-align: center; border-top: 1px solid #d1d5db; padding-top: 15px; margin-top: 20px; font-size: 11px; color: #444; position: relative; }
          .bottom-line { height: 12px; background: #0b3161; position: absolute; bottom: -40px; left: -40px; right: -40px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div class="logo-area">
              <img src="${LOGO_BASE64}" class="logo" />
              <div class="logo-text-block">
                <p class="company-name">BK Nexora Tech</p>
                <p class="company-tag">Innovating the Future</p>
              </div>
            </div>
            <p class="payslip-text">PAYSLIP</p>
            <p class="doi-text">Date of Issuance: ${dateOfIssuance}</p>
          </div>
          <div class="header-right">
            <p>Date of Issuance: <b>${dateOfIssuance}</b></p>
            <p>Pay Period: <b>${payMonth}</b></p>
          </div>
        </div>

        <table class="info-table">
          <tr>
            <td>
              <span class="info-label">Employee Name</span>
              <span class="info-value">${employee.name || '--'}</span>
            </td>
            <td>
              <span class="info-label">Employee ID</span>
              <span class="info-value">${empIdStr}</span>
            </td>
            <td>
              <span class="info-label">Designation</span>
              <span class="info-value">${designationStr}</span>
            </td>
          </tr>
          <tr>
            <td>
              <span class="info-label">Bank Name</span>
              <span class="info-value">${employee.bank_name || '--'}</span>
            </td>
            <td>
              <span class="info-label">Account Number</span>
              <span class="info-value">${employee.account_no || '--'}</span>
            </td>
            <td>
              <span class="info-label">Date of Joining</span>
              <span class="info-value">${joiningDate}</span>
            </td>
          </tr>
        </table>

        <div class="tables-wrapper">
          <div class="col-half col-left">
            <div class="earnings-header">EARNINGS</div>
            <table class="data-table">
              <tr>
                <th>Component</th>
                <th class="right">₹ (INR)</th>
              </tr>
              <tr>
                <td>Base Salary</td>
                <td class="right val">₹ ${baseSal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Performance Bonus</td>
                <td class="right val">₹ ${bonus.toFixed(2)}</td>
              </tr>
              <tr>
                <td>HRA</td>
                <td class="right val">₹ 0.00</td>
              </tr>
              <tr>
                <td>Conveyance Allowance</td>
                <td class="right val" style="border-bottom: none;">₹ 0.00</td>
              </tr>
              <tr style="height: 48px;"><td style="border-bottom: none;"></td><td class="right val" style="border-bottom: none;"></td></tr>
              <tr class="totals-row">
                <td>GROSS EARNINGS:</td>
                <td class="right val">₹ ${grossEarnings.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <div class="col-half">
            <div class="deductions-header">DEDUCTIONS</div>
            <table class="data-table">
              <tr>
                <th>Component</th>
                <th class="right">₹ (INR)</th>
              </tr>
              <tr>
                <td>Income Tax</td>
                <td class="right val">₹ 0.00</td>
              </tr>
              <tr>
                <td>PF Contribution</td>
                <td class="right val">₹ 0.00</td>
              </tr>
              <tr>
                <td>Absenteeism</td>
                <td class="right val">₹ ${deductionsVal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Professional Tax</td>
                <td class="right val" style="border-bottom: none;">₹ 0.00</td>
              </tr>
              <tr style="height: 48px;"><td style="border-bottom: none;"></td><td class="right val" style="border-bottom: none;"></td></tr>
              <tr class="totals-row">
                <td>TOTAL DEDUCTIONS:</td>
                <td class="right val">₹ ${deductionsVal.toFixed(2)}</td>
              </tr>
            </table>
          </div>
        </div>

        <div class="net-pay-box">
          <div class="net-pay-title">NET PAY</div>
          <div class="net-payable">NET PAYABLE: ₹ ${netPay.toFixed(2)}</div>
          <div class="net-words">${netPayWords}</div>
        </div>

        <div class="signatures-area">
          <div class="sig-box">
            <div class="sig-line">
               <span class="cursive">Saranya</span>
            </div>
            Saranya, CEO
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            Employee Signature
          </div>
        </div>

        <div class="bottom-bar">
          bknexoratech.in | support@bknexoratech.in |  BK Nexora Tech,  trichy,tamil nadu
          <div class="bottom-line"></div>
        </div>
      </body>
    </html>
  `;

  try {
    if (Platform.OS === 'web') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 300);
      } else {
        alert('Please allow popups to download the payslip.');
      }
    } else {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    }
  } catch (err) {
    console.error('PDF Generation failed:', err);
    throw new Error('Failed to generate PDF');
  }
};
