'use strict'

const {
  assign,
  forEach,
  isArray,
  isObject,
  isPlainObject,
  unset,
  uniq
} = require('lodash')

class ServerlessMergeConfig {
  constructor(serverless, options) {
    this.serverless = serverless
    this.options = options

    this.hooks = {
      'before:package:initialize': this.mergeConfig.bind(this),
      'before:offline:start:init': this.mergeConfig.bind(this),
      'before:invoke:local:invoke': this.mergeConfig.bind(this)
    }
  }

  mergeConfig() {
    this.deepMerge(this.serverless.service)
  }

  deepMerge(obj, parent) {
    forEach(obj, (value, key, collection) => {
      if (isPlainObject(value) || isArray(value)) {
        this.deepMerge(value, obj)
      }
      if (key === '$<<') {
        if (isArray(value)) {
          value.forEach((subValue) => {
            if (parent && isArray(parent)) {
              parent.push(subValue);
            }
            else {
              this.assignValue(collection, subValue)
            }
          })
        } else {
          this.assignValue(collection, value)
        }
        unset(obj, key);
        // remove invalid values
        if (parent && isArray(parent)) {
          parent.forEach((value, key) => {
            if (!value || (isObject(value) && Object.keys(value).length === 0)) {
              parent.splice(key, 1);
            }
          });
          parent = uniq(parent);
        }
      }
    })
  }

  assignValue(collection, value) {
    if (isPlainObject(value)) {
      // Only merge objects
      assign(collection, value)
    }
  }
}

module.exports = ServerlessMergeConfig
