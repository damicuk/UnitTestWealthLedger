function testAsset() {

  QUnit.module('Asset RegExp');

  QUnit.test('Ticker', function (assert) {

    assert.equal(Asset.tickerRegExp.test('A'), true, 'Ticker A');
    assert.equal(Asset.tickerRegExp.test('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), true, 'Ticker ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    assert.equal(Asset.tickerRegExp.test(`A1 !"#$%&'()*+,-./:;<=>?@_`), true, `Ticker A1 !"#$%&'()*+,-./:;<=>?@_`);
    assert.equal(Asset.tickerRegExp.test('ABCDEFGHIJKLMNOPQRSTUVWXYZA'), false, 'Ticker ABCDEFGHIJKLMNOPQRSTUVWXYZA');
    assert.equal(Asset.tickerRegExp.test(' '), false, 'Ticker space');
    assert.equal(Asset.tickerRegExp.test(' ABC'), false, 'Ticker A A');
    assert.equal(Asset.tickerRegExp.test('ABC '), false, 'Ticker A-A');

  });

  QUnit.test('Asset Type', function (assert) {

    assert.equal(Asset.assetTypeRegExp.test('A'), true, 'Asset type A');
    assert.equal(Asset.assetTypeRegExp.test('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), true, 'Asset type ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    assert.equal(Asset.assetTypeRegExp.test(`A1 !"#$%&'()*+,-./:;<=>?@_`), true, `Asset type A1 !"#$%&'()*+,-./:;<=>?@_`);
    assert.equal(Asset.assetTypeRegExp.test('ABCDEFGHIJKLMNOPQRSTUVWXYZA'), false, 'Asset type ABCDEFGHIJKLMNOPQRSTUVWXYZA');
    assert.equal(Asset.assetTypeRegExp.test(' '), false, 'Asset type space');
    assert.equal(Asset.assetTypeRegExp.test(' ABC'), false, 'Asset type A space');
    assert.equal(Asset.assetTypeRegExp.test('ABC '), false, 'Asset type space A');

  });

  QUnit.test('Decimal Places', function (assert) {

    assert.equal(Asset.decimalPlacesRegExp.test('0'), true, 'Decimal places 0');
    assert.equal(Asset.decimalPlacesRegExp.test('1'), true, 'Decimal places 1');
    assert.equal(Asset.decimalPlacesRegExp.test('8'), true, 'Decimal places 8');
    assert.equal(Asset.decimalPlacesRegExp.test('9'), false, 'Decimal places 9');
    assert.equal(Asset.decimalPlacesRegExp.test('A'), false, 'Decimal places A');

  });
}