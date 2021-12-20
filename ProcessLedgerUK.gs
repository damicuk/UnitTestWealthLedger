function testProcessLedgerUK(testName, assetRecords, ledgerRecords, asset, poolDeposits, closedPoolLots, locale = 'Europe/Paris') {

  QUnit.test(testName, function (assert) {

    let assetTracker = new AssetTracker();
    assetTracker.validateAssetRecords(assetRecords);
    assetTracker.processAssets(assetRecords);

    assetTracker.validateLedgerRecords(ledgerRecords, 'UK');
    assetTracker.processLedgerUK(ledgerRecords, locale);
    let assetPool = assetTracker.assetPools.get(asset.ticker);

    assert.equal(assetPool.poolDeposits.length, poolDeposits.length, 'Pool deposits length');
    assert.deepEqual(assetPool.poolDeposits, poolDeposits, 'Pool deposits');

    assert.equal(assetPool.closedPoolLots.length, closedPoolLots.length, 'Closed pool lots length');
    assert.deepEqual(assetPool.closedPoolLots, closedPoolLots, 'Closed pool lots');
  });
}

function testProcessLedgerUKError(testName, assetRecords, ledgerRecords, sampleError, locale = 'Europe/Paris') {

  QUnit.test(testName, function (assert) {

    let error;
    let noErrorMessage = 'No error thrown.';

    assert.throws(
      function () {
        let assetTracker = new AssetTracker();
        assetTracker.validateAssetRecords(assetRecords);
        assetTracker.processAssets(assetRecords);
        assetTracker.validateLedgerRecords(ledgerRecords, 'UK');
        assetTracker.processLedgerUK(ledgerRecords, locale);
        throw new Error(noErrorMessage);
      },
      function (e) { error = e; return true; },
      'Catch error'
    );

    if (sampleError) {

      assert.equal(error.message, sampleError.message, 'message');
    }
    else {

      assert.equal(error.message, noErrorMessage, 'no error');
    }
  });
}

function processLedgerUKError() {

  QUnit.module('Process Ledger UK Error');

  let assetRecords;
  let ledgerRecords;
  let sampleError;

  assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'GBP', '', 1200, '', '', ''),
  ];

  sampleError = new Error(`Insufficient funds: Attempted to withdraw ADA 1000 + fee 10 from balance of 0.`);

  testProcessLedgerUKError('Insufficient funds withdraw from zero balance', assetRecords, ledgerRecords, sampleError);

  assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1200, '', 'Kraken', 'GBP', '', 1200, '', '', ''),
  ];

  sampleError = new Error(`Insufficient funds: Attempted to withdraw ADA 200 + fee 0 from balance of 0.`);

  testProcessLedgerUKError('Insufficient funds withdraw from positive balance', assetRecords, ledgerRecords, sampleError);

  assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 2000, '', '', '', '', '', '', '', '')
  ];

  sampleError = new Error(`Insufficient funds: Attempted to subtract LMN 2000 from balance of LMN 0`);

  testProcessLedgerUKError('Insufficient funds split subtraction from zero balance', assetRecords, ledgerRecords, sampleError);

  assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 2000, '', '', '', '', '', '', '', '')
  ];

  sampleError = new Error(`Insufficient funds: Attempted to subtract LMN 2000 from balance of LMN 1000`);

  testProcessLedgerUKError('Insufficient funds split subtraction from positive balance', assetRecords, ledgerRecords, sampleError);
}

