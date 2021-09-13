$(window).on("load", function () {
  /**Money Format */
  theme.Currency = (function () {
    var moneyFormat = "${{amount}}"; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
      if (typeof cents === "string") {
        cents = cents.replace(".", "");
      }
      var value = "";
      var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
      var formatString = format || moneyFormat;

      function formatWithDelimiters(number, precision, thousands, decimal) {
        thousands = thousands || ",";
        decimal = decimal || ".";

        if (isNaN(number) || number === null) {
          return 0;
        }

        number = (number / 100.0).toFixed(precision);

        var parts = number.split(".");
        var dollarsAmount = parts[0].replace(
          /(\d)(?=(\d\d\d)+(?!\d))/g,
          "$1" + thousands
        );
        var centsAmount = parts[1] ? decimal + parts[1] : "";

        return dollarsAmount + centsAmount;
      }

      switch (formatString.match(placeholderRegex)[1]) {
        case "amount":
          value = formatWithDelimiters(cents, 2);
          break;
        case "amount_no_decimals":
          value = formatWithDelimiters(cents, 0);
          break;
        case "amount_with_comma_separator":
          value = formatWithDelimiters(cents, 2, ".", ",");
          break;
        case "amount_no_decimals_with_comma_separator":
          value = formatWithDelimiters(cents, 0, ".", ",");
          break;
        case "amount_no_decimals_with_space_separator":
          value = formatWithDelimiters(cents, 0, " ");
          break;
        case "amount_with_apostrophe_separator":
          value = formatWithDelimiters(cents, 2, "'");
          break;
      }

      return formatString.replace(placeholderRegex, value);
    }

    return {
      formatMoney: formatMoney,
    };
  })();

  /**Navigation */
  (function ($) {
    var defaults = {
      sm: 540,
      md: 720,
      lg: 960,
      xl: 1140,
      navbar_expand: "lg",
      animation: true,
      animateIn: "fadeIn",
    };
    $.fn.bootnavbar = function (options) {
      var screen_width = $(document).width();
      settings = $.extend(defaults, options);
      if (screen_width >= settings.lg) {
        $(this)
          .find(".dropdown")
          .hover(
            function () {
              $(this).addClass("show");
              $(this).find(".dropdown-menu").first().addClass("show");
              if (settings.animation) {
                $(this)
                  .find(".dropdown-menu")
                  .first()
                  .addClass("animated " + settings.animateIn);
              }
            },
            function () {
              $(this).removeClass("show");
              $(this).find(".dropdown-menu").first().removeClass("show");
            }
          );
      }

      $(".dropdown-menu a.dropdown-toggle").on("click", function (e) {
        if (!$(this).next().hasClass("show")) {
          $(this)
            .parents(".dropdown-menu")
            .first()
            .find(".show")
            .removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass("show");

        $(this)
          .parents("li.nav-item.dropdown.show")
          .on("hidden.bs.dropdown", function (e) {
            $(".dropdown-submenu .show").removeClass("show");
          });

        return false;
      });
    };
  })(jQuery);

  $("#main_navbar").bootnavbar();
  $(window).on("scroll", function () {
    var scroll = $(window).scrollTop();
    if (scroll < 300) {
      $(".header-sticky").removeClass("sticky-bar");
      $("#back-top").fadeOut(500);
    } else {
      $(".header-sticky").addClass("sticky-bar");
      $("#back-top").fadeIn(500);
    }
  });

  $(".add").on("click", function () {
    $(this)
      .prev()
      .val(+$(this).prev().val() + 1);
  });
  $(".sub").on("click", function () {
    if ($(this).next().val() > 1) {
      if ($(this).next().val() > 1)
        $(this)
          .next()
          .val(+$(this).next().val() - 1);
    }
  });
  function update_varient_id(variant) {
    $("#variant_id").val(variant);
  }

  function update_slider_image(variantImg) {
    var slideIndex = $("#" + variantImg).attr("data-index");
    $(".product-slider").slick("slickGoTo", slideIndex - 1);
  }

  function get_sku(variant) {
    var skuCode = variant.sku;

    if (skuCode != "") {
      $("#product_sku").html(
        "<span><strong>SKU: </strong>" + skuCode + "</span>"
      );
    }
  }

  function update_add_to_cart_text(variant) {
    if (variant.available == false) {
      $("#addToCart").attr("disabled", true);
      $("#addToCart").text("Sold Out");
    } else {
      $("#addToCart").attr("disabled", false);
      $("#addToCart").text("Add to Cart");
    }
  }

  function update_product_price(variant) {
    var currency = theme.moneyFormat.substring(0, 1);
    var regular_price = variant.price;
    var compare_price = variant.compare_at_price;
    var regular_price_output =
      '<span class="money regular_price" id="regular_price">' +
      theme.Currency.formatMoney(regular_price, theme.moneyFormat) +
      "</span>";

    if (compare_price > regular_price) {
      var compare_price_output =
        '<span class="money compare_price" id="compare_price"> ' +
        theme.Currency.formatMoney(compare_price, theme.moneyFormat) +
        "</span>";
      var saved_price = Math.round(
        ((compare_price - regular_price) / compare_price) * 100
      );
      var saved_price_output =
        '<span class="save_amount" id="save_amount"> Save up to ' +
        theme.Currency.formatMoney(saved_price, theme.moneyFormat) +
        "%</span>";
      output = regular_price_output + compare_price_output + saved_price_output;
    } else {
      var compare_price_output = "";
      var saved_price = "";
      var saved_price_output = "";
      output = regular_price_output + compare_price_output + saved_price_output;
    }

    $("#product_price").html(output);
    console.log(variant);
  }

  function updateMasterVariant(variant) {
    var masterSelect = jQuery(".product-form__variants");
    masterSelect.val(variant.id);
  }
  jQuery(".product-category select").on("change", function () {
    var selectedValues = getVariantFromOptions();
    var variants = window.product.variants;
    var found = false;
    variants.forEach(function (variant) {
      var satisfied = true;
      var options = variant.options;
      selectedValues.forEach(function (option) {
        if (satisfied) {
          satisfied = option.value === variant[option.index];
        }
      });

      if (satisfied) {
        found = variant;
      }
    });
    update_add_to_cart_text(found);
    get_sku(found);
    update_varient_id(found.id);
    // update_slider_image(found.featured_image.id);
    update_product_price(found);
    updateMasterVariant(found);
    updateHistoryState(found);
  });
  jQuery("input[type=radio]").on("change", function () {
    var selectedValues = getVariantFromSwatches();
    var variants = window.product.variants;
    var found = false;
    variants.forEach(function (variant) {
      var satisfied = true;
      var options = variant.options;
      selectedValues.forEach(function (option) {
        if (satisfied) {
          satisfied = option.value === variant[option.index];
        }
      });

      if (satisfied) {
        found = variant;
      }
    });
    update_add_to_cart_text(found);
    get_sku(found);
    update_varient_id(found.id);
    update_slider_image(found.featured_image.id);
    update_product_price(found);
    updateMasterVariant(found);
  });
});
