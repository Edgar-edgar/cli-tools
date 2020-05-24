var package_json = require('../package.json');
import { getStyleSheet } from './get.js'
let value_sets = require('./value_sets')
import { property_sets } from './property_sets.js'
import { class_sets } from './class_sets.js'
import { testSelector, testElement, testRootElement, testPropertyValue, testEvent, testMediaQueries } from './test.js'
import { download } from './download.js'

// Variable Section
var debug = true;

var greeting = '/*' + '\n';
greeting += 'ANIMAL LAGE NI?' + '\n';
greeting += 'CSSIST' + '\n';
greeting += 'version : ' + package_json.version + '\n';
greeting += 'date : ' + new Date() + '\n';
greeting += 'The following codes are automatically generated.' + '\n';
greeting += '*/\n\n\n';


var cssist_default = {
  version: package_json.version,
  csses:{
    success:[],
    fail:[]
  },
  selectors:{
    success:[],
    fail:[]
  },
  stylesheet:greeting,

  // Function Section
  download: download,
  testSelector: testSelector,
  testElement: testElement,
  testRootElement: testRootElement,
  testPropertyValue: testPropertyValue,
  testEvent: testEvent,
  testMediaQueries: testMediaQueries
};



// Initialize Section
export var initialize = function(){
  if(localStorage['cssist']) var cssist = JSON.parse(localStorage['cssist']);
  if(!debug && cssist && package_json && cssist.version == package_json.version){
    window.cssist = cssist;
    if(debug) console.log('[initialize] localStorage cssist', window.cssist);
  }
  else{
    window.cssist = cssist_default;
    if(debug) console.log('[initialize] new cssist', window.cssist);
  }

  var sheet = getStyleSheet(window.cssist.stylesheet);
  var csses = window.cssist.csses.success;
  for(var i=0; i<csses.length; i++){
    var css = csses[i];
    if(sheet.insertRule) {
      sheet.insertRule(css.code);
    } else {
      sheet.addRule(css.selector, css.rules);
    }
  }

  if(debug){
    window.value_sets = value_sets;
    window.property_sets = property_sets;
    window.class_sets = class_sets;
  }
};
