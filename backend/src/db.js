const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../hydraulic_billing.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initTables();
  }
});

function initTables() {
  db.serialize(() => {
    // Foreign key support
    db.run("PRAGMA foreign_keys = ON;");

    // Company Info Table
    db.run(`
      CREATE TABLE IF NOT EXISTS company_info (
        id INTEGER PRIMARY KEY DEFAULT 1,
        name TEXT NOT NULL,
        tagline TEXT,
        gstin TEXT,
        address TEXT,
        phone TEXT,
        email TEXT,
        bank_name TEXT,
        account_no TEXT,
        ifsc_code TEXT,
        upi_id TEXT,
        terms_conditions TEXT
      );
    `);

    // Customers Table
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        gstin TEXT,
        phone TEXT,
        email TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Documents (Tax Invoices, Quotations, Labour Bills) Table
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_type TEXT NOT NULL, -- 'TAX_INVOICE', 'QUOTATION', 'LABOUR_BILL'
        doc_number TEXT UNIQUE NOT NULL,
        customer_id INTEGER NOT NULL,
        doc_date DATE NOT NULL,
        valid_till_date DATE,
        status TEXT DEFAULT 'Pending', -- 'Pending', 'Paid', 'Accepted', 'Cancelled', 'Converted'
        is_igst INTEGER DEFAULT 0, -- 0 for CGST+SGST, 1 for IGST
        subtotal REAL DEFAULT 0,
        cgst_total REAL DEFAULT 0,
        sgst_total REAL DEFAULT 0,
        igst_total REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total_amount REAL DEFAULT 0,
        notes TEXT,
        terms TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
      );
    `);

    // Document Line Items Table
    db.run(`
      CREATE TABLE IF NOT EXISTS document_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doc_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        hsn_sac TEXT,
        qty REAL NOT NULL,
        unit TEXT DEFAULT 'Nos',
        rate REAL NOT NULL,
        gst_rate REAL DEFAULT 18,
        taxable_amount REAL NOT NULL,
        total_amount REAL NOT NULL,
        FOREIGN KEY (doc_id) REFERENCES documents(id) ON DELETE CASCADE
      );
    `);

    // Company Letters & Official Notices Table
    db.run(`
      CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ref_number TEXT UNIQUE NOT NULL,
        letter_date DATE NOT NULL,
        recipient_name TEXT NOT NULL,
        recipient_address TEXT,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        signatory_name TEXT DEFAULT 'Authorized Signatory',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `, (err) => {
      if (!err) {
        seedInitialData();
      }
    });
  });
}

function seedInitialData() {
  // Check company info
  db.get("SELECT COUNT(*) AS count FROM company_info", (err, row) => {
    if (row && row.count === 0) {
      db.run(`
        INSERT INTO company_info (id, name, tagline, gstin, address, phone, email, bank_name, account_no, ifsc_code, upi_id, terms_conditions)
        VALUES (
          1,
          'DK Enterprise',
          'Hydraulic Machinery, Spare Parts & Servicing Specialists',
          '27AAACD9988E1Z4',
          'Plot No. 12, Industrial Estate Phase I, MIDC, Mumbai - 400072',
          '+91 98200 99887 / +91 98200 11223',
          'contact@dkenterprise.in',
          'HDFC Bank',
          '50200012345678',
          'HDFC0001234',
          'dkenterprise@hdfcbank',
          '1. Goods once sold will not be taken back.\n2. Warranty covers manufacturing defects for 6 months.\n3. Subject to local jurisdiction.\n4. Payment due within 15 days of invoice date.'
        );
      `);
      console.log('Seeded DK Enterprise company profile');
    } else {
      // Update company name to DK Enterprise if needed
      db.run("UPDATE company_info SET name = 'DK Enterprise', tagline = 'Hydraulic Machinery, Spare Parts & Servicing Specialists' WHERE id = 1 AND name != 'DK Enterprise'");
    }
  });

  // Seed sample letters if empty
  db.get("SELECT COUNT(*) AS count FROM letters", (err, row) => {
    if (row && row.count === 0) {
      const today = new Date().toISOString().split('T')[0];
      db.run(`
        INSERT INTO letters (ref_number, letter_date, recipient_name, recipient_address, subject, body, signatory_name)
        VALUES (
          'DKE/LTR/2026/001',
          '${today}',
          'Mahindra Infrastructure Ltd',
          'Building 4, Commerce Zone, Pune, MH',
          'Work Completion & Warranty Certificate for Hydraulic Power Pack',
          'Dear Sir,\n\nWe hereby certify that the overhauling and servicing of your 100 HP Hydraulic Power Pack Unit has been completed successfully as per your purchase order.\n\nAll fitted hydraulic seals, directional valves, and pressure relief valves carry a 6-month warranty from DK Enterprise against manufacturing defects.\n\nThanking you for your continued business.',
          'Proprietor / Director'
        );
      `);
      console.log('Seeded sample company letter');
    }
  });

  // Check customers
  db.get("SELECT COUNT(*) AS count FROM customers", (err, row) => {
    if (row && row.count === 0) {
      db.run(`
        INSERT INTO customers (name, gstin, phone, email, address) VALUES
        ('Mahindra Infrastructure Ltd', '27AAACM9988A1ZP', '+91 98333 44555', 'purchase@mahindrainfra.com', 'Building 4, Commerce Zone, Pune, MH'),
        ('Krishna Precision Engineering', '27ABCDE5678F1ZH', '+91 97654 32100', 'accounts@krishnaprecision.in', 'Gat No 122, Chakan MIDC, Pune, MH'),
        ('Royal Earthmovers & Construction', '27XYZPS4321K1ZM', '+91 99887 76655', 'info@royalearthmovers.com', 'Industrial Estate, Thane West, Mumbai, MH');
      `);
      console.log('Seeded initial customers');
    }
  });

  // Check documents
  db.get("SELECT COUNT(*) AS count FROM documents", (err, row) => {
    if (row && row.count === 0) {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      // Sample Quotation
      db.run(`
        INSERT INTO documents (doc_type, doc_number, customer_id, doc_date, valid_till_date, status, is_igst, subtotal, cgst_total, sgst_total, igst_total, discount, total_amount, notes, terms)
        VALUES ('QUOTATION', 'QT-2026-001', 1, '${today}', '${nextWeek}', 'Pending', 0, 36200, 3258, 3258, 0, 0, 42716, 'Quotation for supply of Hydraulic Cylinders and Hoses', '1. Price valid for 15 days.\n2. 50% Advance with Purchase Order.\n3. Delivery within 7 working days.');
      `, function(err) {
        if (!err && this.lastID) {
          const docId = this.lastID;
          db.run(`INSERT INTO document_items (doc_id, description, hsn_sac, qty, unit, rate, gst_rate, taxable_amount, total_amount) VALUES
            (${docId}, 'Double Acting Hydraulic Cylinder (80mm Bore x 500mm Stroke)', '84122100', 1, 'Nos', 18500, 18, 18500, 21830),
            (${docId}, 'Hydraulic Gear Pump 32 LPM (200 Bar max)', '84136090', 1, 'Nos', 9200, 18, 9200, 10856),
            (${docId}, 'High Pressure Hydraulic Hose Assembly 1/2" R2 (2 Meters)', '40092200', 5, 'Mtrs', 1700, 18, 8500, 10030);
          `);
        }
      });

      // Sample Tax Invoice
      db.run(`
        INSERT INTO documents (doc_type, doc_number, customer_id, doc_date, valid_till_date, status, is_igst, subtotal, cgst_total, sgst_total, igst_total, discount, total_amount, notes, terms)
        VALUES ('TAX_INVOICE', 'INV-2026-001', 2, '${today}', '${today}', 'Paid', 0, 16500, 1485, 1485, 0, 500, 18970, 'Payment received via NEFT Ref #98721', '1. Goods once sold will not be taken back.\n2. Warranty 6 months.');
      `, function(err) {
        if (!err && this.lastID) {
          const docId = this.lastID;
          db.run(`INSERT INTO document_items (doc_id, description, hsn_sac, qty, unit, rate, gst_rate, taxable_amount, total_amount) VALUES
            (${docId}, 'Hydraulic Power Pack Unit Overhauling & Servicing', '998719', 1, 'Job', 12000, 18, 12000, 14160),
            (${docId}, 'Hard Chrome Plated Piston Rod Repair & Grinding', '998719', 1, 'Job', 4500, 18, 4500, 5310);
          `);
        }
      });
      console.log('Seeded sample quotation and tax invoice');
    }
  });
}

// Helper wrapper for async queries
const dbQuery = {
  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  }),
  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
  }),
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  })
};

module.exports = { db, dbQuery };
