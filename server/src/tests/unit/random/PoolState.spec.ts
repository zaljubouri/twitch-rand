import 'reflect-metadata';
import { PoolState } from '../../../random/PoolState';

describe('PoolState', () => {
  let _sut: PoolState;

  beforeEach(() => {
    _sut = new PoolState();
  });

  describe('#getPoolsForReseeding', () => {
    it('if reseed count is 1, only return first pool', () => {
      _sut.getPoolsForReseeding(1).toString().should.equal('0');
    });

    it('if reseed count is 3, return first, second, and third pools', () => {
      _sut.getPoolsForReseeding(4).toString().should.equal('0,1,2');
    });

    it('if reseed count is 4,294,967,296, return all pools', () => {
      _sut
        .getPoolsForReseeding(4294967296)
        .toString()
        .should.equal(
          '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31'
        );
    });
  });

  describe('#addToPool', () => {
    it('first addition to pool should be to first pool', () => {
      _sut.getPoolToSeed().should.equal(0);

      _sut.addToPool(3n);
      _sut.getPoolToSeed().should.equal(1);

      _sut.getPools()[0].toString().should.equal('3');
    });

    it('second addition to pool should be to second pool', () => {
      _sut.getPoolToSeed().should.equal(0);

      _sut.addToPool(3n);
      _sut.getPoolToSeed().should.equal(1);

      _sut.addToPool(5n);
      _sut.getPoolToSeed().should.equal(2);

      _sut.getPools()[1].toString().should.equal('5');
    });

    it('after 32nd addition to pool, next addition should be to first pool', () => {
      _sut.getPoolToSeed().should.equal(0);

      for (let i = 0; i < 32; i++) {
        _sut.addToPool(3n);
        if (i < 31) _sut.getPoolToSeed().should.equal(i + 1);
      }

      _sut.getPoolToSeed().should.equal(0);
      _sut.addToPool(5n);
      _sut.getPoolToSeed().should.equal(1);

      _sut.getPools()[0].toString().should.equal('35');
    });
  });
});
