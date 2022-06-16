// The title used at the top of the web app
const MAIN_TEST_TITLE_ = 'WealthLedger Test';

const TESTS_ = [

  // validateAssets,
  // validateLedgerGeneral,
  // validateLedgerTransfer,
  // validateLedgerTrade,
  // validateLedgerIncome,
  // validateLedgerDonation,
  // validateLedgerGift,
  // validateLedgerFee,
  // validateLedgerSplit,

  // processLedgerAssetAccountError,
  // processLedgerBasic,
  // processLedgerTransfer,
  // processLedgerTrade,
  // processLedgerTradeZeroAmount,
  // processLedgerTradeZeroExRate,
  // processLedgerIncome,
  // processLedgerDonation,
  // processLedgerGift,
  // processLedgerFee,
  // processLedgerSplit,

  // testAssetTracker,
  // testAsset,

];

const QUnit = QUnitGS2.QUnit;

/**
 * The doGet is the main function that displays the QUnit test web app once it
 * is deployed.
 *
 * It processes the GET from the user's browser and returns the 
 * a HTML template that is populated once the tests are complete
 *
 * Its main purpose is to call the QUnitLib methods:
 * 
 *  - QUnitGS2.init() - Initialize the Apps Script wrapper of the main QUnit library
 *
 *  - TESTS_ - An array of test functions to run, that themselves include calls to QUnit tests
 *
 *  - QUnit.start() - Start the tests running
 *
 *  - QUnitGS2.getHtml() - Return the HTML version of the tests results to
 *                        the web app
 */

function doGet() {

  QUnitGS2.init()

  QUnit.config.title = MAIN_TEST_TITLE_

  TESTS_.forEach((testFunction) => {
    testFunction()
  })

  QUnit.start()

  return QUnitGS2.getHtml()
}

/**
 * The library user has to provide this function to allow the QUnit library
 * to retrieve the test results once they are finished. 
 *
 * The library will then format the results and display them in the web app
 */

function getResultsFromServer() {
  return QUnitGS2.getResultsFromServer()
}