import { describe, it, expect } from 'vitest';
import { emphasize, clampPct } from './format';

describe('emphasize', () => {
  // wraps a single asterisk-delimited span in an em element
  it('wraps an asterisk span in em', () => {
    expect(emphasize('a *b* c')).toBe('a <em>b</em> c');
  });

  // leaves text with no asterisks unchanged
  it('passes through plain text', () => {
    expect(emphasize('no emphasis here')).toBe('no emphasis here');
  });

  // escapes HTML-significant characters so seed content cannot inject markup
  it('escapes angle brackets and ampersands', () => {
    expect(emphasize('a < b & c > d')).toBe('a &lt; b &amp; c &gt; d');
  });

  // converts more than one emphasis span in a single string
  it('wraps multiple spans', () => {
    expect(emphasize('*x* and *y*')).toBe('<em>x</em> and <em>y</em>');
  });

  // escaping runs before emphasis so injected tags cannot survive as live markup
  it('does not emit raw tags from an escaped span', () => {
    expect(emphasize('*<script>*')).toBe('<em>&lt;script&gt;</em>');
  });

  // the empty string maps to the empty string
  it('handles the empty string', () => {
    expect(emphasize('')).toBe('');
  });
});

describe('clampPct', () => {
  // values inside the range pass through unchanged
  it('returns an in-range value unchanged', () => {
    expect(clampPct(62)).toBe(62);
  });

  // negative values clamp up to zero
  it('clamps a negative value to zero', () => {
    expect(clampPct(-10)).toBe(0);
  });

  // values above one hundred clamp down to one hundred
  it('clamps an over-max value to one hundred', () => {
    expect(clampPct(140)).toBe(100);
  });

  // NaN degrades to zero rather than propagating
  it('returns zero for NaN', () => {
    expect(clampPct(Number.NaN)).toBe(0);
  });

  // the range boundaries themselves are preserved
  it('preserves the zero and hundred boundaries', () => {
    expect(clampPct(0)).toBe(0);
    expect(clampPct(100)).toBe(100);
  });
});
