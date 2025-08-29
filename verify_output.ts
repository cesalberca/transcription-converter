import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

async function verifyOutput() {
  try {
    const data = await Deno.readFile('shopify_customers.xlsx');
    const workbook = XLSX.read(data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log('=== SHOPIFY CUSTOMER FORMAT VERIFICATION ===');
    console.log(`Total customers: ${jsonData.length}`);
    console.log('\n=== Column Headers ===');

    if (jsonData.length > 0) {
      const headers = Object.keys(jsonData[0]);
      headers.forEach((header, index) => {
        console.log(`${index + 1}. ${header}`);
      });

      console.log('\n=== Sample Data (First 3 Customers) ===');
      for (let i = 0; i < Math.min(3, jsonData.length); i++) {
        console.log(`\n--- Customer ${i + 1} ---`);
        const customer = jsonData[i] as any;
        console.log(`Name: ${customer['First Name']} ${customer['Last Name']}`);
        console.log(`Email: ${customer['Email']}`);
        console.log(`City: ${customer['Default Address City']}`);
        console.log(`Country: ${customer['Default Address Country Code']}`);
        console.log(`Tags: ${customer['Tags']}`);
        console.log(`Accepts Email Marketing: ${customer['Accepts Email Marketing']}`);
        console.log(`Tax Exempt: ${customer['Tax Exempt']}`);
      }
    }
  } catch (error) {
    console.error('Error verifying output:', error);
  }
}

await verifyOutput();
