function testProcessLedger(testName, assetRecords, ledgerRecords, walletName, fiat, balance, asset, lots, closedLots, incomeLots) {

  QUnit.test(testName, function (assert) {

    let assetTracker = new AssetTracker();
    assetTracker.validateAssetRecords(assetRecords);
    assetTracker.processAssets(assetRecords);

    assetTracker.validateLedgerRecords(ledgerRecords, 'US');
    assetTracker.processLedger(ledgerRecords);

    let wallet = assetTracker.wallets.get(walletName);

    if (fiat) {

      let fiatAccount = wallet.fiatAccounts.get(fiat.ticker);

      assert.equal(fiatAccount.balance, balance, 'Fiat account balance');

    }

    if (asset) {

      let asssetAccount = wallet.assetAccounts.get(asset.ticker);

      assert.equal(asssetAccount.lots.length, lots.length, 'Asset account lots length');
      assert.deepEqual(asssetAccount.lots, lots, 'Asset account lots');

      assert.equal(assetTracker.closedLots.length, closedLots.length, 'Closed lots length');
      assert.deepEqual(assetTracker.closedLots, closedLots, 'Closed lots');

    }

    if (incomeLots) {

      assert.equal(assetTracker.incomeLots.length, incomeLots.length, 'Income lots length');
      assert.deepEqual(assetTracker.incomeLots, incomeLots, 'Income lots');

    }
  });
}

function testProcessLedgerAssetAccountError(testName, assetRecords, ledgerRecords, assetAccountError) {

  QUnit.test(testName, function (assert) {

    let error;
    let noErrorMessage = 'No error thrown.';

    assert.throws(
      function () {
        let assetTracker = new AssetTracker();
        assetTracker.validateAssetRecords(assetRecords);
        assetTracker.processAssets(assetRecords);
        assetTracker.validateLedgerRecords(ledgerRecords, 'US');
        assetTracker.processLedger(ledgerRecords);
        throw new Error(noErrorMessage);
      },
      function (e) { error = e; return true; },
      'Catch error'
    );

    if (assetAccountError) {

      assert.equal(error.message, assetAccountError.message, 'message');
    }
    else {

      assert.equal(error.message, noErrorMessage, 'no error');
    }
  });
}

function processLedgerAssetAccountError() {

  QUnit.module('Process Ledger Asset Account Error');

  let ledgerRecords;
  let assetAccountError;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'USD', '', 1200, '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 3: Attempted to withdraw ADA 1000 + fee 10 from Kraken balance of 0.`, 3, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw with fee from zero balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1200, 10, 'Kraken', 'USD', '', 1200, '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 4: Attempted to withdraw ADA 1200 + fee 10 from Kraken balance of 1000.`, 4, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw with fee from positive balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 3: Attempted to withdraw ADA 1000 + fee 0 from Kraken balance of 0.`, 3, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw no fee from zero balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1200, '', 'Kraken', 'USD', '', 1200, '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 4: Attempted to withdraw ADA 1200 + fee 0 from Kraken balance of 1000.`, 4, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw no fee from positive balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 3: Attempted to withdraw fee ADA 10 from Kraken balance of 0.`, 3, 'debitFee');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw fee from zero balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 12, 'Kraken', '', '', '', '', '', ''),
  ];

  assetAccountError = new AssetAccountError(`Ledger row 4: Attempted to withdraw fee ADA 12 from Kraken balance of 10.`, 4, 'debitFee');

  testProcessLedgerAssetAccountError('Insufficient funds withdraw fee from positive balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'USD', '', 1000, '', 'IB', '')
  ];

  assetAccountError = new AssetAccountError(`Income row 3: Income source can not be debit asset (LMN) when asset not previously held.`, 3, 'debitAsset');

  testProcessLedgerAssetAccountError('Income dividend asset not previously held', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 500, '', 'IB', '', '', '', '', '', '')
  ];

  assetAccountError = new AssetAccountError(`Split row 3: Attempted to subtract LMN 500 from IB balance of 0.`, 3, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds split subtraction with wallet zero balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 1500, '', 'IB', '', '', '', '', '', '')
  ];

  assetAccountError = new AssetAccountError(`Split row 4: Attempted to subtract LMN 1500 from IB balance of 1000.`, 4, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds split subtraction with wallet positive balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 500, '', '', '', '', '', '', '', '')
  ];

  assetAccountError = new AssetAccountError(`Split row 3: Attempted to subtract LMN 500 from balance of 0.`, 3, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds split subtraction no wallet zero balance', assetRecords, ledgerRecords, assetAccountError);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 1500, '', '', '', '', '', '', '', '')
  ];

  assetAccountError = new AssetAccountError(`Split row 4: Attempted to subtract LMN 1500 from balance of 1000.`, 4, 'debitAmount');

  testProcessLedgerAssetAccountError('Insufficient funds split subtraction no wallet positive balance', assetRecords, ledgerRecords, assetAccountError);
}

