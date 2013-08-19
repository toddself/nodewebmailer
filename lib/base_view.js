'use strict';

var Backbone = require('backbone');
var $ = require('jquery');
var handlebars = require('handlebars');
var extend = require('xtend');
var noop = function () {};

// this feels wrong, but cheerio doesn't have an `.on` nor .`off` so
// we'll provide them so the view instantiation works server-side
if (typeof $.prototype.off !== 'function') {
  $.prototype.off = noop;
}
if (typeof $.prototype.on !== 'function') {
  $.prototype.on = noop;
}

// Since we've got no global scope make sure backbone gets our $
Backbone.$ = $;

var BaseView = Backbone.View.extend({
  tmplFn: null,
  childrenViews: [],
  parentView: null,
  _dirtiedData: false,
  extendContext: {},

  /**
   * Alters the constructor of the view so we can still define unique
   * `initialize` method on our extended views. We call the View.apply
   * first so that we can get access to the `this.options` hash so we
   * can attach listeners to the model/collection
   *
   * No, seriously.
   * http://backbonejs.org/docs/backbone.html#section-191
   * @method constructor
   * @private
   * @return {Undefined} Undefined
   */
  constructor: function (options) {
    Backbone.View.call(this, options);
    this.listenTo(this, 'child:close', this.close);
    this.listenTo(this, 'view-closing', this.dereferenceChild);

    if (this.model) {
      this.listenTo(this.model, 'change', this.dirtyData);
    } else if (this.collection) {
      this.listenTo(this.collection, 'add', this.dirtyData);
      this.listenTo(this.collection, 'reset', this.dirtyData);
      this.listenTo(this.collection, 'remove', this.dirtyData);
    }
  },

  /**
   * Sets the dirty flag on the data which explains to the render method
   * to re-render the template even if it's already rendered. Also triggers
   * the `data-dirtied` event on the object
   * @method dirtyData
   * @return {Undefined} Undefined
   */
  dirtyData: function () {
    this._dirtiedData = true;
    this.trigger('data-dirtied');
  },

  /**
   * Resets the dirty flag to false so the render method won't re-render
   * itself if there is already html in the `$el` object. Also triggers
   * the `data-cleaned` flag
   * @method cleanData
   * @return {[Undefined} Undefined
   */
  cleanData: function () {
    this._dirtiedData = false;
    this.trigger('data-cleaned');
  },

  /**
   * Sets up the template for a given template
   * @method setTemplate
   * @param  {Mixed} template_data Either a function which returns the template
   *                               or a string which is the contents of a template
   * @return {Undefined}           Undefined
   */
  setTemplate: function (template_data) {
    if (typeof template_data !== 'function') {
      throw new Error('You must provide compiled template');
    }
    this.tmplFn = template_data;
  },

  /**
   * Returns the locally pre-compiled template function, or if the template is
   * a string, compiles it, sets the local instance and returns it back.
   * @method getTemplateFn
   * @return {Function} Compiled handlebars template instance
   */
  getTemplateFn: function () {
    if (typeof this.tmplFn !== 'function') {
      throw new Error('You must provide a compiled handlerbars template.');
    }
    return this.tmplFn;
  },

  /**
   * Instantiates a child view and attaches it to the parent
   * @method attachChild
   * @param  {Object} View        The view to instantiate
   * @param  {Object} Model       A model of data for the view
   * @param  {String} [$selector] The selector to which the view should be attached
   * @param  {Object} [options]   A key-pair list of options to additionally pass-in
   * @return {Undefined}          Undefined
   */
  attachChild: function (View, Model, $selector, options) {
    $selector.append(this._generateChildView(View, Model, $selector, options));
  },

  /**
   * Instantiates a child view and returns the HTML
   * @method attachChild
   * @param  {Object} View        The view to instantiate
   * @param  {Object} Model       A model or a collection of data for the view
   * @param  {String} [$selector] The selector to which the view should be attached
   * @param  {Object} [options]   A key-pair list of options to additionally pass-in
   * @return {String}             The HTML representation of the view
   */
  _generateChildView: function (View, Model, $selector, options) {
    var dataType = {};
    var el;

    if (Model instanceof Backbone.Model) {
      dataType.model = Model;
    } else {
      dataType.collection = Model;
    }

    if (typeof options === 'undefined') {
      options = {};
    }

    if (typeof $selector === 'undefined') {
      $selector = this.$el;
    } else if (typeof $selector === 'string') {
      $selector = this.$($selector);
    }

    var viewOptions = extend(options, dataType);
    var view = new View(viewOptions);
    return view.render().el;
  },

  /**
   * Instantiates child views and attaches them to the parent
   * @method attachChild
   * @param  {Object} View        The view to instantiate
   * @param  {Object} Collection  A collection of data for the view
   * @param  {String} [$selector] The selector to which the view should be attached
   * @param  {Object} [options]   A key-pair list of options to additionally pass-in
   * @return {Undefined}          Undefined
   */
  attachChildren: function (View, Collection, $selector, options) {
    var els;
    Collection.each(function (model) {
      els.push(this._generateChildView(View, model, $selector));
    }, this);
    $selector.html(els.join(''));
  },

  /**
   * Stub method for overwriting. Allows the parent view to do something when
   * a child view has closed itself.
   * @method dereferenceChild
   * @param  {String} child_id The #id of the view
   * @return {Undefed}         Undefined
   */
  dereferenceChild: function (child_id) {},

  /**
   * Returns the context for the template function that allows the view to be
   * rendered. Allows you to extend the model data with additional fields if
   * neeeded
   * @method serializeData
   * @param  {Object}  data  Data to either override or extend
   * @param  {Boolean} merge Whether or not to extend this.model with passed in data
   * @return {Object}        Object to be passed into the template function
   */
  serializeData: function (data, merge) {
    if (typeof data === 'undefined') {
      if (this.model) {
        data = this.model.toJSON();
      } else if (this.collection) {
        data = this.collection.toJSON();
      } else {
        data = {};
      }
    } else {
      if (typeof merge !== 'undefined')
        if (this.model) {
          data = extend(this.model.toJSON(), data);
        } else if (this.collection) {
        data = extend(this.collection.toJSON(), data);
      }
    }
    return data;
  },

  /**
   * Should be called when the view is unattached from the DOM. Notifies its
   * parent it is closing and tells children views to close themselves (if present)
   *
   * Calls `Backbone.View.remove` to handle event unbinding.
   *
   * @method close
   * @return {Undefined} Undefined
   */
  close: function () {
    if (this.childrenViews.length > 0) {
      this.childrenViews.forEach(function (cv) {
        cv.trigger('child:close');
      });
    }

    if (this.parentView !== null) {
      this.parentView.trigger('view-closing', this.id);
    }

    this.remove();
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _preClientRender: function () {
    if (typeof this.preClientRender === 'function') {
      this.preClientRender();
    }
    this.trigger('pre-client-ender');
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _postClientRender: function () {
    if (typeof this.postClientRender === 'function') {
      this.postClientRender();
    }
    this.trigger('post-client-render');
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _preServerRender: function () {
    if (typeof this.preServerRender === 'function') {
      this.preServerRender();
    }
    this.trigger('pre-server-render');
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _postServerRender: function () {
    if (typeof this.postServerRender === 'function') {
      this.postServerRender();
    }
    this.trigger('post-server-render');
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _preRender: function () {
    if (typeof this.preRender === 'function') {
      this.preRender();
    }
    this.trigger('pre-render');
  },

  /**
   * pre/post render methods for particular contexts
   * @private
   * @return {[type]} [description]
   */
  _postRender: function () {
    if (typeof this.postRender === 'function') {
      this.postRender();
    }
    this.trigger('post-render');
  },
  /**
   * Determines if the element was already rendered (like on the server)
   * We determine this by looking to see if `this.$el` has any elements in it
   * prior to actually attaching our template to the DOM. Since attaching the
   * template uses `.html()` it will wholesale replace any existing contents
   * so the presence of HTML within the element is a valid test
   * @method _elementRendered
   * @private
   * @return {Boolean} If the element was rendered or not
   */
  _elementRendered: function () {
    if (this.$el.html() === '') {
      return false;
    } else {
      return true;
    }
  },

  _getHTML: function () {
    if (process.browser) {
      return this.$el[0];
    } else {
      return this.$el.html();
    }
  },

  /**
   * Default render instance; gets template, serializes data and attaches
   * the rendered element to the cached `this.$el` reference.
   * @param  {Object} data   Object to be passed into serializeData
   * @param  {Boolean} merge Extend or override local model data
   * @return {Object}        Returns `this` for chaining.
   */
  render: function (data, merge) {
    var el;
    var serializedData;
    var elList = [];


    if (Object.keys(this.extendContext).length > 0) {
      if (typeof data === 'undefined') {
        data = {};
      }
      data = extend(this.extendContext, data);
      merge = true;
    }

    if (process.browser) {
      this._preClientRender();
    } else {
      this._preServerRender();
    }

    this._preRender();

    if (!this._elementRendered() || this._dirtiedData) {
      serializedData = this.serializeData(data, merge);
      if (Array.isArray(serializedData)) {
        serializedData.forEach(function (data) {
          elList.push(this.getTemplateFn()(data));
        });
        el = elList.join('');
      } else {
        el = this.getTemplateFn()(serializedData);
      }
      this.$el.html(el);
      this.cleanData();
    }


    if (process.browser) {
      this._postClientRender();
    } else {
      this._postServerRender();
    }

    this._postRender();
    return this._getHTML();
  }
});

module.exports = BaseView;
