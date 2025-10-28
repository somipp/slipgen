import puppeteer from "puppeteer";
import numberToWords from "number-to-words";
import type { Employee, Payslip, CompanySettings } from "@shared/schema";

interface PayslipData {
  employee: Employee;
  payslip: Partial<Payslip>;
  companySettings?: CompanySettings;
}

export async function generatePayslipPDF(data: PayslipData, format: "A4" | "Letter" = "A4"): Promise<Buffer> {
  const { employee, payslip, companySettings } = data;

  // Calculate net pay in words
  const netPayAmount = parseFloat(payslip.netPay || "0");
  const netPayWords = numberToWords.toWords(Math.floor(netPayAmount))
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  // Generate HTML template matching Infosys layout
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${format};
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #000;
    }
    .payslip {
      border: 2px solid #000;
      padding: 10px;
    }
    .header {
      text-align: center;
      margin-bottom: 10px;
    }
    .company-logo {
      float: left;
      max-width: 100px;
      max-height: 60px;
      margin-right: 15px;
    }
    .company-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 3px;
    }
    .company-address {
      font-size: 10px;
      margin-bottom: 2px;
    }
    .payslip-title {
      font-size: 12px;
      font-weight: bold;
      margin-top: 5px;
    }
    .clear {
      clear: both;
    }
    .details-section {
      border: 1px solid #000;
      margin-top: 10px;
    }
    .details-row {
      display: flex;
      border-bottom: 1px solid #000;
    }
    .details-row:last-child {
      border-bottom: none;
    }
    .details-col {
      flex: 1;
      padding: 3px 5px;
      border-right: 1px solid #000;
      display: flex;
    }
    .details-col:last-child {
      border-right: none;
    }
    .label {
      font-weight: normal;
      min-width: 140px;
    }
    .value {
      font-weight: normal;
      flex: 1;
    }
    .earnings-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
      border: 1px solid #000;
    }
    .earnings-table th {
      background-color: #fff;
      padding: 4px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #000;
      font-size: 11px;
    }
    .earnings-table td {
      padding: 3px 5px;
      border: 1px solid #000;
      font-size: 10px;
    }
    .earnings-table .label-col {
      text-align: left;
    }
    .earnings-table .amount-col {
      text-align: right;
      width: 80px;
    }
    .total-row {
      font-weight: bold;
    }
    .net-pay-section {
      margin-top: 10px;
      padding: 5px;
      border: 1px solid #000;
    }
    .net-pay-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 3px;
    }
    .net-pay-label {
      font-weight: normal;
    }
    .net-pay-amount {
      font-weight: bold;
    }
    .footer {
      margin-top: 15px;
      text-align: center;
      font-size: 9px;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="payslip">
    <!-- Header -->
    <div class="header">
      ${companySettings?.logoUrl ? `<img src="${companySettings.logoUrl}" class="company-logo" alt="Company Logo" />` : ''}
      <div class="company-name">${companySettings?.companyName || 'COMPANY NAME'}</div>
      <div class="company-address">${companySettings?.companyAddress || 'Company Address'}</div>
      <div class="payslip-title">Payslip for the month of ${payslip.payPeriod || ''}</div>
    </div>
    <div class="clear"></div>

    <!-- Employee Details -->
    <div class="details-section">
      <div class="details-row">
        <div class="details-col">
          <span class="label">Name:</span>
          <span class="value">${employee.name}</span>
        </div>
        <div class="details-col">
          <span class="label">Employee No:</span>
          <span class="value">${employee.employeeNo}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">Joining Date:</span>
          <span class="value">${employee.joiningDate}</span>
        </div>
        <div class="details-col">
          <span class="label">Bank Name:</span>
          <span class="value">${employee.bankName}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">Designation:</span>
          <span class="value">${employee.designation}</span>
        </div>
        <div class="details-col">
          <span class="label">Bank Account No:</span>
          <span class="value">${employee.bankAccountNo}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">Department:</span>
          <span class="value">${employee.department}</span>
        </div>
        <div class="details-col">
          <span class="label">PAN Number:</span>
          <span class="value">${employee.panNumber}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">Location:</span>
          <span class="value">${employee.location}</span>
        </div>
        <div class="details-col">
          <span class="label">PF No:</span>
          <span class="value">${employee.pfNumber || ''}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">Effective Work Days:</span>
          <span class="value">${payslip.effectiveWorkDays || 0}</span>
        </div>
        <div class="details-col">
          <span class="label">PF UAN:</span>
          <span class="value">${employee.pfUan || ''}</span>
        </div>
      </div>
      <div class="details-row">
        <div class="details-col">
          <span class="label">LOP:</span>
          <span class="value">${payslip.lop || 0}</span>
        </div>
        <div class="details-col">
          <span class="label">EL AVAILED:</span>
          <span class="value">${payslip.elAvailed || 0}</span>
        </div>
      </div>
    </div>

    <!-- Earnings and Deductions Table -->
    <table class="earnings-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 35%;">Earnings</th>
          <th colspan="2">Full</th>
          <th colspan="2">Actual</th>
          <th rowspan="2" style="width: 25%;">Deductions</th>
          <th rowspan="2" style="width: 10%;">Actual</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="label-col">BASIC</td>
          <td class="amount-col">${parseFloat(payslip.basicFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.basicActual || "0").toFixed(0)}</td>
          <td class="label-col">PF</td>
          <td class="amount-col">${parseFloat(payslip.pfActual || "0").toFixed(0)}</td>
        </tr>
        <tr>
          <td class="label-col">HRA</td>
          <td class="amount-col">${parseFloat(payslip.hraFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.hraActual || "0").toFixed(0)}</td>
          <td class="label-col">PROF TAX</td>
          <td class="amount-col">${parseFloat(payslip.profTaxActual || "0").toFixed(0)}</td>
        </tr>
        ${payslip.conveyanceAllowanceFull ? `
        <tr>
          <td class="label-col">CONVEYANCE ALLOWANCE</td>
          <td class="amount-col">${parseFloat(payslip.conveyanceAllowanceFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.conveyanceAllowanceActual || "0").toFixed(0)}</td>
          <td class="label-col"></td>
          <td class="amount-col"></td>
        </tr>
        ` : ''}
        ${payslip.otherAllowanceFull ? `
        <tr>
          <td class="label-col">OTHER ALLOWANCE</td>
          <td class="amount-col">${parseFloat(payslip.otherAllowanceFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.otherAllowanceActual || "0").toFixed(0)}</td>
          <td class="label-col"></td>
          <td class="amount-col"></td>
        </tr>
        ` : ''}
        ${payslip.specialAllowanceFull ? `
        <tr>
          <td class="label-col">SPECIAL ALLOWANCE</td>
          <td class="amount-col">${parseFloat(payslip.specialAllowanceFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.specialAllowanceActual || "0").toFixed(0)}</td>
          <td class="label-col"></td>
          <td class="amount-col"></td>
        </tr>
        ` : ''}
        ${payslip.bounsIncentiveFull ? `
        <tr>
          <td class="label-col">BOUNS/INCENTIVE</td>
          <td class="amount-col">${parseFloat(payslip.bounsIncentiveFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.bounsIncentiveActual || "0").toFixed(0)}</td>
          <td class="label-col"></td>
          <td class="amount-col"></td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td class="label-col">Total Earnings: Rs.</td>
          <td class="amount-col">${parseFloat(payslip.totalEarningsFull || "0").toFixed(0)}</td>
          <td class="amount-col">${parseFloat(payslip.totalEarningsActual || "0").toFixed(0)}</td>
          <td class="label-col">Total Deductions: Rs.</td>
          <td class="amount-col">${parseFloat(payslip.totalDeductionsActual || "0").toFixed(0)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Net Pay -->
    <div class="net-pay-section">
      <div class="net-pay-row">
        <span class="net-pay-label">Net Pay for the month (Total Earnings - Total Deductions): <strong>${parseFloat(payslip.netPay || "0").toFixed(0)} (${netPayWords} only)</strong></span>
        <span class="net-pay-label">Employer PF</span>
        <span class="net-pay-amount">${parseFloat(payslip.employerPf || "0").toFixed(0)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      This is a system generated payslip and does not require signature.
    </div>
  </div>
</body>
</html>
  `;

  // Launch Puppeteer and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: format,
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
