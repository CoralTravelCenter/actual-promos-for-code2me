window.ASAP ||= (->
    fns = []
    callall = () ->
        f() while f = fns.shift()
    if document.addEventListener
        document.addEventListener 'DOMContentLoaded', callall, false
        window.addEventListener 'load', callall, false
    else if document.attachEvent
        document.attachEvent 'onreadystatechange', callall
        window.attachEvent 'onload', callall
    (fn) ->
        fns.push fn
        callall() if document.readyState is 'complete'
)()

window.log ||= () ->
    if window.console and window.DEBUG
        console.group? window.DEBUG
        if arguments.length == 1 and Array.isArray(arguments[0]) and console.table
            console.table.apply window, arguments
        else
            console.log.apply window, arguments
        console.groupEnd?()
window.trouble ||= () ->
    if window.console
        console.group? window.DEBUG if window.DEBUG
        console.warn?.apply window, arguments
        console.groupEnd?() if window.DEBUG

window.preload ||= (what, fn) ->
    what = [what] unless  Array.isArray(what)
    $.when.apply($, ($.ajax(lib, dataType: 'script', cache: true) for lib in what)).done -> fn?()

window.queryParam ||= (p, nocase) ->
    params_kv = location.search.substr(1).split('&')
    params = {}
    params_kv.forEach (kv) -> k_v = kv.split('='); params[k_v[0]] = k_v[1] or ''
    if p
        if nocase
            return decodeURIComponent(params[k]) for k of params when k.toUpperCase() == p.toUpperCase()
            return undefined
        else
            return decodeURIComponent params[p]
    params

ASAP ->
    libs = ['https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/3.0.6/isotope.pkgd.min.js']

    preload libs, ->
        # Get rid of outdated promos
        far_past = '2000-01-01'
        far_future = '2222-01-01'
        now = moment()
        $('.promo-cell').each (idx, el) ->
            $el = $(el)
            since = moment($el.attr('data-since') or far_past)
            till = moment($el.attr('data-till') or far_future)
            $el.remove() unless now.isBetween since.startOf('day'), till.endOf('day')
        # Remove/hide group selector(s) that has no promos
        $('.promo-filters > *').each (idx, el) ->
            $el = $(el)
            group2check = $el.attr 'data-group'
            if group2check != '*'
                unless $(".promo-cell[data-group*='#{ group2check }']").length
                    default_group_removed = $el.hasClass('selected') or default_group_removed
                    $el.remove()
            if default_group_removed
                $('.promo-filters [data-group="*"]').addClass 'selected'

        group2select = $('.promo-filters > *.selected').attr('data-group')
        initial_selector = if group2select != '*' then "[data-group*='#{ group2select }']" else '*'

        $grid = $('.promo-grid').isotope
            itemSelector: '.promo-cell'
            layoutMode: 'fitRows'
            stagger: 30
            filter: initial_selector
        $('.promo-filters > [data-group]').on 'click', ->
            $this = $(this)
            group = $this.attr('data-group')
            selector = if group != '*' then "[data-group*='#{ group }']" else '*'
            $grid.isotope filter: selector
            $this.addClass('selected').siblings('.selected').removeClass('selected')

        setTimeout ->
            $('#actual-promos').addClass('shown')
        , 0
