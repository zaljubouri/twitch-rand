import 'reflect-metadata';
import { IMock, It, Mock, Times } from 'typemoq';
import { IInternalState } from '../../../random/interfaces/IInternalState';
import { IPoolState } from '../../../random/interfaces/IPoolState';
import { RandomNumberGenerator } from '../../../random/RandomNumberGenerator';

describe('RandomNumberGenerator', () => {
  let _internalState: IMock<IInternalState>;
  let _poolState: IMock<IPoolState>;

  const _pools: bigint[] = Array(32).fill(0n);

  let _sut: RandomNumberGenerator;

  beforeEach(() => {
    _internalState = Mock.ofType<IInternalState>();
    _poolState = Mock.ofType<IPoolState>();

    _internalState.setup((x) => x.getReseedCounter()).returns(() => 1);

    _poolState.setup((x) => x.getPools()).returns(() => _pools);
    _poolState.setup((x) => x.getPoolToSeed()).returns(() => 0);
    _poolState.setup((x) => x.getPoolsForReseeding(1)).returns(() => [0]);

    _sut = new RandomNumberGenerator(_internalState.object, _poolState.object);
  });

  describe('#addToPool', () => {
    it('should not seed while first pool size is still under 256-bits', () => {
      _pools[0] = 5n;

      _sut.addToPool(3n);

      _poolState.verify((x) => x.addToPool(3n), Times.once());
      _poolState.verify((x) => x.getPoolToSeed(), Times.once());
      _poolState.verify((x) => x.getPools(), Times.once());
    });

    it('should seed while first pool size is over 256-bits', () => {
      _internalState.setup((x) => x.getState()).returns(() => 'UNSEEDED');
      _pools[0] = BigInt(Math.pow(2, 257));

      _sut.addToPool(3n);

      _poolState.verify((x) => x.addToPool(3n), Times.once());
      _poolState.verify((x) => x.getPoolToSeed(), Times.once());
      _poolState.verify((x) => x.getPools(), Times.once());
      _internalState.verify((x) => x.seed(3n), Times.once());
    });

    it('should reseed while first pool size is over 256-bits', () => {
      _internalState.setup((x) => x.getState()).returns(() => 'SEEDED');
      _pools[0] = BigInt(Math.pow(2, 257));

      _sut.addToPool(3n);

      _poolState.verify((x) => x.addToPool(3n), Times.once());
      _poolState.verify((x) => x.getPoolToSeed(), Times.once());
      _poolState.verify((x) => x.getPools(), Times.atLeast(3));
      _internalState.verify((x) => x.getReseedCounter(), Times.once());
      _poolState.verify((x) => x.getPoolsForReseeding(It.isAnyNumber()), Times.once());
    });
  });

  describe('#generateRandomNumber', () => {
    it('should return 0 if generator is unseeded', () => {
      _internalState.setup((x) => x.getState()).returns(() => 'UNSEEDED');

      const randomNumber = _sut.generateRandomNumber(1000);
      Number(randomNumber).should.equal(-1);
    });

    it('should reseed if should reseed counter is greater than reseed interval', () => {
      _internalState.setup((x) => x.getState()).returns(() => 'SEEDED');
      _internalState.setup((x) => x.getShouldReseedCounter()).returns(() => 2n ** 16n + 1n);
      _internalState.setup((x) => x.generate(It.isAnyNumber())).returns(() => 12345n);
      _pools[0] = BigInt(Math.pow(2, 257));

      _sut.generateRandomNumber();

      _poolState.verify((x) => x.getPools(), Times.atLeast(2));
      _internalState.verify((x) => x.getReseedCounter(), Times.once());
      _poolState.verify((x) => x.getPoolsForReseeding(It.isAnyNumber()), Times.once());
    });
  });
});
