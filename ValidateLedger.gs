function testValidateLedger(testName, assetRecords, ledgerRecords, validationError) {

  QUnit.test(testName, function (assert) {

    let error;
    let noErrorMessage = 'No error thrown.';

    assert.throws(
      function () {
        let assetTracker = new AssetTracker();
        assetTracker.validateAssetRecords(assetRecords);
        assetTracker.processAssets(assetRecords);
        assetTracker.validateLedgerRecords(ledgerRecords);
        assetTracker.processLedger(ledgerRecords);
        throw new Error(noErrorMessage);
      },
      function (e) { error = e; return true; },
      'Catch error'
    );

    if (validationError) {

      assert.equal(error.message, validationError.message, 'Error message');
      assert.equal(error instanceof ValidationError ? error.rowIndex : -1, validationError.rowIndex, 'Validation error row index');
      assert.equal(error instanceof ValidationError ? error.columnName : '', validationError.columnName, 'Validation error column name');
    }
    else {

      assert.equal(error.message, noErrorMessage, 'no error');
    }
  });
}

function validateLedgerGeneral() {

  QUnit.module('Validate Ledger General');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ABC', '', 200, '', 'IB', 'USD', '', 600, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 4: Debit asset (ABC) is not found in the Assets sheet.`, 4, 'debitAsset');

  testValidateLedger('Debit asset not found', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit asset (LMN) is not found in the Assets sheet.`, 3, 'creditAsset');

  testValidateLedger('Credit asset not found', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord('#', 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Invalid date.`, 3, 'date');

  testValidateLedger('Invalid date', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 5: Dates must be in chronological or reverse chronological order.`, 5, 'date');

  testValidateLedger('Dates not chronological or reverse chronological order', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(3020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Date must be in the past.`, 3, 'date');

  testValidateLedger('Date in future', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), '', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Ledger row 3: No action specified.`, 3, 'action');

  testValidateLedger('No action', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '#', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit exchange rate is not valid (number or blank).`, 3, 'debitExRate');

  testValidateLedger('Invalid debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', '#', '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit amount is not valid (number or blank).`, 3, 'debitAmount');

  testValidateLedger('Invalid debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '#', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit fee is not valid (number or blank).`, 3, 'debitFee');

  testValidateLedger('Invalid debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 2000, '', 'IB', 'LMN', '#', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit exchange rate is not valid (number or blank).`, 3, 'creditExRate');

  testValidateLedger('Invalid credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', '#', '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit amount is not valid (number or blank).`, 3, 'creditAmount');

  testValidateLedger('Invalid credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '#', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit fee is not valid (number or blank).`, 3, 'creditFee');

  testValidateLedger('Invalid credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '#')
  ];

  validationError = new ValidationError(`Trade row 3: Lot matching (#) is not valid (FIFO, LIFO, HIFO, LOFO) or blank.`, 3, 'lotMatching');

  testValidateLedger('Invalid lot matching', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Sleep', '', '', '', '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Ledger row 3: Action (Sleep) is invalid.`, 3, 'action');

  testValidateLedger('Invalid Action', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', -2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit amount must be greater than or equal to 0.`, 3, 'debitAmount');

  testValidateLedger('Reverse chronological order with error', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Skip', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', -2000, '', 'IB', 'LMN', '', 1000, 0, '', '')
  ];

  validationError = new ValidationError(`Trade row 5: Debit amount must be greater than or equal to 0.`, 5, 'debitAmount');

  testValidateLedger('Skip then error', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Skip', 'USD', '', -2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', '')
  ];

  validationError = null;

  testValidateLedger('Skip error valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Stop', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', -2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
  ];

  validationError = null;

  testValidateLedger('Stop then error valid', assetRecords, ledgerRecords, validationError);
}

function validateLedgerTransfer() {

  QUnit.module('Validate Ledger Transfer');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 10, 'IB', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat to bank with fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat to bank no fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat from bank valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 10, 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat with fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat no fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, 10, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Transfer asset with fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Transfer asset no fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', 2000, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: No debit or credit asset specified.`, 3, 'debitAsset');

  testValidateLedger('Transfer no debit or credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', 'USD', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Either debit or credit asset must be specified, but not both.`, 3, 'debitAsset');

  testValidateLedger('Transfer both debit and credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'ADA', '', 2000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Credit asset must be fiat (or blank).`, 4, 'creditAsset');

  testValidateLedger('Transfer asset credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', 1.2, 2000, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Transfer debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', 1.2, '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave credit exchange rate blank.`, 3, 'creditExRate');

  testValidateLedger('Transfer credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', '', 10, '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave credit fee blank.`, 3, 'creditFee');

  testValidateLedger('Transfer credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', 2000, '', '', 'EUR', '', 2000, '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave debit amount blank when credit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat from bank debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', 10, '', 'EUR', '', 2000, '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave debit fee blank when credit asset is specified.`, 3, 'debitFee');

  testValidateLedger('Transfer fiat from bank debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', 'Kraken', 'EUR', '', 2000, '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave debit wallet blank when credit asset is specified.`, 3, 'debitWalletName');

  testValidateLedger('Transfer fiat from bank debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Credit amount must be specified when credit asset is specified.`, 3, 'creditAmount');

  testValidateLedger('Transfer fiat from bank no credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', -2000, '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Credit amount must be greater than 0 when credit asset is specified.`, 3, 'creditAmount');

  testValidateLedger('Transfer fiat from bank negative credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 0, '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Credit amount must be greater than 0 when credit asset is specified.`, 3, 'creditAmount');

  testValidateLedger('Transfer fiat from bank zero credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000, '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Credit wallet must be specified when credit asset is specified.`, 3, 'creditWalletName');

  testValidateLedger('Transfer fiat from bank no credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', '', '', 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be specified when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat to bank no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', -2000, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be greater than 0 when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat to bank negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 0, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be greater than 0 when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat to bank zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, -10, 'IB', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit fee must be greater than or equal to 0 (or blank) when debit asset is specified.`, 3, 'debitFee');

  testValidateLedger('Transfer fiat to bank negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 0, 'IB', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat to bank zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit wallet must be specified when debit asset is specified.`, 3, 'debitWalletName');

  testValidateLedger('Transfer fiat to bank no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', 2000, '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave credit amount blank when credit asset is not specified.`, 3, 'creditAmount');

  testValidateLedger('Transfer fiat to bank credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', '', '', 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be specified when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', -2000, '', 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be greater than 0 when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 0, '', 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit amount must be greater than 0 when debit asset is specified.`, 3, 'debitAmount');

  testValidateLedger('Transfer fiat zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, -10, 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit fee must be greater than or equal to 0 (or blank) when debit asset is specified.`, 3, 'debitFee');

  testValidateLedger('Transfer fiat negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 0, 'IB', '', '', '', '', 'Kraken', '')
  ];

  validationError = null;

  testValidateLedger('Transfer fiat zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', '', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit wallet must be specified when debit asset is specified.`, 3, 'debitWalletName');

  testValidateLedger('Transfer fiat no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', 2000, '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Leave credit amount blank when credit asset is not specified.`, 3, 'creditAmount');

  testValidateLedger('Transfer fiat credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Transfer row 3: Debit wallet (IB) and credit wallet (IB) must be different.`, 3, 'debitWalletName');

  testValidateLedger('Transfer fiat same debit and credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', '', '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit amount must be specified when debit asset is specified.`, 4, 'debitAmount');

  testValidateLedger('Transfer asset no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', -2000, '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit amount must be greater than 0 when debit asset is specified.`, 4, 'debitAmount');

  testValidateLedger('Transfer asset negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 0, '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit amount must be greater than 0 when debit asset is specified.`, 4, 'debitAmount');

  testValidateLedger('Transfer asset zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, -10, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit fee must be greater than or equal to 0 (or blank) when debit asset is specified.`, 4, 'debitFee');

  testValidateLedger('Transfer asset negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, 0, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Transfer asset zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', '', '', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit wallet must be specified when debit asset is specified.`, 4, 'debitWalletName');

  testValidateLedger('Transfer asset no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', 2000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Leave credit amount blank when credit asset is not specified.`, 4, 'creditAmount');

  testValidateLedger('Transfer asset credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Credit wallet must be specified when debit asset is not fiat.`, 4, 'creditWalletName');

  testValidateLedger('Transfer asset no credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', '', '', 'Kraken', '')
  ];

  validationError = new ValidationError(`Transfer row 4: Debit wallet (Kraken) and credit wallet (Kraken) must be different.`, 4, 'debitWalletName');

  testValidateLedger('Transfer asset same debit and credit wallet', assetRecords, ledgerRecords, validationError);
}

function validateLedgerTrade() {

  QUnit.module('Validate Ledger Trade');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base buy with fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base buy no fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1020, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'USD', '', 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base sell with fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base sell no fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat buy with fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat buy no fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat sell with fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat sell no fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, 10, 'Kraken', 'ADA', 1.2, 1000, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat buy with fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat buy no fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'EUR', 1.2, 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat sell with fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', 1.2, 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat sell no fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'ALGO', '', 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange assets with fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'ALGO', '', 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange assets no fees debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'ALGO', 1.2, 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange assets with fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'ALGO', 1.2, 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange assets no fees credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'EUR', '', 1000, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base buy fiat with fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'EUR', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base buy fiat no fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1000, 10, 'Kraken', 'USD', '', 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base sell fiat with fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade fiat base sell fiat no fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('GBP', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange fiat with fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('GBP', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade exchange fiat no fees valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', '', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: No debit asset specified.`, 3, 'debitAsset');

  testValidateLedger('Trade no debit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', '', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: No credit asset specified.`, 3, 'creditAsset');

  testValidateLedger('Trade no credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'LMN', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit asset (LMN) and credit asset (LMN) must be different.`, 3, 'debitAsset');

  testValidateLedger('Trade same debit and credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', '', '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: No debit amount specified.`, 3, 'debitAmount');

  testValidateLedger('Trade no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', -2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit amount must be greater than or equal to 0.`, 3, 'debitAmount');

  testValidateLedger('Trade negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 0, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade zero debit amount valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, -10, 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit fee must be greater than or equal to 0 (or blank).`, 3, 'debitFee');

  testValidateLedger('Trade negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, 0, 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', '', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: No debit wallet specified.`, 3, 'debitWalletName');

  testValidateLedger('Trade no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: No credit amount specified.`, 3, 'creditAmount');

  testValidateLedger('Trade no credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', -1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit amount must be greater than or equal to 0.`, 3, 'creditAmount');

  testValidateLedger('Trade negative credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 0, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade zero credit amount valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, -10, '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit fee must be greater than or equal to 0 (or blank).`, 3, 'creditFee');

  testValidateLedger('Trade negative credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 1001, '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit fee must be less than or equal to credit amount (or blank).`, 3, 'creditFee');

  testValidateLedger('Trade Credit fee greater than credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 1000, '', '')
  ];

  validationError = null;

  testValidateLedger('Trade asset credit fee same as credit amount valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', 'Fidelity', '')
  ];

  validationError = new ValidationError(`Trade row 3: Leave credit wallet (Fidelity) blank. It is inferred from the debit wallet (IB).`, 3, 'creditWalletName');

  testValidateLedger('Trade credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', 1, 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit asset is fiat base (USD). Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Trade debit asset is fiat base and debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', 1, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit asset is fiat base (USD). Leave credit exchange rate blank.`, 3, 'creditExRate');

  testValidateLedger('Trade debit asset is fiat base and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', 1, 200, '', 'IB', 'USD', '', 600, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 4: Credit asset is fiat base (USD). Leave debit exchange rate blank.`, 4, 'debitExRate');

  testValidateLedger('Trade credit asset is fiat base and debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 200, '', 'IB', 'USD', 1, 600, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 4: Credit asset is fiat base (USD). Leave credit exchange rate blank.`, 4, 'creditExRate');

  testValidateLedger('Trade credit asset is fiat base and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('GBP', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', 1.2, 1000, '', 'IB', 'EUR', '', 1200, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Fiat exchange: (GBP/EUR). Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Trade fiat exchange and debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('GBP', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'IB', 'GBP', 1.2, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Fiat exchange: (EUR/GBP). Leave credit exchange rate blank.`, 3, 'creditExRate');

  testValidateLedger('Trade fiat exchange and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 0, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Trade with zero debit amount. Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat zero debit amount and debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 0, '', 'IB', 'LMN', 2.4, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Trade with zero debit amount. Leave credit exchange rate blank.`, 3, 'creditExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat zero debit amount and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 2000, '', 'IB', 'LMN', '', 0, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Trade with zero credit amount. Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat zero credit amount and debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 2000, '', 'IB', 'LMN', 2.4, 0, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Trade with zero credit amount. Leave credit exchange rate blank.`, 3, 'creditExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat zero credit amount and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Non fiat base trade requires either debit asset (EUR) or credit asset (LMN) to fiat base (USD) exchange rate.`, 3, 'debitExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat and no debit or credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 2000, '', 'IB', 'LMN', 2.4, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Remove one of the exchange rates.\n\nNon fiat base trade requires either debit asset (EUR) or credit asset (LMN) to fiat base (USD) exchange rate, but not both. One exchange rate can be deduced from the other and the amounts of assets exchanged. The exchange rate of the least volatile, most widely traded asset is likely to be more accurate.`, 3, 'debitExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat and both debit and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', -1.2, 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Debit exchange rate must be greater than or equal to 0.`, 3, 'debitExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat and negative debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 2000, '', 'IB', 'LMN', '', 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade non fiat base non fiat-fiat and zero debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 2000, '', 'IB', 'LMN', -2.4, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Trade row 3: Credit exchange rate must be greater than or equal to 0.`, 3, 'creditExRate');

  testValidateLedger('Trade non fiat base non fiat-fiat and negative credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 2000, '', 'IB', 'LMN', 0, 1000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Trade non fiat base non fiat-fiat and zero credit exrate valid', assetRecords, ledgerRecords, validationError);
}

function validateLedgerIncome() {

  QUnit.module('Validate Ledger Income');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Income rewards valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'EUR', 1.2, 1000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Income fiat interest valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'USD', '', 1000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Income  fiat base interest valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 1000, '', 'IB', 'EUR', 1.2, 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'EUR', 1.2, 1000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Income fiat dividend valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 1000, '', 'IB', 'USD', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'USD', '', 1000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Income fiat base dividend valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', 1.2, '', '', '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Leave debit exchange rate blank.`, 3, 'debitExRate');

  testValidateLedger('Income debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', 1000, '', '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Leave debit amount blank.`, 3, 'debitAmount');

  testValidateLedger('Income debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', 10, '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Leave debit fee blank.`, 3, 'debitFee');

  testValidateLedger('Income debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', 'IB', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Leave debit wallet (IB) blank.`, 3, 'debitWalletName');

  testValidateLedger('Income debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', '', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: No credit asset specified.`, 3, 'creditAsset');

  testValidateLedger('Income no credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 1000, '', 'IB', 'USD', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'USD', 1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 5: Leave credit exchange rate blank when credit asset is fiat base (USD).`, 5, 'creditExRate');

  testValidateLedger('Income credit asset is fiat base and credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Missing credit asset (ADA) to fiat base (USD) exchange rate.`, 3, 'creditExRate');

  testValidateLedger('Income credit asset not fiat base and no credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', -1.2, 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Credit exchange rate must be greater than or equal to 0.`, 3, 'creditExRate');

  testValidateLedger('Income credit asset not fiat base and negative credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 0, 1000, '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Income credit asset not fiat base and zero credit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: No credit amount specified.`, 3, 'creditAmount');

  testValidateLedger('Income no credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, -1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Credit amount must be greater than 0.`, 3, 'creditAmount');

  testValidateLedger('Income negative credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 0, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Credit amount must be greater than 0.`, 3, 'creditAmount');

  testValidateLedger('Income zero credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 1000, 10, 'Ledger', '')
  ];

  validationError = new ValidationError(`Income row 3: Leave credit fee blank.`, 3, 'creditFee');

  testValidateLedger('Income credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 1000, '', '', '')
  ];

  validationError = new ValidationError(`Income row 3: No credit wallet specified.`, 3, 'creditWalletName');

  testValidateLedger('Income no credit wallet', assetRecords, ledgerRecords, validationError);
}

function validateLedgerDonation() {

  QUnit.module('Validate Ledger Donation');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', '1.2', 990, 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Donation with fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', '1.2', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Donation no fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', '', '1.2', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: No debit asset specified.`, 4, 'debitAsset');

  testValidateLedger('Donation no debit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'EUR', '1.2', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 3: Debit asset (EUR) is fiat, not supported.`, 3, 'debitAsset');

  testValidateLedger('Donation debit asset fiat', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', '', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Missing debit asset (ADA) to fiat base (USD) exchange rate.`, 4, 'debitExRate');

  testValidateLedger('Donation no debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', -1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Debit exchange rate must be greater than or equal to 0.`, 4, 'debitExRate');

  testValidateLedger('Donation negative debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 0, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Donation zero debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, '', '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: No debit amount specified.`, 4, 'debitAmount');

  testValidateLedger('Donation no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, -1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Donation negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 0, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Donation zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, -10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Debit fee must be greater than or equal to 0 (or blank).`, 4, 'debitFee');

  testValidateLedger('Donation negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, 0, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Donation zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: No debit wallet specified.`, 4, 'debitWalletName');

  testValidateLedger('Donation no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('BTC', 'Crypto', 8, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', 'BTC', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Leave credit asset (BTC) blank.`, 4, 'creditAsset');

  testValidateLedger('Donation credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', 1.2, '', '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Leave credit exchange rate blank.`, 4, 'creditExRate');

  testValidateLedger('Donation credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Leave credit amount blank.`, 4, 'creditAmount');

  testValidateLedger('Donation credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', 10, '', '')
  ];

  validationError = new ValidationError(`Donation row 4: Leave credit fee blank.`, 4, 'creditFee');

  testValidateLedger('Donation credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Donation row 4: Leave credit wallet (IB) blank.`, 4, 'creditWalletName');

  testValidateLedger('Donation credit wallet', assetRecords, ledgerRecords, validationError);
}

function validateLedgerGift() {

  QUnit.module('Validate Ledger Gift');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Gift given with fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Gift given no fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Gift received valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', '', '', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: No debit asset specified.\n\nFor gifts given debit asset is the asset given.\n\nFor gifts received debit asset must be fiat base (USD) for the inherited cost basis.`, 4, 'debitAsset');

  testValidateLedger('Gift no debit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', '', 1000, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: Either debit wallet (for gifts given) or credit wallet (for gifts received) must be specified.`, 4, 'debitWalletName');

  testValidateLedger('Gift no debit or credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', '', 1000, '', 'Kraken', '', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Gift row 4: Either debit wallet (for gifts given) or credit wallet (for gifts received) must be specified, but not both.`, 4, 'debitWalletName');

  testValidateLedger('Gift both debit and credit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, -10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: Debit fee must be greater than or equal to 0 (or blank).`, 4, 'debitFee');

  testValidateLedger('Gift negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, 0, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Gift zero debit fee valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', '', 1.2, '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: Leave credit exchange rate blank.`, 4, 'creditExRate');

  testValidateLedger('Gift credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', 1000, 10, 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: Leave credit fee blank.`, 3, 'creditFee');

  testValidateLedger('Gift credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'EUR', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 3: Debit asset EUR is fiat. Not supported for gifts given. Use transfer action instead.`, 3, 'debitAsset');

  testValidateLedger('Gift given debit asset fiat', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', '', 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, debit asset (ADA) to fiat base (USD) exchange rate must be specified.`, 4, 'debitExRate');

  testValidateLedger('Gift given no debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', -1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, debit exchange rate must be greater than or equal to 0.`, 4, 'debitExRate');

  testValidateLedger('Gift given negative debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 0, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Gift given zero debit exrate valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, '', '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, debit amount must be specified.`, 4, 'debitAmount');

  testValidateLedger('Gift given no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, -1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Gift given negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 0, '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Gift given zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', 'ADA', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, leave credit asset (ADA) blank.`, 4, 'creditAsset');

  testValidateLedger('Gift given credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', '', '', 1000, '', '', '')
  ];

  validationError = new ValidationError(`Gift row 4: For gifts given, leave credit amount blank.`, 4, 'creditAmount');

  testValidateLedger('Gift given credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'EUR', '', 1000, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, debit asset must be fiat base (for the inherited cost basis).`, 3, 'debitAsset');

  testValidateLedger('Gift received debit asset not fiat base', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', '', '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, debit amount must be specified (for the inherited cost basis).`, 3, 'debitAmount');

  testValidateLedger('Gift received no debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', -1200, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, debit amount must be greater than or equal to 0 (for the inherited cost basis).`, 3, 'debitAmount');

  testValidateLedger('Gift received negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 0, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  validationError = null;

  testValidateLedger('Gift received zero debit amount valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', '', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, credit asset must be specified.`, 3, 'creditAsset');

  testValidateLedger('Gift received no credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'EUR', '', 1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: Credit asset EUR is fiat. Not supported for gifts received. Use transfer action instead.`, 3, 'creditAsset');

  testValidateLedger('Gift received credit asset fiat', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', '', '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, credit amount must be specified.`, 3, 'creditAmount');

  testValidateLedger('Gift received no credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', -1000, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, credit amount must be greater than 0.`, 3, 'creditAmount');

  testValidateLedger('Gift received negative credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', 0, '', 'Ledger', '')
  ];

  validationError = new ValidationError(`Gift row 3: For gifts received, credit amount must be greater than 0.`, 3, 'creditAmount');

  testValidateLedger('Gift received zero credit amount', assetRecords, ledgerRecords, validationError);
}

function validateLedgerFee() {

  QUnit.module('Validate Ledger Fee');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'USD', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Fee fiat base valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'EUR', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Fee fiat valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Fee asset valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', '', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 3: No debit asset specified.`, 3, 'debitAsset');

  testValidateLedger('Fee no debit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', 1.2, '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave debit exchange rate blank.`, 4, 'debitExRate');

  testValidateLedger('Fee debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', 20, 10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave debit amount blank.`, 4, 'debitAmount');

  testValidateLedger('Fee debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', '', 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: No debit fee specified.`, 4, 'debitFee');

  testValidateLedger('Fee no debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', -10, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Debit fee must be greater than 0.`, 4, 'debitFee');

  testValidateLedger('Fee negative debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 0, 'Kraken', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Debit fee must be greater than 0.`, 4, 'debitFee');

  testValidateLedger('Fee zero debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: No debit wallet specified.`, 4, 'debitWalletName');

  testValidateLedger('Fee no debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', 'EUR', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave credit asset (EUR) blank.`, 4, 'creditAsset');

  testValidateLedger('Fee credit asset', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', 1.2, '', '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave credit exchange rate blank.`, 4, 'creditExRate');

  testValidateLedger('Fee credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', 10, '', '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave credit amount blank.`, 4, 'creditAmount');

  testValidateLedger('Fee credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', 10, '', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave credit fee blank.`, 4, 'creditFee');

  testValidateLedger('Fee credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Fee row 4: Leave credit wallet (IB) blank.`, 4, 'creditWalletName');

  testValidateLedger('Fee credit wallet', assetRecords, ledgerRecords, validationError);
}

function validateLedgerSplit() {

  QUnit.module('Validate Ledger Split');

  let assetRecords;
  let ledgerRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Split reverse split no wallet valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', 'IB', '', '', '', '', '', '')
  ];

  validationError = null;

  testValidateLedger('Split reverse split with wallet valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', '', '')
  ];

  validationError = null;

  testValidateLedger('Split forward split no wallet valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', 'IB', '')
  ];

  validationError = null;

  testValidateLedger('Split forward split with wallet valid', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', 'LMN', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✓✓✓ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', '', '', '', 'LMN', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✗✓✓ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', '', '', '', 'LMN', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✗✓✗ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', '', '', '', '', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✗✗✓ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '750', '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✓✗✗ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✗✗✗ debit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', '', '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✗✗✗ debit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', 750, '', '', 'LMN', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✓✓✓ debit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', 750, '', '', 'LMN', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✓✓✗ debit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', 750, '', '', '', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'debitAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✓✗✓ debit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', 'LMN', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'creditAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✓✓✗ credit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', '', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'creditAsset');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✗✗✓ credit asset column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', '', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'creditAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✓✓✗✓ credit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Either enter debit asset and debit amount for reverse splits (decrease amount held) or credit asset and credit amount for foward splits (increase amount held).`, 4, 'creditAmount');

  testValidateLedger('Split debit asset, debit amount, credit asset, credit amount ✗✗✓✗ credit amount column', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'EUR', '', 750, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Debit asset (EUR) is fiat, not supported.`, 4, 'debitAsset');

  testValidateLedger('Split debit asset fiat', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', 2, 750, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Leave debit exchange rate blank.`, 4, 'debitExRate');

  testValidateLedger('Split debit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', -750, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Split negative debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 0, '', '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Debit amount must be greater than 0.`, 4, 'debitAmount');

  testValidateLedger('Split zero debit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, 10, '', '', '', '', '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Leave debit fee blank.`, 4, 'debitFee');

  testValidateLedger('Split debit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', 'IB', 'LMN', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: For foward splits (increase amount held) leave debit wallet (IB) blank.`, 4, 'debitWalletName');

  testValidateLedger('Split foward split debit wallet', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'EUR', '', 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Credit asset (EUR) is fiat, not supported.`, 4, 'creditAsset');

  testValidateLedger('Split credit asset fiat', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', 2, 3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Leave credit exchange rate blank.`, 4, 'creditExRate');

  testValidateLedger('Split credit exrate', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', -3000, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Credit amount must be greater than 0.`, 4, 'creditAmount');

  testValidateLedger('Split negative credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 0, '', '', '')
  ];

  validationError = new ValidationError(`Split row 4: Credit amount must be greater than 0.`, 4, 'creditAmount');

  testValidateLedger('Split zero credit amount', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 3000, 10, '', '')
  ];

  validationError = new ValidationError(`Split row 4: Leave credit fee blank.`, 4, 'creditFee');

  testValidateLedger('Split credit fee', assetRecords, ledgerRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', '', '', '', '', 'IB', '')
  ];

  validationError = new ValidationError(`Split row 4: For reverse splits (decrease amount held) leave credit wallet (IB) blank.`, 4, 'creditWalletName');

  testValidateLedger('Split reverse split credit wallet', assetRecords, ledgerRecords, validationError);
}