function processLedgerBasic() {

  QUnit.module('Process Ledger Basic');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);
  // let algo = new Asset('ALGO', 'Crypto', false, 8);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 3), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 5)
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Chronological order', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 3), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 5), new Date(2020, 3, 2), usd, 1, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Reverse chronological order', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Skip', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3),
    new Lot(new Date(2020, 3, 3), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 5)
  ];

  closedLots = [
  ];

  testProcessLedger('Skip', assetRecords, ledgerRecords, 'Kraken', usd, -2400, ada, lots, closedLots);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Stop', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Stop', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2.005, 0.005, 'Kraken', 'ADA', '', 1.0000005, 0.1000005, '', ''),
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2.01, 0.01, ada, 1.000001, 0.100001, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade round', assetRecords, ledgerRecords, 'Kraken', usd, -2.02, ada, lots, closedLots);
}

function processLedgerTransfer() {

  QUnit.module('Process Ledger Transfer');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 10, 'IB', '', '', '', '', '', '')
  ];

  testProcessLedger('Transfer fiat to bank with fee', assetRecords, ledgerRecords, 'IB', eur, -2010);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, '', 'IB', '', '', '', '', '', '')
  ];

  testProcessLedger('Transfer fiat to bank no fee', assetRecords, ledgerRecords, 'IB', eur, -2000);


  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000, '', 'IB', '')
  ];

  testProcessLedger('Transfer fiat from bank', assetRecords, ledgerRecords, 'IB', eur, 2000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000.004, '', 'IB', '')
  ];

  testProcessLedger('Transfer fiat from bank round down', assetRecords, ledgerRecords, 'IB', eur, 2000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', '', '', '', '', '', 'EUR', '', 2000.005, '', 'IB', '')
  ];

  testProcessLedger('Transfer fiat from bank round up', assetRecords, ledgerRecords, 'IB', eur, 2000.01);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000.004, '', 'IB', '', '', '', '', '', '')
  ];

  testProcessLedger('Transfer fiat to bank round down', assetRecords, ledgerRecords, 'IB', eur, -2000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000.005, '', 'IB', '', '', '', '', '', '')
  ];

  testProcessLedger('Transfer fiat to bank round up', assetRecords, ledgerRecords, 'IB', eur, -2000.01);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 10, 'IB', '', '', '', '', 'Kraken', '')
  ];

  testProcessLedger('Transfer fiat with fee debited', assetRecords, ledgerRecords, 'IB', eur, -2010);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'EUR', '', 2000, 10, 'IB', '', '', '', '', 'Kraken', '')
  ];

  testProcessLedger('Transfer fiat with fee credited', assetRecords, ledgerRecords, 'Kraken', eur, 2000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, 10, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  lots = [
  ];

  closedLots = [
  ];

  testProcessLedger('Transfer asset with fee debited', assetRecords, ledgerRecords, 'Kraken', usd, -2000, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, 10, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, ada, 2010, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Transfer asset with fee credited', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  lots = [
  ];

  closedLots = [
  ];

  testProcessLedger('Transfer asset no fee debited', assetRecords, ledgerRecords, 'Kraken', usd, -2000, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'Kraken', 'ADA', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 2000, '', 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, ada, 2000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Transfer asset no fee credited', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots);
}

function processLedgerTrade() {

  QUnit.module('Process Ledger Trade');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('GBP', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let gbp = new Asset('GBP', 'Fiat', false, 2, 4);
  let ada = new Asset('ADA', 'Crypto', false, 6, 5);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 6);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 10, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat base buy with fees', assetRecords, ledgerRecords, 'Kraken', usd, -1210, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat base buy no fees', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1020, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'USD', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 10, ada, 1020, 20, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat base sell with fees', assetRecords, ledgerRecords, 'Kraken', usd, -20, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'ADA', '', 1485, 15, 'Kraken', 'USD', '', 1800, 15, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 2), usd, 1, 600, 5, ada, 505, 5, 'Kraken', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 1200, 10, ada, 1010, 10, 'Kraken', 'Trade', 5)
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 10, ada, 1010, 20, 'Kraken', 'Trade', 3), new Date(2020, 3, 4), usd, 1, 1200, 10, 'Kraken', 'Trade', 6),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), usd, 1, 600, 5, ada, 505, 10, 'Kraken', 'Trade', 4), new Date(2020, 3, 4), usd, 1, 600, 5, 'Kraken', 'Trade', 6)
  ];

  testProcessLedger('Trade fiat base sell multi-lot with fees default lot matching FIFO', assetRecords, ledgerRecords, 'Kraken', usd, -1845, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat base sell no fees', assetRecords, ledgerRecords, 'Kraken', usd, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 1.2, 1200, 10, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy with fees debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1210, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 1.2, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy no fees debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.01, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell with fees debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell no fees debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, 10, 'Kraken', 'ADA', 1.2, 1000, 10, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 1, 1200, 10, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy with fees credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1210, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy no fees credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'EUR', 1.2, 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1.2, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell with fees credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', 1.2, 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1.2, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell no fees credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'ALGO', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 1, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets with fees debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'ALGO', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 1, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets no fees debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'ALGO', 1.2, 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 1.2, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets with fees credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'ALGO', 1.2, 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 1.2, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets no fees credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, 10, 'Kraken', 'EUR', '', 1000, 10, '', '')
  ];

  testProcessLedger('Trade fiat base buy fiat with fees', assetRecords, ledgerRecords, 'Kraken', eur, 990);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'EUR', '', 1000, '', '', '')
  ];

  testProcessLedger('Trade fiat base buy fiat no fees', assetRecords, ledgerRecords, 'Kraken', eur, 1000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1000, 10, 'Kraken', 'USD', '', 1200, 10, '', '')
  ];

  testProcessLedger('Trade fiat base sell fiat with fees', assetRecords, ledgerRecords, 'Kraken', eur, -1010);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1000, '', 'Kraken', 'USD', '', 1200, '', '', '')
  ];

  testProcessLedger('Trade fiat base sell fiat no fees', assetRecords, ledgerRecords, 'Kraken', eur, -1000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  testProcessLedger('Trade exchange fiat with fees debit', assetRecords, ledgerRecords, 'Kraken', gbp, -1010);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  testProcessLedger('Trade exchange fiat with fees credit', assetRecords, ledgerRecords, 'Kraken', eur, 1190);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  testProcessLedger('Trade exchange fiat no fees debit', assetRecords, ledgerRecords, 'Kraken', gbp, -1000);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  testProcessLedger('Trade exchange fiat no fees credit', assetRecords, ledgerRecords, 'Kraken', eur, 1200);
}

