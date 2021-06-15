import 'reflect-metadata';
import 'chai/register-should';
import { Ioc } from '../../../Ioc';
import { IRandomNumberGenerator } from '../../../random/interfaces/IRandomNumberGenerator';
import { Symbols } from '../../../Symbols';

describe('RandomNumberGenerator', () => {
  let _sut: IRandomNumberGenerator;

  beforeEach(() => {
    const ioc = new Ioc().getInstance();

    _sut = ioc.get<IRandomNumberGenerator>(Symbols.RandomNumberGenerator);
  });

  describe('general', () => {
    it('should reseed counter be three after first pool is filled twice; first and second pools should be empty', () => {
      for (let i = 0; i < 64; i++) {
        _sut.addToPool(BigInt(Math.pow(2, 257)));
      }

      _sut.getInternalState().getReseedCounter().should.equal(3);
      Number(_sut.getPoolState().getPools()[0]).should.equal(0);
      Number(_sut.getPoolState().getPools()[1]).should.equal(0);
    });
  });

  describe('#generateRandomNumber', () => {
    it('should give 0 if first pool has less than 128-bits of entropy', () => {
      const randomNumber = _sut.generateRandomNumber(1000);

      randomNumber.should.not.be.null;
      Number(randomNumber).should.equal(-1);
    });

    it('should generate a random number', () => {
      _sut.addToPool(BigInt(Math.pow(2, 256)));
      const randomNumber = _sut.generateRandomNumber(100000);

      randomNumber.should.not.be.null;
      Number(randomNumber).should.not.be.equal(-1);
    });
  });

  describe('#addToPool', () => {
    it('should be unseeded while first pool has less than 128-bits of entropy', () => {
      _sut.addToPool(BigInt(Math.pow(2, 127)) - 1n);
      _sut.getInternalState().getState().should.equal('UNSEEDED');
    });

    it('should be seeded while first pool has more than 128-bits of entropy', () => {
      _sut.addToPool(BigInt(Math.pow(2, 256)));
      _sut.getInternalState().getState().should.equal('SEEDED');
    });
  });
});
