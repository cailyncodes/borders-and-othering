'use strict';

/**
 * Must be included after all other js files.
 */

document.addEventListener("DOMContentLoaded", ready);

function ready() {
    var btns = document.getElementsByClassName("link");
    for (var i = 0; i < btns.length; ++i) {
        var btn = btns[i];
        btn.addEventListener("click", function(e) {
            var elm = e.target;
            while (!elm.classList.contains("link")) {
                elm = elm.parentElement;
            }
            var href = elm.getAttribute("data-href");
            window.location = href;
        });
    }
}