function processLedgerUKBasic() {

  QUnit.module('Process Ledger UK Basic');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);
  let lmn = new Asset('LMN', 'Stock', false, 0, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 3), gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Chronological order', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 3), gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Reverse chronological order', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Skip', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2400, 0, ada, 2000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Skip', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Stop', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 1200, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Stop', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2.005, 0.005, 'Kraken', 'ADA', '', 1.0000005, 0.1000005, '', ''),
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2.01, 0.01, ada, 1.000001, 0.100001, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Round deposit', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2380, 20, ada, 2020, 20, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade buy asset deposited merged', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 490, 10, 'Kraken', 'GBP', '', 610, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 600, 5, ada, 505, 5, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 600, 5, ada, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 490, 10, gbp, 610, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade sell asset withdrawn', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ALGO', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ALGO', 1.2, 490, 10, 'Kraken', 'ADA', '', 510, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 588, 12, ada, 510, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade exchange asset deposited', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', 1.2, 490, 10, 'Kraken', 'ALGO', '', 510, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 595, 5, ada, 505, 5, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 595, 5, ada, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 490, 10, gbp, 588, 11.53, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange asset with debit exrate withdrawn', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 490, 10, 'Kraken', 'ALGO', 1.2, 510, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 595, 5, ada, 505, 5, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 595, 5, ada, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 490, 10, gbp, 612, 12, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange asset with credit exrate withdrawn', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Donation', 'ADA', 1.2, 490, 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 595, 5, ada, 505, 5, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 595, 5, ada, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 490, 10, gbp, 588, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation withdrawn', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'ADA', 1.2, 490, 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 595, 5, ada, 505, 5, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 595, 5, ada, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 490, 10, gbp, 588, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given subtracted', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'GBP', '', 590, 10, '', 'ADA', '', 500, '', 'Kraken', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1780, 20, ada, 1510, 10, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Gift received deposited merged', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 10, '', 'Rewards', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1212, 0, ada, 1010, 0, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Income deposited merged', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1190, 10, ada, 1010, 20, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Fee added', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 10, 1, 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 10, 1, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee added zero balance removed', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Transfer', 'ADA', '', 990, 10, 'Kraken', '', '', '', '', 'Ledger', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1190, 10, ada, 1010, 20, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Transfer asset fee added', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1190, 10, lmn, 4010, 10, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split addition added', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 750, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1190, 10, lmn, 260, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split subtraction subtracted', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 1000, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1190, 10, lmn, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), lmn, 0, 0, gbp, 0, 0, 'Split')
    )
  ];

  testProcessLedgerUK('Split subtraction subtracted zero balance removed', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);
}

function processLedgerUKBasic2() {

  QUnit.module('Process Ledger UK Basic 2');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let lmn = new Asset('LMN', 'Stock', false, 0, 3);


  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1190, 10, lmn, 1010, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 980, 20, gbp, 1220, 20, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade two withdrawals same dates and actions consecutive merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1785, 15, 'IB', 'LMN', '', 1515, 15, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 1.2, 490, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1190, 10, lmn, 1010, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 980, 20, gbp, 1220, 20, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 595, 5, lmn, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 490, 10, gbp, 588, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Trade two withdrawals same dates and actions non consecutive merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 595, 5, lmn, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 490, 10, gbp, 610, 10, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 595, 5, lmn, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 3), lmn, 490, 10, gbp, 610, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade two withdrawals different dates same actions not merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 490, 10, 'IB', 'GBP', '', 610, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 1.2, 490, 10, 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 595, 5, lmn, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 490, 10, gbp, 610, 10, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 595, 5, lmn, 505, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 490, 10, gbp, 588, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Trade two withdrawals same dates different actions not merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);
}

function processLedgerUKRules() {

  QUnit.module('Process Ledger UK Rules');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let lmn = new Asset('LMN', 'Stock', false, 0, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Same day rule exact match', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 390, 10, 'IB', 'GBP', '', 1200, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1592, 8, lmn, 808, 8, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 195, 5, gbp, 600, 5, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 195, 5, gbp, 600, 5, 'Trade')
    )
  ];

  testProcessLedgerUK('Same day rule part match', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 90, 10, 'IB', 'GBP', '', 300, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2385, 15, lmn, 1115, 15, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 395, 5, lmn, 105, 5, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 90, 10, gbp, 300, 10, 'Trade')
    ),
  ];

  testProcessLedgerUK('Same day rule match part', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 4, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('30 day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 4, 3), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2382, 18, lmn, 1018, 18, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('31 days merged pool', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation same day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 4, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation 30 day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 3), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2382, 18, lmn, 1018, 18, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation 31 days merged pool', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given same day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 4, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given 30 day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 3), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2382, 18, lmn, 1018, 18, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given 31 days merged pool', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1194, 6, lmn, 606, 6, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 796, 4, lmn, 404, 4, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 380, 20, gbp, 1200, 20, 'Trade')
    )
  ];

  testProcessLedgerUK('Same day sell trades merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1194, 6, lmn, 606, 6, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Same day sell and donation trades not merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);
}