function processLedgerTradeZeroAmount() {

  QUnit.module('Process Ledger Trade Zero Amount');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 0, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat base buy zero debit amount', assetRecords, ledgerRecords, 'Kraken', usd, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 0, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), usd, 1, 0, 0, 'Kraken', 'Trade', 3)
  ];

  testProcessLedger('Trade fiat base buy zero credit amount', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 0, '', 'Kraken', 'USD', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 0, 0, ada, 0, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), usd, 1, 1200, 0, 'Kraken', 'Trade', 3)
  ];

  testProcessLedger('Trade fiat base sell zero debit amount', assetRecords, ledgerRecords, 'Kraken', usd, 1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'USD', '', 0, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat base sell zero credit amount', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 0, 0, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy zero debit amount', assetRecords, ledgerRecords, 'Kraken', eur, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 0, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), usd, 1, 0, 0, 'Kraken', 'Trade', 3)
  ];

  testProcessLedger('Trade fiat buy zero credit amount', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 0, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 0, 0, ada, 0, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), eur, 0, 1200, 0, 'Kraken', 'Trade', 3)
  ];

  testProcessLedger('Trade fiat sell zero debit amount', assetRecords, ledgerRecords, 'Kraken', eur, 1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', '', 0, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), eur, 0, 0, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell zero credit amount', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ALGO', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), algo, 0, 0, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 0, 0, algo, 0, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 1), ada, 0, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  testProcessLedger('Trade exchange assets zero debit amount', assetRecords, ledgerRecords, 'Kraken', null, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1000, '', 'Kraken', 'ALGO', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 1000, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1000, 0, algo, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 0, 0, 0, 'Kraken', 'Trade', 4),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), algo, 0, 1000, 0, ada, 0, 0, 'Kraken', 'Trade', 4), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets zero credit amount', assetRecords, ledgerRecords, 'Kraken', usd, -1000, algo, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 10, '', 'Kraken', 'USD', '', 10, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 12, 0, ada, 10, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 10, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat base sell credit fee same as credit amount', assetRecords, ledgerRecords, 'Kraken', usd, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 10, '', 'Kraken', 'EUR', '', 12, 12, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 12, 0, ada, 10, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1, 12, 12, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell credit fee same as credit amount debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 10, '', 'Kraken', 'EUR', 1.2, 12, 12, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 12, 0, ada, 10, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 1.2, 12, 12, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell credit fee same as credit amount credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', 1.2, 10, '', 'Kraken', 'ADA', '', 12, 12, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 12, 0, algo, 10, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1, 12, 12, 'Kraken', 'Trade', 4),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), algo, 1.2, 10, 0, ada, 12, 12, 'Kraken', 'Trade', 4), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets credit fee same as credit amount debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 10, '', 'Kraken', 'ADA', 1.2, 12, 12, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 12, 0, algo, 10, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 12, 12, 'Kraken', 'Trade', 4),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), algo, 1.44, 10, 0, ada, 12, 12, 'Kraken', 'Trade', 4), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets credit fee same as credit amount credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -12, ada, lots, closedLots);
}

