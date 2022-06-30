window.ASAP || (window.ASAP = (function() {
  var callall, fns;
  fns = [];
  callall = function() {
    var f, results;
    results = [];
    while (f = fns.shift()) {
      results.push(f());
    }
    return results;
  };
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callall, false);
    window.addEventListener('load', callall, false);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', callall);
    window.attachEvent('onload', callall);
  }
  return function(fn) {
    fns.push(fn);
    if (document.readyState === 'complete') {
      return callall();
    }
  };
})());

window.log || (window.log = function() {
  if (window.console && window.DEBUG) {
    if (typeof console.group === "function") {
      console.group(window.DEBUG);
    }
    if (arguments.length === 1 && Array.isArray(arguments[0]) && console.table) {
      console.table.apply(window, arguments);
    } else {
      console.log.apply(window, arguments);
    }
    return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
  }
});

window.trouble || (window.trouble = function() {
  var ref;
  if (window.console) {
    if (window.DEBUG) {
      if (typeof console.group === "function") {
        console.group(window.DEBUG);
      }
    }
    if ((ref = console.warn) != null) {
      ref.apply(window, arguments);
    }
    if (window.DEBUG) {
      return typeof console.groupEnd === "function" ? console.groupEnd() : void 0;
    }
  }
});

window.preload || (window.preload = function(what, fn) {
  var lib;
  if (!Array.isArray(what)) {
    what = [what];
  }
  return $.when.apply($, (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = what.length; i < len; i++) {
      lib = what[i];
      results.push($.ajax(lib, {
        dataType: 'script',
        cache: true
      }));
    }
    return results;
  })()).done(function() {
    return typeof fn === "function" ? fn() : void 0;
  });
});

window.queryParam || (window.queryParam = function(p, nocase) {
  var k, params, params_kv;
  params_kv = location.search.substr(1).split('&');
  params = {};
  params_kv.forEach(function(kv) {
    var k_v;
    k_v = kv.split('=');
    return params[k_v[0]] = k_v[1] || '';
  });
  if (p) {
    if (nocase) {
      for (k in params) {
        if (k.toUpperCase() === p.toUpperCase()) {
          return decodeURIComponent(params[k]);
        }
      }
      return void 0;
    } else {
      return decodeURIComponent(params[p]);
    }
  }
  return params;
});

ASAP(function() {
  var libs;
  libs = ['https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js'];
  return preload(libs, function() {
    var $grid, far_future, far_past, group2select, initial_selector, now;
    far_past = '2000-01-01';
    far_future = '2222-01-01';
    now = moment();
    $('.promo-cell').each(function(idx, el) {
      var $el, since, till;
      $el = $(el);
      since = moment($el.attr('data-since') || far_past);
      till = moment($el.attr('data-till') || far_future);
      if (!now.isBetween(since.startOf('day'), till.endOf('day'))) {
        return $el.remove();
      }
    });
    $('.promo-filters > *').each(function(idx, el) {
      var $el, default_group_removed, group2check;
      $el = $(el);
      group2check = $el.attr('data-group');
      if (group2check !== '*') {
        if (!$(".promo-cell[data-group*='" + group2check + "']").length) {
          default_group_removed = $el.hasClass('selected') || default_group_removed;
          $el.remove();
        }
      }
      if (default_group_removed) {
        return $('.promo-filters [data-group="*"]').addClass('selected');
      }
    });
    group2select = $('.promo-filters > *.selected').attr('data-group');
    initial_selector = group2select !== '*' ? "[data-group*='" + group2select + "']" : '*';
    $grid = $('.promo-grid').isotope({
      itemSelector: '.promo-cell',
      layoutMode: 'fitRows',
      stagger: 30,
      filter: initial_selector
    });
    $('.promo-filters > [data-group]').on('click', function() {
      var $this, group, selector;
      $this = $(this);
      group = $this.attr('data-group');
      selector = group !== '*' ? "[data-group*='" + group + "']" : '*';
      $grid.isotope({
        filter: selector
      });
      return $this.addClass('selected').siblings('.selected').removeClass('selected');
    });
    return setTimeout(function() {
      return $('#actual-promos').addClass('shown');
    }, 0);
  });
});
