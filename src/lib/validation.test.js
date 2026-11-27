import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ValidationError,
  validateCredentials,
  validateDocumentRecord,
  validateEventRecord,
  validateProfileInput,
  validateSearchTerm,
  validateSignupInput
} from './validation.js';
import { EVENTS } from '../data/catalogSeed.js';

test('credentials normalize email and reject malformed input', () => {
  assert.deepEqual(validateCredentials('  TEST@EXAMPLE.COM ', 'abc'), {
    email: 'test@example.com',
    password: 'abc'
  });
  assert.throws(() => validateCredentials('not-an-email', 'password'), ValidationError);
  assert.throws(() => validateCredentials('valid@example.com', ''), ValidationError);
});

test('signup enforces Firebase password length and bounded names', () => {
  assert.equal(validateSignupInput(' Ana Silva ', 'ANA@example.com', 'secret1').name, 'Ana Silva');
  assert.throws(() => validateSignupInput('Ana Silva', 'ana@example.com', '12345'), /6 e 128/);
  assert.throws(() => validateSignupInput('A', 'ana@example.com', 'secret1'), /nome/);
});

test('profile validation rejects malformed preferences and deduplicates interests', () => {
  const profile = validateProfileInput({
    name: ' Ana Silva ',
    email: ' ANA@EXAMPLE.COM ',
    course: 'Ciência da Computação',
    interests: ['IA', ' IA '],
    notificationsEmail: true,
    notificationsDocAlerts: false
  });
  assert.deepEqual(profile.interests, ['IA']);
  assert.equal(profile.email, 'ana@example.com');
  assert.throws(() => validateProfileInput({ ...profile, interests: 'IA' }), ValidationError);
});

test('search terms are normalized and bounded', () => {
  assert.equal(validateSearchTerm('  inteligência   artificial '), 'inteligência artificial');
  assert.throws(() => validateSearchTerm('x'.repeat(201)), /200 caracteres/);
  assert.throws(() => validateSearchTerm({}), ValidationError);
});

test('catalog validators reject invalid external links and incomplete records', () => {
  assert.throws(() => validateEventRecord({
    title: 'Evento',
    place: 'Campus',
    tag: 'Unifor',
    startDate: '2026-11-23',
    url: 'javascript:alert(1)'
  }), /URL/);
  assert.throws(() => validateDocumentRecord({
    title: 'Artigo',
    type: 'article',
    author: 'Autora',
    year: 2026,
    area: 'Saúde',
    source: 'Revista',
    url: 'https://example.com'
  }), /índice de busca/);
});

test('sample catalog events have valid dates and remain visible in the agenda', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.ok(EVENTS.length > 0);
  for (const event of EVENTS) {
    assert.doesNotThrow(() => validateEventRecord(event));
    assert.ok(event.startDate >= today, `${event.title} should not be in the past`);
  }
});