function processLedgerUKRulesAdvanced() {

  QUnit.module('Process Ledger UK Rules');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);
  let lmn = new Asset('LMN', 'Stock', false, 0, 4);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation same day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 4, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation 30 day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 3), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2382, 18, lmn, 1018, 18, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation 31 days merged pool', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given same day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1990, 10, lmn, 1010, 10, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 4, 2), gbp, 790, 10, lmn, 210, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given 30 day rule', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 4, 3), 'Trade', 'GBP', '', 790, 10, 'IB', "LMN", '', 210, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2382, 18, lmn, 1018, 18, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given 31 days merged pool', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1990, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'LMN', 3, 190, 10, 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1194, 6, lmn, 606, 6, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    ),
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 398, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 570, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Same day sell and donation trades not merged', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1590, 10, 'Kraken', 'ADA', '', 810, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 190, 10, 'Kraken', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'GBP', '', 800, 10, '', 'ADA', '', 200, '', 'Kraken', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1912, 16, ada, 808, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 478, 4, ada, 202, 2, null),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Gift received no same day rule', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1790, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 190, 10, 'Kraken', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Gift', 'GBP', '', 800, 10, '', 'ADA', '', 200, '', 'Kraken', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2232, 18, ada, 1008, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 358, 2, ada, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Gift received no 30 day rule', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1590, 10, 'Kraken', 'ADA', '', 810, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 190, 10, 'Kraken', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Income', '', '', '', '', '', 'ADA', 4, 200, '', 'Kraken', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1912, 8, ada, 808, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 478, 2, ada, 202, 2, null),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Income no same day rule', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1790, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 190, 10, 'Kraken', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 4, 2), 'Income', '', '', '', '', '', 'ADA', 4, 200, '', 'Kraken', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2232, 8, ada, 1008, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 358, 2, ada, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Income no 30 day rule', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKTrade() {

  QUnit.module('Process Ledger UK Trade');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 10, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat base buy with fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat base buy no fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1020, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'GBP', '', 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 10, ada, 1020, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1200, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell with fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 1200, 10, 'Kraken', 'ADA', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'ADA', '', 1485, 15, 'Kraken', 'GBP', '', 1800, 15, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1800, 15, ada, 1515, 15, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1800, 15, ada, 1515, 15, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 4), ada, 1485, 15, gbp, 1800, 15, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell multi-lot with fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell no fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1440, 12, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy with fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1440, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy no fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1212, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1200, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell with fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell no fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, 10, 'Kraken', 'ADA', 1.2, 1000, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 10, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy with fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 1.2, 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy no fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'EUR', 1.2, 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1440, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1440, 12, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell with fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', 1.2, 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1440, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1440, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell no fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, 10, 'Kraken', 'ALGO', '', 1200, 10, '', '')
  ];

  lots = [
  ];

  closedLots = [
    new ClosedLot(
      new Lot(new Date(2020, 3, 1), gbp, 1, 1200, 0, ada, 1010, 10, 'Kraken'), new Date(2020, 3, 2), algo, 1, 1200, 10, 'Kraken', 'Trade')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1200, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets with fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 1000, '', 'Kraken', 'ALGO', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets no fees debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'ALGO', 1.2, 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1440, 12, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets with fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'ALGO', 1.2, 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1440, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets no fees credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKTradeZeroAmount() {

  QUnit.module('Process Ledger UK Trade Zero Amount');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);
  let algo = new Asset('ALGO', 'Crypto', false, 8, 5);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat base buy zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 1200, 0, ada, 0, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 0, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base buy zero credit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ADA', '', 0, '', 'Kraken', 'GBP', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 0, 0, ada, 0, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 0, 0, gbp, 1200, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'GBP', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell zero credit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 0, 0, ada, 0, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), ada, 0, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat buy zero credit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1440, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'ALGO', '', 0, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade exchange assets zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, '', 'Kraken', 'ALGO', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 1000, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1000, 0, algo, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), algo, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets zero credit amount debit asset pool', assetRecords, ledgerRecords, algo, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1000, '', 'Kraken', 'ALGO', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 1000, '', 'Kraken', 'ADA', '', 0, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 0, 0, ada, 0, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets zero credit amount credit asset pool', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 10, '', 'Kraken', 'GBP', '', 10, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, ada, 10, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 10, 0, gbp, 10, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat base sell credit fee same as credit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 1.2, 10, '', 'Kraken', 'EUR', '', 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 14.4, 0, ada, 10, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 10, 0, gbp, 12, 12, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell credit fee same as credit amount debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 10, '', 'Kraken', 'EUR', 1.2, 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 14.4, 0, ada, 10, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 10, 0, gbp, 14.4, 14.4, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell credit fee same as credit amount credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', 1.2, 10, '', 'Kraken', 'ADA', '', 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, algo, 10, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), algo, 10, 0, gbp, 12, 12, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets credit fee same as credit amount debit exrate debit asset pool', assetRecords, ledgerRecords, algo, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', 1.2, 10, '', 'Kraken', 'ADA', '', 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 12, 0, ada, 12, 12, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets credit fee same as credit amount debit exrate credit asset pool', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 10, '', 'Kraken', 'ADA', 1.2, 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, algo, 10, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), algo, 10, 0, gbp, 14.4, 14.4, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets credit fee same as credit amount credit exrate debit asset pool', assetRecords, ledgerRecords, algo, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ALGO', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 10, '', 'Kraken', 'ADA', 1.2, 12, 12, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 2), gbp, 14.4, 0, ada, 12, 12, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets credit fee same as credit amount credit exrate credit asset pool', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKTradeZeroExRate() {

  QUnit.module('Process Ledger UK Trade Zero Ex Rate');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, 10, 'Kraken', 'ADA', '', 1000, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy with fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy no fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, 10, 'Kraken', 'EUR', '', 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 0, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell with fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, '', 'Kraken', 'EUR', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell no fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, 10, 'Kraken', 'ADA', 0, 1000, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy with fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 1200, '', 'Kraken', 'ADA', 0, 1000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Trade fiat buy no fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'EUR', 0, 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 0, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell with fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 0, 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'EUR', 0, 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade fiat sell no fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, 10, 'Kraken', 'ALGO', '', 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets with fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', 0, 1000, '', 'Kraken', 'ALGO', '', 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets no fees zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, 10, 'Kraken', 'ALGO', 0, 1200, 10, '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets with fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ADA', '', 1000, '', 'Kraken', 'ALGO', 0, 1200, '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 0, 0, 'Trade')
    )
  ];

  testProcessLedgerUK('Trade exchange assets no fees zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKIncome() {

  QUnit.module('Process Ledger UK Income');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Income', '', '', '', '', '', 'ADA', 1.2, 1000, '', 'Ledger', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Income')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Income rewards', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKDonation() {

  QUnit.module('Process Ledger UK Donation');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 990, 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 990, 10, gbp, 1188, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation with fee', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Donation', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Donation')
    )
  ];

  testProcessLedgerUK('Donation no fee', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKGift() {

  QUnit.module('Process Ledger UK Gift');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1010, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1010, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 10, gbp, 1200, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given with fee', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Gift', 'ADA', 1.2, 1000, '', 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 1000, 0, gbp, 1200, 0, 'Gift')
    )
  ];

  testProcessLedgerUK('Gift given no fee', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'GBP', '', 1200, 10, '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 10, ada, 1000, 0, 'Gift')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Gift received with fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'GBP', '', 1200, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 0, 'Gift')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Gift received no fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Gift', 'GBP', '', 0, '', '', 'ADA', '', 1000, '', 'Ledger', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 0, 0, ada, 1000, 0, 'Gift')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Gift received zero debit amount', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKFee() {

  QUnit.module('Process Ledger UK Fee');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', '', ''),
    new AssetRecord('ADA', 'Crypto', 6, '', '', '', ''),
    new AssetRecord('ALGO', 'Crypto', 8, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let ada = new Asset('ADA', 'Crypto', false, 6, 4);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1200, '', 'Kraken', 'ADA', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1200, 0, ada, 1000, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Fee asset', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee fiat base buy fee asset to zero', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 14.4, 0, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee fiat buy fee asset to zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'EUR', '', 12, '', 'Kraken', 'ADA', 1.2, 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee fiat buy fee asset to zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 10, '', 'Kraken', 'ALGO', '', 12, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', 1.2, 12, '', 'Kraken', 'ADA', '', 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 14.4, 0, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 3), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee asset exchange fee asset to zero debit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 10, '', 'Kraken', 'ALGO', '', 12, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'ALGO', '', 12, '', 'Kraken', 'ADA', 1.2, 10, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 12, 0, ada, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 3), ada, 0, 0, gbp, 0, 0, 'Fee')
    )
  ];

  testProcessLedgerUK('Fee asset exchange fee asset to zero credit exrate', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 200, '', 'Kraken', 'ADA', '', 110, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 400, '', 'Kraken', 'ADA', '', 210, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 600, '', 'Kraken', 'ADA', '', 310, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 800, '', 'Binance', 'ADA', '', 410, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 6), 'Fee', 'ADA', '', '', 10, 'Kraken', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, ada, 1040, 50, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Fee asset multi-lot multi-wallet with fees', assetRecords, ledgerRecords, ada, poolDeposits, closedPoolLots);
}

