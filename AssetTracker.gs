function testAssetTracker() {

  QUnit.module('Asset Tracker');

  QUnit.test('Sort', function (assert) {

    let AssetTracker = WealthLedger.AssetTracker;

    let list = ['Bananas', 'Apples', 'Dates', 'Cherries'];
    list.sort(AssetTracker.abcComparator);

    assert.equal(list[0], 'Apples', 'ABC comparator first item');
    assert.equal(list[3], 'Dates', 'ABC comparator last item ');


  });

  QUnit.test('Apportion Integer', function (assert) {

    let integerArray;
    let resultsArray;

    integerArray = [3];
    resultsArray = AssetTracker.apportionInteger(5, integerArray);

    assert.deepEqual(resultsArray, [5], 'Apportion integer single item');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = AssetTracker.apportionInteger(6, integerArray);

    assert.deepEqual(resultsArray, [1, 0, 2, 1, 2], 'Apportion integer no adjust');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = AssetTracker.apportionInteger(7, integerArray);

    assert.deepEqual(resultsArray, [1, 1, 2, 1, 2], 'Apportion integer adjust single add');

    integerArray = [3, 1, 5, 2, 4];
    resultsArray = AssetTracker.apportionInteger(23, integerArray);

    assert.deepEqual(resultsArray, [5, 1, 8, 3, 6], 'Apportion integer adjust single subtract');

    integerArray = [3, 18, 3, 3, 3, 3, 3];
    resultsArray = AssetTracker.apportionInteger(16, integerArray);

    assert.deepEqual(resultsArray, [2, 8, 2, 1, 1, 1, 1], 'Apportion integer adjust multiple add');

    integerArray = [3, 18, 3, 3, 3, 3, 3];
    resultsArray = AssetTracker.apportionInteger(20, integerArray);

    assert.deepEqual(resultsArray, [1, 10, 1, 2, 2, 2, 2], 'Apportion integer adjust multiple subtract');

    integerArray = [5, 0];
    resultsArray = AssetTracker.apportionInteger(4, integerArray);

    assert.deepEqual(resultsArray, [4, 0], 'Apportion integer integerArray with 0');

    integerArray = [0, 0];
    resultsArray = AssetTracker.apportionInteger(4, integerArray);

    assert.deepEqual(resultsArray, [2, 2], 'Apportion integer integerArray all 0');

    integerArray = [5, 0];
    resultsArray = AssetTracker.apportionInteger(0, integerArray);

    assert.deepEqual(resultsArray, [0, 0], 'Apportion integer 0 integerArray with 0');

    integerArray = [0, 0];
    resultsArray = AssetTracker.apportionInteger(0, integerArray);

    assert.deepEqual(resultsArray, [0, 0], 'Apportion integer 0 integerArray all 0');
  });
}