function processLedgerTradeZeroExRate() {

  QUnit.module('Process Ledger Trade Zero Ex Rate');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 0, 1200, 10, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy with fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1210, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy no fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 0, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell with fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 0, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell no fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, 10, 'Kraken', 'ADA', 0, 1000, 10, '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 0, 1200, 10, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy with fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1210, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Trade fiat buy no fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'EUR', 0, 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 0, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell with fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', 0, 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 0, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), eur, 0, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade fiat sell no fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, 10, 'Kraken', 'ALGO', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 0, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets with fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, '', 'Kraken', 'ALGO', '', 1200, '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 0, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets no fees zero debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'ALGO', 0, 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 0, 1200, 10, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets with fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'ALGO', 0, 1200, '', '', '')
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), algo, 0, 1200, 0, 'Kraken', 'Trade', 4)
  ];

  testProcessLedger('Trade exchange assets no fees zero credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);
}

function processLedgerIncome() {

  QUnit.module('Process Ledger Income');

  let ledgerRecords;
  let lots;
  let closedLots;
  let incomeLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let lmn = new Asset('LMN', 'Stock', false, 0, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), ada, 1.2, 1000, 0, ada, 1000, 0, 'Ledger', 'Income', 3)
  ];

  closedLots = [
  ];

  incomeLots = [
    new IncomeLot(new Date(2020, 3, 1), null, ada, 1.2, 1000, 'Ledger', 3)
  ];

  testProcessLedger('Income rewards', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots, incomeLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'EUR', 1.2, 1000, '', 'IB', '')
  ];

  incomeLots = [
    new IncomeLot(new Date(2020, 3, 1), null, eur, 1.2, 1000, 'IB', 3)
  ];

  testProcessLedger('Income fiat interest', assetRecords, ledgerRecords, 'IB', null, 0, null, null, null, incomeLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'USD', '', 1000, '', 'IB', '')
  ];

  incomeLots = [
    new IncomeLot(new Date(2020, 3, 1), null, usd, 1, 1000, 'IB', 3)
  ];

  testProcessLedger('Income fiat base interest', assetRecords, ledgerRecords, 'IB', null, 0, null, null, null, incomeLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 1000, '', 'IB', 'EUR', 1.2, 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'EUR', 1.2, 1000, '', 'IB', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 2000, 0, lmn, 1000, 0, 'IB', 'Trade', 3), new Date(2020, 3, 2), eur, 1.2, 2000, 0, 'IB', 'Trade', 4)
  ];

  incomeLots = [
    new IncomeLot(new Date(2020, 3, 3), lmn, eur, 1.2, 1000, 'IB', 5)
  ];

  testProcessLedger('Income fiat dividend', assetRecords, ledgerRecords, 'IB', eur, 1000, lmn, lots, closedLots, incomeLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 1000, '', 'IB', 'USD', '', 2000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Income', 'LMN', '', '', '', '', 'USD', '', 1000, '', 'IB', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 1000, 0, 'IB', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 2000, 0, 'IB', 'Trade', 4)
  ];

  incomeLots = [
    new IncomeLot(new Date(2020, 3, 3), lmn, usd, 1, 1000, 'IB', 5)
  ];

  testProcessLedger('Income fiat base dividend', assetRecords, ledgerRecords, 'IB', usd, 1000, lmn, lots, closedLots, incomeLots);
}

