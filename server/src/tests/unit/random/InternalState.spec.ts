import 'reflect-metadata';
import 'chai/register-should';
import { InternalState } from '../../../random/InternalState';

describe('InternalState', () => {
  let _sut: InternalState;

  beforeEach(() => {
    _sut = new InternalState();
    _sut.seed(BigInt(Math.pow(2, 128)) | 4n);
  });

  describe('#seed', () => {
    it('should instantiate working state', () => {
      _sut
        .getValue()
        .toString()
        .should.equal(
          '2217266200496728714616965668720666307738314074234112011369130277542385992141250092091933830277788655241171109329841535674141774970880'
        );
      _sut
        .getConstant()
        .toString()
        .should.equal(
          '2073250805583903357026340969239111878875135477574076192968883292503890020052799384879100886063524666041227161336476467307853608124416'
        );
      _sut.getShouldReseedCounter().toString().should.equal('1');
    });
  });

  describe('#reseed', () => {
    it('should update working state with new entropy', () => {
      _sut.reseed(2n);
      _sut
        .getValue()
        .toString()
        .should.equal(
          '1030230934888182786585764593996681649037735071384251641749303610715392476743911969419414571949999998707039029149616356585353227796480'
        );
      _sut
        .getConstant()
        .toString()
        .should.equal(
          '1844506318761588669282425648923314687546182317975669977706308850534499154114282610244443866320703324946654936473436394462753241169920'
        );
      _sut.getShouldReseedCounter().toString().should.equal('1');
    });
  });

  describe('#generate', () => {
    it('should generate 256-bit number by default', () => {
      _sut.generate().toString(2).length.should.equal(256);
      _sut.getShouldReseedCounter().toString().should.equal('2');
    });

    it('should return 32-bit number if max is 32 bits', () => {
      _sut.generate(32).toString(2).length.should.equal(32);
      _sut.getShouldReseedCounter().toString().should.equal('2');
    });

    it('shouldReseedCounter should be 3 after two RN generations', () => {
      _sut.generate();
      _sut.generate();
      _sut.getShouldReseedCounter().toString().should.equal('3');
    });

    it('should return 0 if given output length is 0', () => {
      _sut.generate(0).toString().should.equal('-1');
      _sut.getShouldReseedCounter().toString().should.equal('1');
    });

    it('should return 0 if given output length is greater than 2^19', () => {
      _sut
        .generate(Math.pow(2, 19) + 1)
        .toString()
        .should.equal('-1');
      _sut.getShouldReseedCounter().toString().should.equal('1');
    });
  });
});
