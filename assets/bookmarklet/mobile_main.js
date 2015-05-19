! function()
{
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? ! function()
  {
    function e()
    {
      r(a + "assets/mobile_bookmarklet_modal.css"), jQuery.getJSON(a + "yieldtracks/script.json?callback=?", function(e)
      {
        null == e ? t(a + "assets/bookmarklet/mobile_error_msg.js", function() {}) : (window._YT.vars = {
          state: e.state,
          site: e.site,
          search_term: e.search_term,
          engine: e.engine,
          tpp: e.tpp
        }, t(a + "scripts/" + e.script_id, function() {}))
      })
    }

    function t(e, t)
    {
      var n = !1,
        r = document.createElement("script");
      r.src = e, r.onload = r.onreadystatechange = function()
      {
        var e = !(n || this.readyState && "loaded" != this.readyState && "complete" != this.readyState);
        e && (n = !0, t())
      }, document.body.appendChild(r)
    }

    function n(e)
    {
      for (var t = e + "=", n = document.cookie.split(";"), r = 0; r < n.length; r++)
      {
        for (var a = n[r];
          " " == a.charAt(0);) a = a.substring(1);
        if (-1 != a.indexOf(t)) return a.substring(t.length, a.length)
      }
      return ""
    }

    function r(e)
    {
      var t = document.createElement("link");
      t.rel = "stylesheet", t.href = e, document.getElementsByTagName("head")[0].appendChild(t)
    }
    window._YT = {};
    var a = document.querySelector("[data-cf-bm]").getAttribute("data-base-url");
    ! function()
    {
      if ("undefined" != typeof jQuery) e();
      else
      {
        var n = a + "assets/bookmarklet/jquery.min.js";
        t(n, e)
      }
    }.call(this), ! function()
    {
      window._YT.Modal = {
        init: function(e)
        {
          this.settings = e, this.create(), this.appendToBody(), this.open(), this.addListeners()
        },
        create: function()
        {
          $overlay = jQuery('<div id="ytoverlay"></div>'), $modal = jQuery('<div id="ytmodal"></div>'), $content = jQuery('<div id="ytcontent">' + this.settings.content + "</div>"), $close = jQuery('<a href="#" id="ytclose">close</a>'), $button = jQuery('<div id="ytbutton">OK</div>'), $body = jQuery("body"), $modal.append($content.append($button), $close)
        },
        appendToBody: function()
        {
          $body.prepend($overlay, $modal)
        },
        makeDraggable: function()
        {
          $modal.draggable()
        },
        addListeners: function()
        {
          $close.click(this.close), $overlay.click(this.close), $button.click(this.close)
        },
        open: function()
        {
          $modal.show()
        },
        close: function(e)
        {
          e.preventDefault(), $body.find("#ytmodal, #ytoverlay").remove()
        }
      }
    }.call(this), ! function()
    {
      window._YT.Timer = {
        init: function(e, t, n)
        {
          return n = "undefined" != typeof n ? n : !0, 0 == e || void 0 == e ? void this.fire() : (this.pageLeaveListener(), count = e, this.start(e, t, n), this.createVisual(e), this.appendVisual(), void(masterFunc = this))
        },
        pageLeaveListener: function()
        {
          window.onbeforeunload = function()
          {
            return count > 0 ? "You still have " + count + " seconds until the task is complete" : void 0
          }
        },
        start: function(e, t, n)
        {
          function r()
          {
            count = Math.min(10, count)
            return count -= 1, 0 >= count ? (masterFunc.updateVisual(count), clearInterval(a), n && masterFunc.fire(), void(void 0 == t ? masterFunc.completeVisual() : (masterFunc.removeVisual(), t()))) : void masterFunc.updateVisual(count)
          }
          var a = setInterval(r, 1e3)
        },
        createVisual: function(e)
        {
          $visual = jQuery('<div id="yttimer"></div>'), $message = jQuery('<div id="ytmessage">Please Wait</div>'), $counter = jQuery('<div id="ytseconds-left">' + e + "</div>"), $visual.append($message.append($counter))
        },
        appendVisual: function()
        {
          jQuery("body").append($visual)
        },
        updateVisual: function(e)
        {
          jQuery("#ytseconds-left").text(e)
        },
        completeVisual: function()
        {
          jQuery("#yttimer").html('<div id="ytcomplete">Complete</div>')
        },
        removeVisual: function()
        {
          jQuery("body").find("#yttimer").remove()
        },
        fire: function()
        {
          var e = [],
            t = (new Date).valueOf(),
            r = n("ru"),
            i = r || document.referrer;
          r && (document.cookie = "ru=; expires=Thu, 01 Jan 1970 00:00:00 UTC"), e.push("referrer=" + encodeURIComponent(i)), e.push("x=" + t), e.push("tpp=" + _YT.vars.tpp), e.push("mobile=true"), e.push("bookmarklet=true"), jQuery("body").append('<img src="' + a + "yieldtracks/verify?" + e.join("&") + '" alt="" width="1" height="1" style="display:block;  position:relative; left:-10000px;"/>')
        }
      }
    }.call(this), ! function()
    {
      window._YT.disableLinks = function()
      {
        jQuery("a").each(function()
        {
          jQuery(this).on("click", function(e)
          {
            e.preventDefault(), alert("You are not supposed to click any links after you complete the search. Doing so may get you banned from this job. Click the browser back button in the browser immediately then press 'OK'. ")
          })
        })
      }
    }.call(this)
  }.call(this) : alert("This is not a mobile device.")
}.call(this);