function processLedgerDonation() {

  QUnit.module('Process Ledger Donation');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 990, 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 990, 0, 'Kraken', 'Donation', 4)
  ];

  testProcessLedger('Donation with fee', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 1000, 0, 'Kraken', 'Donation', 4)
  ];

  testProcessLedger('Donation no fee', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots, null);
}

function processLedgerGift() {

  QUnit.module('Process Ledger Gift');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1010, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 1000, 0, 'Kraken', 'Gift', 4)
  ];

  testProcessLedger('Gift given with fee', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 1000, 0, 'Kraken', 'Gift', 4)
  ];

  testProcessLedger('Gift given no fee', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, 10, '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 10, ada, 1000, 0, 'Ledger', 'Gift', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Gift received with fees', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 1200, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 0, 'Ledger', 'Gift', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Gift received no fees', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'USD', '', 0, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 0, 0, ada, 1000, 0, 'Ledger', 'Gift', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Gift received zero debit amount', assetRecords, ledgerRecords, 'Ledger', null, 0, ada, lots, closedLots);
}

function processLedgerFee() {

  QUnit.module('Process Ledger Fee');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let eur = new Asset('EUR', 'Fiat', false, 2, 3);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'USD', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  testProcessLedger('Fee fiat base', assetRecords, ledgerRecords, 'Kraken', usd, -10);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'EUR', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  testProcessLedger('Fee fiat', assetRecords, ledgerRecords, 'Kraken', eur, -10);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1200, 0, ada, 1000, 10, 'Kraken', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Fee asset', assetRecords, ledgerRecords, 'Kraken', usd, -1200, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 12, 0, ada, 10, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Fee', 4),
  ];

  testProcessLedger('Fee fiat base buy fee asset to zero', assetRecords, ledgerRecords, 'Kraken', usd, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1.2, 12, 0, ada, 10, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Fee', 4),
  ];

  testProcessLedger('Fee fiat buy fee asset to zero debit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 12, '', 'Kraken', 'ADA', 1.2, 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), eur, 1, 12, 0, ada, 10, 10, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 0, 0, 'Kraken', 'Fee', 4),
  ];

  testProcessLedger('Fee fiat buy fee asset to zero credit exrate', assetRecords, ledgerRecords, 'Kraken', eur, -12, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 10, '', 'Kraken', 'ALGO', '', 12, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 10, 0, algo, 12, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.44, 10, 0, 'Kraken', 'Trade', 4),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), algo, 1.2, 12, 0, ada, 10, 10, 'Kraken', 'Trade', 4), new Date(2020, 3, 3), usd, 1, 0, 0, 'Kraken', 'Fee', 5),
  ];

  testProcessLedger('Fee asset exchange fee asset to zero debit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 10, '', 'Kraken', 'ALGO', '', 12, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 12, '', 'Kraken', 'ADA', 1.2, 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 10, 0, algo, 12, 0, 'Kraken', 'Trade', 3), new Date(2020, 3, 2), ada, 1.2, 10, 0, 'Kraken', 'Trade', 4),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), algo, 1, 12, 0, ada, 10, 10, 'Kraken', 'Trade', 4), new Date(2020, 3, 3), usd, 1, 0, 0, 'Kraken', 'Fee', 5),
  ];

  testProcessLedger('Fee asset exchange fee asset to zero credit exrate', assetRecords, ledgerRecords, 'Kraken', usd, -10, ada, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 200, '', 'Kraken', 'ADA', '', 110, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 400, '', 'Kraken', 'ADA', '', 210, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 600, '', 'Kraken', 'ADA', '', 310, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 800, '', 'Kraken', 'ADA', '', 410, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Trade', 'USD', '', 1000, '', 'Binance', 'ADA', '', 510, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 6), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 200, 0, ada, 110, 11, 'Kraken', 'Trade', 3),
    new Lot(new Date(2020, 3, 2), usd, 1, 400, 0, ada, 210, 12, 'Kraken', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 600, 0, ada, 310, 13, 'Kraken', 'Trade', 5),
    new Lot(new Date(2020, 3, 4), usd, 1, 800, 0, ada, 410, 14, 'Kraken', 'Trade', 6)
  ];

  closedLots = [
  ];

  testProcessLedger('Fee asset multi-lot multi-wallet with fees', assetRecords, ledgerRecords, 'Kraken', usd, -2000, ada, lots, closedLots);
}

