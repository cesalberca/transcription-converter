import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

interface InputRow {
  'Dirección de correo electrónico'?: string;
  'Nombre'?: string;
  'Apellidos'?: string;
  'Dirección'?: string;
  'TAGS'?: string;
}

interface ShopifyCustomer {
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Accepts Email Marketing': string;
  'Default Address Company': string;
  'Default Address Address1': string;
  'Default Address Address2': string;
  'Default Address City': string;
  'Default Address Province Code': string;
  'Default Address Country Code': string;
  'Default Address Zip': string;
  'Default Address Phone': string;
  'Phone': string;
  'Accepts SMS Marketing': string;
  'Tags': string;
  'Note': string;
  'Tax Exempt': string;
}

function parseAddress(address: string): { city: string; country: string } {
  if (!address) return { city: '', country: '' };

  // Split by whitespace and get the parts
  const parts = address.trim().split(/\s+/);
  if (parts.length >= 2) {
    const city = parts[0];
    const country = parts[parts.length - 1];
    return { city, country };
  }

  return { city: address, country: '' };
}

function cleanTags(tags: string): string {
  if (!tags) return '';

  // Remove quotes and split by comma, then clean up
  return tags
    .replace(/"/g, '')
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .join(',');
}

function transformRow(row: InputRow): ShopifyCustomer {
  const address = parseAddress(row['Dirección'] || '');

  return {
    'First Name': row['Nombre'] || '',
    'Last Name': row['Apellidos'] || '',
    'Email': row['Dirección de correo electrónico'] || '',
    'Accepts Email Marketing': 'yes',
    'Default Address Company': '',
    'Default Address Address1': '',
    'Default Address Address2': '',
    'Default Address City': address.city,
    'Default Address Province Code': '',
    'Default Address Country Code': address.country,
    'Default Address Zip': '',
    'Default Address Phone': '',
    'Phone': '',
    'Accepts SMS Marketing': 'yes',
    'Tags': cleanTags(row['TAGS'] || ''),
    'Note': '',
    'Tax Exempt': 'no'
  };
}

async function convertExcelToShopify(inputPath: string, outputPath: string) {
  try {
    // Read the Excel file
    const data = await Deno.readFile(inputPath);
    const workbook = XLSX.read(data, { type: 'buffer' });

    // Get the first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as InputRow[];

    // Transform each row
    const shopifyData = jsonData.map(transformRow);

    // Filter out rows without email (invalid entries)
    const validData = shopifyData.filter(row => row.Email.trim() !== '');

    // Create new workbook for output
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.json_to_sheet(validData);
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Customers');

    // Write to file
    const outputBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
    await Deno.writeFile(outputPath, new Uint8Array(outputBuffer));

    console.log(`Successfully converted ${validData.length} customers from ${inputPath} to ${outputPath}`);
    console.log(`Skipped ${jsonData.length - validData.length} rows without email addresses`);

  } catch (error) {
    console.error('Error converting file:', error);
    Deno.exit(1);
  }
}

// Main execution
const inputFile = 'input.xlsx';
const outputFile = 'shopify_customers.xlsx';

await convertExcelToShopify(inputFile, outputFile);

export {};
