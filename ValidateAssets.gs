function testValidateAssets(testName, assetRecords, validationError) {

  QUnit.test(testName, function (assert) {

    let error;
    let noErrorMessage = 'No error thrown.';

    assert.throws(
      function () { new AssetTracker().validateAssetRecords(assetRecords); throw new Error(noErrorMessage); },
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

function validateAssets() {

  QUnit.module('Validate Assets');

  let assetRecords;
  let validationError;

  assetRecords = [
    new AssetRecord('USD', 'Fiat', 2, 1, '', '', '')
  ];

  validationError = new ValidationError(`Fiat Base has not been declared in the Assets sheet. One asset must have asset type of 'Fiat Base'.`, 2, 'assetType');

  testValidateAssets('No fiat base', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('', 'Fiat Base', 2, 1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 2: Asset is missing.`, 2, 'ticker');

  testValidateAssets('No asset ticker', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('USD', 'Fiat', 2, 1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Duplicate entry for (USD). An asset can only be declared once`, 3, 'ticker');

  testValidateAssets('Duplicate asset', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('#', 'Stock', 0, '', '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Asset (#) format is invalid.\nInput must be 1-10 characters [A-Za-z0-9_$@].\nOptional prefix of 1-15 characters [A-Za-z0-9_] and colon [:].`, 3, 'ticker');

  testValidateAssets('Invalid asset format', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', '', 0, '', '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Asset type is missing.`, 3, 'assetType');

  testValidateAssets('No asset type', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('LMN', '#', 0, '', '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Asset type (#) format is invalid.\nInput must be between 1 and 20 characters [A-Za-z0-9_-].\nSpaces between characters allowed.`, 3, 'assetType');

  testValidateAssets('Invalid asset type format', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat Base', 2, 1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Fiat base has already been declared (USD). Only one asset can be fiat base.`, 3, 'assetType');

  testValidateAssets('Duplicate fiat base', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', '', 1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 2: Decimal places is missing.`, 2, 'decimalPlaces');

  testValidateAssets('No decimal places', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 9, 1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 2: Decimal places is not valid (integer between 0 and 8).`, 2, 'decimalPlaces');

  testValidateAssets('Invalid decimal places', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 2, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 2: Fiat base current price must be 1.`, 2, 'currentPrice');

  testValidateAssets('Fiat base current price not equal to 1', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, 'abc', '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Current price (abc) is not valid (number or blank).`, 3, 'currentPrice');

  testValidateAssets('Invalid current price', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, -1, '', '', '')
  ];

  validationError = new ValidationError(`Assets row 3: Current price must be greater than or equal to 0 (or blank).`, 3, 'currentPrice');

  testValidateAssets('Negative current price', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('DOGE', 'Crypto', 8, 0, '', '', '')
  ];

  validationError = null;

  testValidateAssets('Zero current price valid', assetRecords, validationError);

  assetRecords = [
    new AssetRecord('USD', 'Fiat Base', 2, 1, '', '', ''),
    new AssetRecord('EUR', 'Fiat', 2, '', '', 'InvalidAPI', '')
  ];

  validationError = new ValidationError(`Assets row 3: API (InvalidAPI) is not valid (CoinMarketCap, CryptoCompare) or blank.`, 3, 'apiName');

  testValidateAssets('Invalid API', assetRecords, validationError);
}