/**
 * @module validators.unit.test
 */

import {isAgeValidFromBirthDate, isPostalCodeValid, isNameValid, isEmailValid, isPasswordValid} from '../../validators/validators';

/**
 * Test suite for validators.
 * This suite contains unit tests for various validation functions.
 */
describe('Validators Unit Test Suites', () => {

    /**
     * Test suite for age validation from birthdate.
     * Tests the function isAgeValidFromBirthDate.
     */
    describe('isAgeValidFromBirthDate', () => {

        /**
         * Test case for a birthdate that makes the person 18 years old today.
         * @test
         */
        it('should return true for a birth date that makes the person 18 years old today', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 18); // 18 years old today
            expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(true);
        });

        /**
         * Test case for a birthdate that makes the person older than 18.
         * @test
         */
        it('should return true for a birth date that makes the person older than 18', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20); // 20 years old today
            expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(true);
        });

        /**
         * Test case for a birthdate that makes the person younger than 18.
         * @test
         */
        it('should return false for a birth date that makes the person younger than 18', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 17); // 17 years old today
            expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(false);
        });

        /**
         * Test case for a birthdate that makes the person younger than 18, but on the day before their birthday.
         * @test
         */
        it('should return false for a birth date that makes the person younger than 18, but on the day before their birthday', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 18); // 18 years old today
            birthDate.setDate(birthDate.getDate() + 1); // One day before the birthday
            expect(isAgeValidFromBirthDate(birthDate.toISOString().split('T')[0])).toBe(false); // 17 years old
        });

        /**
         * Test case for valid dates.
         * @test
         */
        it('should return true for valid dates', () => {
            expect(isAgeValidFromBirthDate('2000-12-02')).toBe(true); // true
            expect(isAgeValidFromBirthDate('2000-05-16')).toBe(true); // true
        });

        /**
         * Test case for invalid dates.
         * @test
         */
        it('should return false for invalid dates', () => {
            expect(isAgeValidFromBirthDate('invalid-date')).toBe(false);
            expect(isAgeValidFromBirthDate('')).toBe(false);
            expect(isAgeValidFromBirthDate(' ')).toBe(false);
            expect(isAgeValidFromBirthDate(null)).toBe(false);
            expect(isAgeValidFromBirthDate(undefined)).toBe(false);
        });

    });

    /**
     * Test suite for postal code validation.
     * @description Tests the function isPostalCodeValid.
     */
    describe('isPostalCodeValid Unit Test Suites', () => {

        /**
         * Test case for valid French postal codes.
         * @test
         */
        it('should return true for valid French postal codes', () => {
            expect(isPostalCodeValid('75001')).toBe(true); // Paris
            expect(isPostalCodeValid('01000')).toBe(true); // Bourg-en-Bresse
            expect(isPostalCodeValid('59000')).toBe(true); // Lille
            expect(isPostalCodeValid('97400')).toBe(true); // Saint-Denis (La Réunion)
            expect(isPostalCodeValid('98700')).toBe(true); // Tahiti
            expect(isPostalCodeValid('20000')).toBe(true); // Ajaccio (Corse)
        });

        /**
         * Test case for invalid French postal codes.
         * @test
         */
        it('should return false for invalid French postal codes', () => {
            expect(isPostalCodeValid('abcd')).toBe(false); // Non numérique
            expect(isPostalCodeValid('7500A')).toBe(false); // Contient une lettre
            expect(isPostalCodeValid('00000')).toBe(false); // Code postal non valide
            expect(isPostalCodeValid('99999')).toBe(false); // Code postal non valide
            expect(isPostalCodeValid('1234')).toBe(false); // Moins de 5 chiffres
            expect(isPostalCodeValid('750010')).toBe(false); // Plus de 5 chiffres
            expect(isPostalCodeValid('')).toBe(false); // Chaîne vide
            expect(isPostalCodeValid(' ')).toBe(false); // Espace
            expect(isPostalCodeValid(null)).toBe(false);
            expect(isPostalCodeValid(undefined)).toBe(false);
            expect(isPostalCodeValid('75 001')).toBe(false); // Espaces dans le code
        });
    });

    /**
     * Test suite for name validation.
     * @description Tests the function isNameValid.
     */
    describe('isNameValid Unit Test Suites', () => {

        /**
         * Test case for valid names.
         * @test
         */
        it('should return true for valid names', () => {
            expect(isNameValid('Marie Curie')).toBe(true);
            expect(isNameValid('Benoît')).toBe(true);
            expect(isNameValid('François')).toBe(true);
            expect(isNameValid("O'Connor")).toBe(true);
            expect(isNameValid('Marie-Claire')).toBe(true);
            expect(isNameValid('Hélène')).toBe(true);
            expect(isNameValid('Zoë')).toBe(true);
            expect(isNameValid('Marseille')).toBe(true);
            expect(isNameValid('Le Havre')).toBe(true);
            expect(isNameValid('Saint-Raphaël')).toBe(true);
            expect(isNameValid('Châteney-Malabry')).toBe(true);

        });

        /**
         * Test case for invalid names.
         * @test
         */
        it('should return false for invalid names', () => {
            expect(isNameValid('Jean123')).toBe(false);
            expect(isNameValid('!@#$%')).toBe(false);
            expect(isNameValid('')).toBe(false);
            expect(isNameValid(' ')).toBe(false);
            expect(isNameValid(null)).toBe(false);
            expect(isNameValid(undefined)).toBe(false);
            expect(isNameValid('Lyon!')).toBe(false); // Caractère spécial
        });
    });

    /**
     * Test suite for email validation.
     * @description Tests the function isEmailValid.
     */
    describe('isEmailValid Unit Test Suites', () => {
        /**
         * Test case for valid email addresses.
         * @test
         */
        it('should return true for valid email addresses', () => {
            expect(isEmailValid('test@example.com')).toBe(true);
            expect(isEmailValid('test@gmail.com')).toBe(true);
            expect(isEmailValid('contact@service-client.fr')).toBe(true);
            expect(isEmailValid('user.name+tag+sorting@example.com')).toBe(true);
            expect(isEmailValid('support@service.org')).toBe(true);
            expect(isEmailValid('admin@mywebsite.fr')).toBe(true);
        });

        /**
         * Test case for invalid email addresses.
         * @test
         */
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

    /**
     * Test suite for password validation.
     * @description Tests the function isPasswordValid.
     */
    describe('isPasswordValid Unit Test Suites', () => {

        /**
         * Test case for valid passwords.
         * @test
         */
        it('should return true for valid passwords', () => {
            expect(isPasswordValid('123456')).toBe(true); // Exactly 6 characters
            expect(isPasswordValid('password')).toBe(true); // More than 6 characters
            expect(isPasswordValid('admin123')).toBe(true); // Valid password
            expect(isPasswordValid('Test@123')).toBe(true); // Complex password
            expect(isPasswordValid('MyPassword2024!')).toBe(true); // Long complex password
            expect(isPasswordValid('azerty')).toBe(true); // Simple 6 character password
        });

        /**
         * Test case for invalid passwords.
         * @test
         */
        it('should return false for invalid passwords', () => {
            expect(isPasswordValid('12345')).toBe(false); // Less than 6 characters
            expect(isPasswordValid('abc')).toBe(false); // Too short
            expect(isPasswordValid('')).toBe(false); // Empty string
            expect(isPasswordValid(' ')).toBe(false); // Only space
            expect(isPasswordValid('     ')).toBe(false); // Only spaces
            expect(isPasswordValid(null)).toBe(false); // Null
            expect(isPasswordValid(undefined)).toBe(false); // Undefined
            expect(isPasswordValid('a')).toBe(false); // Single character
        });
    });

});

