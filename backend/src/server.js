const express = require('express');
const cors = require('cors');
const { dbQuery } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// -------------------------------------------------------------
// 1. COMPANY PROFILE ROUTES
// -------------------------------------------------------------
app.get('/api/company', async (req, res) => {
  try {
    const company = await dbQuery.get('SELECT * FROM company_info WHERE id = 1');
    res.json(company || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/company', async (req, res) => {
  try {
    const { name, tagline, gstin, address, phone, email, bank_name, account_no, ifsc_code, upi_id, terms_conditions } = req.body;
    await dbQuery.run(
      `UPDATE company_info SET 
        name = ?, tagline = ?, gstin = ?, address = ?, phone = ?, email = ?,
        bank_name = ?, account_no = ?, ifsc_code = ?, upi_id = ?, terms_conditions = ?
       WHERE id = 1`,
      [name, tagline, gstin, address, phone, email, bank_name, account_no, ifsc_code, upi_id, terms_conditions]
    );
    const updated = await dbQuery.get('SELECT * FROM company_info WHERE id = 1');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. CUSTOMER ROUTES
// -------------------------------------------------------------
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await dbQuery.all('SELECT * FROM customers ORDER BY name ASC');
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, gstin, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer Name is required' });
    const result = await dbQuery.run(
      'INSERT INTO customers (name, gstin, phone, email, address) VALUES (?, ?, ?, ?, ?)',
      [name, gstin || '', phone || '', email || '', address || '']
    );
    const newCustomer = await dbQuery.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const { name, gstin, phone, email, address } = req.body;
    await dbQuery.run(
      'UPDATE customers SET name = ?, gstin = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, gstin, phone, email, address, req.params.id]
    );
    const updated = await dbQuery.get('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await dbQuery.run('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. DOCUMENTS (TAX INVOICE, QUOTATION & LABOUR BILL) ROUTES
// -------------------------------------------------------------

// Helper to generate next document number
app.get('/api/documents/next-number', async (req, res) => {
  try {
    const type = req.query.type || 'TAX_INVOICE';
    let prefix = 'INV';
    if (type === 'QUOTATION') prefix = 'QT';
    else if (type === 'LABOUR_BILL') prefix = 'LB';

    const year = new Date().getFullYear();

    const sql = `SELECT doc_number FROM documents WHERE doc_type = ? AND doc_number LIKE ? ORDER BY id DESC LIMIT 1`;
    const lastDoc = await dbQuery.get(sql, [type, `${prefix}-${year}-%`]);

    let seq = 1;
    if (lastDoc && lastDoc.doc_number) {
      const parts = lastDoc.doc_number.split('-');
      if (parts.length === 3) {
        seq = parseInt(parts[2], 10) + 1;
      }
    }
    const nextNum = `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
    res.json({ doc_number: nextNum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List documents with filter
app.get('/api/documents', async (req, res) => {
  try {
    const { doc_type, status, search } = req.query;
    let sql = `
      SELECT d.*, c.name as customer_name, c.gstin as customer_gstin, c.phone as customer_phone
      FROM documents d
      JOIN customers c ON d.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (doc_type) {
      sql += ` AND d.doc_type = ?`;
      params.push(doc_type);
    }
    if (status) {
      sql += ` AND d.status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (d.doc_number LIKE ? OR c.name LIKE ? OR c.gstin LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY d.id DESC`;
    const docs = await dbQuery.all(sql, params);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single document detail with items
app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await dbQuery.get(`
      SELECT d.*, c.name as customer_name, c.gstin as customer_gstin, c.phone as customer_phone, c.email as customer_email, c.address as customer_address
      FROM documents d
      JOIN customers c ON d.customer_id = c.id
      WHERE d.id = ?
    `, [req.params.id]);

    if (!doc) return res.status(404).json({ error: 'Document not found' });

    const items = await dbQuery.all('SELECT * FROM document_items WHERE doc_id = ? ORDER BY id ASC', [req.params.id]);
    const company = await dbQuery.get('SELECT * FROM company_info WHERE id = 1');

    res.json({ ...doc, items, company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create document
app.post('/api/documents', async (req, res) => {
  try {
    const {
      doc_type, doc_number, customer_id, doc_date, valid_till_date, status,
      is_igst, discount, notes, terms, items
    } = req.body;

    if (!doc_number || !customer_id || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required document fields or line items' });
    }

    // Calculate totals
    let subtotal = 0;
    let cgst_total = 0;
    let sgst_total = 0;
    let igst_total = 0;

    const processedItems = items.map(item => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const gstRate = parseFloat(item.gst_rate) || 0;
      const taxable = qty * rate;
      const gstAmount = taxable * (gstRate / 100);
      const total = taxable + gstAmount;

      subtotal += taxable;
      if (is_igst) {
        igst_total += gstAmount;
      } else {
        cgst_total += gstAmount / 2;
        sgst_total += gstAmount / 2;
      }

      return {
        description: item.description,
        hsn_sac: item.hsn_sac || '',
        qty,
        unit: item.unit || 'Nos',
        rate,
        gst_rate: gstRate,
        taxable_amount: taxable,
        total_amount: total
      };
    });

    const disc = parseFloat(discount) || 0;
    const taxTotal = is_igst ? igst_total : (cgst_total + sgst_total);
    const grandTotal = Math.round((subtotal + taxTotal - disc) * 100) / 100;

    const docResult = await dbQuery.run(`
      INSERT INTO documents (
        doc_type, doc_number, customer_id, doc_date, valid_till_date, status,
        is_igst, subtotal, cgst_total, sgst_total, igst_total, discount, total_amount, notes, terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      doc_type || 'TAX_INVOICE', doc_number, customer_id, doc_date, valid_till_date || null,
      status || 'Pending', is_igst ? 1 : 0, subtotal, cgst_total, sgst_total, igst_total,
      disc, grandTotal, notes || '', terms || ''
    ]);

    const docId = docResult.lastID;

    // Insert items
    for (const it of processedItems) {
      await dbQuery.run(`
        INSERT INTO document_items (doc_id, description, hsn_sac, qty, unit, rate, gst_rate, taxable_amount, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [docId, it.description, it.hsn_sac, it.qty, it.unit, it.rate, it.gst_rate, it.taxable_amount, it.total_amount]);
    }

    res.status(201).json({ id: docId, doc_number, grandTotal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update document
app.put('/api/documents/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const {
      doc_type, doc_number, customer_id, doc_date, valid_till_date, status,
      is_igst, discount, notes, terms, items
    } = req.body;

    let subtotal = 0;
    let cgst_total = 0;
    let sgst_total = 0;
    let igst_total = 0;

    const processedItems = items.map(item => {
      const qty = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const gstRate = parseFloat(item.gst_rate) || 0;
      const taxable = qty * rate;
      const gstAmount = taxable * (gstRate / 100);
      const total = taxable + gstAmount;

      subtotal += taxable;
      if (is_igst) {
        igst_total += gstAmount;
      } else {
        cgst_total += gstAmount / 2;
        sgst_total += gstAmount / 2;
      }

      return {
        description: item.description,
        hsn_sac: item.hsn_sac || '',
        qty,
        unit: item.unit || 'Nos',
        rate,
        gst_rate: gstRate,
        taxable_amount: taxable,
        total_amount: total
      };
    });

    const disc = parseFloat(discount) || 0;
    const taxTotal = is_igst ? igst_total : (cgst_total + sgst_total);
    const grandTotal = Math.round((subtotal + taxTotal - disc) * 100) / 100;

    await dbQuery.run(`
      UPDATE documents SET
        doc_type = ?, doc_number = ?, customer_id = ?, doc_date = ?, valid_till_date = ?,
        status = ?, is_igst = ?, subtotal = ?, cgst_total = ?, sgst_total = ?, igst_total = ?,
        discount = ?, total_amount = ?, notes = ?, terms = ?
      WHERE id = ?
    `, [
      doc_type, doc_number, customer_id, doc_date, valid_till_date || null,
      status, is_igst ? 1 : 0, subtotal, cgst_total, sgst_total, igst_total,
      disc, grandTotal, notes || '', terms || '', docId
    ]);

    // Delete old items and insert updated ones
    await dbQuery.run('DELETE FROM document_items WHERE doc_id = ?', [docId]);
    for (const it of processedItems) {
      await dbQuery.run(`
        INSERT INTO document_items (doc_id, description, hsn_sac, qty, unit, rate, gst_rate, taxable_amount, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [docId, it.description, it.hsn_sac, it.qty, it.unit, it.rate, it.gst_rate, it.taxable_amount, it.total_amount]);
    }

    res.json({ success: true, id: docId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Convert Quotation to Tax Invoice or Labour Bill
app.post('/api/documents/:id/convert', async (req, res) => {
  try {
    const origId = req.params.id;
    const targetType = req.body.target_type || 'TAX_INVOICE';
    const origDoc = await dbQuery.get('SELECT * FROM documents WHERE id = ?', [origId]);
    if (!origDoc) return res.status(404).json({ error: 'Original quotation not found' });

    const year = new Date().getFullYear();
    const prefix = targetType === 'LABOUR_BILL' ? 'LB' : 'INV';
    const lastDoc = await dbQuery.get(
      `SELECT doc_number FROM documents WHERE doc_type = ? AND doc_number LIKE ? ORDER BY id DESC LIMIT 1`,
      [targetType, `${prefix}-${year}-%`]
    );
    let seq = 1;
    if (lastDoc && lastDoc.doc_number) {
      const parts = lastDoc.doc_number.split('-');
      if (parts.length === 3) seq = parseInt(parts[2], 10) + 1;
    }
    const newDocNum = `${prefix}-${year}-${String(seq).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const result = await dbQuery.run(`
      INSERT INTO documents (
        doc_type, doc_number, customer_id, doc_date, valid_till_date, status,
        is_igst, subtotal, cgst_total, sgst_total, igst_total, discount, total_amount, notes, terms
      ) VALUES (?, ?, ?, ?, ?, 'Unpaid', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      targetType, newDocNum, origDoc.customer_id, today, today,
      origDoc.is_igst, origDoc.subtotal, origDoc.cgst_total, origDoc.sgst_total, origDoc.igst_total,
      origDoc.discount, origDoc.total_amount, `Converted from Quotation #${origDoc.doc_number}`, origDoc.terms
    ]);

    const newDocId = result.lastID;

    const items = await dbQuery.all('SELECT * FROM document_items WHERE doc_id = ?', [origId]);
    for (const it of items) {
      await dbQuery.run(`
        INSERT INTO document_items (doc_id, description, hsn_sac, qty, unit, rate, gst_rate, taxable_amount, total_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [newDocId, it.description, it.hsn_sac, it.qty, it.unit, it.rate, it.gst_rate, it.taxable_amount, it.total_amount]);
    }

    await dbQuery.run("UPDATE documents SET status = 'Converted' WHERE id = ?", [origId]);

    res.json({ success: true, newDocId, newInvoiceNumber: newDocNum });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    await dbQuery.run('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. COMPANY LETTERS & LETTERHEAD MODULE ROUTES
// -------------------------------------------------------------
app.get('/api/letters/next-number', async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `DKE/LTR/${year}`;
    const lastLtr = await dbQuery.get(
      `SELECT ref_number FROM letters WHERE ref_number LIKE ? ORDER BY id DESC LIMIT 1`,
      [`${prefix}/%`]
    );
    let seq = 1;
    if (lastLtr && lastLtr.ref_number) {
      const parts = lastLtr.ref_number.split('/');
      if (parts.length === 4) {
        seq = parseInt(parts[3], 10) + 1;
      }
    }
    const nextRef = `${prefix}/${String(seq).padStart(3, '0')}`;
    res.json({ ref_number: nextRef });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/letters', async (req, res) => {
  try {
    const letters = await dbQuery.all('SELECT * FROM letters ORDER BY id DESC');
    res.json(letters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/letters/:id', async (req, res) => {
  try {
    const letter = await dbQuery.get('SELECT * FROM letters WHERE id = ?', [req.params.id]);
    if (!letter) return res.status(404).json({ error: 'Letter not found' });
    const company = await dbQuery.get('SELECT * FROM company_info WHERE id = 1');
    res.json({ ...letter, company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/letters', async (req, res) => {
  try {
    const { ref_number, letter_date, recipient_name, recipient_address, subject, body, signatory_name } = req.body;
    if (!ref_number || !recipient_name || !subject || !body) {
      return res.status(400).json({ error: 'Recipient, Subject, and Body text are required' });
    }
    const result = await dbQuery.run(
      `INSERT INTO letters (ref_number, letter_date, recipient_name, recipient_address, subject, body, signatory_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ref_number, letter_date || new Date().toISOString().split('T')[0], recipient_name, recipient_address || '', subject, body, signatory_name || 'Proprietor']
    );
    res.status(201).json({ id: result.lastID, ref_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/letters/:id', async (req, res) => {
  try {
    const { ref_number, letter_date, recipient_name, recipient_address, subject, body, signatory_name } = req.body;
    await dbQuery.run(
      `UPDATE letters SET ref_number = ?, letter_date = ?, recipient_name = ?, recipient_address = ?, subject = ?, body = ?, signatory_name = ? WHERE id = ?`,
      [ref_number, letter_date, recipient_name, recipient_address, subject, body, signatory_name, req.params.id]
    );
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/letters/:id', async (req, res) => {
  try {
    await dbQuery.run('DELETE FROM letters WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 5. ENHANCED DASHBOARD STATS (MONTHLY & YEARLY EARNINGS)
// -------------------------------------------------------------
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    // All-time Total Paid Revenue
    const revenueRow = await dbQuery.get("SELECT SUM(total_amount) as total FROM documents WHERE doc_type IN ('TAX_INVOICE', 'LABOUR_BILL') AND status = 'Paid'");
    
    // Monthly Earnings (Current Month)
    const monthRow = await dbQuery.get(
      "SELECT SUM(total_amount) as total FROM documents WHERE doc_type IN ('TAX_INVOICE', 'LABOUR_BILL') AND status = 'Paid' AND strftime('%Y-%m', doc_date) = ?",
      [currentMonth]
    );

    // Yearly Earnings (Current Year)
    const yearRow = await dbQuery.get(
      "SELECT SUM(total_amount) as total FROM documents WHERE doc_type IN ('TAX_INVOICE', 'LABOUR_BILL') AND status = 'Paid' AND strftime('%Y', doc_date) = ?",
      [currentYear]
    );

    // Pending Receivables
    const unpaidRow = await dbQuery.get("SELECT SUM(total_amount) as total, COUNT(*) as count FROM documents WHERE doc_type IN ('TAX_INVOICE', 'LABOUR_BILL') AND status = 'Unpaid'");
    
    // Counts
    const quotationCountRow = await dbQuery.get("SELECT COUNT(*) as count FROM documents WHERE doc_type = 'QUOTATION'");
    const customerCountRow = await dbQuery.get("SELECT COUNT(*) as count FROM customers");

    // Monthly breakdown for current year
    const monthlyBreakdown = await dbQuery.all(`
      SELECT strftime('%m', doc_date) as month_num, SUM(total_amount) as total
      FROM documents
      WHERE doc_type IN ('TAX_INVOICE', 'LABOUR_BILL') AND status = 'Paid' AND strftime('%Y', doc_date) = ?
      GROUP BY month_num
      ORDER BY month_num ASC
    `, [currentYear]);

    const recentDocs = await dbQuery.all(`
      SELECT d.*, c.name as customer_name
      FROM documents d
      JOIN customers c ON d.customer_id = c.id
      ORDER BY d.id DESC LIMIT 6
    `);

    res.json({
      totalRevenue: revenueRow ? revenueRow.total || 0 : 0,
      thisMonthRevenue: monthRow ? monthRow.total || 0 : 0,
      thisYearRevenue: yearRow ? yearRow.total || 0 : 0,
      unpaidAmount: unpaidRow ? unpaidRow.total || 0 : 0,
      unpaidCount: unpaidRow ? unpaidRow.count || 0 : 0,
      totalQuotations: quotationCountRow ? quotationCountRow.count || 0 : 0,
      totalCustomers: customerCountRow ? customerCountRow.count || 0 : 0,
      monthlyBreakdown,
      recentDocs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 DK Enterprise Billing Backend Server running on http://localhost:${PORT}`);
});
