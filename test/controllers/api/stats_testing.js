process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../../models/user');
let Entry = require('../../../models/entry');
let Device = require('../../../models/device');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../../app');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);

describe('stats routes', () => {

	// describe('GET /', () => {

	// });

	// describe('POST /add', () => {

	// });

	// describe('POST /edit/:domain', () => {

	// });

	// describe('DELETE /:domain', () => {

	// });

});