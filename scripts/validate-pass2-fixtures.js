"use strict";

var fs = require("fs");
var path = require("path");
var validation = require("../utils/pass2-validation.js");

var projectRoot = path.resolve(__dirname, "..");
var fixturesDir = path.join(projectRoot, "fixtures");

function getPass2FixtureFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter(function (name) {
      return /^pass2-ui\..+\.json$/i.test(name);
    })
    .sort();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function formatError(err) {
  return "- " + err.path + ": " + err.message;
}

function main() {
  var files = getPass2FixtureFiles(fixturesDir);

  if (files.length === 0) {
    console.error("No pass2 fixture files found in " + fixturesDir);
    process.exit(1);
  }

  var invalidCount = 0;

  files.forEach(function (name) {
    var filePath = path.join(fixturesDir, name);
    var payload;

    try {
      payload = readJson(filePath);
    } catch (error) {
      invalidCount += 1;
      console.error("FAIL " + name + " (JSON parse error)");
      console.error(String(error && error.message ? error.message : error));
      return;
    }

    var result = validation.validatePass2Payload(payload, { maxErrors: 25 });
    if (result.ok) {
      console.log("PASS " + name);
      return;
    }

    invalidCount += 1;
    console.error("FAIL " + name + " (" + result.errorCount + " errors)");
    result.errors.forEach(function (err) {
      console.error(formatError(err));
    });
  });

  if (invalidCount > 0) {
    console.error("");
    console.error("Fixture validation failed for " + invalidCount + " file(s).");
    process.exit(1);
  }

  console.log("");
  console.log("All pass2 fixtures are valid.");
}

main();

