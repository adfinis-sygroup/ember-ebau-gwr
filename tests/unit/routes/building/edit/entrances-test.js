import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | building/edit/entrances', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:building/edit/entrances');
    assert.ok(route);
  });
});