function processLedgerSplit() {

  QUnit.module('Process Ledger Split');

  let ledgerRecords;
  let lots;
  let closedLots;

  let assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let usd = new Asset('USD', 'Fiat', true, 2, 2);
  let lmn = new Asset('LMN', 'Stock', false, 0, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 260, 10, 'IB', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Split reverse split no wallet with fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 2010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 750, '', 'IB', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1000, 0, lmn, 255, 5, 'IB', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Split reverse split with wallet with fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 4010, 10, 'IB', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Split forward split no wallet with fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 2010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', 'IB', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 1000, 0, lmn, 4005, 5, 'IB', 'Trade', 3)
  ];

  closedLots = [
  ];

  testProcessLedger('Split forward split with wallet with fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 1000, '', '', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 10, 10, 'IB', 'Trade', 3), new Date(2020, 3, 2), usd, 1, 0, 0, 'IB', 'Split', 4)
  ];

  testProcessLedger('Split reverse split to zero no wallet with fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 1000, '', 'IB', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 1000, 0, lmn, 0, 0, 'IB', 'Trade', 3), new Date(2020, 3, 3), usd, 1, 0, 0, 'IB', 'Split', 5)
  ];

  testProcessLedger('Split reverse split to zero with wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -2000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 4000, '', '', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 600, 0, 'IB', 'Trade', 3),
    new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 1200, 0, 'IB', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 1800, 0, 'IB', 'Trade', 5),
    new Lot(new Date(2020, 3, 4), usd, 1, 8000, 0, lmn, 2400, 0, 'IB', 'Trade', 6)
  ];

  closedLots = [
  ];

  testProcessLedger('Split reverse split multi-lot no wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -20000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 4000, '', 'IB', '', '', '', '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 333, 0, 'IB', 'Trade', 3),
    new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 667, 0, 'IB', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 1000, 0, 'IB', 'Trade', 5)
  ];

  closedLots = [
  ];

  testProcessLedger('Split reverse split multi-lot with wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -12000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', '', '', '', '', '', 'LMN', '', 10000, '', '', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 2000, 0, 'IB', 'Trade', 3),
    new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 4000, 0, 'IB', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 6000, 0, 'IB', 'Trade', 5),
    new Lot(new Date(2020, 3, 4), usd, 1, 8000, 0, lmn, 8000, 0, 'IB', 'Trade', 6)
  ];

  closedLots = [
  ];

  testProcessLedger('Split forward split multi-lot no wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -20000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', '', '', '', '', '', 'LMN', '', 10000, '', 'IB', '')
  ];

  lots = [
    new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 2667, 0, 'IB', 'Trade', 3),
    new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 5333, 0, 'IB', 'Trade', 4),
    new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 8000, 0, 'IB', 'Trade', 5)
  ];

  closedLots = [
  ];

  testProcessLedger('Split forward split multi-lot with wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -12000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 10000, '', '', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 0, 0, 'IB', 'Trade', 3), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 0, 0, 'IB', 'Trade', 4), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7),
    new ClosedLot(
      new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 0, 0, 'IB', 'Trade', 5), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7),
    new ClosedLot(
      new Lot(new Date(2020, 3, 4), usd, 1, 8000, 0, lmn, 0, 0, 'IB', 'Trade', 6), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7)
  ];

  testProcessLedger('Split reverse split to zero multi-lot no wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -20000, lmn, lots, closedLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'USD', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'USD', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'USD', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'USD', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 6000, '', 'IB', '', '', '', '', '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), usd, 1, 2000, 0, lmn, 0, 0, 'IB', 'Trade', 3), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7),
    new ClosedLot(
      new Lot(new Date(2020, 3, 2), usd, 1, 4000, 0, lmn, 0, 0, 'IB', 'Trade', 4), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7),
    new ClosedLot(
      new Lot(new Date(2020, 3, 3), usd, 1, 6000, 0, lmn, 0, 0, 'IB', 'Trade', 5), new Date(2020, 3, 5), usd, 1, 0, 0, 'IB', 'Split', 7)
  ];

  testProcessLedger('Split reverse split to zero multi-lot with wallet no fees', assetRecords, ledgerRecords, 'IB', usd, -12000, lmn, lots, closedLots);
}