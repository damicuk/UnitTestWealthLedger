function testAssetTracker() {

  QUnit.module('Asset Tracker');

  QUnit.test('Sort', function (assert) {

    let AssetTracker = WealthLedger.AssetTracker;

    let list = ['Bananas', 'Apples', 'Dates', 'Cherries'];
    list.sort(AssetTracker.abcComparator);

    assert.equal(list[0], 'Apples', 'ABC comparator first item');
    assert.equal(list[3], 'Dates', 'ABC comparator last item ');


  });

  QUnit.test('Dates', function (assert) {

    let date1;
    let date2;
    let midnight1;
    let midnight2;
    let diffDays;

    date1 = new Date("2020-02-01T22:59:00Z"); //european winter time
    date2 = new Date("2020-02-01T23:01:00Z");
    midnight1 = AssetTracker.getMidnight(date1, 'Europe/Paris');
    midnight2 = AssetTracker.getMidnight(date2, 'Europe/Paris');
    diffDays = AssetTracker.diffDays(midnight1, midnight2);

    assert.equal(QUnit.equiv(midnight1, new Date("2020-01-31T23:00:00Z")), true, 'Get midnight - 1 min European Winter Time');
    assert.equal(QUnit.equiv(midnight2, new Date("2020-02-01T23:00:00Z")), true, 'Get midnight + 1 min European Winter Time');
    assert.equal(diffDays, 1, 'Diff days 1 European Winter Time');

    date1 = new Date("2020-05-01T21:59:00Z"); //european summer time
    date2 = new Date("2020-05-01T22:01:00Z");
    midnight1 = AssetTracker.getMidnight(date1, 'Europe/Paris');
    midnight2 = AssetTracker.getMidnight(date2, 'Europe/Paris');
    diffDays = AssetTracker.diffDays(midnight1, midnight2);

    assert.equal(QUnit.equiv(midnight1, new Date("2020-04-30T22:00:00Z")), true, 'Get midnight - 1 min European Summer Time');
    assert.equal(QUnit.equiv(midnight2, new Date("2020-05-01T22:00:00Z")), true, 'Get midnight + 1 min European Summer Time');
    assert.equal(diffDays, 1, 'Diff days 1 European Summer Time');

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