/*global QUnit*/

sap.ui.define([
	"comabp/spot-it/controller/IncidentCreate.controller"
], function (Controller) {
	"use strict";

	QUnit.module("IncidentCreate Controller");

	QUnit.test("I should test the IncidentCreate controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