function processLedgerUKSplit() {

  QUnit.module('Process Ledger UK Split');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let lmn = new Asset('LMN', 'Stock', false, 0, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 750, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, lmn, 260, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split no wallet with fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 2010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 750, '', 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, lmn, 1260, 10, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split with wallet with fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, lmn, 4010, 10, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split forward split no wallet with fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 2010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', '', '', '', '', '', 'LMN', '', 3000, '', 'IB', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, lmn, 5010, 10, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split forward split with wallet with fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 1000, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 2000, 0, lmn, 10, 10, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 0, 0, gbp, 0, 0, 'Split')
    )
  ];

  testProcessLedgerUK('Split reverse split to zero no wallet with fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Transfer', 'LMN', '', 1000, '', 'IB', '', '', '', '', 'Fidelity', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 1000, '', 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 2000, 0, lmn, 1000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split to zero with wallet no fees (UK version not to zero)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 4000, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 20000, 0, lmn, 6000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split multi-lot no wallet no fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 4000, '', 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 20000, 0, lmn, 6000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split multi-lot with wallet no fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', '', '', '', '', '', 'LMN', '', 10000, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 20000, 0, lmn, 20000, 0, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split forward split multi-lot no wallet no fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', '', '', '', '', '', 'LMN', '', 10000, '', 'IB', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 20000, 0, lmn, 20000, 0, null)
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split forward split multi-lot with wallet no fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'IB', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 10000, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 20000, 0, lmn, 0, 0, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 5), lmn, 0, 0, gbp, 0, 0, 'Split')
    )
  ];

  testProcessLedgerUK('Split reverse split to zero multi-lot no wallet no fees', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 2000, '', 'IB', 'LMN', '', 1000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'GBP', '', 4000, '', 'IB', 'LMN', '', 2000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'GBP', '', 6000, '', 'IB', 'LMN', '', 3000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 4), 'Trade', 'GBP', '', 8000, '', 'Fidelity', 'LMN', '', 4000, 0, '', ''),
    new LedgerRecord(new Date(2020, 3, 5), 'Split', 'LMN', '', 6000, '', 'IB', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 20000, 0, lmn, 4000, 0, 'Trade')
  ];

  closedPoolLots = [
  ];

  testProcessLedgerUK('Split reverse split to zero multi-lot with wallet no fees (UK version not to zero)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);
}

