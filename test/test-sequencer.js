const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    const order = [
      'test/e2e/categories.e2e-spec.ts',
      'test/e2e/transactions.e2e-spec.ts',
    ];

    return tests.sort((a, b) => {
      const aIndex = order.indexOf(a.path);
      const bIndex = order.indexOf(b.path);

      if (aIndex === -1 || bIndex === -1) {
        return 1;
      }

      return aIndex - bIndex;
    });
  }
}

module.exports = CustomSequencer;