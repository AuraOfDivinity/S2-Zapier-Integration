const {
  config: authentication,
  befores = [],
  afters = [],
} = require("./authentication");
const newActionTrigger = require("./triggers/new_action");
const newObjectiveTrigger = require("./triggers/new_objective");

module.exports = {
  // This is just shorthand to reference the installed dependencies you have.
  // Zapier will need to know these before we can upload.
  version: require("./package.json").version,
  platformVersion: require("zapier-platform-core").version,

  authentication,

  beforeRequest: [...befores],

  afterResponse: [...afters],

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [newActionTrigger.key]: newActionTrigger,
    [newObjectiveTrigger.key]: newObjectiveTrigger,
  },

  // If you want your searches to show up, you better include it here!
  searches: {},

  // If you want your creates to show up, you better include it here!
  creates: {},

  resources: {},
};