function processLedgerUKSplitExecutionOrder() {

  QUnit.module('Process Ledger UK Split Execution Order');

  let ledgerRecords;
  let poolDeposits;
  let closedPoolLots;

  let assetRecords = [
    new AssetRecord('GBP', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', 'Stock', 0, '', '', '', '')
  ];

  let gbp = new Asset('GBP', 'Fiat', true, 2, 2);
  let lmn = new Asset('LMN', 'Stock', false, 0, 3);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', '', '', '', '', '', 'LMN', '', 800, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 1608, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition same day buy sell split - executes buy sell (same day rule) split (no same day rule)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', '', '', '', '', '', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 1808, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition same day buy split sell - executes buy sell (same day rule) split (no same day rule)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 800, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1057.78, 8.89, lmn, 1609, 9, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 132.22, 1.11, lmn, 201, 1, null),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition buy same day sell split - executes buy split (no same day rule, deposits before withdrawals) sell (withdrawal)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1071, 9, lmn, 1809, 9, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 119, 1, lmn, 201, 1, null),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition buy same day split sell - executes buy split (no same day rule, deposits before withdrawals) sell (withdrawal)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', '', '', '', '', '', 'LMN', '', 800, '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 1608, 8, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition consecutive days buy sell split - executes buy sell split (no 30 day rule)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', '', '', '', '', '', 'LMN', '', 1000, '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 1071, 9, lmn, 1809, 9, null)
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 119, 1, lmn, 201, 1, null),
      new PoolWithdrawal(new Date(2020, 3, 3), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split addition consecutive days buy split sell - executes buy split sell', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 400, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 408, 8, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction same day buy sell split - executes buy sell (same day rule) split (no same day rule)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Split', 'LMN', '', 500, '', '', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 308, 8, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(new Date(2020, 3, 1), gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 1), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction same day buy split sell - executes buy sell (same day rule) split (no same day rule)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 400, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 408, 8, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction buy same day sell split - executes buy sell (withdrawal) split (withdrawal - no merge)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 500, '', '', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 714, 6, lmn, 306, 6, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 476, 4, lmn, 204, 4, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction buy same day split sell - executes buy split (withdrawal - no merge) sell (withdrawal)', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Split', 'LMN', '', 400, '', '', '', '', '', '', '', '')
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 952, 8, lmn, 408, 8, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 238, 2, lmn, 202, 2, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 2), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction consecutive days buy sell split - executes buy sell split', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);

  ledgerRecords = [
    new LedgerRecord(new Date(2020, 3, 1), 'Trade', 'GBP', '', 1190, 10, 'IB', 'LMN', '', 1010, 10, '', ''),
    new LedgerRecord(new Date(2020, 3, 2), 'Split', 'LMN', '', 500, '', '', '', '', '', '', '', ''),
    new LedgerRecord(new Date(2020, 3, 3), 'Trade', 'LMN', '', 190, 10, 'IB', 'GBP', '', 600, 10, '', ''),
  ];

  poolDeposits = [
    new PoolDeposit(null, gbp, 714, 6, lmn, 306, 6, 'Trade')
  ];

  closedPoolLots = [
    new ClosedPoolLot(
      new PoolDeposit(null, gbp, 476, 4, lmn, 204, 4, 'Trade'),
      new PoolWithdrawal(new Date(2020, 3, 3), lmn, 190, 10, gbp, 600, 10, 'Trade')
    )
  ];

  testProcessLedgerUK('Split subtraction consecutive days buy split sell - executes buy split sell', assetRecords, ledgerRecords, lmn, poolDeposits, closedPoolLots);
}