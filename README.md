# Excel to Shopify Customer Converter

A Deno script that converts Excel files with Spanish customer data to Shopify-compatible Excel format for customer import.

## Requirements

- [Deno](https://deno.land/) version 1.37.0 or higher

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/fulanitos-script-importer.git
cd fulanitos-script-importer
```

2. No additional installation is needed since Deno includes all dependencies.

## Usage

The script automatically converts `input.xlsx` to `shopify_customers.xlsx`:

```bash
deno task start
```

Or run directly with permissions:

```bash
deno run --allow-read --allow-write --allow-net convert.ts
```

### Development Mode

Run with file watching (auto-reloads on changes):

```bash
deno task dev
```

### Verify Output

To verify the converted output format:

```bash
deno run --allow-read --allow-net verify_output.ts
```

## Input Format

The script expects Excel files with the following Spanish column headers:

- `Dirección de correo electrónico` (Email address)
- `Nombre` (First name)
- `Apellidos` (Last name)
- `Dirección` (Address - format: "City Country")
- `TAGS` (Tags in quoted comma-separated format)

Example input row:
```
oricp1989@gmail.com | Oriol | Comella Polo | Barcelona US | "Han venido Barcelona","carnevale 1"
```

## Output Format

The output will be a Shopify-compatible Excel file with these columns:

- First Name, Last Name, Email
- Accepts Email Marketing, Accepts SMS Marketing
- Default Address fields (Company, Address1, Address2, City, Province Code, Country Code, Zip, Phone)
- Phone, Tags, Note, Tax Exempt

The script automatically:
- Maps Spanish column names to English Shopify format
- Parses city and country from the address field
- Cleans and formats tags (removes quotes, proper comma separation)
- Sets appropriate default values for missing fields
- Filters out rows without email addresses

## License

MIT
