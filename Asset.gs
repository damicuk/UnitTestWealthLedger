function testAsset() {

  QUnit.module('Asset RegExp');

  QUnit.test('Ticker', function (assert) {

    assert.equal(Asset.tickerRegExp.test('A'), true, 'Ticker A');
    assert.equal(Asset.tickerRegExp.test('AAAAAAAAAAAAAAAAAAAAAAAAAA'), true, 'Ticker AAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(Asset.tickerRegExp.test('#'), true, 'Ticker #');
    assert.equal(Asset.tickerRegExp.test('$'), true, 'Ticker $');
    assert.equal(Asset.tickerRegExp.test('/'), true, 'Ticker /');
    assert.equal(Asset.tickerRegExp.test(':'), true, 'Ticker :');
    assert.equal(Asset.tickerRegExp.test('@'), true, 'Ticker @');
    assert.equal(Asset.tickerRegExp.test('AAAAAAAAAAAAAAAAAAAAAAAAAAA'), false, 'Ticker AAAAAAAAAAAAAAAAAAAAAAAAAAA');
    assert.equal(Asset.tickerRegExp.test(' '), false, 'Ticker space');
    assert.equal(Asset.tickerRegExp.test('A A'), false, 'Ticker A A');
    assert.equal(Asset.tickerRegExp.test('A-A'), false, 'Ticker A-A');
  });

  QUnit.test('Asset Type', function (assert) {

    assert.equal(Asset.assetTypeRegExp.test('A'), true, 'Asset type A');
    assert.equal(Asset.assetTypeRegExp.test('AAAAAAAAAAAAAAAAAAAA'), true, 'Asset type AAAAAAAAAAAAAAAAAAAA');
    assert.equal(Asset.assetTypeRegExp.test('A A'), true, 'Asset type A A');
    assert.equal(Asset.assetTypeRegExp.test('A-A'), true, 'Asset type A-A');
    assert.equal(Asset.assetTypeRegExp.test('A-'), true, 'Asset type A-');
    assert.equal(Asset.assetTypeRegExp.test('-A'), true, 'Asset type -A');
    assert.equal(Asset.assetTypeRegExp.test('-'), true, 'Asset type -');
    assert.equal(Asset.assetTypeRegExp.test('AAAAAAAAAAAAAAAAAAAAA'), false, 'Asset type AAAAAAAAAAAAAAAAAAAAA');
    assert.equal(Asset.assetTypeRegExp.test(' '), false, 'Asset type space');
    assert.equal(Asset.assetTypeRegExp.test('A '), false, 'Asset type A space');
    assert.equal(Asset.assetTypeRegExp.test(' A'), false, 'Asset type space A');
    assert.equal(Asset.assetTypeRegExp.test('A$A'), false, 'Asset type A$A');
    assert.equal(Asset.assetTypeRegExp.test('A@A'), false, 'Asset type A@A');
    assert.equal(Asset.assetTypeRegExp.test('A#A'), false, 'Asset type A#A');
    assert.equal(Asset.assetTypeRegExp.test('A$'), false, 'Asset type A$');
    assert.equal(Asset.assetTypeRegExp.test('A@'), false, 'Asset type A@');
    assert.equal(Asset.assetTypeRegExp.test('A#'), false, 'Asset type A#');
    assert.equal(Asset.assetTypeRegExp.test('$A'), false, 'Asset type $A');
    assert.equal(Asset.assetTypeRegExp.test('@A'), false, 'Asset type @A');
    assert.equal(Asset.assetTypeRegExp.test('#A'), false, 'Asset type #A');
    assert.equal(Asset.assetTypeRegExp.test('$'), false, 'Asset type $');
    assert.equal(Asset.assetTypeRegExp.test('@'), false, 'Asset type @');
    assert.equal(Asset.assetTypeRegExp.test('#'), false, 'Asset type #');

  });

  QUnit.test('Decimal Places', function (assert) {

    assert.equal(Asset.decimalPlacesRegExp.test('0'), true, 'Decimal places 0');
    assert.equal(Asset.decimalPlacesRegExp.test('1'), true, 'Decimal places 1');
    assert.equal(Asset.decimalPlacesRegExp.test('8'), true, 'Decimal places 8');
    assert.equal(Asset.decimalPlacesRegExp.test('9'), false, 'Decimal places 9');
    assert.equal(Asset.decimalPlacesRegExp.test('A'), false, 'Decimal places A');

  });
}