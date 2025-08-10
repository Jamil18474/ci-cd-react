/**
 * @module validators.unit.test (backend)
 */

const {
  isAgeValidFromBirthDate,
  isPostalCodeValid,
  isNameValid,
  isEmailValid,
  isPasswordValid
} = require('../utils/validators');

describe('Validators Unit Test Suites (Backend)', () => {

  describe('isAgeValidFromBirthDate', () => {
    it('should return true for a birth date that makes the person 18 years old today', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should return true for a birth date that makes the person older than 18', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 20);
      expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should return false for a birth date that makes the person younger than 18', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 17);
      expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should return false for a birth date that makes the person younger than 18, but on the day before their birthday', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 18);
      birthDate.setDate(birthDate.getDate() + 1);
      expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should return true for valid dates', () => {
      expect(isAgeValidFromBirthDate('2000-12-02')).toBe(true);
      expect(isAgeValidFromBirthDate('2000-05-16')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isAgeValidFromBirthDate('invalid-date')).toBe(false);
      expect(isAgeValidFromBirthDate('')).toBe(false);
      expect(isAgeValidFromBirthDate(' ')).toBe(false);
      expect(isAgeValidFromBirthDate(null)).toBe(false);
      expect(isAgeValidFromBirthDate(undefined)).toBe(false);
    });
  });

  describe('isPostalCodeValid', () => {
    it('should return true for valid French postal codes', () => {
      expect(isPostalCodeValid('75001')).toBe(true);
      expect(isPostalCodeValid('01000')).toBe(true);
      expect(isPostalCodeValid('59000')).toBe(true);
      expect(isPostalCodeValid('97400')).toBe(true);
      expect(isPostalCodeValid('98700')).toBe(true);
      expect(isPostalCodeValid('20000')).toBe(true);
    });

    it('should return false for invalid French postal codes', () => {
      expect(isPostalCodeValid('abcd')).toBe(false);
      expect(isPostalCodeValid('7500A')).toBe(false);
      expect(isPostalCodeValid('00000')).toBe(false);
      expect(isPostalCodeValid('99999')).toBe(false);
      expect(isPostalCodeValid('1234')).toBe(false);
      expect(isPostalCodeValid('750010')).toBe(false);
      expect(isPostalCodeValid('')).toBe(false);
      expect(isPostalCodeValid(' ')).toBe(false);
      expect(isPostalCodeValid(null)).toBe(false);
      expect(isPostalCodeValid(undefined)).toBe(false);
      expect(isPostalCodeValid('75 001')).toBe(false);
    });
  });

  describe('isNameValid', () => {
    it('should return true for valid names', () => {
      expect(isNameValid('Marie Curie')).toBe(true);
      expect(isNameValid('Benoît')).toBe(true);
      expect(isNameValid('François')).toBe(true);
      expect(isNameValid('O\'Connor')).toBe(true);
      expect(isNameValid('Marie-Claire')).toBe(true);
      expect(isNameValid('Hélène')).toBe(true);
      expect(isNameValid('Zoë')).toBe(true);
      expect(isNameValid('Marseille')).toBe(true);
      expect(isNameValid('Le Havre')).toBe(true);
      expect(isNameValid('Saint-Raphaël')).toBe(true);
      expect(isNameValid('Châteney-Malabry')).toBe(true);
    });

    it('should return false for invalid names', () => {
      expect(isNameValid('Jean123')).toBe(false);
      expect(isNameValid('!@#$%')).toBe(false);
      expect(isNameValid('')).toBe(false);
      expect(isNameValid(' ')).toBe(false);
      expect(isNameValid(null)).toBe(false);
      expect(isNameValid(undefined)).toBe(false);
      expect(isNameValid('Lyon!')).toBe(false);
    });
  });

  describe('isEmailValid', () => {
    it('should return true for valid email addresses', () => {
      expect(isEmailValid('test@example.com')).toBe(true);
      expect(isEmailValid('test@gmail.com')).toBe(true);
      expect(isEmailValid('contact@service-client.fr')).toBe(true);
      expect(isEmailValid('user.name+tag+sorting@example.com')).toBe(true);
      expect(isEmailValid('support@service.org')).toBe(true);
      expect(isEmailValid('admin@mywebsite.fr')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
      expect(isEmailValid('plainaddress')).toBe(false);
      expect(isEmailValid('shortdomain.c')).toBe(false);
      expect(isEmailValid('@missingusername.com')).toBe(false);
      expect(isEmailValid('username@.com')).toBe(false);
      expect(isEmailValid('françois@gmail.com')).toBe(false);
      expect(isEmailValid('testwithspace @example.com')).toBe(false);
      expect(isEmailValid('username@domain.com!')).toBe(false);
      expect(isEmailValid('username@@domain.com')).toBe(false);
      expect(isEmailValid('username@domain..com')).toBe(false);
      expect(isEmailValid('username.domain.com')).toBe(false);
      expect(isEmailValid('')).toBe(false);
      expect(isEmailValid(' ')).toBe(false);
      expect(isEmailValid(null)).toBe(false);
      expect(isEmailValid(undefined)).toBe(false);
    });
  });

  describe('isPasswordValid', () => {
    it('should return true for valid passwords', () => {
      expect(isPasswordValid('123456')).toBe(true);
      expect(isPasswordValid('password')).toBe(true);
      expect(isPasswordValid('admin123')).toBe(true);
      expect(isPasswordValid('Test@123')).toBe(true);
      expect(isPasswordValid('MyPassword2024!')).toBe(true);
      expect(isPasswordValid('azerty')).toBe(true);
    });

    it('should return false for invalid passwords', () => {
      expect(isPasswordValid('12345')).toBe(false);
      expect(isPasswordValid('abc')).toBe(false);
      expect(isPasswordValid('')).toBe(false);
      expect(isPasswordValid(' ')).toBe(false);
      expect(isPasswordValid('     ')).toBe(false);
      expect(isPasswordValid(null)).toBe(false);
      expect(isPasswordValid(undefined)).toBe(false);
      expect(isPasswordValid('a')).toBe(false);
    });
  });

});