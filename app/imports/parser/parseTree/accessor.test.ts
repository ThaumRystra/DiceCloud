import inputProviderForTests from '../../api/engine/action/functions/userInput/inputProviderForTests.testFn';
import { parse } from '/imports/parser/parser';
import resolve from '/imports/parser/resolve';
import toString from '/imports/parser/toString';
import { assert } from 'chai';

describe('Accessor Node', function () {
  it('compiles', async function () {
    const callNode = parse('unknownVariable + knownVariable + 1');
    const scope = {
      knownVariable: { value: 7 },
    };
    const { result, context } = await resolve(
      'compile', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(context.errors);
    assert.equal(
      toString(result),
      '8',
      'Unknown variables should be be substituted with zero during compilation step'
    );
  });
  it('reduces', async function () {
    const callNode = parse('unknownVariable + knownVariable + 1');
    const scope = {
      knownVariable: { value: 7 },
    };
    const { result, context } = await resolve(
      'reduce', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(context.errors);
    assert.equal(
      toString(result),
      '8',
      'All variables should be substituted during reduce step'
    );
  });
  it('marks undefined variables', async function () {
    const callNode = parse('unknownVariable');

    // At compile step
    const { result: compileResult, context: compileContext } = await resolve(
      'compile', callNode, undefined, undefined, inputProviderForTests
    );
    assert.isEmpty(compileContext.errors, 'compiling unknown variables should not have errors');
    assert.deepEqual(
      compileResult, { parseType: 'constant', value: 0, valueType: 'number', isUndefined: true },
      'Unknown variables should be zero and marked as inUndefined in compile step'
    );

    // At reduce step
    const { result: reduceResult, context: reduceContext } = await resolve(
      'reduce', callNode, undefined, undefined, inputProviderForTests
    );
    assert.isEmpty(reduceContext.errors, 'reducing unknown variables should not have errors');
    assert.deepEqual(
      reduceResult, { parseType: 'constant', value: 0, valueType: 'number', isUndefined: true },
      'Unknown variables should be marked as inUndefined in compile step'
    );
  });
  it('Does not mark isUndefined on known variables', async function () {
    const callNode = parse('knownVariable');
    const scope = {
      knownVariable: { value: 0 },
    };

    // At compile step
    const { result: compileResult, context: compileContext } = await resolve(
      'compile', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(compileContext.errors, 'compiling known variables should not have errors');
    assert.deepEqual(
      compileResult, { parseType: 'constant', value: 0, valueType: 'number' },
      'Known variables should not be marked as inUndefined in compile step'
    );

    // At reduce step
    const { result: reduceResult, context: reduceContext } = await resolve(
      'reduce', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(reduceContext.errors, 'reducing known variables should not have errors');
    assert.deepEqual(
      reduceResult, { parseType: 'constant', value: 0, valueType: 'number' },
      'Known variables should not be marked as inUndefined in compile step'
    );
  });
  it('handles .isUndefined on unknown variables', async function () {
    const callNode = parse('unknownVariable.isUndefined');
    const scope = {
      knownVariable: { value: 7 },
    };

    // At compile step
    const { result: compileResult, context: compileContext } = await resolve(
      'compile', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(compileContext.errors, 'compiling unknown variables should not have errors');
    assert.equal(
      toString(compileResult), 'true',
      'Unknown variables should be marked as inUndefined in compile step'
    );

    // At reduce step
    const { result: reduceResult, context: reduceContext } = await resolve(
      'reduce', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(reduceContext.errors, 'reducing unknown variables should not have errors');
    assert.equal(
      toString(reduceResult), 'true',
      'Unknown variables should be marked as inUndefined in reduce step'
    );
  });
  it('handles .isUndefined on known variables', async function () {
    const callNode = parse('knownVariable.isUndefined');
    const scope = {
      knownVariable: { value: 7 },
    };

    // At compile step
    const { result: compileResult, context: compileContext } = await resolve(
      'compile', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(compileContext.errors, 'compiling unknown variables should not have errors');
    assert.equal(
      toString(compileResult), 'false',
      'Unknown variables should not be marked as inUndefined in compile step'
    );

    // At reduce step
    const { result: reduceResult, context: reduceContext } = await resolve(
      'reduce', callNode, scope, undefined, inputProviderForTests
    );
    assert.isEmpty(reduceContext.errors, 'reducing unknown variables should not have errors');
    assert.equal(
      toString(reduceResult), 'false',
      'Known variables should not be marked as inUndefined in reduce step'
    );
  });
});
