import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

// Master CSV format: Dirección de correo electrónico, Nombre, Apellidos, Dirección, TAGS
interface MasterRow {
  'Dirección de correo electrónico'?: string;
  'Nombre'?: string;
  'Apellidos'?: string;
  'Dirección'?: string;
  'TAGS'?: string;
}

// Form CSV format: status,text-243,text-154,your-email,tel-778,date-343,menu-749,textarea-785,email-210,file-556,mc4wp_checkbox,Date
interface FormRow {
  status: string;
  'text-243': string; // First Name
  'text-154': string; // Last Name
  'your-email': string; // Email
  'tel-778': string; // Phone
  'date-343': string; // Birth Date
  'menu-749': string; // Referral source
  'textarea-785': string; // Note/Instagram
  'email-210': string; // Referral email
  'file-556': string; // File upload
  'mc4wp_checkbox': string; // Marketing consent
  Date: string; // Form submission date
}

// Final Shopify output format
interface ShopifyCustomer {
  'Customer ID': string;
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
  'Total Spent': string;
  'Total Orders': string;
  'Note': string;
  'Tax Exempt': string;
  'Tags': string;
  '¿De qué ciudad eres? (customer.metafields.custom.city)': string;
  '¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)': string;
  '¿Cómo nos has conocido? (customer.metafields.custom.referral)': string;
  'Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)': string;
  'Fecha de nacimiento (customer.metafields.facts.birth_date)': string;
}

function parseAddress(address: string): { city: string; country: string } {
  if (!address) return { city: '', country: '' };
  const parts = address.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { city: parts[0], country: parts[parts.length - 1] };
  }
  return { city: address, country: '' };
}

function cleanTags(tags: string): string {
  if (!tags) return '';
  return tags.replace(/"/g, '').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0).join(',');
}

function mapReferralSource(menuValue: string): string {
  if (!menuValue) return '';
  if (menuValue.includes('amigo')) return 'friend';
  if (menuValue.includes('fulanito')) return 'fulanito';
  if (menuValue.toLowerCase().includes('por instagram')) return 'instagram';
  return menuValue.toLowerCase();
}

function formatBirthDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}

function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',');
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length >= headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function transformMasterRow(row: MasterRow): ShopifyCustomer {
  const address = parseAddress(row['Dirección'] || '');
  const email = row['Dirección de correo electrónico'] || '';

  return {
    'Customer ID': '', // Will be ignored as requested
    'First Name': row['Nombre'] || '',
    'Last Name': row['Apellidos'] || '',
    'Email': email,
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
    'Total Spent': '0.00',
    'Total Orders': '0',
    'Note': '',
    'Tax Exempt': 'no',
    'Tags': cleanTags(row['TAGS'] || '') + (cleanTags(row['TAGS'] || '') ? ',' : '') + 'onboarding',
    '¿De qué ciudad eres? (customer.metafields.custom.city)': address.city,
    '¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)': '',
    '¿Cómo nos has conocido? (customer.metafields.custom.referral)': '',
    'Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)': '',
    'Fecha de nacimiento (customer.metafields.facts.birth_date)': ''
  };
}

function transformFormRow(row: FormRow): ShopifyCustomer {
  const referralSource = row['menu-749'] || '';
  const instagramValue = referralSource.toLowerCase().includes('por instagram') ? 'instagram' : (row['textarea-785'] || '');

  return {
    'Customer ID': '', // Will be ignored as requested
    'First Name': row['text-243'] || '',
    'Last Name': row['text-154'] || '',
    'Email': row['your-email'] || '',
    'Accepts Email Marketing': 'yes',
    'Default Address Company': '',
    'Default Address Address1': '',
    'Default Address Address2': '',
    'Default Address City': '',
    'Default Address Province Code': '',
    'Default Address Country Code': '',
    'Default Address Zip': '',
    'Default Address Phone': '',
    'Phone': row['tel-778'] || '',
    'Accepts SMS Marketing': 'yes',
    'Total Spent': '0.00',
    'Total Orders': '0',
    'Note': row['textarea-785'] || '',
    'Tax Exempt': 'no',
    'Tags': 'shopify-forms-574141',
    '¿De qué ciudad eres? (customer.metafields.custom.city)': '',
    '¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)': instagramValue,
    '¿Cómo nos has conocido? (customer.metafields.custom.referral)': mapReferralSource(referralSource),
    'Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)': row['email-210'] || '',
    'Fecha de nacimiento (customer.metafields.facts.birth_date)': formatBirthDate(row['date-343'])
  };
}

function mergeCustomers(masterCustomers: ShopifyCustomer[], formCustomers: ShopifyCustomer[]): ShopifyCustomer[] {
  const customerMap = new Map<string, ShopifyCustomer>();

  // Add master customers first
  masterCustomers.forEach(customer => {
    if (customer.Email) {
      customerMap.set(customer.Email.toLowerCase(), customer);
    }
  });

  // Merge form data
  formCustomers.forEach(formCustomer => {
    const email = formCustomer.Email.toLowerCase();
    const existing = customerMap.get(email);

    if (existing) {
      // Merge form data into existing customer
      existing.Phone = formCustomer.Phone || existing.Phone;
      existing.Note = formCustomer.Note || existing.Note;
      existing['¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)'] =
        formCustomer['¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)'] ||
        existing['¿Nos dejas tu Instagram para que verifiquemos que existes? (customer.metafields.custom.instagram)'];
      existing['¿Cómo nos has conocido? (customer.metafields.custom.referral)'] =
        formCustomer['¿Cómo nos has conocido? (customer.metafields.custom.referral)'] ||
        existing['¿Cómo nos has conocido? (customer.metafields.custom.referral)'];
      existing['Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)'] =
        formCustomer['Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)'] ||
        existing['Si te ha recomendado alguien, ¿nos puedes dejar su correo? (customer.metafields.custom.referral-email)'];
      existing['Fecha de nacimiento (customer.metafields.facts.birth_date)'] =
        formCustomer['Fecha de nacimiento (customer.metafields.facts.birth_date)'] ||
        existing['Fecha de nacimiento (customer.metafields.facts.birth_date)'];

      // Merge tags
      const existingTags = existing.Tags ? existing.Tags.split(',').map(t => t.trim()) : [];
      const formTags = formCustomer.Tags ? formCustomer.Tags.split(',').map(t => t.trim()) : [];
      const allTags = [...new Set([...existingTags, ...formTags])];
      existing.Tags = allTags.join(',');
    } else {
      // Add new customer from form data
      customerMap.set(email, formCustomer);
    }
  });

  return Array.from(customerMap.values()).filter(customer => customer.Email.trim() !== '');
}

async function processFiles(masterCsvPath: string, formCsvPath: string, outputPath: string) {
  try {
    // Read master CSV
    const masterContent = await Deno.readTextFile(masterCsvPath);
    const masterData = parseCSV(masterContent) as MasterRow[];
    const masterCustomers = masterData.map(transformMasterRow);

    // Read form CSV
    const formContent = await Deno.readTextFile(formCsvPath);
    const formData = parseCSV(formContent) as FormRow[];
    const formCustomers = formData.map(transformFormRow);

    // Merge customers
    const mergedCustomers = mergeCustomers(masterCustomers, formCustomers);

    // Create Excel output
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(mergedCustomers);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    const outputBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    await Deno.writeFile(outputPath, new Uint8Array(outputBuffer));

    console.log(`Successfully processed and merged ${mergedCustomers.length} customers`);
    console.log(`Master CSV: ${masterCustomers.length} customers`);
    console.log(`Form CSV: ${formCustomers.length} customers`);
    console.log(`Output: ${outputPath}`);

  } catch (error) {
    console.error('Error processing files:', error);
    Deno.exit(1);
  }
}

// Main execution
if (import.meta.main) {
  const args = Deno.args;

  if (args.length < 2) {
    console.log('Usage: deno run --allow-read --allow-write convert.ts <master_csv> <form_csv> [output.xlsx]');
    console.log('  master_csv: CSV with columns "Dirección de correo electrónico", "Nombre", "Apellidos", "Dirección", "TAGS"');
    console.log('  form_csv: CSV with contact form data');
    console.log('  output.xlsx: Output file (optional, defaults to "merged_output.xlsx")');
    Deno.exit(1);
  }

  const masterCsv = args[0];
  const formCsv = args[1];
  const output = args[2] || 'merged_output.xlsx';

  await processFiles(masterCsv, formCsv, output);
}
